'use client';

import { useState, useEffect, useRef } from 'react';
import { ATTACK_METHODS, AttackMethod, BruteForceResult, simulateBruteForce, calculateBruteForceTime } from '../utils/bruteForceCalculator';
import { saveSimulationState, loadSimulationState, clearSimulationState, SimulationState } from '../utils/simulationState';

interface BruteForceSimulatorProps {
  password: string;
}

export default function BruteForceSimulator({ password }: BruteForceSimulatorProps) {
  const [selectedMethod, setSelectedMethod] = useState<AttackMethod>(ATTACK_METHODS[0]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BruteForceResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [wasCracked, setWasCracked] = useState(false);
  const [crackedAttempt, setCrackedAttempt] = useState<string | null>(null);
  const [stopSimulation, setStopSimulation] = useState<(() => void) | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptNumberRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadSimulationState();
    if (savedState && savedState.password === password) {
      setSelectedMethod(ATTACK_METHODS.find(m => m.id === savedState.selectedMethod) || ATTACK_METHODS[0]);
      setSpeedMultiplier(savedState.speedMultiplier);
      setIsRunning(savedState.isRunning);
      setIsComplete(savedState.isComplete);
      attemptNumberRef.current = savedState.attemptNumber;
      
      if (savedState.isRunning) {
        // Resume simulation
        setTimeout(() => {
          handleStart();
        }, 100);
      } else {
        // Just show current state
        const newResult = calculateBruteForceTime(password, ATTACK_METHODS.find(m => m.id === savedState.selectedMethod) || ATTACK_METHODS[0], savedState.speedMultiplier);
        setResult(newResult);
      }
    } else if (password && !isRunning) {
      const newResult = calculateBruteForceTime(password, selectedMethod, speedMultiplier);
      setResult(newResult);
    }
    setIsInitialized(true);
  }, [password]);

  // Save state whenever it changes
  useEffect(() => {
    if (isInitialized && password) {
      const state: SimulationState = {
        isRunning,
        password,
        selectedMethod: selectedMethod.id,
        speedMultiplier,
        attemptNumber: attemptNumberRef.current,
        isComplete
      };
      saveSimulationState(state);
    }
  }, [isRunning, password, selectedMethod.id, speedMultiplier, isComplete, isInitialized]);

  const handleStart = () => {
    if (!password) return;
    
    setIsRunning(true);
    setIsComplete(false);
    setWasCracked(false);
    setCrackedAttempt(null);
    attemptNumberRef.current = 0;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const baseResult = calculateBruteForceTime(password, selectedMethod, speedMultiplier);
    // Build deterministic charset ONLY from classes present
    const charset = buildCharsetFromPassword(password);
    const totalCombinations = Math.pow(charset.length || 1, password.length || 1);
    const targetIndex = passwordToIndex(password, charset);
    // Ensure we run at least until targetIndex (bounded by totalCombinations)
    const maxAttempts = Math.min(totalCombinations, Math.max(targetIndex + 1, baseResult.totalCombinations));
    // Target ~60 updates/sec for smooth UI while scaling attempts with speed
    const updateInterval = 16;
    const perTickAttempts = Math.max(1, Math.floor(baseResult.attemptsPerSecond / (1000 / updateInterval)));
    
    intervalRef.current = setInterval(() => {
      if (attemptNumberRef.current >= maxAttempts) {
        setIsComplete(true);
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      // Try multiple attempts per tick for high speed
      let found = false;
      let lastAttempt = '';
      for (let i = 0; i < perTickAttempts && attemptNumberRef.current < maxAttempts; i++) {
        // If we have reached or passed the target index, declare success
        if (attemptNumberRef.current >= targetIndex) {
          found = true;
          lastAttempt = password;
          break;
        }
        lastAttempt = generateAttemptByIndex(attemptNumberRef.current, password.length, charset, selectedMethod);
        if (lastAttempt === password) {
          found = true;
          break;
        }
        attemptNumberRef.current++;
      }

      const currentResult: BruteForceResult = {
        ...baseResult,
        currentAttempt: found ? password : lastAttempt,
        progress: (attemptNumberRef.current / maxAttempts) * 100
      };

      setResult(currentResult);

      if (found) {
        setWasCracked(true);
        setCrackedAttempt(password);
        setIsComplete(true);
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, updateInterval);
  };

  function buildCharsetFromPassword(target: string): string {
    let hasLower = false, hasUpper = false, hasNum = false, hasSym = false;
    for (const ch of target) {
      if (ch >= 'a' && ch <= 'z') hasLower = true;
      else if (ch >= 'A' && ch <= 'Z') hasUpper = true;
      else if (ch >= '0' && ch <= '9') hasNum = true;
      else hasSym = true;
    }
    let cs = '';
    if (hasLower) cs += 'abcdefghijklmnopqrstuvwxyz';
    if (hasUpper) cs += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (hasNum) cs += '0123456789';
    if (hasSym) cs += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (cs.length === 0) cs = 'abcdefghijklmnopqrstuvwxyz';
    return cs;
  }

  function generateAttemptByIndex(index: number, length: number, charset: string, method: AttackMethod): string {
    // For dictionary/smart we keep their generators but they won't be used for deterministic stepping
    if (method.id !== 'brute-force') {
      return generateCurrentAttempt(password, index, method);
    }
    const base = charset.length;
    const digits: number[] = new Array(length).fill(0);
    let n = index;
    for (let pos = length - 1; pos >= 0; pos--) {
      digits[pos] = n % base;
      n = Math.floor(n / base);
    }
    let out = '';
    for (let pos = 0; pos < length; pos++) {
      out += charset[digits[pos]];
    }
    return out;
  }

  function passwordToIndex(target: string, charset: string): number {
    const base = charset.length;
    let n = 0;
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      const idx = charset.indexOf(ch);
      if (idx < 0) {
        // If char not in charset, fallback to 0 so loop will still progress
        return Number.MAX_SAFE_INTEGER;
      }
      n = n * base + idx;
    }
    return n;
  }

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsComplete(false);
    setWasCracked(false);
    setCrackedAttempt(null);
    attemptNumberRef.current = 0;
    clearSimulationState();
    if (password) {
      const newResult = calculateBruteForceTime(password, selectedMethod, speedMultiplier);
      setResult(newResult);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const generateCurrentAttempt = (password: string, attemptNumber: number, method: AttackMethod): string => {
    const length = password.length;
    
    if (method.id === 'dictionary') {
      // Dictionary attack - try common words first
      const commonWords = [
        'password', '123456', 'admin', 'qwerty', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'hello', 'login', 'abc123', 'password123', 'admin123',
        'root', 'toor', 'pass', 'test', 'user', 'guest', 'demo', 'sample'
      ];
      
      if (attemptNumber < commonWords.length) {
        return commonWords[attemptNumber];
      }
      
      // After common words, try variations
      const baseWord = commonWords[attemptNumber % commonWords.length];
      const variations = [
        baseWord,
        baseWord + '123',
        baseWord + '!',
        baseWord + '1',
        baseWord.toUpperCase(),
        baseWord.charAt(0).toUpperCase() + baseWord.slice(1)
      ];
      
      return variations[Math.floor(attemptNumber / commonWords.length) % variations.length];
    } else if (method.id === 'smart') {
      // Smart attack - try patterns and common substitutions
      const patterns = [
        '123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
        'abcdefgh', 'password', 'admin', 'root', 'user'
      ];
      
      if (attemptNumber < patterns.length) {
        return patterns[attemptNumber];
      }
      
      // Try common substitutions
      const substitutions = {
        'a': '@', 'e': '3', 'i': '1', 'o': '0', 's': '$', 't': '7'
      };
      
      const basePattern = patterns[attemptNumber % patterns.length];
      let result = basePattern;
      
      // Apply substitutions based on attempt number
      const subIndex = Math.floor(attemptNumber / patterns.length) % 6;
      if (subIndex > 0) {
        const chars = Object.keys(substitutions);
        const subChar = chars[subIndex - 1];
        result = result.replace(new RegExp(subChar, 'g'), substitutions[subChar as keyof typeof substitutions]);
      }
      
      return result;
    } else {
      // Brute force - systematic character-by-character using actual charset from password
      // Determine what character types are in the password
      let charset = '';
      let hasLowercase = false;
      let hasUppercase = false;
      let hasNumbers = false;
      let hasSymbols = false;
      
      for (const char of password) {
        if (char >= 'a' && char <= 'z') hasLowercase = true;
        else if (char >= 'A' && char <= 'Z') hasUppercase = true;
        else if (char >= '0' && char <= '9') hasNumbers = true;
        else hasSymbols = true;
      }
      
      // Always include lowercase, then add detected types
      charset += 'abcdefghijklmnopqrstuvwxyz';
      if (hasUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (hasNumbers) charset += '0123456789';
      if (hasSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      // Default to lowercase if empty
      if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyz';
      
      let result = '';
      let remaining = attemptNumber;
      const charsetSize = charset.length;
      
      for (let i = 0; i < length; i++) {
        result += charset[remaining % charsetSize];
        remaining = Math.floor(remaining / charsetSize);
      }
      
      return result;
    }
  };

  const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num < 1000000000000) return `${(num / 1000000000).toFixed(1)}B`;
    
    // For anything over trillion, use scientific notation
    const exponent = Math.floor(Math.log10(num));
    const mantissa = (num / Math.pow(10, exponent)).toFixed(1);
    return `${mantissa} × 10^${exponent}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
        Attack Simulation
      </h2>

      {/* Attack Method Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Attack Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ATTACK_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`p-2 rounded border text-center text-sm transition-colors ${
                selectedMethod.id === method.id
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
              }`}
            >
              {method.name}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Speed: {speedMultiplier}x
        </label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={speedMultiplier}
          onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1x</span>
          <span>50x</span>
          <span>100x</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleStart}
          disabled={!password || isRunning}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium py-2 px-3 rounded text-sm transition-colors shadow-sm"
        >
          {isRunning ? 'Running...' : 'Start'}
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white font-medium py-2 px-3 rounded text-sm transition-colors shadow-sm"
        >
          Stop
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors shadow-sm"
        >
          Reset
        </button>
      </div>

      {/* Simulation Display */}
      {result && (
        <div className="space-y-3">
          {/* Current Attempt */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              Trying:
            </div>
            <div className="font-mono text-xl font-semibold text-slate-900 dark:text-white tracking-wider">
              {result.currentAttempt}
            </div>
          </div>



          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-center border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Attempts</div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                {formatNumber(attemptNumberRef.current)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-center border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Speed</div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                {formatNumber(result.attemptsPerSecond)}/s
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-center border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total</div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                {formatNumber(result.totalCombinations)}
              </div>
            </div>
          </div>

        </div>
      )}
      {/* Completion Message */}
      {isComplete && (
        <div className={`mt-6 p-4 rounded-lg ${wasCracked ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${wasCracked ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                <span className="text-white text-sm">{wasCracked ? '✓' : '•'}</span>
              </div>
              <span className={`${wasCracked ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'} font-semibold`}>
                {wasCracked ? 'Password cracked!' : 'Finished without crack (limit reached).'}
              </span>
            </div>
            {wasCracked && (
              <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{crackedAttempt}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

