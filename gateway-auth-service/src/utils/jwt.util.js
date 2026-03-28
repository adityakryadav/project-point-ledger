const jwt = require("jsonwebtoken");

const ALGORITHM = "RS256";

function signToken(payload, privateKeyPem, options = {}) {
  const { expiresIn = "1h", ...signOpts } = options;
  return jwt.sign(payload, privateKeyPem, {
    algorithm: ALGORITHM,
    expiresIn,
    ...signOpts,
  });
}

function verifyToken(token, publicKeyPem, options = {}) {
  return jwt.verify(token, publicKeyPem, {
    algorithms: [ALGORITHM],
    ...options,
  });
}

module.exports = {
  signToken,
  verifyToken,
  ALGORITHM,
};
