const { query, getClient } = require('../config/db');
const crypto = require('crypto');

// ─── TIER LOGIC ───────────────────────────────────────────────
// Fixed tiers: 200, 350, 500
// Case A: No filter       → coupon from 500-tier, charge 500 pts
// Case B: Category filter → coupon from 350-tier, charge 500 pts (premium for narrowing)
// Case C: Subcategory     → coupon from 200-tier, charge 500 pts (200 coupon + 150 category + 150 brand = 500)

const POINT_TIERS = [200, 350, 500];

const CHARGE_BREAKDOWN = {
  none:        { couponTier: 500, couponCharge: 500, categoryCharge: 0,   brandCharge: 0   },
  category:    { couponTier: 350, couponCharge: 200, categoryCharge: 150, brandCharge: 0   },
  subcategory: { couponTier: 200, couponCharge: 200, categoryCharge: 150, brandCharge: 150 },
};

const getMatchingTier = (userPoints) => {
  const valid = POINT_TIERS.filter(t => t <= userPoints);
  return valid.length > 0 ? valid[valid.length - 1] : null;
};

// GET /api/coupons
const getCoupons = async (req, res) => {
  try {
    const { category, subcategory, tier, search, section } = req.query;

    let sql = `
      SELECT c.*,
             cat.name AS category_name, cat.slug AS category_slug, cat.icon AS category_icon,
             parent.name AS parent_category_name, parent.slug AS parent_category_slug,
             COALESCE(c.demand_score, 50) AS demand_score
      FROM coupons c
      JOIN coupon_categories cat ON cat.id = c.category_id
      LEFT JOIN coupon_categories parent ON parent.id = cat.parent_id
      WHERE c.is_active = true
    `;
    const params = [];
    let pIdx = 1;

    if (category) {
      sql += ` AND (cat.slug = $${pIdx} OR parent.slug = $${pIdx})`;
      params.push(category); pIdx++;
    }
    if (subcategory) {
      sql += ` AND cat.slug = $${pIdx}`;
      params.push(subcategory); pIdx++;
    }
    if (tier) {
      sql += ` AND c.tier = $${pIdx}`;
      params.push(tier); pIdx++;
    }
    if (search) {
      sql += ` AND (c.brand_name ILIKE $${pIdx} OR c.title ILIKE $${pIdx})`;
      params.push(`%${search}%`); pIdx++;
    }
    if (section === 'best')        sql += ' AND c.demand_score >= 80';
    if (section === 'premium')     sql += ` AND c.tier = 'premium'`;
    if (section === 'budget')      sql += ` AND c.tier = 'budget'`;
    if (section === 'trending')    sql += ' AND c.demand_score >= 60 AND c.demand_score < 80';

    sql += ' ORDER BY c.demand_score DESC, c.points_required ASC, c.brand_name ASC';

    const { rows } = await query(sql, params);
    res.json({ coupons: rows });
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

// GET /api/coupons/categories
const getCategories = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT p.*, json_agg(
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon)
        ORDER BY c.name
      ) AS subcategories
      FROM coupon_categories p
      LEFT JOIN coupon_categories c ON c.parent_id = p.id
      WHERE p.parent_id IS NULL
      GROUP BY p.id ORDER BY p.name
    `);
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// POST /api/coupons/generate
// Fixed logic:
//   A) No filter:      coupon from 500-tier, charge 500 pts total
//   B) Category:       coupon from 350-tier, charge 500 pts (200 coupon + 150 category premium)
//   C) Subcategory:    coupon from 200-tier, charge 500 pts (200 coupon + 150 category + 150 brand)
const generateCoupon = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { card_id, category_slug, subcategory_slug } = req.body;

    // Get user's points
    const { rows: pointRows } = await client.query(
      `SELECT rp.available_points, c.bank_name, c.card_name
       FROM reward_points rp
       JOIN cards c ON c.id = rp.card_id
       WHERE rp.card_id = $1 AND rp.user_id = $2 AND c.is_active = true`,
      [card_id, req.user.id]
    );

    if (pointRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card or reward points not found' });
    }

    const userPoints = pointRows[0].available_points;
    const TOTAL_CHARGE = 500; // Always charge 500 points

    if (userPoints < TOTAL_CHARGE) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `You need at least 500 points to generate a coupon. You have ${userPoints}.` });
    }

    // Determine case and breakdown
    let filterCase = 'none';
    if (subcategory_slug) filterCase = 'subcategory';
    else if (category_slug) filterCase = 'category';

    const breakdown = CHARGE_BREAKDOWN[filterCase];
    const { couponTier } = breakdown;

    // Find a random coupon from the correct tier + filter
    let couponSql = `
      SELECT cp.*, cat.name AS category_name, cat.icon AS category_icon,
             parent.name AS parent_category_name
      FROM coupons cp
      JOIN coupon_categories cat ON cat.id = cp.category_id
      LEFT JOIN coupon_categories parent ON parent.id = cat.parent_id
      WHERE cp.is_active = true AND cp.points_required = $1
    `;
    const couponParams = [couponTier];
    let pIdx = 2;

    if (subcategory_slug) {
      couponSql += ` AND cat.slug = $${pIdx}`;
      couponParams.push(subcategory_slug); pIdx++;
    } else if (category_slug) {
      couponSql += ` AND (cat.slug = $${pIdx} OR parent.slug = $${pIdx})`;
      couponParams.push(category_slug); pIdx++;
    }

    couponSql += ' ORDER BY RANDOM() LIMIT 1';

    const { rows: couponRows } = await client.query(couponSql, couponParams);

    if (couponRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No coupons available for your selection. Try a different category.' });
    }

    const coupon = couponRows[0];

    // Deduct exactly 500 points
    await client.query(
      'UPDATE reward_points SET available_points = available_points - $1 WHERE card_id = $2',
      [TOTAL_CHARGE, card_id]
    );

    // Bump demand score
    await client.query(
      'UPDATE coupons SET demand_score = LEAST(100, COALESCE(demand_score, 50) + 2) WHERE id = $1',
      [coupon.id]
    );

    const couponToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { rows: userCouponRows } = await client.query(
      `INSERT INTO user_coupons
         (user_id, coupon_id, card_id, points_spent, coupon_token, acquired_via, expires_at,
          breakdown_coupon, breakdown_category, breakdown_brand, filter_case)
       VALUES ($1,$2,$3,$4,$5,'generated',$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id, coupon.id, card_id, TOTAL_CHARGE, couponToken, expiresAt,
        breakdown.couponCharge, breakdown.categoryCharge, breakdown.brandCharge, filterCase
      ]
    );

    await client.query(
      `INSERT INTO reward_history (user_id, card_id, user_coupon_id, transaction_type, points, description)
       VALUES ($1,$2,$3,'spent',$4,$5)`,
      [req.user.id, card_id, userCouponRows[0].id, -TOTAL_CHARGE,
       `Generated ${coupon.brand_name} coupon (${filterCase} filter)`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      user_coupon: userCouponRows[0],
      coupon: { ...coupon, redemption_url: undefined },
      points_charged: TOTAL_CHARGE,
      breakdown: {
        coupon_value:      breakdown.couponCharge,
        category_premium:  breakdown.categoryCharge,
        brand_premium:     breakdown.brandCharge,
        total:             TOTAL_CHARGE,
        filter_case:       filterCase,
        coupon_tier:       couponTier,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Failed to generate coupon' });
  } finally {
    client.release();
  }
};

// POST /api/coupons/:id/purchase
const purchaseCoupon = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { card_id } = req.body;

    const { rows: couponRows } = await client.query(
      'SELECT * FROM coupons WHERE id = $1 AND is_active = true', [req.params.id]
    );
    if (couponRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const coupon = couponRows[0];
    const { rows: pointRows } = await client.query(
      'SELECT available_points FROM reward_points WHERE card_id = $1 AND user_id = $2',
      [card_id, req.user.id]
    );
    if (pointRows.length === 0 || pointRows[0].available_points < coupon.points_required) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient points' });
    }

    await client.query(
      'UPDATE reward_points SET available_points = available_points - $1 WHERE card_id = $2',
      [coupon.points_required, card_id]
    );
    await client.query(
      'UPDATE coupons SET demand_score = LEAST(100, COALESCE(demand_score, 50) + 1) WHERE id = $1',
      [coupon.id]
    );

    const couponToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { rows: userCouponRows } = await client.query(
      `INSERT INTO user_coupons
         (user_id, coupon_id, card_id, points_spent, coupon_token, acquired_via, expires_at,
          breakdown_coupon, breakdown_category, breakdown_brand, filter_case)
       VALUES ($1,$2,$3,$4,$5,'purchased',$6,$7,0,0,'none')
       RETURNING *`,
      [req.user.id, coupon.id, card_id, coupon.points_required, couponToken, expiresAt, coupon.points_required]
    );

    await client.query(
      `INSERT INTO reward_history (user_id, card_id, user_coupon_id, transaction_type, points, description)
       VALUES ($1,$2,$3,'spent',$4,$5)`,
      [req.user.id, card_id, userCouponRows[0].id, -coupon.points_required, `Purchased ${coupon.brand_name} coupon`]
    );

    await client.query('COMMIT');
    res.status(201).json({ user_coupon: userCouponRows[0], coupon: { ...coupon, redemption_url: undefined } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Purchase error:', err);
    res.status(500).json({ error: 'Failed to purchase coupon' });
  } finally {
    client.release();
  }
};

// POST /api/coupons/user/:userCouponId/redeem
const redeemCoupon = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT uc.*, c.redemption_url, c.brand_name
       FROM user_coupons uc JOIN coupons c ON c.id = uc.coupon_id
       WHERE uc.id = $1 AND uc.user_id = $2`,
      [req.params.userCouponId, req.user.id]
    );

    if (rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Coupon not found' }); }
    const uc = rows[0];
    if (uc.status === 'redeemed') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Already redeemed' }); }
    if (new Date(uc.expires_at) < new Date()) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Coupon expired' }); }

    await client.query(`UPDATE user_coupons SET status='redeemed', redeemed_at=NOW() WHERE id=$1`, [uc.id]);
    await client.query('COMMIT');

    res.json({ message: 'Redeemed!', redemption_url: uc.redemption_url, brand_name: uc.brand_name });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to redeem' });
  } finally {
    client.release();
  }
};

// GET /api/coupons/my-coupons
const getMyCoupons = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT uc.*, c.brand_name, c.title, c.description, c.tier, c.points_required,
              c.logo_url, c.discount_label, c.brand_logo_url,
              cat.name AS category_name, cat.icon AS category_icon,
              card.card_name, card.bank_name, card.last_four_digits,
              u.name AS user_name, u.email AS user_email
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN coupon_categories cat ON cat.id = c.category_id
       LEFT JOIN cards card ON card.id = uc.card_id
       JOIN users u ON u.id = uc.user_id
       WHERE uc.user_id = $1
       ORDER BY uc.created_at DESC`,
      [req.user.id]
    );
    res.json({ coupons: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your coupons' });
  }
};

// GET /api/coupons/user/:userCouponId/bill - data for PDF bill
const getBillData = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT uc.*, c.brand_name, c.title, c.discount_label, c.tier, c.brand_logo_url,
              cat.name AS category_name, cat.icon AS category_icon,
              card.card_name, card.bank_name, card.last_four_digits,
              u.name AS user_name, u.email AS user_email
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN coupon_categories cat ON cat.id = c.category_id
       LEFT JOIN cards card ON card.id = uc.card_id
       JOIN users u ON u.id = uc.user_id
       WHERE uc.id = $1 AND uc.user_id = $2`,
      [req.params.userCouponId, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ bill: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

module.exports = { getCoupons, getCategories, generateCoupon, purchaseCoupon, redeemCoupon, getMyCoupons, getBillData };
