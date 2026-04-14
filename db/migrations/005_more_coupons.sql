-- ============================================================
-- Migration 005: Expand point tiers + 200 new coupons
-- Remove tier constraint, support any points_required value
-- ============================================================

-- Drop old tier check if exists and widen tier column
ALTER TABLE coupons ALTER COLUMN tier TYPE VARCHAR(30);
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_tier_check;

-- Add more subcategories for new brands
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('b0000002-0000-0000-0000-000000000016', 'KFC',          'kfc',         '🍗', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000017', 'Pizza Hut',    'pizza-hut',   '🍕', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000018', 'Starbucks',    'starbucks',   '☕', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000019', 'Cafe Coffee Day','ccd',       '☕', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000020', 'Blinkit',      'blinkit',     '🛒', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000021', 'Zepto',        'zepto',       '⚡', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000022', 'Nike',         'nike',        '👟', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000023', 'Adidas',       'adidas',      '👟', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000024', 'Levi''s',      'levis',       '👖', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000025', 'FabIndia',     'fabindia',    '🧥', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000026', 'BookMyShow',   'bookmyshow',  '🎟️', 'a0000001-0000-0000-0000-000000000003'),
  ('b0000002-0000-0000-0000-000000000027', 'Uber',         'uber',        '🚗', 'a0000001-0000-0000-0000-000000000004'),
  ('b0000002-0000-0000-0000-000000000028', 'Rapido',       'rapido',      '🛵', 'a0000001-0000-0000-0000-000000000004'),
  ('b0000002-0000-0000-0000-000000000029', 'RedBus',       'redbus',      '🚌', 'a0000001-0000-0000-0000-000000000004'),
  ('b0000002-0000-0000-0000-000000000030', 'Apple',        'apple',       '🍎', 'a0000001-0000-0000-0000-000000000005'),
  ('b0000002-0000-0000-0000-000000000031', 'Samsung',      'samsung',     '📱', 'a0000001-0000-0000-0000-000000000005'),
  ('b0000002-0000-0000-0000-000000000032', 'Nykaa',        'nykaa',       '💄', 'a0000001-0000-0000-0000-000000000006'),
  ('b0000002-0000-0000-0000-000000000033', 'Puma',         'puma',        '🏃', 'a0000001-0000-0000-0000-000000000007'),
  ('b0000002-0000-0000-0000-000000000034', 'Decathlon',    'decathlon',   '🏋️', 'a0000001-0000-0000-0000-000000000007')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 200 NEW COUPONS across multiple tiers: 50,100,200,350,500,750,1000
-- ============================================================

-- ── FOOD — micro tier (50 pts) ────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Dominos',    'Free drink with any slice',         'Valid on individual slice orders.',                    'b0000002-0000-0000-0000-000000000001','micro',   50,  'https://dominos.co.in',  'FREE DRINK',  '2025-12-31', 62, 'https://logo.clearbit.com/dominos.co.in'),
('Swiggy',     'Rs 30 off first order of the day',  'Min order Rs 99. Valid 6am–12pm.',                    'b0000002-0000-0000-0000-000000000004','micro',   50,  'https://swiggy.com',     'Rs 30 OFF',   '2025-12-31', 58, 'https://logo.clearbit.com/swiggy.com'),
('Zomato',     'Rs 40 off on breakfast orders',     'Valid 7am–11am. Min order Rs 149.',                   'b0000002-0000-0000-0000-000000000005','micro',   50,  'https://zomato.com',     'Rs 40 OFF',   '2025-12-31', 55, 'https://logo.clearbit.com/zomato.com'),
('Burger King','Free small fries with any burger',  'Valid Mon-Fri. Dine-in only.',                        'b0000002-0000-0000-0000-000000000002','micro',   50,  'https://burgerking.in',  'FREE FRIES',  '2025-12-31', 60, 'https://logo.clearbit.com/burgerking.in'),
('McDonalds',  'Rs 25 off on McSaver menu',         'Valid on Rs 99 and Rs 149 McSaver combos.',           'b0000002-0000-0000-0000-000000000003','micro',   50,  'https://mcdonalds.co.in','Rs 25 OFF',   '2025-12-31', 57, 'https://logo.clearbit.com/mcdonalds.com'),
('Starbucks',  'Rs 50 off on any cold beverage',    'Valid on Frappuccino range. App order only.',         'b0000002-0000-0000-0000-000000000018','micro',   50,  'https://starbucks.in',   'Rs 50 OFF',   '2025-12-31', 71, 'https://logo.clearbit.com/starbucks.com'),
('KFC',        'Free side with 2-piece chicken',    'Coleslaw or corn. Dine-in only.',                     'b0000002-0000-0000-0000-000000000016','micro',   50,  'https://kfc.co.in',      'FREE SIDE',   '2025-12-31', 65, 'https://logo.clearbit.com/kfc.com'),
('Blinkit',    'Rs 30 off on grocery orders',       'Min Rs 299. Valid twice per month.',                  'b0000002-0000-0000-0000-000000000020','micro',   50,  'https://blinkit.com',    'Rs 30 OFF',   '2025-12-31', 68, 'https://logo.clearbit.com/blinkit.com'),
('Zepto',      'Rs 25 off on snacks category',      'Min 3 items from snacks. Valid 10am–6pm.',            'b0000002-0000-0000-0000-000000000021','micro',   50,  'https://zeptonow.com',   'Rs 25 OFF',   '2025-12-31', 62, 'https://logo.clearbit.com/zeptonow.com'),
('Pizza Hut',  'Free breadsticks with pizza order', 'Regular breadsticks. Delivery and dine-in.',          'b0000002-0000-0000-0000-000000000017','micro',   50,  'https://pizzahut.co.in', 'FREE BREAD',  '2025-12-31', 59, 'https://logo.clearbit.com/pizzahut.com')
ON CONFLICT DO NOTHING;

