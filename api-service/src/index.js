require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { migrate } = require('./config/db');
const routes = require('./routes/index');
const { googleCallback } = require('./controllers/authController');
const { startCouponService } = require('./services/couponService');

const app = express();

// ─── SECURITY MIDDLEWARE ─────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many auth attempts.' } });

// Apply general limiter to all API routes EXCEPT OAuth callback (which is externally triggered)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/google')) return next(); // skip rate limit for OAuth flow
  return limiter(req, res, next);
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── BODY PARSING ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── GOOGLE OAUTH (only if credentials are configured) ───────
const googleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';

if (googleConfigured) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await googleCallback(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
  console.log('✅ Google OAuth enabled');
} else {
  console.log('⚠️  Google OAuth disabled — add GOOGLE_CLIENT_ID to .env to enable');
}

app.use(passport.initialize());

// ─── ROUTES ──────────────────────────────────────────────────
app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── ERROR HANDLER ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await migrate();
    app.listen(PORT, () => {
      console.log(`✅ Point Ledger API running on http://localhost:${PORT}`);
      startCouponService(); // Start background real-time coupon generation
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
