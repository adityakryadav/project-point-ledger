const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, age, phone, gender, city, referred_by } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    // Generate a simple referral code for this user
    const referral_code = name.replace(/\s+/g, '').toUpperCase().slice(0, 4)
      + Math.floor(1000 + Math.random() * 9000);

    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, age, phone, gender, city, referral_code, referred_by, auth_provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'local')
       RETURNING id, name, email, age, avatar_url, created_at`,
      [name, email, password_hash, age || null, phone || null, gender || null, city || null, referral_code, referred_by || null]
    );

    const user = rows[0];
    const token = generateToken(user.id);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await query(
      'SELECT id, name, email, age, avatar_url, password_hash, auth_provider FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.auth_provider !== 'local' || !user.password_hash) {
      return res.status(401).json({ error: 'Please sign in with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    const { password_hash, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, age, avatar_url, auth_provider, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Google OAuth callback handler
const googleCallback = async (profile) => {
  const { id: googleId, displayName, emails, photos } = profile;
  const email = emails[0].value;
  const avatar_url = photos?.[0]?.value || null;

  const existing = await query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // Update google_id if user signed up via email before
    if (!user.google_id) {
      await query('UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3', [googleId, avatar_url, user.id]);
    }
    return user;
  }

  const { rows } = await query(
    `INSERT INTO users (name, email, google_id, avatar_url, auth_provider, is_email_verified)
     VALUES ($1, $2, $3, $4, 'google', true)
     RETURNING *`,
    [displayName, email, googleId, avatar_url]
  );
  return rows[0];
};

module.exports = { register, login, getMe, generateToken, googleCallback };
