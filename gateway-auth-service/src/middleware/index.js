const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

const { jwtValidator } = require("./jwt_validator");

module.exports = {
  requestLogger,
  jwtValidator,
};
