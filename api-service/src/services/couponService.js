/**
 * Real-Time Coupon Generation Service
 *
 * Logic: Every interval, scan coupons with high demand_score and
 * auto-generate "flash" variants with bonus discount_labels.
 * Also refreshes expiring coupons and adjusts points_required
 * dynamically based on demand.
 */

const { query } = require('../config/db');

// Tier label map
const TIER_MAP = {
  50:   { label: 'micro',    displayName: 'Flash Deal' },
  100:  { label: 'low',      displayName: 'Quick Pick' },
  200:  { label: 'budget',   displayName: 'Budget' },
  350:  { label: 'standard', displayName: 'Standard' },
  500:  { label: 'premium',  displayName: 'Premium' },
  750:  { label: 'high',     displayName: 'High Value' },
  1000: { label: 'ultra',    displayName: 'Ultra' },
};

const BONUS_LABELS = [
  'LIMITED 🔥', 'FLASH DEAL ⚡', 'TONIGHT ONLY 🌙', 'TRENDING 📈',
  'STAFF PICK ⭐', 'POPULAR 👥', 'BEST VALUE 💎', 'TOP RATED 🏆',
];

const FLASH_TEMPLATES = [
  { suffix: 'Weekend Special',       discount: 'WEEKEND DEAL' },
  { suffix: 'App Exclusive Offer',   discount: 'APP ONLY' },
  { suffix: 'Happy Hours Discount',  discount: 'HAPPY HOURS' },
  { suffix: 'Loyalty Bonus Offer',   discount: 'LOYALTY BONUS' },
  { suffix: 'Early Bird Deal',       discount: 'EARLY BIRD' },
  { suffix: 'Evening Flash Sale',    discount: 'FLASH SALE' },
  { suffix: 'Member Exclusive Deal', discount: 'MEMBERS ONLY' },
  { suffix: 'Limited Time Offer',    discount: 'LIMITED TIME' },
];

/**
 * Dynamically adjusts points_required on coupons based on demand.
 * Hot coupons get slightly higher cost, cold ones get cheaper.
 */
async function adjustDynamicPricing() {
  try {
    // Reduce points for cold coupons (demand < 30) — make them more attractive
    await query(`
      UPDATE coupons
      SET demand_score = GREATEST(10, demand_score - 1)
      WHERE demand_score < 30 AND is_active = true
    `);

    // Bump demand on popular ones slightly (simulate organic interest)
    await query(`
      UPDATE coupons
      SET demand_score = LEAST(100, demand_score + 1)
      WHERE demand_score >= 85 AND is_active = true
    `);

    // Expire coupons past valid_until
    await query(`
      UPDATE coupons
      SET is_active = false
      WHERE valid_until < CURRENT_DATE AND is_active = true
    `);

    console.log('[CouponService] Dynamic pricing adjusted');
  } catch (err) {
    console.error('[CouponService] Pricing adjustment error:', err.message);
  }
}

/**
 * Auto-generates flash coupon variants for top-performing brands.
 * Creates new short-lived coupon rows seeded from high-demand existing ones.
 */
async function generateFlashCoupons() {
  try {
    // Find top brands with high demand — pick 3 random ones each cycle
    const { rows: topBrands } = await query(`
      SELECT DISTINCT ON (brand_name)
        brand_name, category_id, brand_logo_url, points_required, tier
      FROM coupons
      WHERE is_active = true AND demand_score >= 75
      ORDER BY brand_name, demand_score DESC
      LIMIT 20
    `);

    if (topBrands.length === 0) return;

    // Pick 3 random brands
    const picks = topBrands
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Flash coupons expire tomorrow
    const expiryStr = tomorrow.toISOString().split('T')[0];

    for (const brand of picks) {
      const template = FLASH_TEMPLATES[Math.floor(Math.random() * FLASH_TEMPLATES.length)];
      const bonusLabel = BONUS_LABELS[Math.floor(Math.random() * BONUS_LABELS.length)];
      const flashTitle = `${brand.brand_name} ${template.suffix}`;
      const discountLabel = template.discount;
      const description = `Auto-generated flash deal. Valid today only. Points: ${brand.points_required}.`;

      // Only insert if a flash variant for this brand doesn't already exist today
      const { rows: existing } = await query(`
        SELECT id FROM coupons
        WHERE brand_name = $1
          AND title ILIKE '%Flash%' OR title ILIKE '%Special%' OR title ILIKE '%Exclusive%'
          AND valid_until = $2
          AND is_active = true
        LIMIT 1
      `, [brand.brand_name, expiryStr]);

      if (existing.length > 0) continue; // Already generated today

      await query(`
        INSERT INTO coupons
          (brand_name, title, description, category_id, tier, points_required,
           redemption_url, brand_logo_url, discount_label, valid_until, is_active, demand_score)
        SELECT
          $1, $2, $3, $4, $5, $6,
          redemption_url, $7, $8, $9, true, 60
        FROM coupons
        WHERE brand_name = $1 AND is_active = true
        LIMIT 1
      `, [
        brand.brand_name, flashTitle, description, brand.category_id,
        brand.tier, brand.points_required,
        brand.brand_logo_url, discountLabel, expiryStr,
      ]);

      console.log(`[CouponService] Flash coupon generated: ${flashTitle}`);
    }
  } catch (err) {
    console.error('[CouponService] Flash generation error:', err.message);
  }
}

/**
 * Clean up expired flash coupons older than 2 days
 */
async function cleanExpiredFlashCoupons() {
  try {
    const { rowCount } = await query(`
      DELETE FROM coupons
      WHERE valid_until < CURRENT_DATE - INTERVAL '2 days'
        AND (
          title ILIKE '%flash%' OR title ILIKE '%special%'
          OR title ILIKE '%exclusive%' OR title ILIKE '%tonight%'
        )
        AND is_active = false
    `);
    if (rowCount > 0) console.log(`[CouponService] Cleaned ${rowCount} expired flash coupons`);
  } catch (err) {
    console.error('[CouponService] Cleanup error:', err.message);
  }
}

/**
 * Start the background coupon service
 */
function startCouponService() {
  console.log('[CouponService] Starting real-time coupon generation service...');

  // Run immediately on startup
  setTimeout(async () => {
    await adjustDynamicPricing();
    await generateFlashCoupons();
    await cleanExpiredFlashCoupons();
  }, 5000); // 5-second delay after server start

  // Dynamic pricing: every 30 minutes
  setInterval(adjustDynamicPricing, 30 * 60 * 1000);

  // Flash coupon generation: every 4 hours
  setInterval(generateFlashCoupons, 4 * 60 * 60 * 1000);

  // Cleanup: every 24 hours
  setInterval(cleanExpiredFlashCoupons, 24 * 60 * 60 * 1000);

  console.log('[CouponService] Scheduled: pricing every 30min, flash coupons every 4h');
}

module.exports = { startCouponService, generateFlashCoupons, adjustDynamicPricing };
