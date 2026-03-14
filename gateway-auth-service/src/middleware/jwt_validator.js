const fs = require("fs");
const path = require("path");
const { verifyToken } = require("../utils/jwt.util");

let cachedPublicKey;

function resolvePublicKeyPem() {
  if (cachedPublicKey) return cachedPublicKey;

  const inline = process.env.JWT_PUBLIC_KEY;
  if (inline) {
    cachedPublicKey = inline.replace(/\\n/g, "\n");
    return cachedPublicKey;
  }

  const keyPath =
    process.env.JWT_PUBLIC_KEY_PATH ||
    path.join(__dirname, "..", "..", "dev-keys", "public.pem");

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `JWT public key not found. Set JWT_PUBLIC_KEY or JWT_PUBLIC_KEY_PATH, or run npm run generate:dev-keys (expected default: ${keyPath}).`
    );
  }

  cachedPublicKey = fs.readFileSync(keyPath, "utf8");
  return cachedPublicKey;
}

function jwtValidator(req, res, next) {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header",
    });
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Bearer token is empty",
    });
  }

  try {
    const publicKey = resolvePublicKeyPem();
    const decoded = verifyToken(token, publicKey);
    const role = decoded.role;
    const kycStatus = decoded.kycStatus ?? decoded.kyc_status;

    req.auth = {
      ...decoded,
      role,
      kycStatus,
    };

    next();
  } catch (err) {
    if (err.message && err.message.includes("JWT public key not found")) {
      return res.status(500).json({
        error: "ConfigurationError",
        message: err.message,
      });
    }
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}

module.exports = { jwtValidator };
