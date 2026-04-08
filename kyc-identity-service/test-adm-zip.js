const AdmZip = require('adm-zip');
console.log('AdmZip methods:', Object.keys(new AdmZip()));
const zip = new AdmZip();
console.log('Zip entry prototype:', Object.getPrototypeOf(zip.getEntries()[0] || {}));
