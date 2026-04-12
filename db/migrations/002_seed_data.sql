-- ============================================================
-- Seed: Coupon Categories (parent categories)
-- ============================================================
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Food',            'food',          '🍔', NULL),
  ('a0000001-0000-0000-0000-000000000002', 'Clothing',        'clothing',      '👗', NULL),
  ('a0000001-0000-0000-0000-000000000003', 'Movies',          'movies',        '🎬', NULL),
  ('a0000001-0000-0000-0000-000000000004', 'Travel',          'travel',        '✈️',  NULL),
  ('a0000001-0000-0000-0000-000000000005', 'Electronics',     'electronics',   '📱', NULL),
  ('a0000001-0000-0000-0000-000000000006', 'Health & Beauty', 'health-beauty', '💊', NULL),
  ('a0000001-0000-0000-0000-000000000007', 'Sports',          'sports',        '⚽', NULL)
ON CONFLICT DO NOTHING;

-- Food subcategories
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('b0000002-0000-0000-0000-000000000001', 'Dominos',    'dominos',     '🍕', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000002', 'Burger King','burger-king', '🍔', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000003', 'McDonalds',  'mcdonalds',   '🍟', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000004', 'Swiggy',     'swiggy',      '🛵', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000005', 'Zomato',     'zomato',      '🔴', 'a0000001-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Clothing subcategories
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('b0000002-0000-0000-0000-000000000006', 'Zara',   'zara',   '🛍️', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000007', 'Zudio',  'zudio',  '👔', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000008', 'H&M',    'hnm',    '👕', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000002-0000-0000-0000-000000000009', 'Myntra', 'myntra', '👗', 'a0000001-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Movies subcategories
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('b0000002-0000-0000-0000-000000000010', 'IMAX', 'imax', '🎥', 'a0000001-0000-0000-0000-000000000003'),
  ('b0000002-0000-0000-0000-000000000011', 'PVR',  'pvr',  '🎦', 'a0000001-0000-0000-0000-000000000003'),
  ('b0000002-0000-0000-0000-000000000012', 'INOX', 'inox', '🍿', 'a0000001-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Travel subcategories
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('b0000002-0000-0000-0000-000000000013', 'MakeMyTrip', 'makemytrip', '🏨', 'a0000001-0000-0000-0000-000000000004'),
  ('b0000002-0000-0000-0000-000000000014', 'Cleartrip',  'cleartrip',  '🛫', 'a0000001-0000-0000-0000-000000000004'),
  ('b0000002-0000-0000-0000-000000000015', 'Ola',        'ola',        '🚗', 'a0000001-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Coupons
-- ============================================================

-- FOOD 200pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Dominos',    '20% off on any pizza order',      'Valid on regular and medium pizzas. Min order Rs 300.',  'b0000002-0000-0000-0000-000000000001', 'budget', 200, 'https://dominos.co.in',   '20% OFF',      '2025-12-31'),
  ('Burger King','Rs 50 off on meals above Rs 299', 'Valid at all BK outlets.',                              'b0000002-0000-0000-0000-000000000002', 'budget', 200, 'https://burgerking.in',   'Rs 50 OFF',    '2025-12-31'),
  ('McDonalds',  'Free McFlurry with any combo',    'Valid for dine-in and takeaway orders.',                 'b0000002-0000-0000-0000-000000000003', 'budget', 200, 'https://mcdelivery.co.in','FREE',         '2025-12-31'),
  ('Swiggy',     'Rs 75 off on first 3 orders',     'Min order Rs 199. Valid on select restaurants.',        'b0000002-0000-0000-0000-000000000004', 'budget', 200, 'https://swiggy.com',      'Rs 75 OFF',    '2025-12-31')
ON CONFLICT DO NOTHING;

-- FOOD 350pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Dominos',    '30% off on order above Rs 500',   'Valid on large and XL pizzas.',                         'b0000002-0000-0000-0000-000000000001', 'standard', 350, 'https://dominos.co.in', '30% OFF',    '2025-12-31'),
  ('Zomato',     'Rs 150 off on orders above Rs 399','Valid on Zomato Gold restaurants.',                    'b0000002-0000-0000-0000-000000000005', 'standard', 350, 'https://zomato.com',    'Rs 150 OFF', '2025-12-31'),
  ('Burger King','Buy 1 Get 1 Whopper',              'Valid on Classic Whopper only. Dine-in only.',          'b0000002-0000-0000-0000-000000000002', 'standard', 350, 'https://burgerking.in', 'BOGO',       '2025-12-31')
ON CONFLICT DO NOTHING;

-- FOOD 500pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Swiggy', 'Rs 300 off on orders above Rs 799',   'Valid sitewide.',                                       'b0000002-0000-0000-0000-000000000004', 'premium', 500, 'https://swiggy.com',      'Rs 300 OFF',   '2025-12-31'),
  ('Zomato', 'Zomato Gold 1-Month Free',             'Unlimited 1+1 dishes at 2000+ restaurants.',           'b0000002-0000-0000-0000-000000000005', 'premium', 500, 'https://zomato.com/gold', '1 MONTH FREE', '2025-12-31')
ON CONFLICT DO NOTHING;

-- CLOTHING 200pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Zara',  '10% off on new arrivals',              'Valid on selected new season items online.',             'b0000002-0000-0000-0000-000000000006', 'budget', 200, 'https://zara.com/in', '10% OFF',  '2025-12-31'),
  ('Zudio', 'Rs 100 off on purchase above Rs 599',  'Valid across all Zudio stores and app.',                'b0000002-0000-0000-0000-000000000007', 'budget', 200, 'https://zudio.com',   'Rs 100 OFF','2025-12-31')
ON CONFLICT DO NOTHING;

-- CLOTHING 350pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('H&M',    '15% off on full-price items',         'Valid online only. Excludes sale items.',               'b0000002-0000-0000-0000-000000000008', 'standard', 350, 'https://hm.com/in',  '15% OFF', '2025-12-31'),
  ('Myntra', '25% off on top brands',               'Valid on brands like Puma, Nike, Adidas.',             'b0000002-0000-0000-0000-000000000009', 'standard', 350, 'https://myntra.com', '25% OFF', '2025-12-31')
ON CONFLICT DO NOTHING;

-- CLOTHING 500pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Zara',   '20% off sitewide plus free shipping', 'Valid on entire Zara catalog including sale.',          'b0000002-0000-0000-0000-000000000006', 'premium', 500, 'https://zara.com/in', '20% OFF',  '2025-12-31'),
  ('Myntra', 'Rs 500 off on orders above Rs 1999',  'Valid on Myntra End of Reason Sale items.',            'b0000002-0000-0000-0000-000000000009', 'premium', 500, 'https://myntra.com',  'Rs 500 OFF','2025-12-31')
ON CONFLICT DO NOTHING;

-- MOVIES 200pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('PVR',  'Rs 75 off on movie tickets',            'Valid on 2D shows. Book via PVR app.',                 'b0000002-0000-0000-0000-000000000011', 'budget', 200, 'https://pvrcinemas.com', 'Rs 75 OFF',    '2025-12-31'),
  ('INOX', 'Buy 2 tickets get free popcorn',         'Valid on weekend shows.',                              'b0000002-0000-0000-0000-000000000012', 'budget', 200, 'https://inoxmovies.com', 'FREE POPCORN', '2025-12-31')
ON CONFLICT DO NOTHING;

-- MOVIES 350pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('PVR', 'Rs 150 off on 3D movies',                'Valid on IMAX and 3D shows at premium screens.',       'b0000002-0000-0000-0000-000000000011', 'standard', 350, 'https://pvrcinemas.com', 'Rs 150 OFF', '2025-12-31')
ON CONFLICT DO NOTHING;

-- MOVIES 500pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('IMAX', 'Rs 200 off on IMAX experience',          'Valid on any IMAX show. Includes popcorn combo.',     'b0000002-0000-0000-0000-000000000010', 'premium', 500, 'https://imax.com', 'Rs 200 OFF', '2025-12-31')
ON CONFLICT DO NOTHING;

-- TRAVEL 200pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Ola', 'Rs 50 off on 3 rides',                   'Valid on Ola Mini and Sedan.',                         'b0000002-0000-0000-0000-000000000015', 'budget', 200, 'https://olacabs.com', 'Rs 50 OFF', '2025-12-31')
ON CONFLICT DO NOTHING;

-- TRAVEL 350pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('MakeMyTrip', 'Rs 300 off on hotel bookings',    'Valid on hotels above Rs 1500 per night.',             'b0000002-0000-0000-0000-000000000013', 'standard', 350, 'https://makemytrip.com', 'Rs 300 OFF', '2025-12-31'),
  ('Cleartrip',  'Rs 500 off on flight bookings',   'Valid on domestic flights above Rs 3000.',             'b0000002-0000-0000-0000-000000000014', 'standard', 350, 'https://cleartrip.com',  'Rs 500 OFF', '2025-12-31')
ON CONFLICT DO NOTHING;

-- TRAVEL 500pts
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('MakeMyTrip', 'Rs 1000 off on holiday packages', 'Valid on MMT holiday packages above Rs 15000.',        'b0000002-0000-0000-0000-000000000013', 'premium', 500, 'https://makemytrip.com/holidays', 'Rs 1000 OFF', '2025-12-31')
ON CONFLICT DO NOTHING;

-- ELECTRONICS all tiers
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until) VALUES
  ('Amazon',   '5% cashback on electronics',        'Valid on purchases above Rs 5000.',                    'a0000001-0000-0000-0000-000000000005', 'budget',   200, 'https://amazon.in',   '5% BACK',   '2025-12-31'),
  ('Flipkart', 'Rs 200 off on mobiles above Rs 8000','Valid on select brands.',                             'a0000001-0000-0000-0000-000000000005', 'standard', 350, 'https://flipkart.com','Rs 200 OFF','2025-12-31'),
  ('Croma',    'Rs 750 off on appliances',           'Valid at all Croma stores and croma.com.',            'a0000001-0000-0000-0000-000000000005', 'premium',  500, 'https://croma.com',   'Rs 750 OFF','2025-12-31')
ON CONFLICT DO NOTHING;
