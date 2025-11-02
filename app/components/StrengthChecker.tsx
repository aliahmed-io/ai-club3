'use client';

import { useState, useEffect } from 'react';
import { calculatePasswordStrength, PasswordStrength } from '../utils/passwordUtils';

interface StrengthCheckerProps {
  password: string;
}

export default function StrengthChecker({ password }: StrengthCheckerProps) {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    level: 'weak',
    entropy: 0,
    timeToCrack: 'Instant',
    suggestions: ['Enter a password to check its strength']
  });

  useEffect(() => {
    const result = calculatePasswordStrength(password);
    setStrength(result);
  }, [password]);

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak': return 'from-red-500 to-red-600';
      case 'fair': return 'from-orange-500 to-orange-600';
      case 'good': return 'from-yellow-500 to-yellow-600';
      case 'strong': return 'from-green-500 to-green-600';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  const getStrengthTextColor = (level: string) => {
    switch (level) {
      case 'weak': return 'text-red-600 dark:text-red-400';
      case 'fair': return 'text-orange-600 dark:text-orange-400';
      case 'good': return 'text-yellow-600 dark:text-yellow-400';
      case 'strong': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
        Password Strength
      </h2>

      {/* Strength Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Strength: 
          </span>
          <span className={`text-lg font-bold ${getStrengthTextColor(strength.level)}`}>
            {strength.level.toUpperCase()}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor(strength.level)} transition-all duration-500 ease-out`}
            style={{ width: `${strength.score}%` }}
          ></div>
        </div>
      </div>

      {/* Time to Crack */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Estimated time to crack (using an advanced computer system):</div>
          <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
            {strength.timeToCrack}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {strength.suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Suggestions
          </h3>
          <ul className="space-y-1">
            {strength.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-blue-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}