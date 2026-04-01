/**
 * Fuzzy Name Matcher Utility
 * Compares two strings (user-provided name vs NSDL-returned name) using similarity algorithms
 * Supports both Jaro-Winkler and Levenshtein distance calculations
 */

const natural = require('natural');

/**
 * Normalizes a name string by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Removing special characters except spaces
 * - Normalizing multiple spaces to single space
 * 
 * @param {string} name - The name to normalize
 * @returns {string} - Normalized name
 */
const normalizeName = (name) => {
  if (typeof name !== 'string') {
    return '';
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
};

/**
 * Calculates Jaro-Winkler similarity score between two names
 * Jaro-Winkler is ideal for name comparisons as it gives more weight to matching prefixes
 * 
 * @param {string} name1 - First name (e.g., user-provided name)
 * @param {string} name2 - Second name (e.g., NSDL-returned name)
 * @returns {number} - Similarity score between 0 and 1 (0 = no match, 1 = exact match)
 */
const calculateJaroWinklerScore = (name1, name2) => {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  if (!normalized1 || !normalized2) {
    return 0;
  }
  
  return natural.JaroWinklerDistance(normalized1, normalized2);
};

/**
 * Calculates Levenshtein similarity score between two names
 * Returns a normalized score between 0 and 1 based on edit distance
 * 
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateLevenshteinScore = (name1, name2) => {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  if (!normalized1 || !normalized2) {
    return 0;
  }
  
  const distance = natural.LevenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  // Normalize distance to similarity score (0-1)
  // where 1 = exact match and 0 = completely different
  return 1 - (distance / maxLength);
};

/**
 * Main function: Matches two names using Jaro-Winkler similarity
 * Returns true only if confidence score exceeds 85%
 * 
 * @param {string} userProvidedName - The name provided by the user
 * @param {string} nsdlReturnedName - The name returned by NSDL
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Confidence threshold (default: 0.85 or 85%)
 * @param {string} options.algorithm - Algorithm to use: 'jaro-winkler' or 'levenshtein' (default: 'jaro-winkler')
 * @returns {boolean} - True if similarity score exceeds threshold, false otherwise
 * 
 * @example
 * const isMatch = matchNames('RAJESH KUMAR', 'Rajesh Kumar');
 * // returns: true (score: 1.0)
 * 
 * @example
 * const isMatch = matchNames('RAJESH KUMAR', 'RAJESH KIRMAR', { threshold: 0.85 });
 * // returns: true if similarity >= 0.85
 */
const matchNames = (userProvidedName, nsdlReturnedName, options = {}) => {
  const {
    threshold = 0.85,
    algorithm = 'jaro-winkler'
  } = options;
  
  if (typeof userProvidedName !== 'string' || typeof nsdlReturnedName !== 'string') {
    throw new Error('Both userProvidedName and nsdlReturnedName must be strings');
  }
  
  if (threshold < 0 || threshold > 1) {
    throw new Error('Threshold must be a value between 0 and 1');
  }
  
  let score;
  
  if (algorithm === 'levenshtein') {
    score = calculateLevenshteinScore(userProvidedName, nsdlReturnedName);
  } else if (algorithm === 'jaro-winkler') {
    score = calculateJaroWinklerScore(userProvidedName, nsdlReturnedName);
  } else {
    throw new Error(`Unsupported algorithm: ${algorithm}. Use 'jaro-winkler' or 'levenshtein'`);
  }
  
  return score >= threshold;
};

/**
 * Returns detailed matching information including the similarity score
 * Useful for debugging or logging purposes
 * 
 * @param {string} userProvidedName - The name provided by the user
 * @param {string} nsdlReturnedName - The name returned by NSDL
 * @param {Object} options - Configuration options (same as matchNames)
 * @returns {Object} - Object with match result, scores, and normalized names
 * 
 * @example
 * const result = getMatchDetails('RAJESH KUMAR', 'Rajesh Kumar');
 * // returns: {
 * //   isMatch: true,
 * //   jaroWinklerScore: 1.0,
 * //   levenshteinScore: 1.0,
 * //   userNormalizedName: 'rajesh kumar',
 * //   nsdlNormalizedName: 'rajesh kumar'
 * // }
 */
const getMatchDetails = (userProvidedName, nsdlReturnedName, options = {}) => {
  const {
    threshold = 0.85,
    algorithm = 'jaro-winkler'
  } = options;
  
  const jaroWinklerScore = calculateJaroWinklerScore(userProvidedName, nsdlReturnedName);
  const levenshteinScore = calculateLevenshteinScore(userProvidedName, nsdlReturnedName);
  
  const isMatch = algorithm === 'levenshtein'
    ? levenshteinScore >= threshold
    : jaroWinklerScore >= threshold;
  
  return {
    isMatch,
    jaroWinklerScore: Math.round(jaroWinklerScore * 100) / 100,
    levenshteinScore: Math.round(levenshteinScore * 100) / 100,
    userNormalizedName: normalizeName(userProvidedName),
    nsdlNormalizedName: normalizeName(nsdlReturnedName),
    threshold,
    algorithm
  };
};

module.exports = {
  matchNames,
  getMatchDetails,
  calculateJaroWinklerScore,
  calculateLevenshteinScore,
  normalizeName
};