-- ── FOOD — low tier (100 pts) ─────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Dominos',    'Rs 80 off on medium pizza',         'Valid on any medium pizza. Min order Rs 250.',        'b0000002-0000-0000-0000-000000000001','low',     100, 'https://dominos.co.in',  'Rs 80 OFF',   '2025-12-31', 72, 'https://logo.clearbit.com/dominos.co.in'),
('Swiggy',     'Rs 75 off on lunch orders',         'Min order Rs 249. Valid 12pm–3pm.',                   'b0000002-0000-0000-0000-000000000004','low',     100, 'https://swiggy.com',     'Rs 75 OFF',   '2025-12-31', 74, 'https://logo.clearbit.com/swiggy.com'),
('Zomato',     'Rs 100 off on orders above Rs 299', 'Sitewide. New and existing users.',                   'b0000002-0000-0000-0000-000000000005','low',     100, 'https://zomato.com',     'Rs 100 OFF',  '2025-12-31', 80, 'https://logo.clearbit.com/zomato.com'),
('KFC',        'Buy 2 pieces get 1 free',           'Original Recipe 3-piece deal.',                       'b0000002-0000-0000-0000-000000000016','low',     100, 'https://kfc.co.in',      'B2G1 FREE',   '2025-12-31', 76, 'https://logo.clearbit.com/kfc.com'),
('Starbucks',  'Rs 100 off on coffee above Rs 350', 'Any hot or cold brew. App only.',                     'b0000002-0000-0000-0000-000000000018','low',     100, 'https://starbucks.in',   'Rs 100 OFF',  '2025-12-31', 78, 'https://logo.clearbit.com/starbucks.com'),
('Pizza Hut',  'Rs 99 off on personal pan pizza',   'Any topping personal pan.',                           'b0000002-0000-0000-0000-000000000017','low',     100, 'https://pizzahut.co.in', 'Rs 99 OFF',   '2025-12-31', 69, 'https://logo.clearbit.com/pizzahut.com'),
('Burger King','Whopper Jr combo at Rs 149',        'Whopper Jr + small fries + small drink.',             'b0000002-0000-0000-0000-000000000002','low',     100, 'https://burgerking.in',  'Rs 149 ONLY', '2025-12-31', 73, 'https://logo.clearbit.com/burgerking.in'),
('Blinkit',    'Rs 80 off on dairy and eggs',       'Min 5 items. Valid all day.',                         'b0000002-0000-0000-0000-000000000020','low',     100, 'https://blinkit.com',    'Rs 80 OFF',   '2025-12-31', 71, 'https://logo.clearbit.com/blinkit.com'),
('Zepto',      'Rs 100 off on first 2 orders',      'Each order min Rs 249.',                              'b0000002-0000-0000-0000-000000000021','low',     100, 'https://zeptonow.com',   'Rs 100 OFF',  '2025-12-31', 75, 'https://logo.clearbit.com/zeptonow.com'),
('McDonalds',  'Happy Meal upgrade free',           'Upgrade to medium size free with any Happy Meal.',    'b0000002-0000-0000-0000-000000000003','low',     100, 'https://mcdonalds.co.in','FREE UPGRADE', '2025-12-31', 68, 'https://logo.clearbit.com/mcdonalds.com')
ON CONFLICT DO NOTHING;

-- ── FOOD — standard (200 pts, additional) ────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Starbucks',  '2 Frappuccinos at Rs 399',          'Any size. App order only.',                           'b0000002-0000-0000-0000-000000000018','budget',  200, 'https://starbucks.in',   '2 FOR Rs 399','2025-12-31', 85, 'https://logo.clearbit.com/starbucks.com'),
('Cafe Coffee Day','Buy 1 Get 1 on all beverages',  'Valid at all CCD outlets. No restrictions.',          'b0000002-0000-0000-0000-000000000019','budget',  200, 'https://cafecoffeeday.com','BOGO',       '2025-12-31', 64, 'https://logo.clearbit.com/cafecoffeeday.com'),
('Blinkit',    'Rs 150 off on Rs 599+ orders',      'Sitewide. Includes fresh produce.',                   'b0000002-0000-0000-0000-000000000020','budget',  200, 'https://blinkit.com',    'Rs 150 OFF',  '2025-12-31', 79, 'https://logo.clearbit.com/blinkit.com'),
('Zepto',      '10 minute delivery + Rs 120 off',   'On orders above Rs 299.',                             'b0000002-0000-0000-0000-000000000021','budget',  200, 'https://zeptonow.com',   'Rs 120 OFF',  '2025-12-31', 72, 'https://logo.clearbit.com/zeptonow.com'),
('Starbucks',  'Rs 200 off on merchandise',         'Valid on cups, tumblers and merchandise.',            'b0000002-0000-0000-0000-000000000018','budget',  200, 'https://starbucks.in',   'Rs 200 OFF',  '2025-12-31', 70, 'https://logo.clearbit.com/starbucks.com')
ON CONFLICT DO NOTHING;

-- ── FOOD — medium (350 pts, additional) ──────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Starbucks',  'Rs 300 off on any order above Rs 800','Valid on food and beverages combined.',              'b0000002-0000-0000-0000-000000000018','standard',350, 'https://starbucks.in',   'Rs 300 OFF',  '2025-12-31', 82, 'https://logo.clearbit.com/starbucks.com'),
('Blinkit',    'Rs 200 off + free delivery 30 days', 'Subscription-like deal for heavy users.',            'b0000002-0000-0000-0000-000000000020','standard',350, 'https://blinkit.com',    'Rs 200 + FREE','2025-12-31',76, 'https://logo.clearbit.com/blinkit.com'),
('KFC',        'Family Feast Rs 599',                '8 pieces + 4 sides + 4 drinks.',                     'b0000002-0000-0000-0000-000000000016','standard',350, 'https://kfc.co.in',      'Rs 599 FEAST','2025-12-31', 80, 'https://logo.clearbit.com/kfc.com'),
('Pizza Hut',  'Rs 250 off on large pizza + sides',  'Valid on Margherita, Pepperoni, Farmhouse.',         'b0000002-0000-0000-0000-000000000017','standard',350, 'https://pizzahut.co.in', 'Rs 250 OFF',  '2025-12-31', 74, 'https://logo.clearbit.com/pizzahut.com'),
('Cafe Coffee Day','Coffee for a month pass',        '30 filter coffees in 30 days.',                      'b0000002-0000-0000-0000-000000000019','standard',350, 'https://cafecoffeeday.com','MONTH PASS', '2025-12-31', 68, 'https://logo.clearbit.com/cafecoffeeday.com')
ON CONFLICT DO NOTHING;

