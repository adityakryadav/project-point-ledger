-- ============================================================
-- Credit Card Rewards Coupon Marketplace - Database Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),                    -- NULL for OAuth users
  age INTEGER,
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,                 -- for Google OAuth
  auth_provider VARCHAR(20) DEFAULT 'local',     -- 'local' | 'google'
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_name VARCHAR(100) NOT NULL,               -- e.g. "HDFC Regalia"
  bank_name VARCHAR(100) NOT NULL,               -- e.g. "HDFC Bank"
  last_four_digits VARCHAR(4) NOT NULL,
  card_type VARCHAR(50),                         -- 'credit' | 'debit'
  network VARCHAR(50),                           -- 'Visa' | 'Mastercard' | 'Amex' | 'RuPay'
  reward_program VARCHAR(100),                   -- e.g. "SmartBuy Points"
  card_token VARCHAR(255),                       -- encrypted/tokenized card ref
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REWARD POINTS (per card)
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  available_points INTEGER NOT NULL DEFAULT 0,
  expiring_points INTEGER DEFAULT 0,             -- points expiring within 4 days
  expiry_date DATE,                              -- when expiring_points expire
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPON CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,                    -- e.g. "Food"
  slug VARCHAR(100) UNIQUE NOT NULL,             -- e.g. "food"
  icon VARCHAR(50),                              -- emoji or icon name
  parent_id UUID REFERENCES coupon_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS (master catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name VARCHAR(100) NOT NULL,              -- e.g. "Domino's"
  title VARCHAR(200) NOT NULL,                   -- e.g. "30% off on orders above ₹500"
  description TEXT,
  category_id UUID REFERENCES coupon_categories(id),
  tier VARCHAR(20) NOT NULL,                     -- 'budget' | 'standard' | 'premium'
  points_required INTEGER NOT NULL,              -- e.g. 200, 350, 500
  redemption_url TEXT,                           -- external URL, never shown directly
  logo_url TEXT,
  discount_label VARCHAR(50),                    -- e.g. "30% OFF"
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER COUPONS (generated / purchased)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  card_id UUID REFERENCES cards(id),             -- which card points were deducted from
  points_spent INTEGER NOT NULL,
  coupon_token VARCHAR(255) UNIQUE NOT NULL,     -- unique token for redemption (not coupon code)
  status VARCHAR(30) DEFAULT 'active',           -- 'active' | 'redeemed' | 'expired'
  acquired_via VARCHAR(20) DEFAULT 'generated',  -- 'generated' | 'purchased'
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REWARD HISTORY (points transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id),
  user_coupon_id UUID REFERENCES user_coupons(id),
  transaction_type VARCHAR(30) NOT NULL,         -- 'earned' | 'spent' | 'expired' | 'synced'
  points INTEGER NOT NULL,                       -- positive = earned, negative = spent
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_user_id ON reward_points(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_card_id ON reward_points(card_id);
CREATE INDEX IF NOT EXISTS idx_coupons_category_id ON coupons(category_id);
CREATE INDEX IF NOT EXISTS idx_coupons_points_required ON coupons(points_required);
CREATE INDEX IF NOT EXISTS idx_coupons_tier ON coupons(tier);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_status ON user_coupons(status);
CREATE INDEX IF NOT EXISTS idx_reward_history_user_id ON reward_history(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reward_points_updated_at BEFORE UPDATE ON reward_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_coupons_updated_at BEFORE UPDATE ON user_coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
