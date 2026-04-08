const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const { generateSHA256Hash } = require('./crypto_hashing');

/**
 * Parses Aadhaar Offline XML from a password-protected ZIP file.
 * CRITICAL: This function extracts only demographic data (name, dob, gender).
 * Per ILPEP compliance: Aadhaar number is NOT extracted, returned, or stored in plaintext.
 * Per RBI PII COMPLIANCE: Aadhaar number is hashed using SHA-256 and salt for secure identification.
 * 
 * @param {Buffer|string} zipBuffer - Buffer or path to the password-protected ZIP file.
 * @param {string} shareCode - 4-digit share code (password for the ZIP).
 * @returns {Promise<Object>} - Extracted demographic data, aadhaar_hash, and success flag.
 *   - success: {boolean}
 *   - data: {name, dob, gender, aadhaar_hash} if success=true (never includes raw Aadhaar)
 *   - signature: {string} for UIDAI validation
 *   - error: {string} if success=false
 * 
 * ILPEP DATA LOCALIZATION: Raw Aadhaar number is NEVER persisted or transmitted outside this function.
 */
async function parseAadhaarOfflineXML(zipBuffer, shareCode) {
    try {
        const zip = new AdmZip(zipBuffer);
        
        // Aadhaar Offline XML ZIP files are password protected with the share code
        // We need to provide the password when extracting
        const zipEntries = zip.getEntries();
        
        if (zipEntries.length === 0) {
            throw new Error('ZIP file is empty');
        }

        // Find the XML file in the ZIP
        const xmlEntry = zipEntries.find(entry => entry.entryName.endsWith('.xml'));
        if (!xmlEntry) {
            throw new Error('No XML file found in the ZIP');
        }

        // Extract the XML content using the share code as password
        const xmlBuffer = zip.readFile(xmlEntry, shareCode);
        if (!xmlBuffer) {
            throw new Error('Failed to decrypt or read XML file from ZIP. Check if the share code is correct.');
        }

        const xmlContent = xmlBuffer.toString('utf8');
        
        // Parse XML to JS Object
        const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        const result = await parser.parseStringPromise(xmlContent);

        // Extract demographic data from OfflinePaperlessKyc
        // Structure usually: OfflinePaperlessKyc.UidData.Poi (Proof of Identity)
        // ILPEP COMPLIANCE: Extract only demographic data fields
        const uidData = result.OfflinePaperlessKyc.UidData;
        const poi = uidData.Poi;
        
        // CRITICAL: Extract Aadhaar number but ONLY for hashing
        // The raw Aadhaar number is never returned or stored per RBI PII compliance
        let aadhaar_hash = null;
        if (poi.uid) {
            try {
                aadhaar_hash = generateSHA256Hash(poi.uid);
                // CRITICAL: Clear reference to raw Aadhaar - memory disposal
                // The poi.uid should be overwritten or garbage collected after hashing
            } catch (hashError) {
                console.warn('Warning: Failed to hash Aadhaar number:', hashError.message);
                aadhaar_hash = null;
            }
        }
        
        // CRITICAL: Only extract permitted demographic fields
        // Aadhaar number is NOT included; only its SHA-256 hash for identification
        const demographicData = {
            name: poi.name || null,
            dob: poi.dob || null,
            gender: poi.gender || null,
            aadhaar_hash: aadhaar_hash  // RBI PII compliant hashed identifier (ILPEP mandated)
        };

        // Extract digital signature (usually 344 characters)
        // It's often in OfflinePaperlessKyc.Signature
        let signature = result.OfflinePaperlessKyc.Signature;
        if (typeof signature === 'object' && signature._) {
            signature = signature._; // Handle case where it might have attributes
        }

        // ILPEP COMPLIANCE: Return only success flag and demographic data (no raw sensitive data)
        // Signature is included for validation via validateDigitalSignature()
        return {
            success: true,
            data: demographicData,  // Contains: {name, dob, gender, aadhaar_hash} - NO raw Aadhaar
            signature: signature    // For UIDAI digital signature validation only
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Placeholder function to validate the 344-character digital signature against UIDAI public keys.
 * 
 * @param {string} signature - The digital signature from the XML.
 * @param {string} rawXml - The original XML content.
 * @returns {boolean} - Returns true if signature is valid.
 */
function validateDigitalSignature(signature, rawXml) {
    console.log('Validating 344-character digital signature against UIDAI public keys...');
    
    // TODO: Implement actual signature validation logic:
    // 1. Get UIDAI public key (usually from a certificate)
    // 2. Normalize the XML content if needed (canonicalization)
    // 3. Use crypto library to verify the signature
    
    // For now, we return a placeholder result as requested
    if (signature && signature.length === 344) {
        console.log('Signature format appears correct (344 characters).');
        return true; 
    }
    
    console.warn('Invalid signature format.');
    return false;
}

module.exports = {
    parseAadhaarOfflineXML,
    validateDigitalSignature
};
