const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "kyc-identity-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