-- ── FOOD — high tier (750 pts) ────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Swiggy',     'Swiggy One 3-Month Membership',     'Unlimited free delivery + exclusive deals.',          'b0000002-0000-0000-0000-000000000004','high',    750, 'https://swiggy.com',     '3 MONTHS',    '2025-12-31', 94, 'https://logo.clearbit.com/swiggy.com'),
('Zomato',     'Zomato Gold 3-Month Free',           '1+1 dishes at 3000+ restaurants.',                   'b0000002-0000-0000-0000-000000000005','high',    750, 'https://zomato.com/gold','3 MONTHS',    '2025-12-31', 96, 'https://logo.clearbit.com/zomato.com'),
('Starbucks',  'Rs 750 off on any order above Rs 2000','Corporate gifting deal included.',                 'b0000002-0000-0000-0000-000000000018','high',    750, 'https://starbucks.in',   'Rs 750 OFF',  '2025-12-31', 78, 'https://logo.clearbit.com/starbucks.com'),
('KFC',        'Birthday Party Package for 10',      '40 pieces + large sides + soft drinks.',             'b0000002-0000-0000-0000-000000000016','high',    750, 'https://kfc.co.in',      'PARTY PACK',  '2025-12-31', 72, 'https://logo.clearbit.com/kfc.com'),
('Blinkit',    'Rs 500 off + 6-month free delivery', 'Annual savings deal.',                               'b0000002-0000-0000-0000-000000000020','high',    750, 'https://blinkit.com',    'Rs 500 + 6M', '2025-12-31', 80, 'https://logo.clearbit.com/blinkit.com')
ON CONFLICT DO NOTHING;

-- ── FOOD — premium tier (1000 pts) ───────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Zomato',     'Zomato Gold Annual Membership',     '12 months free — worth Rs 2400.',                     'b0000002-0000-0000-0000-000000000005','ultra',  1000, 'https://zomato.com/gold','1 YEAR FREE', '2025-12-31', 98, 'https://logo.clearbit.com/zomato.com'),
('Swiggy',     'Swiggy One Annual Pass',            'Rs 2999 value. Free delivery all year.',              'b0000002-0000-0000-0000-000000000004','ultra',  1000, 'https://swiggy.com',     '1 YEAR PASS', '2025-12-31', 97, 'https://logo.clearbit.com/swiggy.com'),
('Starbucks',  'Rs 1000 Starbucks gift card',       'Redeemable at any Starbucks outlet.',                 'b0000002-0000-0000-0000-000000000018','ultra',  1000, 'https://starbucks.in',   'Rs 1000 GIFT','2025-12-31', 91, 'https://logo.clearbit.com/starbucks.com')
ON CONFLICT DO NOTHING;

-- ── CLOTHING — micro (50 pts) ─────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Myntra',     '5% extra off on sale items',        'Over and above existing discounts.',                  'b0000002-0000-0000-0000-000000000009','micro',   50,  'https://myntra.com',     '5% EXTRA',    '2025-12-31', 65, 'https://logo.clearbit.com/myntra.com'),
('Zudio',      'Free alteration on any purchase',   'At store only. Valid for 30 days from purchase.',     'b0000002-0000-0000-0000-000000000007','micro',   50,  'https://zudio.com',      'FREE ALTER',  '2025-12-31', 55, 'https://logo.clearbit.com/zudio.com'),
('FabIndia',   'Rs 50 off on ethnic wear',          'Min Rs 499. Store and online.',                       'b0000002-0000-0000-0000-000000000025','micro',   50,  'https://fabindia.com',   'Rs 50 OFF',   '2025-12-31', 62, 'https://logo.clearbit.com/fabindia.com')
ON CONFLICT DO NOTHING;

-- ── CLOTHING — low (100 pts) ──────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Adidas',     '10% off on running collection',     'All Adidas running shoes and apparel.',               'b0000002-0000-0000-0000-000000000023','low',     100, 'https://adidas.co.in',   '10% OFF',     '2025-12-31', 79, 'https://logo.clearbit.com/adidas.com'),
('Levi''s',    'Rs 100 off on jeans above Rs 1299', 'Valid on all Levi''s 511, 512, 514 fits.',           'b0000002-0000-0000-0000-000000000024','low',     100, 'https://levis.in',       'Rs 100 OFF',  '2025-12-31', 74, 'https://logo.clearbit.com/levi.com'),
('FabIndia',   'Buy 2 get 1 on kurtas',             'All cotton kurtas. Mix and match.',                   'b0000002-0000-0000-0000-000000000025','low',     100, 'https://fabindia.com',   'B2G1 FREE',   '2025-12-31', 70, 'https://logo.clearbit.com/fabindia.com'),
('Nike',       'Rs 100 off on socks pack',          '3-pair socks pack. All sports types.',                'b0000002-0000-0000-0000-000000000022','low',     100, 'https://nike.com/in',    'Rs 100 OFF',  '2025-12-31', 68, 'https://logo.clearbit.com/nike.com')
ON CONFLICT DO NOTHING;

