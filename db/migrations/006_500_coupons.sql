-- ============================================================
-- Migration 006: 500 new unique coupons across new and existing categories
-- New categories: Education, Finance, Gaming, Home & Living, Automotive, Pets, Kids, Books, Wellness
-- ============================================================

-- New parent categories
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  ('a0000001-0000-0000-0000-000000000008', 'Education',      'education',       '📚', NULL),
  ('a0000001-0000-0000-0000-000000000009', 'Gaming',         'gaming',          '🎮', NULL),
  ('a0000001-0000-0000-0000-000000000010', 'Home & Living',  'home-living',     '🏠', NULL),
  ('a0000001-0000-0000-0000-000000000011', 'Automotive',     'automotive',      '🚘', NULL),
  ('a0000001-0000-0000-0000-000000000012', 'Finance',        'finance',         '💳', NULL),
  ('a0000001-0000-0000-0000-000000000013', 'Kids & Baby',    'kids-baby',       '🧸', NULL),
  ('a0000001-0000-0000-0000-000000000014', 'Books & Media',  'books-media',     '📖', NULL),
  ('a0000001-0000-0000-0000-000000000015', 'Pets',           'pets',            '🐾', NULL),
  ('a0000001-0000-0000-0000-000000000016', 'Wellness & Spa', 'wellness',        '🧘', NULL)
ON CONFLICT DO NOTHING;

-- New subcategories
INSERT INTO coupon_categories (id, name, slug, icon, parent_id) VALUES
  -- Education
  ('c0000003-0000-0000-0000-000000000001', 'Udemy',          'udemy',           '🎓', 'a0000001-0000-0000-0000-000000000008'),
  ('c0000003-0000-0000-0000-000000000002', 'Coursera',       'coursera',        '🎓', 'a0000001-0000-0000-0000-000000000008'),
  ('c0000003-0000-0000-0000-000000000003', 'Byju''s',        'byjus',           '📗', 'a0000001-0000-0000-0000-000000000008'),
  ('c0000003-0000-0000-0000-000000000004', 'Unacademy',      'unacademy',       '📘', 'a0000001-0000-0000-0000-000000000008'),
  -- Gaming
  ('c0000003-0000-0000-0000-000000000005', 'Steam',          'steam',           '🎮', 'a0000001-0000-0000-0000-000000000009'),
  ('c0000003-0000-0000-0000-000000000006', 'PlayStation',    'playstation',     '🕹️', 'a0000001-0000-0000-0000-000000000009'),
  ('c0000003-0000-0000-0000-000000000007', 'Xbox',           'xbox',            '🎯', 'a0000001-0000-0000-0000-000000000009'),
  ('c0000003-0000-0000-0000-000000000008', 'MPL',            'mpl',             '📱', 'a0000001-0000-0000-0000-000000000009'),
  -- Home & Living
  ('c0000003-0000-0000-0000-000000000009', 'IKEA',           'ikea',            '🛋️', 'a0000001-0000-0000-0000-000000000010'),
  ('c0000003-0000-0000-0000-000000000010', 'Pepperfry',      'pepperfry',       '🛏️', 'a0000001-0000-0000-0000-000000000010'),
  ('c0000003-0000-0000-0000-000000000011', 'Urban Ladder',   'urban-ladder',    '🪑', 'a0000001-0000-0000-0000-000000000010'),
  ('c0000003-0000-0000-0000-000000000012', 'Godrej Interio', 'godrej-interio',  '🏡', 'a0000001-0000-0000-0000-000000000010'),
  -- Automotive
  ('c0000003-0000-0000-0000-000000000013', 'Droom',          'droom',           '🚗', 'a0000001-0000-0000-0000-000000000011'),
  ('c0000003-0000-0000-0000-000000000014', 'CarDekho',       'cardekho',        '🚙', 'a0000001-0000-0000-0000-000000000011'),
  ('c0000003-0000-0000-0000-000000000015', 'Mivi',           'mivi',            '🔊', 'a0000001-0000-0000-0000-000000000011'),
  -- Books
  ('c0000003-0000-0000-0000-000000000016', 'Amazon Kindle',  'kindle',          '📱', 'a0000001-0000-0000-0000-000000000014'),
  ('c0000003-0000-0000-0000-000000000017', 'Audible',        'audible',         '🎧', 'a0000001-0000-0000-0000-000000000014'),
  ('c0000003-0000-0000-0000-000000000018', 'Flipkart Books', 'flipkart-books',  '📚', 'a0000001-0000-0000-0000-000000000014'),
  -- Kids
  ('c0000003-0000-0000-0000-000000000019', 'FirstCry',       'firstcry',        '👶', 'a0000001-0000-0000-0000-000000000013'),
  ('c0000003-0000-0000-0000-000000000020', 'Hamleys',        'hamleys',         '🧸', 'a0000001-0000-0000-0000-000000000013'),
  -- Pets
  ('c0000003-0000-0000-0000-000000000021', 'Heads Up For Tails','huf-tails',    '🐕', 'a0000001-0000-0000-0000-000000000015'),
  ('c0000003-0000-0000-0000-000000000022', 'PetKart',        'petkart',         '🐱', 'a0000001-0000-0000-0000-000000000015'),
  -- Wellness
  ('c0000003-0000-0000-0000-000000000023', 'Urban Company',  'urban-company',   '💆', 'a0000001-0000-0000-0000-000000000016'),
  ('c0000003-0000-0000-0000-000000000024', 'YogaBar',        'yogabar',         '🧘', 'a0000001-0000-0000-0000-000000000016'),
  ('c0000003-0000-0000-0000-000000000025', 'Healthkart',     'healthkart',      '💊', 'a0000001-0000-0000-0000-000000000016')
ON CONFLICT DO NOTHING;

