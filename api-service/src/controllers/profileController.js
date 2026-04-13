const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: userRows } = await query(
      'SELECT id, name, email, age, avatar_url, auth_provider, created_at FROM users WHERE id = $1',
      [userId]
    );

    const { rows: cardRows } = await query(
      `SELECT c.*, rp.available_points, rp.expiring_points, rp.expiry_date
       FROM cards c
       LEFT JOIN reward_points rp ON rp.card_id = c.id
       WHERE c.user_id = $1 AND c.is_active = true`,
      [userId]
    );

    const { rows: historyRows } = await query(
      `SELECT rh.*, ca.card_name, ca.bank_name
       FROM reward_history rh
       LEFT JOIN cards ca ON ca.id = rh.card_id
       WHERE rh.user_id = $1
       ORDER BY rh.created_at DESC
       LIMIT 20`,
      [userId]
    );

    const { rows: couponRows } = await query(
      `SELECT uc.*, c.brand_name, c.title, c.discount_label, c.tier, c.logo_url,
              cat.name AS category_name, cat.icon
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN coupon_categories cat ON cat.id = c.category_id
       WHERE uc.user_id = $1
       ORDER BY uc.created_at DESC`,
      [userId]
    );

    const totalPoints = cardRows.reduce((sum, c) => sum + (c.available_points || 0), 0);

    res.json({
      user: userRows[0],
      cards: cardRows,
      total_points: totalPoints,
      reward_history: historyRows,
      coupons: couponRows,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PATCH /api/profile
const updateProfile = async (req, res) => {
  try {
    const { name, age } = req.body;
    const { rows } = await query(
      `UPDATE users SET name = COALESCE($1, name), age = COALESCE($2, age)
       WHERE id = $3
       RETURNING id, name, email, age, avatar_url`,
      [name, age, req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getProfile, updateProfile };
