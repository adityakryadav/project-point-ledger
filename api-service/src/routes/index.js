const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { register, login, getMe, generateToken, googleCallback } = require('../controllers/authController');
const { getCards, addCard, syncCard, deleteCard } = require('../controllers/cardsController');
const { getCoupons, getCategories, generateCoupon, purchaseCoupon, redeemCoupon, getMyCoupons, getBillData } = require('../controllers/couponsController');
const { getDashboard } = require('../controllers/dashboardController');
const { getProfile, updateProfile } = require('../controllers/profileController');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// ── AUTH ──────────────────────────────────────────────────────
router.post('/auth/register',
  [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })],
  validate, register
);
router.post('/auth/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate, login
);
router.get('/auth/me', authenticate, getMe);

// Google OAuth
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user.id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// ── DASHBOARD ────────────────────────────────────────────────
router.get('/dashboard', authenticate, getDashboard);

// ── CARDS ────────────────────────────────────────────────────
router.get('/cards', authenticate, getCards);
router.post('/cards',
  authenticate,
  [
    body('card_name').trim().notEmpty(),
    body('bank_name').trim().notEmpty(),
    body('last_four_digits').matches(/^\d{4}$/),
    body('card_type').isIn(['credit', 'debit']),
    body('network').isIn(['Visa', 'Mastercard', 'Amex', 'RuPay', 'Diners']),
  ],
  validate, addCard
);
router.post('/cards/:id/sync', authenticate, syncCard);
router.delete('/cards/:id', authenticate, deleteCard);

// ── COUPONS ──────────────────────────────────────────────────
router.get('/coupons', authenticate, getCoupons);
router.get('/coupons/categories', authenticate, getCategories);
router.get('/coupons/my-coupons', authenticate, getMyCoupons);
router.get('/coupons/user/:userCouponId/bill', authenticate, getBillData);

router.post('/coupons/generate',
  authenticate,
  [body('card_id').isUUID()],
  validate, generateCoupon
);
router.post('/coupons/:id/purchase', authenticate, purchaseCoupon);
router.post('/coupons/user/:userCouponId/redeem', authenticate, redeemCoupon);

// ── PROFILE ──────────────────────────────────────────────────
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;