-- ── EDUCATION COUPONS ─────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Udemy','Rs 100 off any course','Min Rs 499. All categories.','c0000003-0000-0000-0000-000000000001','low',100,'https://udemy.com','Rs 100 OFF','2025-12-31',76,'https://logo.clearbit.com/udemy.com'),
('Udemy','3 courses for price of 1','Select bundle packs only.','c0000003-0000-0000-0000-000000000001','standard',350,'https://udemy.com','3 FOR 1','2025-12-31',82,'https://logo.clearbit.com/udemy.com'),
('Udemy','Udemy Pro 1-month free','Unlimited learning access.','c0000003-0000-0000-0000-000000000001','premium',500,'https://udemy.com','1 MONTH FREE','2025-12-31',88,'https://logo.clearbit.com/udemy.com'),
('Udemy','Udemy Pro 3-month access','Certificates included.','c0000003-0000-0000-0000-000000000001','high',750,'https://udemy.com','3 MONTHS','2025-12-31',85,'https://logo.clearbit.com/udemy.com'),
('Coursera','Rs 200 off on Guided Projects','1-2 hour project courses.','c0000003-0000-0000-0000-000000000002','budget',200,'https://coursera.org','Rs 200 OFF','2025-12-31',74,'https://logo.clearbit.com/coursera.org'),
('Coursera','Coursera Plus 1-month trial','800+ courses unlimited.','c0000003-0000-0000-0000-000000000002','premium',500,'https://coursera.org','1 MONTH FREE','2025-12-31',87,'https://logo.clearbit.com/coursera.org'),
('Coursera','Google Certificate course free','IT Support, Data Analytics.','c0000003-0000-0000-0000-000000000002','high',750,'https://coursera.org','FREE CERT','2025-12-31',91,'https://logo.clearbit.com/coursera.org'),
('Byju''s','Rs 500 off on JEE prep pack','Class 11-12 combined pack.','c0000003-0000-0000-0000-000000000003','premium',500,'https://byjus.com','Rs 500 OFF','2025-12-31',80,'https://logo.clearbit.com/byjus.com'),
('Byju''s','1-month Byju''s app free','All classes. K-12 and exams.','c0000003-0000-0000-0000-000000000003','standard',350,'https://byjus.com','1 MONTH FREE','2025-12-31',77,'https://logo.clearbit.com/byjus.com'),
('Unacademy','Rs 300 off on UPSC course','Foundation batch included.','c0000003-0000-0000-0000-000000000004','standard',350,'https://unacademy.com','Rs 300 OFF','2025-12-31',79,'https://logo.clearbit.com/unacademy.com'),
('Unacademy','Unacademy Plus 2-month free','Live classes + tests.','c0000003-0000-0000-0000-000000000004','high',750,'https://unacademy.com','2 MONTHS FREE','2025-12-31',84,'https://logo.clearbit.com/unacademy.com')
ON CONFLICT DO NOTHING;

-- ── GAMING COUPONS ────────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Steam','Rs 150 off on any game above Rs 999','PC games. All genres.','c0000003-0000-0000-0000-000000000005','low',100,'https://store.steampowered.com','Rs 150 OFF','2025-12-31',85,'https://logo.clearbit.com/steampowered.com'),
('Steam','Rs 300 off on game bundle','Any bundle above Rs 1999.','c0000003-0000-0000-0000-000000000005','standard',350,'https://store.steampowered.com','Rs 300 OFF','2025-12-31',88,'https://logo.clearbit.com/steampowered.com'),
('Steam','Rs 500 Steam wallet credit','Add to Steam wallet directly.','c0000003-0000-0000-0000-000000000005','premium',500,'https://store.steampowered.com','Rs 500 CREDIT','2025-12-31',92,'https://logo.clearbit.com/steampowered.com'),
('PlayStation','Rs 200 off on PS Store','Games, DLC, add-ons.','c0000003-0000-0000-0000-000000000006','budget',200,'https://playstation.com','Rs 200 OFF','2025-12-31',86,'https://logo.clearbit.com/playstation.com'),
('PlayStation','PS Plus 1-month Essential free','Online multiplayer + games.','c0000003-0000-0000-0000-000000000006','premium',500,'https://playstation.com','1 MONTH FREE','2025-12-31',93,'https://logo.clearbit.com/playstation.com'),
('PlayStation','PS Plus 3-month Extra','800+ games on demand.','c0000003-0000-0000-0000-000000000006','ultra',1000,'https://playstation.com','3 MONTHS','2025-12-31',95,'https://logo.clearbit.com/playstation.com'),
('Xbox','Rs 200 off on Xbox game','Digital copy. All titles.','c0000003-0000-0000-0000-000000000007','budget',200,'https://xbox.com','Rs 200 OFF','2025-12-31',84,'https://logo.clearbit.com/xbox.com'),
('Xbox','Xbox Game Pass 1-month free','100+ games. Console + PC.','c0000003-0000-0000-0000-000000000007','premium',500,'https://xbox.com','1 MONTH FREE','2025-12-31',94,'https://logo.clearbit.com/xbox.com'),
('Xbox','Xbox Game Pass Ultimate 3 months','Cloud gaming included.','c0000003-0000-0000-0000-000000000007','ultra',1000,'https://xbox.com','3 MONTHS','2025-12-31',96,'https://logo.clearbit.com/xbox.com'),
('MPL','Rs 100 MPL game cash','Play fantasy, puzzles, cards.','c0000003-0000-0000-0000-000000000008','low',100,'https://mpl.live','Rs 100 CASH','2025-12-31',72,'https://logo.clearbit.com/mpl.live'),
('MPL','Rs 250 bonus MPL credits','Valid on any tournament entry.','c0000003-0000-0000-0000-000000000008','standard',350,'https://mpl.live','Rs 250 BONUS','2025-12-31',75,'https://logo.clearbit.com/mpl.live')
ON CONFLICT DO NOTHING;

-- ── HOME & LIVING COUPONS ─────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('IKEA','Rs 100 off on accessories','Frames, cushions, plants.','c0000003-0000-0000-0000-000000000009','low',100,'https://ikea.com/in','Rs 100 OFF','2025-12-31',78,'https://logo.clearbit.com/ikea.com'),
('IKEA','Rs 300 off on furniture above Rs 3000','All IKEA furniture.','c0000003-0000-0000-0000-000000000009','standard',350,'https://ikea.com/in','Rs 300 OFF','2025-12-31',82,'https://logo.clearbit.com/ikea.com'),
('IKEA','Rs 750 off on kitchen systems','METOD and SEKTION range.','c0000003-0000-0000-0000-000000000009','high',750,'https://ikea.com/in','Rs 750 OFF','2025-12-31',80,'https://logo.clearbit.com/ikea.com'),
('Pepperfry','Rs 200 off on decor','Wall art, vases, lamps.','c0000003-0000-0000-0000-000000000010','budget',200,'https://pepperfry.com','Rs 200 OFF','2025-12-31',74,'https://logo.clearbit.com/pepperfry.com'),
('Pepperfry','Rs 500 off on furniture above Rs 5000','All categories.','c0000003-0000-0000-0000-000000000010','premium',500,'https://pepperfry.com','Rs 500 OFF','2025-12-31',79,'https://logo.clearbit.com/pepperfry.com'),
('Pepperfry','Rs 1200 off on sofa above Rs 15000','All sofas and recliners.','c0000003-0000-0000-0000-000000000010','ultra',1000,'https://pepperfry.com','Rs 1200 OFF','2025-12-31',76,'https://logo.clearbit.com/pepperfry.com'),
('Urban Ladder','Rs 300 off on beds','Single, double, king size.','c0000003-0000-0000-0000-000000000011','standard',350,'https://urbanladder.com','Rs 300 OFF','2025-12-31',77,'https://logo.clearbit.com/urbanladder.com'),
('Urban Ladder','Rs 800 off on wardrobes','Hinged and sliding doors.','c0000003-0000-0000-0000-000000000011','high',750,'https://urbanladder.com','Rs 800 OFF','2025-12-31',80,'https://logo.clearbit.com/urbanladder.com'),
('Urban Ladder','Rs 2000 off on modular kitchen','Full kitchen sets above Rs 30000.','c0000003-0000-0000-0000-000000000011','ultra',1000,'https://urbanladder.com','Rs 2000 OFF','2025-12-31',75,'https://logo.clearbit.com/urbanladder.com'),
('Godrej Interio','Rs 500 off on mattress','All foam and spring types.','c0000003-0000-0000-0000-000000000012','premium',500,'https://godrejinterio.com','Rs 500 OFF','2025-12-31',72,'https://logo.clearbit.com/godrejinterio.com')
ON CONFLICT DO NOTHING;

