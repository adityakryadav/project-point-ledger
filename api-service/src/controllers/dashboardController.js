const { query } = require('../config/db');

// GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total points across all cards
    const { rows: pointsRows } = await query(
      `SELECT COALESCE(SUM(available_points), 0) AS total_points,
              COALESCE(SUM(expiring_points), 0) AS total_expiring_points
       FROM reward_points
       WHERE user_id = $1`,
      [userId]
    );

    // Points expiring within 4 days
    const { rows: expiringRows } = await query(
      `SELECT rp.expiring_points, rp.expiry_date, c.card_name, c.bank_name, c.last_four_digits
       FROM reward_points rp
       JOIN cards c ON c.id = rp.card_id
       WHERE rp.user_id = $1
         AND rp.expiry_date <= NOW() + INTERVAL '4 days'
         AND rp.expiry_date >= NOW()
         AND rp.expiring_points > 0
       ORDER BY rp.expiry_date ASC`,
      [userId]
    );

    // User coupons expiring soon
    const { rows: couponExpiringRows } = await query(
      `SELECT uc.id, uc.expires_at, uc.status, c.brand_name, c.discount_label, c.tier,
              cat.name AS category_name, cat.icon
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN coupon_categories cat ON cat.id = c.category_id
       WHERE uc.user_id = $1
         AND uc.status = 'active'
         AND uc.expires_at <= NOW() + INTERVAL '7 days'
       ORDER BY uc.expires_at ASC
       LIMIT 5`,
      [userId]
    );

    // Recently generated/purchased coupons
    const { rows: recentCouponsRows } = await query(
      `SELECT uc.id, uc.created_at, uc.status, uc.points_spent, uc.acquired_via, uc.expires_at,
              c.brand_name, c.title, c.discount_label, c.tier, c.logo_url,
              cat.name AS category_name, cat.icon
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN coupon_categories cat ON cat.id = c.category_id
       WHERE uc.user_id = $1
       ORDER BY uc.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Card-wise summary
    const { rows: cardSummaryRows } = await query(
      `SELECT c.id, c.card_name, c.bank_name, c.last_four_digits, c.network,
              rp.available_points, rp.expiring_points, rp.expiry_date, rp.last_synced_at
       FROM cards c
       LEFT JOIN reward_points rp ON rp.card_id = c.id
       WHERE c.user_id = $1 AND c.is_active = true
       ORDER BY rp.available_points DESC`,
      [userId]
    );

    // Points spent this month
    const { rows: spentRows } = await query(
      `SELECT COALESCE(SUM(ABS(points)), 0) AS points_spent_month
       FROM reward_history
       WHERE user_id = $1
         AND transaction_type = 'spent'
         AND created_at >= DATE_TRUNC('month', NOW())`,
      [userId]
    );

    // Total coupons stats
    const { rows: couponStatsRows } = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'active') AS active_coupons,
        COUNT(*) FILTER (WHERE status = 'redeemed') AS redeemed_coupons,
        COUNT(*) AS total_coupons
       FROM user_coupons WHERE user_id = $1`,
      [userId]
    );

    res.json({
      total_points: parseInt(pointsRows[0].total_points),
      total_expiring_points: parseInt(pointsRows[0].total_expiring_points),
      points_spent_this_month: parseInt(spentRows[0].points_spent_month),
      expiring_points: expiringRows,
      expiring_coupons: couponExpiringRows,
      recent_coupons: recentCouponsRows,
      card_summary: cardSummaryRows,
      coupon_stats: couponStatsRows[0],
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getDashboard };
