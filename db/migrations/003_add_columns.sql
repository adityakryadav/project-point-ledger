-- Add demand_score to coupons for dynamic pricing
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS demand_score INTEGER DEFAULT 50;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;

-- Add breakdown columns to user_coupons
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS breakdown_coupon INTEGER DEFAULT 0;
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS breakdown_category INTEGER DEFAULT 0;
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS breakdown_brand INTEGER DEFAULT 0;
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS filter_case VARCHAR(20) DEFAULT 'none';

-- Index for demand score sorting
CREATE INDEX IF NOT EXISTS idx_coupons_demand ON coupons(demand_score DESC);