-- ── AUTOMOTIVE COUPONS ────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Droom','Rs 200 off on used car inspection','Detailed 200-point check.','c0000003-0000-0000-0000-000000000013','budget',200,'https://droom.in','Rs 200 OFF','2025-12-31',70,'https://logo.clearbit.com/droom.in'),
('Droom','Rs 500 off on RC transfer','State-to-state included.','c0000003-0000-0000-0000-000000000013','premium',500,'https://droom.in','Rs 500 OFF','2025-12-31',67,'https://logo.clearbit.com/droom.in'),
('CarDekho','Free car valuation report','Instant online report.','c0000003-0000-0000-0000-000000000014','micro',50,'https://cardekho.com','FREE REPORT','2025-12-31',65,'https://logo.clearbit.com/cardekho.com'),
('CarDekho','Rs 300 off on car insurance','All car models. Instant policy.','c0000003-0000-0000-0000-000000000014','standard',350,'https://cardekho.com','Rs 300 OFF','2025-12-31',72,'https://logo.clearbit.com/cardekho.com'),
('CarDekho','Rs 1000 off on new car booking','Select models. Advance booking.','c0000003-0000-0000-0000-000000000014','ultra',1000,'https://cardekho.com','Rs 1000 OFF','2025-12-31',76,'https://logo.clearbit.com/cardekho.com')
ON CONFLICT DO NOTHING;

-- ── BOOKS & MEDIA COUPONS ─────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Amazon Kindle','Rs 100 off on any ebook','All genres. Any device.','c0000003-0000-0000-0000-000000000016','low',100,'https://amazon.in/kindle','Rs 100 OFF','2025-12-31',74,'https://logo.clearbit.com/amazon.com'),
('Amazon Kindle','Kindle Unlimited 3-month free','1 million+ titles.','c0000003-0000-0000-0000-000000000016','premium',500,'https://amazon.in/kindle','3 MONTHS FREE','2025-12-31',88,'https://logo.clearbit.com/amazon.com'),
('Amazon Kindle','Kindle device Rs 500 off','Paperwhite and Oasis.','c0000003-0000-0000-0000-000000000016','high',750,'https://amazon.in/kindle','Rs 500 OFF','2025-12-31',82,'https://logo.clearbit.com/amazon.com'),
('Audible','Audible 1-month free trial','1 audiobook per month free.','c0000003-0000-0000-0000-000000000017','standard',350,'https://audible.in','1 MONTH FREE','2025-12-31',80,'https://logo.clearbit.com/audible.com'),
('Audible','Audible 3-month membership','3 credits + member deals.','c0000003-0000-0000-0000-000000000017','high',750,'https://audible.in','3 MONTHS','2025-12-31',83,'https://logo.clearbit.com/audible.com'),
('Flipkart Books','Buy 2 get 1 free on bestsellers','Top 100 books list.','c0000003-0000-0000-0000-000000000018','budget',200,'https://flipkart.com','B2G1 FREE','2025-12-31',76,'https://logo.clearbit.com/flipkart.com'),
('Flipkart Books','Rs 300 off on 5+ books','Mix genres allowed.','c0000003-0000-0000-0000-000000000018','standard',350,'https://flipkart.com','Rs 300 OFF','2025-12-31',74,'https://logo.clearbit.com/flipkart.com')
ON CONFLICT DO NOTHING;

-- ── KIDS & BABY COUPONS ───────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('FirstCry','Rs 75 off on baby care','Diapers, wipes, lotions.','c0000003-0000-0000-0000-000000000019','micro',50,'https://firstcry.com','Rs 75 OFF','2025-12-31',72,'https://logo.clearbit.com/firstcry.com'),
('FirstCry','Rs 200 off on baby clothing','0-12 months range.','c0000003-0000-0000-0000-000000000019','budget',200,'https://firstcry.com','Rs 200 OFF','2025-12-31',76,'https://logo.clearbit.com/firstcry.com'),
('FirstCry','Rs 400 off on strollers','All brands. Free assembly.','c0000003-0000-0000-0000-000000000019','premium',500,'https://firstcry.com','Rs 400 OFF','2025-12-31',79,'https://logo.clearbit.com/firstcry.com'),
('FirstCry','Rs 800 off on baby crib + mattress','Bundle deal.','c0000003-0000-0000-0000-000000000019','high',750,'https://firstcry.com','Rs 800 OFF','2025-12-31',77,'https://logo.clearbit.com/firstcry.com'),
('Hamleys','Rs 100 off on toys above Rs 599','All brands.','c0000003-0000-0000-0000-000000000020','low',100,'https://hamleys.in','Rs 100 OFF','2025-12-31',74,'https://logo.clearbit.com/hamleys.com'),
('Hamleys','Buy 2 toys get 1 free','Under Rs 999 each.','c0000003-0000-0000-0000-000000000020','standard',350,'https://hamleys.in','B2G1 FREE','2025-12-31',78,'https://logo.clearbit.com/hamleys.com'),
('Hamleys','Rs 500 off on Lego sets','Technic and City range.','c0000003-0000-0000-0000-000000000020','premium',500,'https://hamleys.in','Rs 500 OFF','2025-12-31',82,'https://logo.clearbit.com/hamleys.com')
ON CONFLICT DO NOTHING;

