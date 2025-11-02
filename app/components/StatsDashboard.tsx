'use client';

import { useState, useEffect } from 'react';
import { calculatePasswordStrength } from '../utils/passwordUtils';
import { calculateBruteForceTime, ATTACK_METHODS } from '../utils/bruteForceCalculator';

interface StatsDashboardProps {
  password: string;
}

export default function StatsDashboard({ password }: StatsDashboardProps) {
  const [strength, setStrength] = useState<any>(null);
  const [attackResults, setAttackResults] = useState<any[]>([]);

  useEffect(() => {
    if (password) {
      const strengthResult = calculatePasswordStrength(password);
      setStrength(strengthResult);

      const results = ATTACK_METHODS.map(method => ({
        method: method.name,
        ...calculateBruteForceTime(password, method, 1)
      }));
      setAttackResults(results);
    } else {
      setStrength(null);
      setAttackResults([]);
    }
  }, [password]);

  if (!password) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Security Analysis
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          Enter a password to see security analysis.
        </p>
      </div>
    );
  }

  const getSecurityLevel = (timeToCrack: string): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (timeToCrack.includes('billion years') || timeToCrack.includes('million years')) return 'excellent';
    if (timeToCrack.includes('years') && !timeToCrack.includes('billion') && !timeToCrack.includes('million')) return 'good';
    if (timeToCrack.includes('days') || timeToCrack.includes('hours')) return 'fair';
    return 'poor';
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
        Security Analysis
      </h2>

      {/* Password Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded text-center border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Length</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {password.length}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded text-center border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Strength</div>
          <div className={`text-2xl font-bold ${getSecurityColor(strength?.level)}`}>
            {strength?.level.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Attack Resistance */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Attack Resistance
        </h3>
        <div className="space-y-2">
          {attackResults.map((result, index) => {
            const securityLevel = getSecurityLevel(result.timeToCrack);
            return (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300">{result.method}</span>
                <span className={`font-medium ${getSecurityColor(securityLevel)}`}>
                  {result.timeToCrack}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}