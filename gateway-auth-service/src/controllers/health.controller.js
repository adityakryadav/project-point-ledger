const healthCheck = (req, res) => {
  res.status(200).json({
    service: "gateway-auth-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  healthCheck,
};
