const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "dev-keys");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

fs.mkdirSync(outDir, { recursive: true });
const pubPath = path.join(outDir, "public.pem");
const privPath = path.join(outDir, "private.pem");

fs.writeFileSync(pubPath, publicKey, { mode: 0o644 });
fs.writeFileSync(privPath, privateKey, { mode: 0o600 });

console.log(`Wrote ${pubPath}`);
console.log(`Wrote ${privPath}`);
console.log(
  "Set JWT_PUBLIC_KEY_PATH to the public key path, or paste the public PEM into JWT_PUBLIC_KEY."
);