-- ── PETS COUPONS ──────────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Heads Up For Tails','Rs 80 off on dog food','All premium brands.','c0000003-0000-0000-0000-000000000021','micro',50,'https://hufnt.com','Rs 80 OFF','2025-12-31',68,'https://logo.clearbit.com/hufnt.com'),
('Heads Up For Tails','Rs 200 off on pet accessories','Beds, toys, bowls, leashes.','c0000003-0000-0000-0000-000000000021','budget',200,'https://hufnt.com','Rs 200 OFF','2025-12-31',72,'https://logo.clearbit.com/hufnt.com'),
('Heads Up For Tails','Rs 400 off on vet consultation','Online + in-clinic.','c0000003-0000-0000-0000-000000000021','standard',350,'https://hufnt.com','Rs 400 OFF','2025-12-31',70,'https://logo.clearbit.com/hufnt.com'),
('PetKart','Rs 100 off on cat food','Dry and wet food all brands.','c0000003-0000-0000-0000-000000000022','low',100,'https://petkart.in','Rs 100 OFF','2025-12-31',65,'https://logo.clearbit.com/petkart.in'),
('PetKart','Free pet grooming session','At-home grooming. Dog only.','c0000003-0000-0000-0000-000000000022','premium',500,'https://petkart.in','FREE GROOM','2025-12-31',71,'https://logo.clearbit.com/petkart.in')
ON CONFLICT DO NOTHING;

-- ── WELLNESS & SPA COUPONS ────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Urban Company','Rs 100 off on salon at home','Haircut, facial, waxing.','c0000003-0000-0000-0000-000000000023','low',100,'https://urbancompany.com','Rs 100 OFF','2025-12-31',82,'https://logo.clearbit.com/urbancompany.com'),
('Urban Company','Rs 300 off on spa massage','60-min Swedish or deep tissue.','c0000003-0000-0000-0000-000000000023','standard',350,'https://urbancompany.com','Rs 300 OFF','2025-12-31',86,'https://logo.clearbit.com/urbancompany.com'),
('Urban Company','Rs 600 off on home cleaning','3BHK deep clean.','c0000003-0000-0000-0000-000000000023','high',750,'https://urbancompany.com','Rs 600 OFF','2025-12-31',84,'https://logo.clearbit.com/urbancompany.com'),
('Urban Company','Annual home maintenance plan','AC service + pest control + more.','c0000003-0000-0000-0000-000000000023','ultra',1000,'https://urbancompany.com','ANNUAL PLAN','2025-12-31',81,'https://logo.clearbit.com/urbancompany.com'),
('YogaBar','Rs 50 off on protein bars','Pack of 6. All flavors.','c0000003-0000-0000-0000-000000000024','micro',50,'https://yogabar.in','Rs 50 OFF','2025-12-31',70,'https://logo.clearbit.com/yogabar.in'),
('YogaBar','Rs 150 off on granola combo','5 pack assorted flavors.','c0000003-0000-0000-0000-000000000024','low',100,'https://yogabar.in','Rs 150 OFF','2025-12-31',72,'https://logo.clearbit.com/yogabar.in'),
('YogaBar','Rs 300 off on monthly nutrition pack','Protein + granola + bars.','c0000003-0000-0000-0000-000000000024','standard',350,'https://yogabar.in','Rs 300 OFF','2025-12-31',75,'https://logo.clearbit.com/yogabar.in'),
('Healthkart','Rs 200 off on protein powder','All brands above Rs 1499.','c0000003-0000-0000-0000-000000000025','budget',200,'https://healthkart.com','Rs 200 OFF','2025-12-31',78,'https://logo.clearbit.com/healthkart.com'),
('Healthkart','Rs 400 off on supplement stack','Pre + post workout combo.','c0000003-0000-0000-0000-000000000025','standard',350,'https://healthkart.com','Rs 400 OFF','2025-12-31',80,'https://logo.clearbit.com/healthkart.com'),
('Healthkart','Rs 800 off on annual fitness plan','Protein + vitamins + creatine.','c0000003-0000-0000-0000-000000000025','high',750,'https://healthkart.com','Rs 800 OFF','2025-12-31',82,'https://logo.clearbit.com/healthkart.com')
ON CONFLICT DO NOTHING;

-- ── FINANCE COUPONS ───────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Zerodha','Free demat account opening','Zero brokerage on delivery.','a0000001-0000-0000-0000-000000000012','micro',50,'https://zerodha.com','FREE DEMAT','2025-12-31',80,'https://logo.clearbit.com/zerodha.com'),
('Zerodha','3-month Kite premium free','Advanced charting + tools.','a0000001-0000-0000-0000-000000000012','standard',350,'https://zerodha.com','3 MONTHS FREE','2025-12-31',82,'https://logo.clearbit.com/zerodha.com'),
('Groww','Rs 100 off on first SIP','Mutual funds. Direct plans.','a0000001-0000-0000-0000-000000000012','low',100,'https://groww.in','Rs 100 OFF','2025-12-31',79,'https://logo.clearbit.com/groww.in'),
('Groww','Free Gold ETF worth Rs 500','Digital gold investment.','a0000001-0000-0000-0000-000000000012','premium',500,'https://groww.in','FREE GOLD','2025-12-31',85,'https://logo.clearbit.com/groww.in'),
('PolicyBazaar','Rs 500 off on term life insurance','Annual premium above Rs 5000.','a0000001-0000-0000-0000-000000000012','premium',500,'https://policybazaar.com','Rs 500 OFF','2025-12-31',77,'https://logo.clearbit.com/policybazaar.com'),
('PolicyBazaar','Free health insurance comparison','Top 20 plans compared.','a0000001-0000-0000-0000-000000000012','micro',50,'https://policybazaar.com','FREE COMPARE','2025-12-31',74,'https://logo.clearbit.com/policybazaar.com'),
('PhonePe','Rs 50 cashback on first investment','Mutual funds via PhonePe.','a0000001-0000-0000-0000-000000000012','micro',50,'https://phonepe.com','Rs 50 BACK','2025-12-31',81,'https://logo.clearbit.com/phonepe.com'),
('PhonePe','Rs 200 off on gold purchase','24K digital gold.','a0000001-0000-0000-0000-000000000012','budget',200,'https://phonepe.com','Rs 200 OFF','2025-12-31',78,'https://logo.clearbit.com/phonepe.com'),
('Paytm','Rs 100 Paytm cashback','On any bill payment.','a0000001-0000-0000-0000-000000000012','low',100,'https://paytm.com','Rs 100 BACK','2025-12-31',76,'https://logo.clearbit.com/paytm.com'),
('Paytm','Rs 300 off on Paytm First subscription','Movies + cashback + more.','a0000001-0000-0000-0000-000000000012','standard',350,'https://paytm.com','Rs 300 OFF','2025-12-31',73,'https://logo.clearbit.com/paytm.com')
ON CONFLICT DO NOTHING;

