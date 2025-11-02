export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  entropy: number;
  timeToCrack: string;
  suggestions: string[];
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options: PasswordOptions): string {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;
  
  let charset = '';
  if (includeLowercase) charset += LOWERCASE;
  if (includeUppercase) charset += UPPERCASE;
  if (includeNumbers) charset += NUMBERS;
  if (includeSymbols) charset += SYMBOLS;
  
  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      level: 'weak',
      entropy: 0,
      timeToCrack: 'Instant',
      suggestions: ['Enter a password to check its strength']
    };
  }

  const length = password.length;
  let charsetSize = 0;
  let hasUppercase = false;
  let hasLowercase = false;
  let hasNumbers = false;
  let hasSymbols = false;
  let hasRepeatedChars = false;
  let hasSequentialChars = false;
  let hasCommonPatterns = false;

  // Check character types
  for (const char of password) {
    if (UPPERCASE.includes(char)) {
      hasUppercase = true;
      charsetSize = Math.max(charsetSize, 26);
    } else if (LOWERCASE.includes(char)) {
      hasLowercase = true;
      charsetSize = Math.max(charsetSize, 26);
    } else if (NUMBERS.includes(char)) {
      hasNumbers = true;
      charsetSize = Math.max(charsetSize, 10);
    } else if (SYMBOLS.includes(char)) {
      hasSymbols = true;
      charsetSize = Math.max(charsetSize, 32);
    }
  }

  // Check for patterns
  const charCounts: { [key: string]: number } = {};
  for (const char of password) {
    charCounts[char] = (charCounts[char] || 0) + 1;
    if (charCounts[char] > 2) hasRepeatedChars = true;
  }

  // Check for sequential characters
  for (let i = 0; i < length - 2; i++) {
    const char1 = password.charCodeAt(i);
    const char2 = password.charCodeAt(i + 1);
    const char3 = password.charCodeAt(i + 2);
    if (char2 === char1 + 1 && char3 === char2 + 1) {
      hasSequentialChars = true;
      break;
    }
  }

  // Check for common patterns
  const commonPatterns = ['123', 'abc', 'qwe', 'asd', 'password', 'admin'];
  const lowerPassword = password.toLowerCase();
  for (const pattern of commonPatterns) {
    if (lowerPassword.includes(pattern)) {
      hasCommonPatterns = true;
      break;
    }
  }

  // Calculate entropy
  const entropy = Math.log2(Math.pow(charsetSize, length));

  // Calculate score
  let score = 0;
  
  // Length scoring
  if (length >= 8) score += 20;
  if (length >= 12) score += 20;
  if (length >= 16) score += 20;
  if (length >= 20) score += 10;

  // Character variety scoring
  if (hasLowercase) score += 10;
  if (hasUppercase) score += 10;
  if (hasNumbers) score += 10;
  if (hasSymbols) score += 10;

  // Penalty for patterns
  if (hasRepeatedChars) score -= 15;
  if (hasSequentialChars) score -= 10;
  if (hasCommonPatterns) score -= 20;

  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 30) level = 'weak';
  else if (score < 60) level = 'fair';
  else if (score < 80) level = 'good';
  else level = 'strong';

  // Generate suggestions
  const suggestions: string[] = [];
  if (length < 8) suggestions.push('Use at least 8 characters');
  if (length < 12) suggestions.push('Consider using 12+ characters for better security');
  if (!hasUppercase) suggestions.push('Add uppercase letters');
  if (!hasLowercase) suggestions.push('Add lowercase letters');
  if (!hasNumbers) suggestions.push('Add numbers');
  if (!hasSymbols) suggestions.push('Add special characters');
  if (hasRepeatedChars) suggestions.push('Avoid repeating characters');
  if (hasSequentialChars) suggestions.push('Avoid sequential characters (123, abc)');
  if (hasCommonPatterns) suggestions.push('Avoid common patterns and words');

  // Calculate time to crack (simplified)
  const timeToCrack = calculateTimeToCrack(entropy);

  return {
    score,
    level,
    entropy,
    timeToCrack,
    suggestions
  };
}

function calculateTimeToCrack(entropy: number): string {
  // Assuming 1 billion attempts per second (modern GPU)
  const attemptsPerSecond = 1e9;
  const totalCombinations = Math.pow(2, entropy);
  const secondsToCrack = totalCombinations / (2 * attemptsPerSecond); // Divide by 2 for average case

  if (secondsToCrack < 1) return 'Less than a second';
  if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
  if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
  if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`;
  if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`;
  return `${Math.round(secondsToCrack / 31536000000)} billion years`;
}
