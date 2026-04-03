const express = require("express");
const { nsdlPanVerification } = require("../controllers/nsdl_pan_verification");

const router = express.Router();

// POST /api/v1/kyc/pan/verify
router.post("/verify", nsdlPanVerification);

module.exports = router;