-- ── CLOTHING — standard (200/350 pts, additional) ─────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Adidas',     '20% off on Ultraboost shoes',       'Latest Ultraboost collection.',                       'b0000002-0000-0000-0000-000000000023','budget',  200, 'https://adidas.co.in',   '20% OFF',     '2025-12-31', 85, 'https://logo.clearbit.com/adidas.com'),
('Levi''s',    'Rs 200 off on jackets',             'All leather and denim jackets.',                      'b0000002-0000-0000-0000-000000000024','budget',  200, 'https://levis.in',       'Rs 200 OFF',  '2025-12-31', 76, 'https://logo.clearbit.com/levi.com'),
('FabIndia',   'Rs 250 off on festive collection',  'Silk, linen, chanderi range.',                        'b0000002-0000-0000-0000-000000000025','budget',  200, 'https://fabindia.com',   'Rs 250 OFF',  '2025-12-31', 72, 'https://logo.clearbit.com/fabindia.com'),
('Adidas',     'Rs 350 off on sports sets',         'T-shirt + shorts combo. All sizes.',                  'b0000002-0000-0000-0000-000000000023','standard',350, 'https://adidas.co.in',   'Rs 350 OFF',  '2025-12-31', 80, 'https://logo.clearbit.com/adidas.com'),
('Levi''s',    '30% off on entire collection',      'Including new arrivals. Limited time.',               'b0000002-0000-0000-0000-000000000024','standard',350, 'https://levis.in',       '30% OFF',     '2025-12-31', 82, 'https://logo.clearbit.com/levi.com')
ON CONFLICT DO NOTHING;

-- ── CLOTHING — high (750 pts) ─────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Nike',       'Rs 750 off on Nike Air Max',        'Any colour. Any size.',                               'b0000002-0000-0000-0000-000000000022','high',    750, 'https://nike.com/in',    'Rs 750 OFF',  '2025-12-31', 90, 'https://logo.clearbit.com/nike.com'),
('Adidas',     'Rs 700 off on Yeezy-style shoes',   'Adidas Ozweego and NMD range.',                       'b0000002-0000-0000-0000-000000000023','high',    750, 'https://adidas.co.in',   'Rs 700 OFF',  '2025-12-31', 87, 'https://logo.clearbit.com/adidas.com'),
('Levi''s',    'Rs 600 off on premium denim',       'Levi''s 501 original and Skinny range.',             'b0000002-0000-0000-0000-000000000024','high',    750, 'https://levis.in',       'Rs 600 OFF',  '2025-12-31', 83, 'https://logo.clearbit.com/levi.com'),
('Myntra',     'Rs 800 off + free express delivery','On orders above Rs 2999.',                            'b0000002-0000-0000-0000-000000000009','high',    750, 'https://myntra.com',     'Rs 800 OFF',  '2025-12-31', 88, 'https://logo.clearbit.com/myntra.com'),
('Zara',       'Rs 750 off on winter collection',   'Coats, jackets, knitwear included.',                  'b0000002-0000-0000-0000-000000000006','high',    750, 'https://zara.com/in',    'Rs 750 OFF',  '2025-12-31', 86, 'https://logo.clearbit.com/zara.com')
ON CONFLICT DO NOTHING;

-- ── CLOTHING — ultra (1000 pts) ───────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Nike',       'Rs 1500 off on any Nike purchase',  'No minimum. All categories.',                         'b0000002-0000-0000-0000-000000000022','ultra',  1000, 'https://nike.com/in',    'Rs 1500 OFF', '2025-12-31', 95, 'https://logo.clearbit.com/nike.com'),
('Adidas',     'Adidas VIP store access + Rs 1000 off','Early access to new launches.',                   'b0000002-0000-0000-0000-000000000023','ultra',  1000, 'https://adidas.co.in',   'VIP + Rs 1000','2025-12-31',92, 'https://logo.clearbit.com/adidas.com')
ON CONFLICT DO NOTHING;

-- ── MOVIES — all tiers ────────────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('BookMyShow', 'Rs 50 off on any movie ticket',     'Valid on 2D shows. App booking.',                     'b0000002-0000-0000-0000-000000000026','micro',   50,  'https://bookmyshow.com', 'Rs 50 OFF',   '2025-12-31', 72, 'https://logo.clearbit.com/bookmyshow.com'),
('PVR',        'Rs 40 off on weekday shows',        'Mon-Thu. Any show time.',                             'b0000002-0000-0000-0000-000000000011','micro',   50,  'https://pvrcinemas.com', 'Rs 40 OFF',   '2025-12-31', 68, 'https://logo.clearbit.com/pvrcinemas.com'),
('INOX',       'Rs 60 off on afternoon shows',      '12pm–4pm slot. Any day.',                             'b0000002-0000-0000-0000-000000000012','micro',   50,  'https://inoxmovies.com', 'Rs 60 OFF',   '2025-12-31', 65, 'https://logo.clearbit.com/inoxmovies.com'),
('BookMyShow', 'Rs 100 off on event tickets',       'Concerts, plays, comedy shows.',                      'b0000002-0000-0000-0000-000000000026','low',     100, 'https://bookmyshow.com', 'Rs 100 OFF',  '2025-12-31', 76, 'https://logo.clearbit.com/bookmyshow.com'),
('PVR',        'Popcorn combo free with 2 tickets', 'Large popcorn + 2 drinks.',                           'b0000002-0000-0000-0000-000000000011','low',     100, 'https://pvrcinemas.com', 'FREE COMBO',  '2025-12-31', 81, 'https://logo.clearbit.com/pvrcinemas.com'),
('INOX',       'Rs 120 off on 3D movies',           'IMAX 3D and Dolby 3D screens.',                       'b0000002-0000-0000-0000-000000000012','low',     100, 'https://inoxmovies.com', 'Rs 120 OFF',  '2025-12-31', 74, 'https://logo.clearbit.com/inoxmovies.com'),
('IMAX',       'Buy 3 tickets get 1 free',          'Group outing deal. Any IMAX show.',                   'b0000002-0000-0000-0000-000000000010','standard',350, 'https://imax.com',       'B3G1 FREE',   '2025-12-31', 88, 'https://logo.clearbit.com/imax.com'),
('BookMyShow', 'Rs 400 off on sports events',       'IPL, ISL, football. Select venues.',                  'b0000002-0000-0000-0000-000000000026','standard',350, 'https://bookmyshow.com', 'Rs 400 OFF',  '2025-12-31', 84, 'https://logo.clearbit.com/bookmyshow.com'),
('PVR',        'Date Night Package',                '2 tickets + dinner voucher + popcorn.',               'b0000002-0000-0000-0000-000000000011','premium', 500, 'https://pvrcinemas.com', 'DATE NIGHT',  '2025-12-31', 90, 'https://logo.clearbit.com/pvrcinemas.com'),
('IMAX',       'Exclusive IMAX + Dining Experience','Premiere show + 3-course dinner.',                    'b0000002-0000-0000-0000-000000000010','high',    750, 'https://imax.com',       'PREMIERE EXP','2025-12-31', 89, 'https://logo.clearbit.com/imax.com'),
('BookMyShow', 'Bollywood Premiere Invite + Rs 500 off','Access to movie premieres.',                     'b0000002-0000-0000-0000-000000000026','ultra',  1000, 'https://bookmyshow.com', 'PREMIERE',    '2025-12-31', 93, 'https://logo.clearbit.com/bookmyshow.com')
ON CONFLICT DO NOTHING;

