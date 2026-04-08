const AdmZip = require('adm-zip');
const { parseAadhaarOfflineXML, validateDigitalSignature } = require('./src/utils/aadhaar_xml_parser');
const fs = require('fs');
const path = require('path');

async function testParser() {
    const shareCode = '1234';
    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<OfflinePaperlessKyc xmlns="http://www.uidai.gov.in/offline-kyc">
    <UidData>
        <Poi name="John Doe" dob="1990-01-01" gender="M" m="hash_mobile" e="hash_email" />
    </UidData>
    <Signature>${'A'.repeat(344)}</Signature>
</OfflinePaperlessKyc>`;

    const zip = new AdmZip();
    zip.addFile('offline_aadhaar.xml', Buffer.from(mockXml));
    
    // AdmZip's addFile doesn't support passwords directly.
    // However, it has a method to password-protect the zip.
    // Wait, in adm-zip 0.5.17, we can set password for the entire zip or entries.
    // Actually, to create a password-protected zip with adm-zip, it's a bit different.
    
    // For testing purposes, let's see if we can just test the parsing part 
    // if password-protected creation is tricky with adm-zip.
    
    // In adm-zip 0.5.x, password protection during creation is not straightforward.
    // But since our goal is to test the parser's ability to extract with a password:
    
    const zipBuffer = zip.toBuffer();
    const zipPath = path.join(__dirname, 'test_aadhaar.zip');
    fs.writeFileSync(zipPath, zipBuffer);

    console.log('--- Testing without password (normal zip) ---');
    const result1 = await parseAadhaarOfflineXML(zipPath, undefined);
    console.log('Result:', result1.success ? 'Success' : 'Failed', result1.error || '');
    if (result1.success) {
        console.log('Data:', result1.data);
        console.log('Signature length:', result1.signature?.length);
        console.log('Signature validation:', validateDigitalSignature(result1.signature, mockXml));
    }

    console.log('\n--- Testing with incorrect password (should fail) ---');
    // Note: This might not fail if the zip is not encrypted, but let's check.
    const result2 = await parseAadhaarOfflineXML(zipPath, '9999');
    console.log('Result (Expected fail if encrypted):', result2.success ? 'Success' : 'Failed', result2.error || '');

    // Clean up
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
}

testParser().catch(console.error);