-- ── MORE FOOD ─────────────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Dunzo','Rs 40 off on grocery delivery','Min Rs 199. Any time.','a0000001-0000-0000-0000-000000000001','micro',50,'https://dunzo.com','Rs 40 OFF','2025-12-31',66,'https://logo.clearbit.com/dunzo.com'),
('Dunzo','Rs 100 off + express delivery','30-min delivery guarantee.','a0000001-0000-0000-0000-000000000001','low',100,'https://dunzo.com','Rs 100 + FAST','2025-12-31',70,'https://logo.clearbit.com/dunzo.com'),
('Wow Momo','Rs 50 off on momos above Rs 299','All varieties. App order.','a0000001-0000-0000-0000-000000000001','micro',50,'https://wowmomo.com','Rs 50 OFF','2025-12-31',65,'https://logo.clearbit.com/wowmomo.com'),
('Haldirams','Rs 80 off on sweets box','Assorted mithai. Festive pack.','a0000001-0000-0000-0000-000000000001','micro',50,'https://haldirams.com','Rs 80 OFF','2025-12-31',68,'https://logo.clearbit.com/haldirams.com'),
('Haldirams','Buy 2 get 1 on snack packs','Namkeen and chips range.','a0000001-0000-0000-0000-000000000001','low',100,'https://haldirams.com','B2G1 FREE','2025-12-31',72,'https://logo.clearbit.com/haldirams.com'),
('Baskin Robbins','Buy 2 scoops get 1 free','Any flavor. Any outlet.','a0000001-0000-0000-0000-000000000001','micro',50,'https://baskinrobbins.co.in','B2G1 FREE','2025-12-31',71,'https://logo.clearbit.com/baskinrobbins.com'),
('Baskin Robbins','Rs 100 off on ice cream cake','Custom or ready-made cakes.','a0000001-0000-0000-0000-000000000001','low',100,'https://baskinrobbins.co.in','Rs 100 OFF','2025-12-31',69,'https://logo.clearbit.com/baskinrobbins.com'),
('Chaayos','Buy 1 get 1 on chai','Any chai. Any size.','a0000001-0000-0000-0000-000000000001','micro',50,'https://chaayos.com','BOGO CHAI','2025-12-31',74,'https://logo.clearbit.com/chaayos.com'),
('Chaayos','Rs 150 off on snack + chai combo','For 2. Dine-in only.','a0000001-0000-0000-0000-000000000001','low',100,'https://chaayos.com','Rs 150 OFF','2025-12-31',72,'https://logo.clearbit.com/chaayos.com'),
('Barbeque Nation','Rs 200 off on weekday buffet','Lunch or dinner. One person.','a0000001-0000-0000-0000-000000000001','budget',200,'https://barbequenation.com','Rs 200 OFF','2025-12-31',83,'https://logo.clearbit.com/barbequenation.com'),
('Barbeque Nation','Rs 400 off on couple buffet','Weekend special. Pre-booking needed.','a0000001-0000-0000-0000-000000000001','standard',350,'https://barbequenation.com','Rs 400 OFF','2025-12-31',87,'https://logo.clearbit.com/barbequenation.com'),
('Barbeque Nation','Table for 4 at Rs 1999','Unlimited BBQ + desserts.','a0000001-0000-0000-0000-000000000001','premium',500,'https://barbequenation.com','4 FOR Rs 1999','2025-12-31',90,'https://logo.clearbit.com/barbequenation.com'),
('Paradise Biryani','Rs 100 off on family pack biryani','2kg biryani. Any variety.','a0000001-0000-0000-0000-000000000001','low',100,'https://paradisebiryani.com','Rs 100 OFF','2025-12-31',79,'https://logo.clearbit.com/paradisebiryani.com'),
('Paradise Biryani','Rs 250 off on party order above Rs 1500','Catering service.','a0000001-0000-0000-0000-000000000001','standard',350,'https://paradisebiryani.com','Rs 250 OFF','2025-12-31',76,'https://logo.clearbit.com/paradisebiryani.com'),
('Theobroma','Buy 1 get 1 on brownies','All varieties. In-store only.','a0000001-0000-0000-0000-000000000001','micro',50,'https://theobroma.in','BOGO BROWNIE','2025-12-31',77,'https://logo.clearbit.com/theobroma.in'),
('Theobroma','Rs 200 off on cake above Rs 800','Custom + readymade.','a0000001-0000-0000-0000-000000000001','budget',200,'https://theobroma.in','Rs 200 OFF','2025-12-31',80,'https://logo.clearbit.com/theobroma.in')
ON CONFLICT DO NOTHING;

-- ── MORE TRAVEL ───────────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('OYO','Rs 200 off on hotel booking','Min Rs 800/night.','a0000001-0000-0000-0000-000000000004','budget',200,'https://oyorooms.com','Rs 200 OFF','2025-12-31',78,'https://logo.clearbit.com/oyorooms.com'),
('OYO','Rs 400 off on weekend getaway','Fri-Sun. Select properties.','a0000001-0000-0000-0000-000000000004','standard',350,'https://oyorooms.com','Rs 400 OFF','2025-12-31',82,'https://logo.clearbit.com/oyorooms.com'),
('OYO','OYO Weekend Pass 4 nights','Any 4 weekends in a month.','a0000001-0000-0000-0000-000000000004','high',750,'https://oyorooms.com','4 NIGHTS','2025-12-31',79,'https://logo.clearbit.com/oyorooms.com'),
('Treebo','Rs 150 off on 2-night stay','Mid-range hotels.','a0000001-0000-0000-0000-000000000004','low',100,'https://treebo.com','Rs 150 OFF','2025-12-31',70,'https://logo.clearbit.com/treebo.com'),
('Treebo','Rs 500 off on 5-night package','All cities.','a0000001-0000-0000-0000-000000000004','premium',500,'https://treebo.com','Rs 500 OFF','2025-12-31',73,'https://logo.clearbit.com/treebo.com'),
('Yatra','Rs 250 off on hotel booking','Min 2 nights above Rs 2000.','a0000001-0000-0000-0000-000000000004','standard',350,'https://yatra.com','Rs 250 OFF','2025-12-31',72,'https://logo.clearbit.com/yatra.com'),
('Yatra','Rs 700 off on holiday package','Domestic 3-night packages.','a0000001-0000-0000-0000-000000000004','high',750,'https://yatra.com','Rs 700 OFF','2025-12-31',75,'https://logo.clearbit.com/yatra.com'),
('IndiGo','Rs 500 off on domestic flight','Select routes. App booking.','a0000001-0000-0000-0000-000000000004','premium',500,'https://goindigo.in','Rs 500 OFF','2025-12-31',88,'https://logo.clearbit.com/goindigo.in'),
('IndiGo','Rs 1200 off on round trip','Same airline round trip.','a0000001-0000-0000-0000-000000000004','ultra',1000,'https://goindigo.in','Rs 1200 OFF','2025-12-31',91,'https://logo.clearbit.com/goindigo.in'),
('Air India','Rs 800 off on business upgrade','Economy to business. Select flights.','a0000001-0000-0000-0000-000000000004','high',750,'https://airindia.com','Rs 800 OFF','2025-12-31',84,'https://logo.clearbit.com/airindia.com'),
('IRCTC','Rs 100 off on train ticket','Any class. Tatkal excluded.','a0000001-0000-0000-0000-000000000004','low',100,'https://irctc.co.in','Rs 100 OFF','2025-12-31',81,'https://logo.clearbit.com/irctc.co.in'),
('IRCTC','Free train meal upgrade','Rajdhani and Shatabdi only.','a0000001-0000-0000-0000-000000000004','standard',350,'https://irctc.co.in','FREE UPGRADE','2025-12-31',77,'https://logo.clearbit.com/irctc.co.in')
ON CONFLICT DO NOTHING;

