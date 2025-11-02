'use client';

import { useState } from 'react';
import PasswordGenerator from './components/PasswordGenerator';
import StrengthChecker from './components/StrengthChecker';
import BruteForceSimulator from './components/BruteForceSimulator';
import StatsDashboard from './components/StatsDashboard';

export default function Home() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordGenerated = (password: string) => {
    setCurrentPassword(password);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Security Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate passwords and see how attacks work
          </p>
        </div>

        <div className="space-y-6">
          {/* Try Your Own Password */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Try your own password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Type a password to analyze and simulate..."
                className="w-full pr-12 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 my-auto h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.63 6.94 18.25 12 18.25c1.58 0 3.03-.267 4.313-.748M9.743 9.743A3.75 3.75 0 0012 15.75c2.071 0 3.75-1.679 3.75-3.75 0-.59-.134-1.148-.373-1.648M6.53 6.53L17.47 17.47M20.02 15.777A10.477 10.477 0 0022.066 12C20.774 8.37 17.06 5.75 12 5.75c-.938 0-1.835.098-2.676.283" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.364 4.75 12 4.75s8.577 2.76 9.964 6.928c.07.214.07.43 0 .644C20.577 16.49 16.636 19.25 12 19.25s-8.577-2.76-9.964-6.928z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              This password will be used by the Strength Checker and Attack Simulation.
            </p>
          </div>

          {/* Row 1: Password Generator + Strength Checker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
            <StrengthChecker password={currentPassword} />
          </div>

          {/* Row 2: Brute Force Simulator */}
          <div>
            <BruteForceSimulator password={currentPassword} />
          </div>

          {/* Row 3: Security Analysis */}
          <div>
            <StatsDashboard password={currentPassword} />
          </div>
        </div>
      </div>
    </div>
  );
}