-- ── TRAVEL — all tiers ────────────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Rapido',     'Rs 30 off on 2 bike rides',         'Valid on Rapido Bike. Morning commute.',               'b0000002-0000-0000-0000-000000000028','micro',   50,  'https://rapido.bike',    'Rs 30 OFF',   '2025-12-31', 63, 'https://logo.clearbit.com/rapido.bike'),
('Uber',       'Rs 50 off on first ride today',     'UberGo or UberX. Valid till midnight.',               'b0000002-0000-0000-0000-000000000027','micro',   50,  'https://uber.com/in',    'Rs 50 OFF',   '2025-12-31', 71, 'https://logo.clearbit.com/uber.com'),
('Ola',        'Rs 40 off on evening rides',        '5pm–10pm. Mini and Sedan.',                           'b0000002-0000-0000-0000-000000000015','micro',   50,  'https://olacabs.com',    'Rs 40 OFF',   '2025-12-31', 66, 'https://logo.clearbit.com/olacabs.com'),
('RedBus',     'Rs 75 off on sleeper bus',          'Min Rs 400 booking.',                                 'b0000002-0000-0000-0000-000000000029','low',     100, 'https://redbus.in',      'Rs 75 OFF',   '2025-12-31', 69, 'https://logo.clearbit.com/redbus.in'),
('Rapido',     'Rs 100 off on 5 rides',             'Mix of bike and auto rides.',                         'b0000002-0000-0000-0000-000000000028','low',     100, 'https://rapido.bike',    'Rs 100 OFF',  '2025-12-31', 70, 'https://logo.clearbit.com/rapido.bike'),
('Uber',       'Rs 120 off on Uber Auto',           'Valid on 3 auto rides. Any time.',                    'b0000002-0000-0000-0000-000000000027','low',     100, 'https://uber.com/in',    'Rs 120 OFF',  '2025-12-31', 74, 'https://logo.clearbit.com/uber.com'),
('RedBus',     'Rs 200 off on Volvo AC bus',        'Min Rs 800 booking.',                                 'b0000002-0000-0000-0000-000000000029','budget',  200, 'https://redbus.in',      'Rs 200 OFF',  '2025-12-31', 74, 'https://logo.clearbit.com/redbus.in'),
('Rapido',     'Rapido Monthly Pass Rs 199',        'Unlimited bike rides. Daily cap applies.',            'b0000002-0000-0000-0000-000000000028','budget',  200, 'https://rapido.bike',    'MONTH PASS',  '2025-12-31', 76, 'https://logo.clearbit.com/rapido.bike'),
('Uber',       'Uber One 1-month free',             '10% off every ride + priority pickup.',               'b0000002-0000-0000-0000-000000000027','standard',350, 'https://uber.com/in',    '1 MONTH FREE','2025-12-31', 83, 'https://logo.clearbit.com/uber.com'),
('RedBus',     'Rs 400 off on train ticket booking','IRCTC via RedBus. Tatkal included.',                 'b0000002-0000-0000-0000-000000000029','standard',350, 'https://redbus.in',      'Rs 400 OFF',  '2025-12-31', 77, 'https://logo.clearbit.com/redbus.in'),
('MakeMyTrip', 'Rs 700 off on business class',     'Domestic business class. Select airlines.',           'b0000002-0000-0000-0000-000000000013','high',    750, 'https://makemytrip.com', 'Rs 700 OFF',  '2025-12-31', 81, 'https://logo.clearbit.com/makemytrip.com'),
('Cleartrip',  'Rs 600 off on international flight','Min Rs 20000 booking.',                              'b0000002-0000-0000-0000-000000000014','high',    750, 'https://cleartrip.com',  'Rs 600 OFF',  '2025-12-31', 78, 'https://logo.clearbit.com/cleartrip.com'),
('MakeMyTrip', 'Rs 2000 off on international trip','MMT holiday packages abroad.',                        'b0000002-0000-0000-0000-000000000013','ultra',  1000, 'https://makemytrip.com', 'Rs 2000 OFF', '2025-12-31', 89, 'https://logo.clearbit.com/makemytrip.com'),
('Uber',       'Uber Black 1-month subscription',  'Premium rides all month with flat rates.',            'b0000002-0000-0000-0000-000000000027','ultra',  1000, 'https://uber.com/in',    'BLACK PASS',  '2025-12-31', 85, 'https://logo.clearbit.com/uber.com')
ON CONFLICT DO NOTHING;