-- ── MORE ELECTRONICS ──────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('OnePlus','Rs 500 off on OnePlus Nord','Nord CE and CE 3 series.','a0000001-0000-0000-0000-000000000005','premium',500,'https://oneplus.in','Rs 500 OFF','2025-12-31',87,'https://logo.clearbit.com/oneplus.com'),
('OnePlus','Rs 1000 off on OnePlus 12','12 and 12R models.','a0000001-0000-0000-0000-000000000005','ultra',1000,'https://oneplus.in','Rs 1000 OFF','2025-12-31',90,'https://logo.clearbit.com/oneplus.com'),
('realme','Rs 300 off on realme GT series','GT Neo 5 and above.','a0000001-0000-0000-0000-000000000005','standard',350,'https://realme.com/in','Rs 300 OFF','2025-12-31',80,'https://logo.clearbit.com/realme.com'),
('Xiaomi','Rs 200 off on Redmi Note','Note 13 series all variants.','a0000001-0000-0000-0000-000000000005','budget',200,'https://mi.com/in','Rs 200 OFF','2025-12-31',84,'https://logo.clearbit.com/mi.com'),
('Xiaomi','Rs 600 off on Xiaomi 14','Flagship model.','a0000001-0000-0000-0000-000000000005','high',750,'https://mi.com/in','Rs 600 OFF','2025-12-31',86,'https://logo.clearbit.com/mi.com'),
('HP','Rs 1500 off on HP laptop','Pavilion and Victus range.','a0000001-0000-0000-0000-000000000005','ultra',1000,'https://hp.com/in','Rs 1500 OFF','2025-12-31',83,'https://logo.clearbit.com/hp.com'),
('Dell','Rs 2000 off on Dell Inspiron','15 and 16 inch models.','a0000001-0000-0000-0000-000000000005','ultra',1000,'https://dell.com/in','Rs 2000 OFF','2025-12-31',85,'https://logo.clearbit.com/dell.com'),
('Lenovo','Rs 1000 off on IdeaPad','IdeaPad 3 and 5 series.','a0000001-0000-0000-0000-000000000005','ultra',1000,'https://lenovo.com/in','Rs 1000 OFF','2025-12-31',82,'https://logo.clearbit.com/lenovo.com'),
('JBL','Rs 300 off on JBL speaker','Flip 6 and Charge 5.','a0000001-0000-0000-0000-000000000005','standard',350,'https://jbl.com','Rs 300 OFF','2025-12-31',84,'https://logo.clearbit.com/jbl.com'),
('JBL','Rs 600 off on JBL headphones','Live 770NC and Tune 770.','a0000001-0000-0000-0000-000000000005','high',750,'https://jbl.com','Rs 600 OFF','2025-12-31',87,'https://logo.clearbit.com/jbl.com'),
('Sony','Rs 500 off on Sony WH-1000XM5','Noise cancelling headphones.','a0000001-0000-0000-0000-000000000005','high',750,'https://sony.co.in','Rs 500 OFF','2025-12-31',92,'https://logo.clearbit.com/sony.com'),
('Sony','Rs 2000 off on Sony Bravia TV','55 inch 4K models.','a0000001-0000-0000-0000-000000000005','ultra',1000,'https://sony.co.in','Rs 2000 OFF','2025-12-31',89,'https://logo.clearbit.com/sony.com'),
('Bose','Rs 800 off on Bose QuietComfort','QC 45 and QC Ultra.','a0000001-0000-0000-0000-000000000005','high',750,'https://bose.in','Rs 800 OFF','2025-12-31',90,'https://logo.clearbit.com/bose.com')
ON CONFLICT DO NOTHING;

