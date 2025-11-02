export interface AttackMethod {
  id: string;
  name: string;
  description: string;
  attemptsPerSecond: number;
  charsetSize: number;
}

export interface BruteForceResult {
  totalCombinations: number;
  timeToCrack: string;
  attemptsPerSecond: number;
  currentAttempt: string;
  progress: number;
}

// A small representative dictionary for estimation (analytics only)
const COMMON_WORDS: string[] = [
  'password','123456','qwerty','admin','welcome','login','monkey','dragon','letmein','football',
  'iloveyou','abc123','starwars','hello','freedom','whatever','qazwsx','trustno1','baseball','master'
];

export const ATTACK_METHODS: AttackMethod[] = [
  {
    id: 'brute-force',
    name: 'Brute Force',
    description: 'Try every possible combination systematically (1M attempts/sec)',
    attemptsPerSecond: 1000000, // 1 million per second (realistic for demo)
    charsetSize: 0 // Will be calculated based on password
  },
  {
    id: 'dictionary',
    name: 'Dictionary Attack',
    description: 'Try common words and variations first (10K attempts/sec)',
    attemptsPerSecond: 10000, // 10 thousand per second
    charsetSize: 10000 // Common dictionary size
  },
  {
    id: 'smart',
    name: 'Smart Attack',
    description: 'Use patterns and common substitutions (100K attempts/sec)',
    attemptsPerSecond: 100000, // 100 thousand per second
    charsetSize: 0 // Will be calculated
  }
];

export function calculateBruteForceTime(
  password: string,
  method: AttackMethod,
  speedMultiplier: number = 1
): BruteForceResult {
  if (!password) {
    return {
      totalCombinations: 0,
      timeToCrack: 'N/A',
      attemptsPerSecond: 0,
      currentAttempt: '',
      progress: 0
    };
  }

  const length = password.length;
  let charsetSize = method.charsetSize;
  
  // Calculate charset size based on password if not predefined
  if (charsetSize === 0) {
    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumbers = false;
    let hasSymbols = false;

    for (const char of password) {
      if (char >= 'A' && char <= 'Z') hasUppercase = true;
      else if (char >= 'a' && char <= 'z') hasLowercase = true;
      else if (char >= '0' && char <= '9') hasNumbers = true;
      else hasSymbols = true;
    }

    // Build charset size ONLY from detected classes
    charsetSize = 0;
    if (hasLowercase) charsetSize += 26;
    if (hasUppercase) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSymbols) charsetSize += 32;
  }

  // Ensure we have a valid charset size
  if (charsetSize === 0) {
    charsetSize = 26; // Default to lowercase letters
  }

  let totalCombinations = Math.pow(charsetSize, length);
  const attemptsPerSecond = method.attemptsPerSecond * speedMultiplier;

  // Heuristic adjustments by method
  if (method.id === 'dictionary') {
    const lower = password.toLowerCase();
    const dictSize = Math.max(method.charsetSize || COMMON_WORDS.length, COMMON_WORDS.length);
    const idx = COMMON_WORDS.indexOf(lower);
    if (idx >= 0) {
      totalCombinations = idx + 1; // Will likely be found early
    } else {
      // Estimate variations: capitalization + numeric/symbol suffixes
      const capVariants = 4; // lower, Title, UPPER, random-ish
      const digitSuffixes = 1 + 10 + 100 + 1000 + 10000; // empty to 4 digits
      const symbolVariants = 10; // a handful of common symbols
      totalCombinations = dictSize * (capVariants + digitSuffixes + symbolVariants);
    }
  } else if (method.id === 'smart') {
    // Smart attack: heuristically reduced search space based on patterns
    let hasUpper = false, hasLower = false, hasNum = false, hasSym = false;
    for (const ch of password) {
      if (ch >= 'A' && ch <= 'Z') hasUpper = true;
      else if (ch >= 'a' && ch <= 'z') hasLower = true;
      else if (ch >= '0' && ch <= '9') hasNum = true;
      else hasSym = true;
    }

    // Check if contains a common word substring
    const lower = password.toLowerCase();
    const containsDict = COMMON_WORDS.some(w => w.length >= 4 && lower.includes(w));

    // Base on brute-force but apply reduction factors typical of mask/prioritized attacks
    const bruteCombos = Math.pow(charsetSize, length);
    let factor = 0.01; // default 1%
    if (containsDict && hasNum && !hasSym) factor = 0.001; // word + digits
    if (containsDict && hasSym) factor = 0.0005; // word + symbol(s)
    if (length <= 8 && (hasLower || hasUpper) && hasNum && !hasSym) factor = 0.0001; // short mixed
    if (!hasUpper && hasLower && hasNum && !hasSym) factor = Math.min(factor, 0.0005);

    const minMaskSpace = COMMON_WORDS.length * 1000; // floor for mask tries
    totalCombinations = Math.max(minMaskSpace, Math.floor(bruteCombos * factor));
  }

  const secondsToCrack = totalCombinations / (2 * attemptsPerSecond); // Average case

  return {
    totalCombinations,
    timeToCrack: formatTime(secondsToCrack),
    attemptsPerSecond,
    currentAttempt: generateCurrentAttempt(password, 0),
    progress: 0
  };
}

export function generateCurrentAttempt(password: string, attemptNumber: number): string {
  const length = password.length;
  let result = '';
  
  // Generate a pattern based on attempt number
  let remaining = attemptNumber;
  for (let i = 0; i < length; i++) {
    const charsetSize = 26; // Simplified for display
    result += String.fromCharCode(97 + (remaining % charsetSize)); // 'a' + offset
    remaining = Math.floor(remaining / charsetSize);
  }
  
  return result;
}

export function simulateBruteForce(
  password: string,
  method: AttackMethod,
  speedMultiplier: number,
  onProgress: (result: BruteForceResult) => void,
  onComplete: (success: boolean) => void
): () => void {
  let isRunning = true;
  let attemptNumber = 0;
  
  const result = calculateBruteForceTime(password, method, speedMultiplier);
  const maxAttempts = Math.min(result.totalCombinations, 1000000); // Cap for demo
  
  const interval = setInterval(() => {
    if (!isRunning || attemptNumber >= maxAttempts) {
      clearInterval(interval);
      onComplete(attemptNumber < maxAttempts);
      return;
    }
    
    const currentResult: BruteForceResult = {
      ...result,
      currentAttempt: generateCurrentAttempt(password, attemptNumber),
      progress: (attemptNumber / maxAttempts) * 100
    };
    
    onProgress(currentResult);
    attemptNumber++;
  }, 1000 / (result.attemptsPerSecond / 1000)); // Adjust for realistic animation speed
  
  return () => {
    isRunning = false;
    clearInterval(interval);
  };
}

function formatTime(seconds: number): string {
  if (seconds < 1) return 'Less than a second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  
  const years = seconds / 31536000;
  
  // Under 1 million years, show normal years
  if (years < 1000000) {
    return `${Math.round(years).toLocaleString()} years`;
  }
  
  // Over 1 million years, use scientific notation
  const exponent = Math.floor(Math.log10(years));
  const mantissa = (years / Math.pow(10, exponent)).toFixed(1);
  return `${mantissa} × 10^${exponent} years`;
}
