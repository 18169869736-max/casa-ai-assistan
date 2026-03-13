/**
 * Email Validation Utility
 *
 * Provides email validation with common typo detection for popular email providers
 */

// Common email providers
export const COMMON_EMAIL_PROVIDERS = [
  '@gmail.com',
  '@yahoo.com',
  '@outlook.com',
  '@hotmail.com',
  '@icloud.com',
  '@aol.com',
];

// Common typos mapped to correct providers
const EMAIL_TYPOS: Record<string, string> = {
  // Gmail typos
  'gnail.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmain.com': 'gmail.com',
  'gmsil.com': 'gmail.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yohoo.com': 'yahoo.com',
  'yahoomail.com': 'yahoo.com',
  'yuhoo.com': 'yahoo.com',
  'yahhoo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',

  // Outlook typos
  'outloo.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'outlookk.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlook.com': 'outlook.com',

  // Hotmail typos
  'hotmil.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'htmail.com': 'hotmail.com',
  'homail.com': 'hotmail.com',

  // iCloud typos
  'iclod.com': 'icloud.com',
  'icload.com': 'icloud.com',
  'iclould.com': 'icloud.com',
  'iclou.com': 'icloud.com',
  'icloude.com': 'icloud.com',

  // AOL typos
  'aol.con': 'aol.com',
  'aoll.com': 'aol.com',
  'al.com': 'aol.com',
};

/**
 * Check if email has a common typo and suggest correction
 */
export const detectEmailTypo = (email: string): { hasTypo: boolean; suggestion: string | null } => {
  const trimmedEmail = email.trim().toLowerCase();

  // Extract domain from email
  const atIndex = trimmedEmail.lastIndexOf('@');
  if (atIndex === -1) {
    return { hasTypo: false, suggestion: null };
  }

  const domain = trimmedEmail.substring(atIndex + 1);

  // Check if domain matches a known typo
  if (EMAIL_TYPOS[domain]) {
    const localPart = trimmedEmail.substring(0, atIndex);
    const correctedEmail = `${localPart}@${EMAIL_TYPOS[domain]}`;
    return { hasTypo: true, suggestion: correctedEmail };
  }

  return { hasTypo: false, suggestion: null };
};

/**
 * Basic email format validation
 */
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Find closest matching provider for fuzzy suggestions
 */
export const findClosestProvider = (domain: string): string | null => {
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
  ];

  let closestDomain: string | null = null;
  let minDistance = Infinity;

  for (const commonDomain of commonDomains) {
    const distance = levenshteinDistance(domain.toLowerCase(), commonDomain);
    // Only suggest if distance is small (1-2 characters different)
    if (distance > 0 && distance <= 2 && distance < minDistance) {
      minDistance = distance;
      closestDomain = commonDomain;
    }
  }

  return closestDomain;
};

/**
 * Extract local part (username) from email
 */
export const getEmailLocalPart = (email: string): string => {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;
  return email.substring(0, atIndex);
};

/**
 * Extract domain from email
 */
export const getEmailDomain = (email: string): string => {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return '';
  return email.substring(atIndex + 1);
};