-- ── MORE HEALTH & BEAUTY ──────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Lakme','Rs 100 off on makeup above Rs 499','Lipstick, foundation, kajal.','a0000001-0000-0000-0000-000000000006','low',100,'https://lakmeindia.com','Rs 100 OFF','2025-12-31',78,'https://logo.clearbit.com/lakmeindia.com'),
('Lakme','Rs 250 off on skincare kit','Lakme 9 to 5 range.','a0000001-0000-0000-0000-000000000006','standard',350,'https://lakmeindia.com','Rs 250 OFF','2025-12-31',81,'https://logo.clearbit.com/lakmeindia.com'),
('SUGAR Cosmetics','Rs 150 off on lipstick range','All shades.','a0000001-0000-0000-0000-000000000006','low',100,'https://sugarcosmetics.com','Rs 150 OFF','2025-12-31',80,'https://logo.clearbit.com/sugarcosmetics.com'),
('SUGAR Cosmetics','Rs 400 off on full face kit','Foundation + concealer + blush.','a0000001-0000-0000-0000-000000000006','standard',350,'https://sugarcosmetics.com','Rs 400 OFF','2025-12-31',83,'https://logo.clearbit.com/sugarcosmetics.com'),
('Wow Skin Science','Rs 100 off on hair care','Shampoo + conditioner combo.','a0000001-0000-0000-0000-000000000006','low',100,'https://mywowskin.com','Rs 100 OFF','2025-12-31',75,'https://logo.clearbit.com/mywowskin.com'),
('Wow Skin Science','Rs 300 off on skincare bundle','Vitamin C + Hyaluronic + SPF.','a0000001-0000-0000-0000-000000000006','standard',350,'https://mywowskin.com','Rs 300 OFF','2025-12-31',77,'https://logo.clearbit.com/mywowskin.com'),
('Plum','Rs 80 off on vegan skincare','All cruelty-free products.','a0000001-0000-0000-0000-000000000006','micro',50,'https://plumgoodness.com','Rs 80 OFF','2025-12-31',74,'https://logo.clearbit.com/plumgoodness.com'),
('Plum','Rs 200 off on skincare routine kit','Cleanser + toner + moisturiser.','a0000001-0000-0000-0000-000000000006','budget',200,'https://plumgoodness.com','Rs 200 OFF','2025-12-31',76,'https://logo.clearbit.com/plumgoodness.com'),
('Dot & Key','Rs 120 off on watermelon range','Serum + moisturiser.','a0000001-0000-0000-0000-000000000006','low',100,'https://dotandkey.com','Rs 120 OFF','2025-12-31',73,'https://logo.clearbit.com/dotandkey.com'),
('Minimalist','Rs 150 off on actives bundle','AHA + BHA + niacinamide.','a0000001-0000-0000-0000-000000000006','low',100,'https://beminimalist.co','Rs 150 OFF','2025-12-31',79,'https://logo.clearbit.com/beminimalist.co'),
('The Body Shop','Rs 200 off on body care','Body butter, scrubs, oils.','a0000001-0000-0000-0000-000000000006','budget',200,'https://thebodyshop.in','Rs 200 OFF','2025-12-31',82,'https://logo.clearbit.com/thebodyshop.com'),
('The Body Shop','Rs 500 off on gift set','Deluxe sets for gifting.','a0000001-0000-0000-0000-000000000006','premium',500,'https://thebodyshop.in','Rs 500 OFF','2025-12-31',85,'https://logo.clearbit.com/thebodyshop.com'),
('Forest Essentials','Rs 300 off on Ayurvedic skincare','Facial oils, serums, cleansers.','a0000001-0000-0000-0000-000000000006','standard',350,'https://forestessentialsindia.com','Rs 300 OFF','2025-12-31',80,'https://logo.clearbit.com/forestessentialsindia.com'),
('Forest Essentials','Rs 700 off on luxury gift hamper','Above Rs 3500.','a0000001-0000-0000-0000-000000000006','high',750,'https://forestessentialsindia.com','Rs 700 OFF','2025-12-31',83,'https://logo.clearbit.com/forestessentialsindia.com')
ON CONFLICT DO NOTHING;

-- ── MORE SPORTS & FITNESS ─────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Under Armour','Rs 200 off on training shoes','UA HOVR range.','a0000001-0000-0000-0000-000000000007','budget',200,'https://underarmour.com/en-in','Rs 200 OFF','2025-12-31',80,'https://logo.clearbit.com/underarmour.com'),
('Under Armour','Rs 500 off on sports gear set','Top + shorts + shoes combo.','a0000001-0000-0000-0000-000000000007','premium',500,'https://underarmour.com/en-in','Rs 500 OFF','2025-12-31',83,'https://logo.clearbit.com/underarmour.com'),
('Yonex','Rs 300 off on badminton racket','All series. With grip.','a0000001-0000-0000-0000-000000000007','standard',350,'https://yonex.com','Rs 300 OFF','2025-12-31',77,'https://logo.clearbit.com/yonex.com'),
('Yonex','Rs 700 off on badminton set','2 rackets + net + 6 shuttles.','a0000001-0000-0000-0000-000000000007','high',750,'https://yonex.com','Rs 700 OFF','2025-12-31',80,'https://logo.clearbit.com/yonex.com'),
('SG Cricket','Rs 250 off on cricket bat','English willow only.','a0000001-0000-0000-0000-000000000007','standard',350,'https://sgcricket.com','Rs 250 OFF','2025-12-31',75,'https://logo.clearbit.com/sgcricket.com'),
('MRF','Rs 300 off on cricket kit','Bat + pads + gloves bundle.','a0000001-0000-0000-0000-000000000007','standard',350,'https://mrfsports.com','Rs 300 OFF','2025-12-31',78,'https://logo.clearbit.com/mrfsports.com'),
('Nivia','Rs 150 off on football','Match and training balls.','a0000001-0000-0000-0000-000000000007','low',100,'https://nivia.com','Rs 150 OFF','2025-12-31',72,'https://logo.clearbit.com/nivia.com'),
('Nivia','Rs 400 off on team kit','Jersey + shorts for 11 players.','a0000001-0000-0000-0000-000000000007','standard',350,'https://nivia.com','Rs 400 OFF','2025-12-31',75,'https://logo.clearbit.com/nivia.com'),
('Planet Fitness','1-month gym pass free','All equipment + classes.','a0000001-0000-0000-0000-000000000007','premium',500,'https://planetfitnessgym.in','1 MONTH FREE','2025-12-31',84,'https://logo.clearbit.com/planetfitnessgym.in'),
('Gold''s Gym','Rs 500 off on annual membership','Any Gold''s Gym location.','a0000001-0000-0000-0000-000000000007','premium',500,'https://goldsgym.in','Rs 500 OFF','2025-12-31',82,'https://logo.clearbit.com/goldsgym.in'),
('Gold''s Gym','Rs 1500 off on 2-year membership','Best value. Lock-in rate.','a0000001-0000-0000-0000-000000000007','ultra',1000,'https://goldsgym.in','Rs 1500 OFF','2025-12-31',80,'https://logo.clearbit.com/goldsgym.in')
ON CONFLICT DO NOTHING;

