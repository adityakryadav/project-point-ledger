const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

const { jwtValidator } = require("./jwt_validator");
const { rateLimiter } = require("./rate_limiter");

module.exports = {
  requestLogger,
  jwtValidator,
  rateLimiter,
};