-- ── ELECTRONICS — all tiers ───────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Flipkart',   'Rs 50 off on mobile accessories',  'Covers, chargers, earphones.',                        'a0000001-0000-0000-0000-000000000005','micro',   50,  'https://flipkart.com',   'Rs 50 OFF',   '2025-12-31', 63, 'https://logo.clearbit.com/flipkart.com'),
('Amazon',     'Rs 75 cashback on Amazon Pay',      'On any electronics purchase above Rs 500.',           'a0000001-0000-0000-0000-000000000005','micro',   50,  'https://amazon.in',      'Rs 75 BACK',  '2025-12-31', 70, 'https://logo.clearbit.com/amazon.com'),
('Samsung',    'Free screen protector',             'With any Samsung phone purchase.',                    'b0000002-0000-0000-0000-000000000031','micro',   50,  'https://samsung.com/in', 'FREE SCREEN', '2025-12-31', 65, 'https://logo.clearbit.com/samsung.com'),
('Flipkart',   'Rs 150 off on headphones',         'Branded headphones above Rs 999.',                    'a0000001-0000-0000-0000-000000000005','low',     100, 'https://flipkart.com',   'Rs 150 OFF',  '2025-12-31', 72, 'https://logo.clearbit.com/flipkart.com'),
('Amazon',     '10% off on smart home devices',    'Alexa, Echo, Ring devices.',                          'a0000001-0000-0000-0000-000000000005','low',     100, 'https://amazon.in',      '10% OFF',     '2025-12-31', 76, 'https://logo.clearbit.com/amazon.com'),
('Samsung',    'Rs 1000 off on Galaxy Watch',      'Watch 4, Watch 5 series.',                            'b0000002-0000-0000-0000-000000000031','standard',350, 'https://samsung.com/in', 'Rs 1000 OFF', '2025-12-31', 84, 'https://logo.clearbit.com/samsung.com'),
('Apple',      'Rs 500 off on Apple Watch SE',     'GPS model. Any size.',                                'b0000002-0000-0000-0000-000000000030','standard',350, 'https://apple.com/in',   'Rs 500 OFF',  '2025-12-31', 92, 'https://logo.clearbit.com/apple.com'),
('Croma',      'Rs 1500 off on washing machines',  'Above Rs 15000. Select brands.',                      'a0000001-0000-0000-0000-000000000005','premium', 500, 'https://croma.com',      'Rs 1500 OFF', '2025-12-31', 78, 'https://logo.clearbit.com/croma.com'),
('Samsung',    'Rs 2000 off on Galaxy S series',   'S23, S24 models included.',                           'b0000002-0000-0000-0000-000000000031','high',    750, 'https://samsung.com/in', 'Rs 2000 OFF', '2025-12-31', 87, 'https://logo.clearbit.com/samsung.com'),
('Apple',      'Rs 2500 off on iPhone 15',         'All storage variants.',                               'b0000002-0000-0000-0000-000000000030','high',    750, 'https://apple.com/in',   'Rs 2500 OFF', '2025-12-31', 96, 'https://logo.clearbit.com/apple.com'),
('Apple',      'Rs 5000 off on MacBook Pro M3',    '14-inch and 16-inch models.',                         'b0000002-0000-0000-0000-000000000030','ultra',  1000, 'https://apple.com/in',   'Rs 5000 OFF', '2025-12-31', 98, 'https://logo.clearbit.com/apple.com'),
('Samsung',    'Rs 4000 off on Neo QLED 4K TV',   '55-inch and above.',                                  'b0000002-0000-0000-0000-000000000031','ultra',  1000, 'https://samsung.com/in', 'Rs 4000 OFF', '2025-12-31', 90, 'https://logo.clearbit.com/samsung.com')
ON CONFLICT DO NOTHING;

-- ── HEALTH & BEAUTY — all tiers ───────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Nykaa',      'Rs 60 off on lip care',            'Lip balm, lip gloss, lip serum.',                     'b0000002-0000-0000-0000-000000000032','micro',   50,  'https://nykaa.com',      'Rs 60 OFF',   '2025-12-31', 64, 'https://logo.clearbit.com/nykaa.com'),
('Mamaearth',  'Free face wash with serum',        'Any Mamaearth serum. Valid online.',                  'a0000001-0000-0000-0000-000000000006','micro',   50,  'https://mamaearth.in',   'FREE WASH',   '2025-12-31', 60, 'https://logo.clearbit.com/mamaearth.in'),
('Nykaa',      'Rs 150 off on sunscreen range',    'SPF 30+ all brands.',                                 'b0000002-0000-0000-0000-000000000032','low',     100, 'https://nykaa.com',      'Rs 150 OFF',  '2025-12-31', 73, 'https://logo.clearbit.com/nykaa.com'),
('Cult.fit',   '2 Free trial classes',             'Any fitness class at any Cult.fit.',                  'a0000001-0000-0000-0000-000000000006','low',     100, 'https://cult.fit',       '2 FREE',      '2025-12-31', 77, 'https://logo.clearbit.com/cult.fit'),
('Nykaa',      'Rs 250 off on perfume above Rs 999','All premium fragrances.',                            'b0000002-0000-0000-0000-000000000032','budget',  200, 'https://nykaa.com',      'Rs 250 OFF',  '2025-12-31', 81, 'https://logo.clearbit.com/nykaa.com'),
('Mamaearth',  'Full skincare kit 40% off',        'Cleanser + toner + moisturiser + serum.',             'a0000001-0000-0000-0000-000000000006','budget',  200, 'https://mamaearth.in',   '40% OFF',     '2025-12-31', 75, 'https://logo.clearbit.com/mamaearth.in'),
('Cult.fit',   '3-Month Cult Pass at Rs 999',      '3 months unlimited classes. Rs 2997 value.',          'a0000001-0000-0000-0000-000000000006','standard',350, 'https://cult.fit',       'Rs 999 ONLY', '2025-12-31', 85, 'https://logo.clearbit.com/cult.fit'),
('Nykaa',      'Rs 500 off on makeup kits',        'Foundation, contour, highlighter sets.',              'b0000002-0000-0000-0000-000000000032','premium', 500, 'https://nykaa.com',      'Rs 500 OFF',  '2025-12-31', 88, 'https://logo.clearbit.com/nykaa.com'),
('Cult.fit',   '6-Month Annual Pass',              'Save 40% vs monthly. All gyms included.',            'a0000001-0000-0000-0000-000000000006','high',    750, 'https://cult.fit',       '6 MONTHS',    '2025-12-31', 82, 'https://logo.clearbit.com/cult.fit'),
('Nykaa',      'Nykaa Annual Box Subscription',    '12 monthly beauty boxes worth Rs 6000.',              'b0000002-0000-0000-0000-000000000032','ultra',  1000, 'https://nykaa.com',      'ANNUAL BOX',  '2025-12-31', 87, 'https://logo.clearbit.com/nykaa.com')
ON CONFLICT DO NOTHING;