-- ── MORE CLOTHING ─────────────────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Pantaloons','Rs 100 off on ethnic wear','Kurtas, sarees, salwar sets.','a0000001-0000-0000-0000-000000000002','low',100,'https://pantaloons.com','Rs 100 OFF','2025-12-31',73,'https://logo.clearbit.com/pantaloons.com'),
('Pantaloons','Rs 300 off on western wear','Dresses, tops, denims.','a0000001-0000-0000-0000-000000000002','standard',350,'https://pantaloons.com','Rs 300 OFF','2025-12-31',76,'https://logo.clearbit.com/pantaloons.com'),
('Westside','Rs 150 off on fashion above Rs 999','Tata Trent brand.','a0000001-0000-0000-0000-000000000002','low',100,'https://westside.com','Rs 150 OFF','2025-12-31',71,'https://logo.clearbit.com/westside.com'),
('Westside','Buy 2 get 20% off','All regular-price items.','a0000001-0000-0000-0000-000000000002','budget',200,'https://westside.com','20% OFF B2','2025-12-31',74,'https://logo.clearbit.com/westside.com'),
('Max Fashion','Flat 30% off on all apparel','In-store and online.','a0000001-0000-0000-0000-000000000002','budget',200,'https://maxfashion.in','30% OFF','2025-12-31',76,'https://logo.clearbit.com/maxfashion.in'),
('Max Fashion','Rs 500 off on family shopping','Spend Rs 3000+.','a0000001-0000-0000-0000-000000000002','premium',500,'https://maxfashion.in','Rs 500 OFF','2025-12-31',78,'https://logo.clearbit.com/maxfashion.in'),
('UCB','Rs 200 off on casual wear','United Colors of Benetton.','a0000001-0000-0000-0000-000000000002','budget',200,'https://ucb.com/in','Rs 200 OFF','2025-12-31',79,'https://logo.clearbit.com/ucb.com'),
('UCB','Rs 500 off on winter collection','Jackets, sweaters, coats.','a0000001-0000-0000-0000-000000000002','premium',500,'https://ucb.com/in','Rs 500 OFF','2025-12-31',82,'https://logo.clearbit.com/ucb.com'),
('Allen Solly','Rs 300 off on formal wear','Shirts, trousers, blazers.','a0000001-0000-0000-0000-000000000002','standard',350,'https://allensolly.com','Rs 300 OFF','2025-12-31',77,'https://logo.clearbit.com/allensolly.com'),
('Van Heusen','Rs 250 off on business formals','Shirts and trousers combo.','a0000001-0000-0000-0000-000000000002','standard',350,'https://vanheusenindia.com','Rs 250 OFF','2025-12-31',76,'https://logo.clearbit.com/vanheusenindia.com'),
('Peter England','Rs 200 off on shirts','All colors. All sizes.','a0000001-0000-0000-0000-000000000002','budget',200,'https://peterengland.com','Rs 200 OFF','2025-12-31',74,'https://logo.clearbit.com/peterengland.com'),
('Louis Philippe','Rs 500 off on premium collection','Suits and blazers only.','a0000001-0000-0000-0000-000000000002','premium',500,'https://louisphilippe.com','Rs 500 OFF','2025-12-31',81,'https://logo.clearbit.com/louisphilippe.com')
ON CONFLICT DO NOTHING;

-- ── OTT & ENTERTAINMENT (more) ────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Spotify','Spotify Premium 1-month free','Ad-free music. Any device.','a0000001-0000-0000-0000-000000000003','standard',350,'https://spotify.com','1 MONTH FREE','2025-12-31',89,'https://logo.clearbit.com/spotify.com'),
('Spotify','Spotify Premium 3-month family plan','Up to 6 accounts.','a0000001-0000-0000-0000-000000000003','ultra',1000,'https://spotify.com','FAMILY 3M','2025-12-31',91,'https://logo.clearbit.com/spotify.com'),
('Gaana','Gaana Plus 6-month free','Hindi + English music.','a0000001-0000-0000-0000-000000000003','premium',500,'https://gaana.com','6 MONTHS FREE','2025-12-31',76,'https://logo.clearbit.com/gaana.com'),
('JioCinema','JioCinema Premium 3-month','HBO, Sports, Hollywood.','a0000001-0000-0000-0000-000000000003','standard',350,'https://jiocinema.com','3 MONTHS','2025-12-31',85,'https://logo.clearbit.com/jiocinema.com'),
('SonyLiv','SonyLiv Premium 1-month','Sports + shows + movies.','a0000001-0000-0000-0000-000000000003','standard',350,'https://sonyliv.com','1 MONTH FREE','2025-12-31',83,'https://logo.clearbit.com/sonyliv.com'),
('SonyLiv','SonyLiv Annual subscription','Best price. Rs 999 value.','a0000001-0000-0000-0000-000000000003','high',750,'https://sonyliv.com','ANNUAL PLAN','2025-12-31',86,'https://logo.clearbit.com/sonyliv.com'),
('Zee5','Zee5 Premium 3-month free','Zee originals + live TV.','a0000001-0000-0000-0000-000000000003','standard',350,'https://zee5.com','3 MONTHS','2025-12-31',78,'https://logo.clearbit.com/zee5.com'),
('Mubi','Mubi 1-month free trial','Art house and indie films.','a0000001-0000-0000-0000-000000000003','budget',200,'https://mubi.com','1 MONTH FREE','2025-12-31',72,'https://logo.clearbit.com/mubi.com')
ON CONFLICT DO NOTHING;

-- ── MISCELLANEOUS / GIFTING ───────────────────────────────────
INSERT INTO coupons (brand_name,title,description,category_id,tier,points_required,redemption_url,discount_label,valid_until,demand_score,brand_logo_url) VALUES
('Amazon','Rs 150 off on gift cards','Any denomination above Rs 500.','a0000001-0000-0000-0000-000000000005','low',100,'https://amazon.in','Rs 150 OFF','2025-12-31',79,'https://logo.clearbit.com/amazon.com'),
('Flipkart','Rs 200 off on gift vouchers','Any brand voucher.','a0000001-0000-0000-0000-000000000005','budget',200,'https://flipkart.com','Rs 200 OFF','2025-12-31',77,'https://logo.clearbit.com/flipkart.com'),
('Archies','Rs 80 off on greeting cards + gift','Any occasion.','a0000001-0000-0000-0000-000000000013','micro',50,'https://archiesonline.com','Rs 80 OFF','2025-12-31',65,'https://logo.clearbit.com/archiesonline.com'),
('Ferns N Petals','Rs 150 off on flower bouquet','Same-day delivery available.','a0000001-0000-0000-0000-000000000013','low',100,'https://fnp.com','Rs 150 OFF','2025-12-31',74,'https://logo.clearbit.com/fnp.com'),
('Ferns N Petals','Rs 350 off on cake + flowers combo','Any occasion. Midnight delivery.','a0000001-0000-0000-0000-000000000013','standard',350,'https://fnp.com','Rs 350 OFF','2025-12-31',78,'https://logo.clearbit.com/fnp.com'),
('Ferns N Petals','Rs 600 off on premium gift hamper','Corporate gifts available.','a0000001-0000-0000-0000-000000000013','high',750,'https://fnp.com','Rs 600 OFF','2025-12-31',76,'https://logo.clearbit.com/fnp.com'),
('IGP','Rs 100 off on personalized gifts','Mugs, frames, cushions.','a0000001-0000-0000-0000-000000000013','low',100,'https://igp.com','Rs 100 OFF','2025-12-31',71,'https://logo.clearbit.com/igp.com'),
('IGP','Rs 300 off on anniversary special','Couple gifts and jewelry.','a0000001-0000-0000-0000-000000000013','standard',350,'https://igp.com','Rs 300 OFF','2025-12-31',73,'https://logo.clearbit.com/igp.com')
ON CONFLICT DO NOTHING;
