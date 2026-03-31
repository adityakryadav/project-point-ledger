const crypto = require("crypto");
const { nsdlPanVerificationSchema } = require("../schemas/nsdl_pan.schema");

function stableDecision(pan, name) {
  // Deterministic mock so tests/integrations are stable across restarts.
  const secret = process.env.NSDL_MOCK_SECRET || "ilpep-nsdl-mock-secret";
  const hash = crypto
    .createHash("sha256")
    .update(`${secret}|${pan}|${name}`)
    .digest("hex");

  // ~80% match, ~15% mismatch, ~5% pending (arbitrary but realistic distribution).
  const n = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
  if (n < 0.8) return "MATCH";
  if (n < 0.95) return "MISMATCH";
  return "PENDING";
}

function simulateNsdlLatencyMs() {
  const min = Number(process.env.NSDL_MOCK_MIN_LATENCY_MS ?? 80);
  const max = Number(process.env.NSDL_MOCK_MAX_LATENCY_MS ?? 220);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 120;
  return Math.floor(min + Math.random() * (max - min));
}

async function nsdlPanVerification(req, res) {
  const { error, value } = nsdlPanVerificationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid request body",
      details: error.details.map((d) => ({
        message: d.message,
        path: d.path,
        type: d.type,
      })),
    });
  }

  const pan = value.pan_number.toUpperCase();
  const name = value.name;

  // Simulate calling NSDL PAN verification API (mock only).
  const startedAt = Date.now();
  const latencyMs = simulateNsdlLatencyMs();
  await new Promise((r) => setTimeout(r, latencyMs));

  const verificationStatus = stableDecision(pan, name);
  const requestId = `nsdl-mock-${crypto.randomBytes(6).toString("hex")}`;

  return res.status(200).json({
    provider: "NSDL",
    mocked: true,
    request_id: requestId,
    input: {
      pan_number: pan,
      name,
    },
    result: {
      status: verificationStatus, // MATCH | MISMATCH | PENDING
      name_match_score:
        verificationStatus === "MATCH"
          ? 0.92
          : verificationStatus === "MISMATCH"
            ? 0.41
            : 0.0,
      pan_status: verificationStatus === "MISMATCH" ? "INVALID" : "VALID",
    },
    meta: {
      latency_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { nsdlPanVerification };

