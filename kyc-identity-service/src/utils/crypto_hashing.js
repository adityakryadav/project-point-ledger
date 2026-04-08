const crypto = require('crypto');

/**
 * System-wide salt for PII hashing retrieved from environment variable.
 * CRITICAL: This salt ensures RBI PII compliance by enabling secure hashing of sensitive data
 * while maintaining deterministic hashes for the same input (allowing record matching).
 * 
 * Environment Variable: PII_SALT
 * Fallback: Uses a default value if not set (in production, this MUST be configured).
 */
const SYSTEM_SALT = process.env.PII_SALT || 'default-pii-salt-value';

/**
 * Generates a SHA-256 hash of sensitive data with optional salt.
 * 
 * RBI PII COMPLIANCE:
 * - This function enables secure storage of Personally Identifiable Information (PII)
 *   such as Aadhaar numbers without storing the raw data.
 * - Hashed values allow for unique record identification and matching without exposing
 *   the original sensitive information.
 * - Used in KYC workflows where Aadhaar numbers must be referenced but never persisted in plaintext.
 * 
 * @param {string} data - The sensitive string to hash (e.g., Aadhaar number, email, phone).
 * @param {string} [salt] - Optional salt to use. If not provided, SYSTEM_SALT is used.
 * @returns {string} - Hex-encoded SHA-256 hash of the data with salt.
 * 
 * @example
 * const aadhaar_hash = generateSHA256Hash('123456789012', process.env.PII_SALT);
 * // Returns: a1b2c3d4e5f6... (hex-encoded SHA-256)
 */
function generateSHA256Hash(data, salt) {
    // Use provided salt or fall back to system-wide salt
    const effectiveSalt = salt || SYSTEM_SALT;
    
    // Validate input
    if (!data || typeof data !== 'string') {
        throw new Error('Invalid input: data must be a non-empty string');
    }
    
    if (!effectiveSalt || typeof effectiveSalt !== 'string') {
        throw new Error('Invalid salt: salt must be a non-empty string');
    }
    
    // Combine data with salt and generate SHA-256 hash
    const combined = data + effectiveSalt;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    return hash;
}

/**
 * Verifies whether a given plain text value matches a previously generated hash.
 * Useful for validation workflows where we need to verify data without storing raw PII.
 * 
 * @param {string} plaintext - The plain text value to verify (e.g., Aadhaar number).
 * @param {string} hash - The hash to compare against.
 * @param {string} [salt] - Optional salt. If not provided, SYSTEM_SALT is used.
 * @returns {boolean} - True if plaintext matches the hash, false otherwise.
 */
function verifyHash(plaintext, hash, salt) {
    try {
        const generatedHash = generateSHA256Hash(plaintext, salt);
        return generatedHash === hash;
    } catch (error) {
        return false;
    }
}

module.exports = {
    generateSHA256Hash,
    verifyHash,
    SYSTEM_SALT
};