-- ── SPORTS — all tiers ────────────────────────────────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Decathlon',  'Rs 50 off on sports accessories',  'Caps, socks, wristbands, grips.',                     'b0000002-0000-0000-0000-000000000034','micro',   50,  'https://decathlon.in',   'Rs 50 OFF',   '2025-12-31', 62, 'https://logo.clearbit.com/decathlon.com'),
('Puma',       'Rs 80 off on sports socks',        '3-pack multicolor socks.',                            'b0000002-0000-0000-0000-000000000033','micro',   50,  'https://in.puma.com',    'Rs 80 OFF',   '2025-12-31', 60, 'https://logo.clearbit.com/puma.com'),
('Decathlon',  'Rs 150 off on swimming gear',      'Goggles, cap, swimwear combo.',                       'b0000002-0000-0000-0000-000000000034','low',     100, 'https://decathlon.in',   'Rs 150 OFF',  '2025-12-31', 68, 'https://logo.clearbit.com/decathlon.com'),
('Puma',       '15% off on gym collection',        'Tank tops, gym shorts, training shoes.',              'b0000002-0000-0000-0000-000000000033','low',     100, 'https://in.puma.com',    '15% OFF',     '2025-12-31', 72, 'https://logo.clearbit.com/puma.com'),
('Decathlon',  'Rs 300 off on trekking gear',      'Backpacks, poles, waterproof jackets.',               'b0000002-0000-0000-0000-000000000034','budget',  200, 'https://decathlon.in',   'Rs 300 OFF',  '2025-12-31', 76, 'https://logo.clearbit.com/decathlon.com'),
('Puma',       'Buy 2 shoes get 30% off',          'Mix and match all Puma footwear.',                    'b0000002-0000-0000-0000-000000000033','standard',350, 'https://in.puma.com',    '30% OFF',     '2025-12-31', 81, 'https://logo.clearbit.com/puma.com'),
('Decathlon',  'Rs 500 off on fitness equipment',  'Dumbbells, resistance bands, yoga mats.',             'b0000002-0000-0000-0000-000000000034','premium', 500, 'https://decathlon.in',   'Rs 500 OFF',  '2025-12-31', 79, 'https://logo.clearbit.com/decathlon.com'),
('Puma',       'Rs 700 off on smart fitness band',  'Puma Smartwatch and fitness trackers.',               'b0000002-0000-0000-0000-000000000033','high',    750, 'https://in.puma.com',    'Rs 700 OFF',  '2025-12-31', 76, 'https://logo.clearbit.com/puma.com'),
('Decathlon',  'Rs 1500 off on premium bicycle',   'Mountain bikes and road bikes above Rs 8000.',        'b0000002-0000-0000-0000-000000000034','ultra',  1000, 'https://decathlon.in',   'Rs 1500 OFF', '2025-12-31', 83, 'https://logo.clearbit.com/decathlon.com'),
('Puma',       'Puma Athlete Gear Bundle',         'Full pro kit: shoes + jersey + shorts + bag.',        'b0000002-0000-0000-0000-000000000033','ultra',  1000, 'https://in.puma.com',    'ATHLETE KIT', '2025-12-31', 85, 'https://logo.clearbit.com/puma.com')
ON CONFLICT DO NOTHING;

-- ── EXTRA VARIETY — misc brands across categories ─────────────
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
-- Ajio (clothing)
('Ajio',  '10% off on western wear',               'Dresses, tops, co-ords.',                             'a0000001-0000-0000-0000-000000000002','micro',   50,  'https://ajio.com',       '10% OFF',     '2025-12-31', 70, 'https://logo.clearbit.com/ajio.com'),
('Ajio',  'Rs 200 off on premium brands',          'Tommy, Calvin Klein, Armani Exchange.',               'a0000001-0000-0000-0000-000000000002','budget',  200, 'https://ajio.com',       'Rs 200 OFF',  '2025-12-31', 78, 'https://logo.clearbit.com/ajio.com'),
('Ajio',  'Rs 500 off on luxury brand sale',       'End of season clearance.',                            'a0000001-0000-0000-0000-000000000002','premium', 500, 'https://ajio.com',       'Rs 500 OFF',  '2025-12-31', 82, 'https://logo.clearbit.com/ajio.com'),
-- Meesho (clothing)
('Meesho','Rs 60 off on ethnic sets',              'Kurti + pallazo sets. Min Rs 299.',                   'a0000001-0000-0000-0000-000000000002','micro',   50,  'https://meesho.com',     'Rs 60 OFF',   '2025-12-31', 65, 'https://logo.clearbit.com/meesho.com'),
('Meesho','Free shipping + Rs 100 off',            'Valid sitewide for 7 days.',                          'a0000001-0000-0000-0000-000000000002','low',     100, 'https://meesho.com',     'FREE + Rs 100','2025-12-31',70, 'https://logo.clearbit.com/meesho.com'),
-- Boat (electronics)
('Boat',  'Rs 100 off on Airdopes',                'All wireless earbuds.',                               'a0000001-0000-0000-0000-000000000005','low',     100, 'https://boat-lifestyle.com','Rs 100 OFF','2025-12-31', 77, 'https://logo.clearbit.com/boat-lifestyle.com'),
('Boat',  'Rs 300 off on neckband + earphones combo','Rockerz + Bassheads bundle.',                      'a0000001-0000-0000-0000-000000000005','standard',350, 'https://boat-lifestyle.com','Rs 300 OFF','2025-12-31', 80, 'https://logo.clearbit.com/boat-lifestyle.com'),
('Boat',  'Rs 700 off on premium headphones',      'Nirvana and Immortal series.',                        'a0000001-0000-0000-0000-000000000005','high',    750, 'https://boat-lifestyle.com','Rs 700 OFF','2025-12-31', 83, 'https://logo.clearbit.com/boat-lifestyle.com'),
-- JioMart (food/grocery)
('JioMart','Rs 50 off on grocery order',           'Min Rs 299. Fresh produce included.',                 'a0000001-0000-0000-0000-000000000001','micro',   50,  'https://jiomart.com',    'Rs 50 OFF',   '2025-12-31', 67, 'https://logo.clearbit.com/jiomart.com'),
('JioMart','Rs 150 off on monthly groceries',      'One-time deal. Valid on Rs 999+ cart.',               'a0000001-0000-0000-0000-000000000001','low',     100, 'https://jiomart.com',    'Rs 150 OFF',  '2025-12-31', 72, 'https://logo.clearbit.com/jiomart.com'),
('JioMart','Rs 400 off on household items',        'Cleaning, kitchen, personal care combo.',             'a0000001-0000-0000-0000-000000000001','standard',350, 'https://jiomart.com',    'Rs 400 OFF',  '2025-12-31', 75, 'https://logo.clearbit.com/jiomart.com'),
-- Naukri/Job portals (misc)
('Naukri', 'Resume boost service free',            '3-month resume highlight on Naukri.',                 'a0000001-0000-0000-0000-000000000006','standard',350, 'https://naukri.com',     'FREE BOOST',  '2025-12-31', 66, 'https://logo.clearbit.com/naukri.com'),
-- 1mg / PharmEasy (health)
('1mg',   'Rs 80 off on medicines above Rs 499',   'Valid on prescribed medicines.',                      'a0000001-0000-0000-0000-000000000006','low',     100, 'https://1mg.com',        'Rs 80 OFF',   '2025-12-31', 74, 'https://logo.clearbit.com/1mg.com'),
('1mg',   'Rs 200 off on health packages',         'Full body checkup, vitamin tests.',                   'a0000001-0000-0000-0000-000000000006','budget',  200, 'https://1mg.com',        'Rs 200 OFF',  '2025-12-31', 78, 'https://logo.clearbit.com/1mg.com'),
('1mg',   'Rs 500 off on annual health plan',      '12 lab tests + doctor consultations.',                'a0000001-0000-0000-0000-000000000006','premium', 500, 'https://1mg.com',        'Rs 500 OFF',  '2025-12-31', 82, 'https://logo.clearbit.com/1mg.com'),
-- Myntra sport
('Myntra', 'Rs 100 off on sports brand sale',      'Puma, Adidas, Nike on Myntra.',                      'b0000002-0000-0000-0000-000000000009','low',     100, 'https://myntra.com',     'Rs 100 OFF',  '2025-12-31', 77, 'https://logo.clearbit.com/myntra.com'),
-- Reliance Trends
('Reliance Trends','Rs 75 off on any purchase',    'Valid at all Reliance Trends stores.',                'a0000001-0000-0000-0000-000000000002','micro',   50,  'https://reliancetrends.com','Rs 75 OFF', '2025-12-31', 60, 'https://logo.clearbit.com/reliancetrends.com'),
('Reliance Trends','Buy 3 get 1 free',             'On all regular-price items.',                         'a0000001-0000-0000-0000-000000000002','budget',  200, 'https://reliancetrends.com','B3G1 FREE',  '2025-12-31', 66, 'https://logo.clearbit.com/reliancetrends.com'),
-- Airtel / Jio (misc services, under electronics)
('Airtel', 'Rs 100 off on recharge above Rs 299',  'Valid for prepaid users.',                            'a0000001-0000-0000-0000-000000000005','low',     100, 'https://airtel.in',      'Rs 100 OFF',  '2025-12-31', 79, 'https://logo.clearbit.com/airtel.in'),
('Jio',    'Free 5G data 10GB',                    'Valid for Jio 5G users. No expiry.',                  'a0000001-0000-0000-0000-000000000005','budget',  200, 'https://jio.com',        '10GB FREE',   '2025-12-31', 83, 'https://logo.clearbit.com/jio.com'),
-- Hotstar/OTT (movies category)
('Disney+ Hotstar','3-Month Mobile Plan Free',     'HD streaming on 1 device.',                           'a0000001-0000-0000-0000-000000000003','standard',350, 'https://hotstar.com',    '3 MONTHS',    '2025-12-31', 88, 'https://logo.clearbit.com/hotstar.com'),
('Netflix','Netflix 1-Month Mobile Plan',          'Streaming on mobile. Standard quality.',              'a0000001-0000-0000-0000-000000000003','premium', 500, 'https://netflix.com',    '1 MONTH',     '2025-12-31', 95, 'https://logo.clearbit.com/netflix.com'),
('Amazon Prime','Prime 3-Month Membership',        'Video + Music + Shopping benefits.',                  'a0000001-0000-0000-0000-000000000003','premium', 500, 'https://primevideo.com', '3 MONTHS',    '2025-12-31', 93, 'https://logo.clearbit.com/primevideo.com'),
('Netflix','Netflix Premium 3-Month',              '4K + 4 screens.',                                     'a0000001-0000-0000-0000-000000000003','high',    750, 'https://netflix.com',    '3M PREMIUM',  '2025-12-31', 97, 'https://logo.clearbit.com/netflix.com'),
('Disney+ Hotstar','Hotstar Annual Super Plan',    '365 days. All sports + movies + shows.',              'a0000001-0000-0000-0000-000000000003','ultra',  1000, 'https://hotstar.com',    '1 YEAR',      '2025-12-31', 96, 'https://logo.clearbit.com/hotstar.com')
ON CONFLICT DO NOTHING;
