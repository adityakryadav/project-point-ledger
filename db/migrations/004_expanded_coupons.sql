-- Clear old coupons and reseed with 100+ coupons with brand logos and demand scores

TRUNCATE coupons RESTART IDENTITY CASCADE;

-- ── FOOD ──────────────────────────────────────────────────────────────────────

-- Dominos
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Dominos',  '20% off on any pizza',          'Valid on regular & medium pizzas. Min ₹300.',      'b0000002-0000-0000-0000-000000000001','budget',   200,'https://dominos.co.in', '20% OFF',    '2025-12-31', 85, 'https://logo.clearbit.com/dominos.co.in'),
('Dominos',  'Buy 1 Get 1 Medium Pizza',       'Valid Mon-Thu. Dine-in only.',                    'b0000002-0000-0000-0000-000000000001','standard', 350,'https://dominos.co.in', 'BOGO',       '2025-12-31', 78, 'https://logo.clearbit.com/dominos.co.in'),
('Dominos',  '30% off + free garlic bread',    'On orders above ₹600. Delivery & dine-in.',      'b0000002-0000-0000-0000-000000000001','premium',  500,'https://dominos.co.in', '30% + FREE', '2025-12-31', 91, 'https://logo.clearbit.com/dominos.co.in');

-- Burger King
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Burger King','₹50 off on meals above ₹299',  'Valid all outlets. Not combinable.',              'b0000002-0000-0000-0000-000000000002','budget',   200,'https://burgerking.in', '₹50 OFF',   '2025-12-31', 72, 'https://logo.clearbit.com/burgerking.in'),
('Burger King','Buy 1 Get 1 Whopper',           'Classic Whopper. Dine-in only.',                 'b0000002-0000-0000-0000-000000000002','standard', 350,'https://burgerking.in', 'BOGO',       '2025-12-31', 88, 'https://logo.clearbit.com/burgerking.in'),
('Burger King','King Meal for 2 at ₹399',       'Includes 2 Whoppers, 2 fries, 2 drinks.',       'b0000002-0000-0000-0000-000000000002','premium',  500,'https://burgerking.in', 'MEGA DEAL',  '2025-12-31', 76, 'https://logo.clearbit.com/burgerking.in');

-- McDonalds
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('McDonalds', 'Free McFlurry with any combo',   'Dine-in and takeaway.',                          'b0000002-0000-0000-0000-000000000003','budget',   200,'https://mcdonalds.co.in','FREE',       '2025-12-31', 69, 'https://logo.clearbit.com/mcdonalds.com'),
('McDonalds', '2 Burgers + 2 Fries for ₹299',  'McSaver combo deal. Limited time.',              'b0000002-0000-0000-0000-000000000003','standard', 350,'https://mcdonalds.co.in','₹299 COMBO', '2025-12-31', 81, 'https://logo.clearbit.com/mcdonalds.com'),
('McDonalds', 'Happy Meal free with ₹599 order','Kids meal + toy included.',                      'b0000002-0000-0000-0000-000000000003','premium',  500,'https://mcdonalds.co.in','FREE MEAL',  '2025-12-31', 74, 'https://logo.clearbit.com/mcdonalds.com');

-- Swiggy
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Swiggy',    '₹75 off on first 3 orders',      'Min ₹199. Select restaurants.',                  'b0000002-0000-0000-0000-000000000004','budget',   200,'https://swiggy.com',    '₹75 OFF',    '2025-12-31', 90, 'https://logo.clearbit.com/swiggy.com'),
('Swiggy',    '₹150 off sitewide',               'Min order ₹399. Valid once.',                   'b0000002-0000-0000-0000-000000000004','standard', 350,'https://swiggy.com',    '₹150 OFF',   '2025-12-31', 86, 'https://logo.clearbit.com/swiggy.com'),
('Swiggy',    'Swiggy One 1-Month Free',          'Unlimited free delivery + member discounts.',   'b0000002-0000-0000-0000-000000000004','premium',  500,'https://swiggy.com',    '1 MONTH FREE','2025-12-31',92, 'https://logo.clearbit.com/swiggy.com');

-- Zomato
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Zomato',    '₹100 off on orders above ₹299',  'Valid on 500+ restaurants.',                     'b0000002-0000-0000-0000-000000000005','budget',   200,'https://zomato.com',    '₹100 OFF',   '2025-12-31', 83, 'https://logo.clearbit.com/zomato.com'),
('Zomato',    'Zomato Pro 1-month free trial',   '30% off on restaurants + free delivery.',       'b0000002-0000-0000-0000-000000000005','standard', 350,'https://zomato.com',    'PRO FREE',   '2025-12-31', 79, 'https://logo.clearbit.com/zomato.com'),
('Zomato',    'Zomato Gold 1-Month Free',         'Unlimited 1+1 dishes at 2000+ restaurants.',   'b0000002-0000-0000-0000-000000000005','premium',  500,'https://zomato.com/gold','1 MONTH FREE','2025-12-31',95, 'https://logo.clearbit.com/zomato.com');

-- KFC
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('KFC',       '5 pc Chicken for ₹199',           'Original Recipe. Dine-in only.',                'a0000001-0000-0000-0000-000000000001','budget',   200,'https://kfc.co.in',     '₹199 DEAL',  '2025-12-31', 77, 'https://logo.clearbit.com/kfc.com'),
('KFC',       'Bucket Meal for 2 at ₹499',       '12 pc bucket + 2 drinks + coleslaw.',           'a0000001-0000-0000-0000-000000000001','standard', 350,'https://kfc.co.in',     'BUCKET DEAL','2025-12-31', 84, 'https://logo.clearbit.com/kfc.com'),
('KFC',       'Party Pack 25 pc + sides',         'Family feast. Pre-order required.',             'a0000001-0000-0000-0000-000000000001','premium',  500,'https://kfc.co.in',     'PARTY PACK', '2025-12-31', 71, 'https://logo.clearbit.com/kfc.com');

-- Pizza Hut
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Pizza Hut', '25% off on medium pizza',         'Valid on dine-in and takeaway.',                 'a0000001-0000-0000-0000-000000000001','budget',   200,'https://pizzahut.co.in','25% OFF',    '2025-12-31', 68, 'https://logo.clearbit.com/pizzahut.com'),
('Pizza Hut', 'Buy 2 Get 1 Free Pan Pizza',      'Large pan pizzas only. Weekends.',              'a0000001-0000-0000-0000-000000000001','standard', 350,'https://pizzahut.co.in','B2G1 FREE',  '2025-12-31', 75, 'https://logo.clearbit.com/pizzahut.com'),
('Pizza Hut', 'Pizza for 4 at ₹799',             '4 medium pizzas + 4 drinks. Groups only.',      'a0000001-0000-0000-0000-000000000001','premium',  500,'https://pizzahut.co.in','GROUP DEAL', '2025-12-31', 70, 'https://logo.clearbit.com/pizzahut.com');

-- ── CLOTHING ──────────────────────────────────────────────────────────────────

-- Zara
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Zara',      '10% off on new arrivals',         'Valid on selected new season items.',            'b0000002-0000-0000-0000-000000000006','budget',   200,'https://zara.com/in',  '10% OFF',    '2025-12-31', 80, 'https://logo.clearbit.com/zara.com'),
('Zara',      '15% off on sale items',           'Extra 15% on already discounted items.',        'b0000002-0000-0000-0000-000000000006','standard', 350,'https://zara.com/in',  '15% OFF',    '2025-12-31', 73, 'https://logo.clearbit.com/zara.com'),
('Zara',      '20% off sitewide + free shipping','Full catalog including sale.',                  'b0000002-0000-0000-0000-000000000006','premium',  500,'https://zara.com/in',  '20% OFF',    '2025-12-31', 87, 'https://logo.clearbit.com/zara.com');

-- Zudio
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Zudio',     '₹100 off above ₹599',            'Valid all Zudio stores and app.',               'b0000002-0000-0000-0000-000000000007','budget',   200,'https://zudio.com',    '₹100 OFF',   '2025-12-31', 65, 'https://logo.clearbit.com/zudio.com'),
('Zudio',     '₹200 off above ₹999',            'Weekend deal. In-store only.',                  'b0000002-0000-0000-0000-000000000007','standard', 350,'https://zudio.com',    '₹200 OFF',   '2025-12-31', 60, 'https://logo.clearbit.com/zudio.com'),
('Zudio',     'Flat 30% off on all ethnic wear','Kurtis, sarees, salwar sets.',                  'b0000002-0000-0000-0000-000000000007','premium',  500,'https://zudio.com',    '30% OFF',    '2025-12-31', 67, 'https://logo.clearbit.com/zudio.com');

-- H&M
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('H&M',       '15% off on full-price items',    'Online only. Excludes sale items.',              'b0000002-0000-0000-0000-000000000008','budget',   200,'https://hm.com/in',    '15% OFF',    '2025-12-31', 76, 'https://logo.clearbit.com/hm.com'),
('H&M',       '20% off + free returns',         'Any purchase above ₹1500.',                     'b0000002-0000-0000-0000-000000000008','standard', 350,'https://hm.com/in',    '20% OFF',    '2025-12-31', 71, 'https://logo.clearbit.com/hm.com'),
('H&M',       '₹500 gift card',                 'Redeemable on any H&M purchase.',               'b0000002-0000-0000-0000-000000000008','premium',  500,'https://hm.com/in',    '₹500 GIFT',  '2025-12-31', 82, 'https://logo.clearbit.com/hm.com');

-- Myntra
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Myntra',    '25% off on top brands',           'Puma, Nike, Adidas, Levis.',                    'b0000002-0000-0000-0000-000000000009','budget',   200,'https://myntra.com',   '25% OFF',    '2025-12-31', 88, 'https://logo.clearbit.com/myntra.com'),
('Myntra',    '40% off on fashion week picks',   'Curated styles. Limited stock.',                'b0000002-0000-0000-0000-000000000009','standard', 350,'https://myntra.com',   '40% OFF',    '2025-12-31', 85, 'https://logo.clearbit.com/myntra.com'),
('Myntra',    '₹500 off on orders above ₹1999', 'End of Reason Sale items.',                     'b0000002-0000-0000-0000-000000000009','premium',  500,'https://myntra.com',   '₹500 OFF',   '2025-12-31', 93, 'https://logo.clearbit.com/myntra.com');

-- Nike
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Nike',      '15% off on footwear',             'Valid on all running shoes.',                   'a0000001-0000-0000-0000-000000000002','budget',   200,'https://nike.com/in',  '15% OFF',    '2025-12-31', 84, 'https://logo.clearbit.com/nike.com'),
('Nike',      '20% off on sportswear',           'Dri-FIT, Jordan, and more.',                   'a0000001-0000-0000-0000-000000000002','standard', 350,'https://nike.com/in',  '20% OFF',    '2025-12-31', 80, 'https://logo.clearbit.com/nike.com'),
('Nike',      '₹1000 off on orders above ₹4999','Members only deal. Nike app required.',         'a0000001-0000-0000-0000-000000000002','premium',  500,'https://nike.com/in',  '₹1000 OFF',  '2025-12-31', 89, 'https://logo.clearbit.com/nike.com');

-- ── MOVIES ────────────────────────────────────────────────────────────────────

-- PVR
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('PVR',       '₹75 off on movie tickets',        '2D shows. PVR app booking.',                   'b0000002-0000-0000-0000-000000000011','budget',   200,'https://pvrcinemas.com','₹75 OFF',    '2025-12-31', 77, 'https://logo.clearbit.com/pvrcinemas.com'),
('PVR',       '₹150 off on 3D/IMAX tickets',    'Premium screens only.',                         'b0000002-0000-0000-0000-000000000011','standard', 350,'https://pvrcinemas.com','₹150 OFF',   '2025-12-31', 82, 'https://logo.clearbit.com/pvrcinemas.com'),
('PVR',       'Movie + Meal for 2 at ₹599',      '2 tickets + 2 large combos.',                  'b0000002-0000-0000-0000-000000000011','premium',  500,'https://pvrcinemas.com','MOVIE DEAL', '2025-12-31', 88, 'https://logo.clearbit.com/pvrcinemas.com');

-- INOX
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('INOX',      'Buy 2 tickets get free popcorn',  'Regular popcorn. Weekends.',                    'b0000002-0000-0000-0000-000000000012','budget',   200,'https://inoxmovies.com','FREE POPCORN','2025-12-31',70, 'https://logo.clearbit.com/inoxmovies.com'),
('INOX',      '₹100 off + free nachos',          'On 2 tickets. Any show.',                       'b0000002-0000-0000-0000-000000000012','standard', 350,'https://inoxmovies.com','₹100 + FREE','2025-12-31', 66, 'https://logo.clearbit.com/inoxmovies.com'),
('INOX',      'Couple Package — 2 tickets + combo','Romantic deal. Valid all days.',              'b0000002-0000-0000-0000-000000000012','premium',  500,'https://inoxmovies.com','COUPLE DEAL','2025-12-31', 72, 'https://logo.clearbit.com/inoxmovies.com');

-- IMAX
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('IMAX',      '₹100 off IMAX ticket',            'Valid any IMAX show.',                          'b0000002-0000-0000-0000-000000000010','budget',   200,'https://imax.com',      '₹100 OFF',   '2025-12-31', 75, 'https://logo.clearbit.com/imax.com'),
('IMAX',      '₹200 off IMAX experience',        'Includes popcorn combo.',                       'b0000002-0000-0000-0000-000000000010','standard', 350,'https://imax.com',      '₹200 OFF',   '2025-12-31', 83, 'https://logo.clearbit.com/imax.com'),
('IMAX',      'IMAX VIP for 2 + premium seats',  'Recliner seats + food voucher.',               'b0000002-0000-0000-0000-000000000010','premium',  500,'https://imax.com',      'VIP DEAL',   '2025-12-31', 91, 'https://logo.clearbit.com/imax.com');

-- BookMyShow
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('BookMyShow','₹50 off on any event ticket',     'Movies, concerts, sports.',                     'a0000001-0000-0000-0000-000000000003','budget',   200,'https://bookmyshow.com','₹50 OFF',    '2025-12-31', 78, 'https://logo.clearbit.com/bookmyshow.com'),
('BookMyShow','₹150 off on concert tickets',     'Live music events only.',                       'a0000001-0000-0000-0000-000000000003','standard', 350,'https://bookmyshow.com','₹150 OFF',   '2025-12-31', 74, 'https://logo.clearbit.com/bookmyshow.com'),
('BookMyShow','₹300 off on sports events',       'IPL, football, tennis.',                        'a0000001-0000-0000-0000-000000000003','premium',  500,'https://bookmyshow.com','₹300 OFF',   '2025-12-31', 86, 'https://logo.clearbit.com/bookmyshow.com');

-- ── TRAVEL ────────────────────────────────────────────────────────────────────

-- MakeMyTrip
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('MakeMyTrip','₹200 off on hotel bookings',      'Hotels above ₹1000/night.',                     'b0000002-0000-0000-0000-000000000013','budget',   200,'https://makemytrip.com','₹200 OFF',   '2025-12-31', 76, 'https://logo.clearbit.com/makemytrip.com'),
('MakeMyTrip','₹500 off on flights',             'Domestic flights above ₹3000.',                 'b0000002-0000-0000-0000-000000000013','standard', 350,'https://makemytrip.com','₹500 OFF',   '2025-12-31', 84, 'https://logo.clearbit.com/makemytrip.com'),
('MakeMyTrip','₹1500 off on holiday packages',   'MMT packages above ₹20000.',                    'b0000002-0000-0000-0000-000000000013','premium',  500,'https://makemytrip.com/holidays','₹1500 OFF','2025-12-31',90,'https://logo.clearbit.com/makemytrip.com');

-- Cleartrip
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Cleartrip', '₹150 off on train tickets',       'Book via Cleartrip app.',                       'b0000002-0000-0000-0000-000000000014','budget',   200,'https://cleartrip.com', '₹150 OFF',  '2025-12-31', 65, 'https://logo.clearbit.com/cleartrip.com'),
('Cleartrip', '₹400 off on flight bookings',     'Domestic flights above ₹2500.',                'b0000002-0000-0000-0000-000000000014','standard', 350,'https://cleartrip.com', '₹400 OFF',  '2025-12-31', 71, 'https://logo.clearbit.com/cleartrip.com'),
('Cleartrip', '₹800 off on international flights','Above ₹15000. Select airlines.',              'b0000002-0000-0000-0000-000000000014','premium',  500,'https://cleartrip.com', '₹800 OFF',  '2025-12-31', 78, 'https://logo.clearbit.com/cleartrip.com');

-- Ola
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Ola',       '₹50 off on 3 rides',              'Ola Mini and Sedan.',                           'b0000002-0000-0000-0000-000000000015','budget',   200,'https://olacabs.com',  '₹50 OFF',    '2025-12-31', 73, 'https://logo.clearbit.com/olacabs.com'),
('Ola',       '₹100 off on Ola Prime',           'AC cab. Airport rides included.',               'b0000002-0000-0000-0000-000000000015','standard', 350,'https://olacabs.com',  '₹100 OFF',   '2025-12-31', 69, 'https://logo.clearbit.com/olacabs.com'),
('Ola',       'Ola Pass 1-month free',            'Unlimited rides with daily cap.',               'b0000002-0000-0000-0000-000000000015','premium',  500,'https://olacabs.com',  '1 MONTH FREE','2025-12-31',81,'https://logo.clearbit.com/olacabs.com');

-- Uber
INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Uber',      '₹60 off on first ride',           'New users only. UberGo eligible.',              'a0000001-0000-0000-0000-000000000004','budget',   200,'https://uber.com/in',  '₹60 OFF',    '2025-12-31', 79, 'https://logo.clearbit.com/uber.com'),
('Uber',      '₹120 off on airport rides',       'Valid from any airport. Uber XL.',              'a0000001-0000-0000-0000-000000000004','standard', 350,'https://uber.com/in',  '₹120 OFF',   '2025-12-31', 75, 'https://logo.clearbit.com/uber.com'),
('Uber',      'Uber One 3-month free',            'Priority pickup + 10% off every ride.',         'a0000001-0000-0000-0000-000000000004','premium',  500,'https://uber.com/in',  '3 MONTHS FREE','2025-12-31',86,'https://logo.clearbit.com/uber.com');

-- ── ELECTRONICS ───────────────────────────────────────────────────────────────

INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Amazon',    '5% cashback on electronics',      'Laptops, phones above ₹5000.',                  'a0000001-0000-0000-0000-000000000005','budget',   200,'https://amazon.in',    '5% BACK',    '2025-12-31', 82, 'https://logo.clearbit.com/amazon.com'),
('Amazon',    '₹500 off on mobiles above ₹8000','Select Android phones.',                         'a0000001-0000-0000-0000-000000000005','standard', 350,'https://amazon.in',    '₹500 OFF',   '2025-12-31', 88, 'https://logo.clearbit.com/amazon.com'),
('Amazon',    '₹1000 off on laptops above ₹30k','Select brands. Prime members only.',            'a0000001-0000-0000-0000-000000000005','premium',  500,'https://amazon.in',    '₹1000 OFF',  '2025-12-31', 92, 'https://logo.clearbit.com/amazon.com'),
('Flipkart',  '₹200 off on mobiles above ₹8000','Select brands. One per user.',                  'a0000001-0000-0000-0000-000000000005','budget',   200,'https://flipkart.com', '₹200 OFF',   '2025-12-31', 80, 'https://logo.clearbit.com/flipkart.com'),
('Flipkart',  '10% off on accessories',          'Earphones, chargers, cases.',                   'a0000001-0000-0000-0000-000000000005','standard', 350,'https://flipkart.com', '10% OFF',    '2025-12-31', 75, 'https://logo.clearbit.com/flipkart.com'),
('Flipkart',  '₹750 off on smart TVs',           '32 inch and above. Select brands.',             'a0000001-0000-0000-0000-000000000005','premium',  500,'https://flipkart.com', '₹750 OFF',   '2025-12-31', 83, 'https://logo.clearbit.com/flipkart.com'),
('Croma',     '₹500 off on appliances',          'All Croma stores and croma.com.',               'a0000001-0000-0000-0000-000000000005','budget',   200,'https://croma.com',    '₹500 OFF',   '2025-12-31', 68, 'https://logo.clearbit.com/croma.com'),
('Croma',     '₹1000 off on ACs and Fridges',    'Summer deals. BEE rated only.',                 'a0000001-0000-0000-0000-000000000005','standard', 350,'https://croma.com',    '₹1000 OFF',  '2025-12-31', 73, 'https://logo.clearbit.com/croma.com'),
('Croma',     '₹2000 off on laptops',            'Gaming and professional laptops.',              'a0000001-0000-0000-0000-000000000005','premium',  500,'https://croma.com',    '₹2000 OFF',  '2025-12-31', 77, 'https://logo.clearbit.com/croma.com'),
('Apple',     '₹1000 off on AirPods',            'AirPods 3rd gen and Pro.',                      'a0000001-0000-0000-0000-000000000005','standard', 350,'https://apple.com/in', '₹1000 OFF',  '2025-12-31', 94, 'https://logo.clearbit.com/apple.com'),
('Apple',     '₹3000 off on MacBook Air',        'M2 chip models only. Education pricing.',       'a0000001-0000-0000-0000-000000000005','premium',  500,'https://apple.com/in', '₹3000 OFF',  '2025-12-31', 97, 'https://logo.clearbit.com/apple.com'),
('Samsung',   '10% off on Galaxy phones',        'S series and A series.',                        'a0000001-0000-0000-0000-000000000005','budget',   200,'https://samsung.com/in','10% OFF',    '2025-12-31', 81, 'https://logo.clearbit.com/samsung.com'),
('Samsung',   '₹500 off on Galaxy Tab',          'All Galaxy Tab models.',                        'a0000001-0000-0000-0000-000000000005','standard', 350,'https://samsung.com/in','₹500 OFF',   '2025-12-31', 76, 'https://logo.clearbit.com/samsung.com'),
('Samsung',   '₹2000 off on QLED TVs',           '4K and 8K QLED models.',                        'a0000001-0000-0000-0000-000000000005','premium',  500,'https://samsung.com/in','₹2000 OFF',  '2025-12-31', 85, 'https://logo.clearbit.com/samsung.com');

-- ── HEALTH & BEAUTY ───────────────────────────────────────────────────────────

INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Nykaa',     '20% off on skincare',             'All skincare brands. App only.',                'a0000001-0000-0000-0000-000000000006','budget',   200,'https://nykaa.com',    '20% OFF',    '2025-12-31', 86, 'https://logo.clearbit.com/nykaa.com'),
('Nykaa',     '₹300 off on beauty above ₹1499', 'Makeup + skincare combined.',                   'a0000001-0000-0000-0000-000000000006','standard', 350,'https://nykaa.com',    '₹300 OFF',   '2025-12-31', 82, 'https://logo.clearbit.com/nykaa.com'),
('Nykaa',     'Nykaa Beauty Box subscription',   '3-month curated beauty box free.',              'a0000001-0000-0000-0000-000000000006','premium',  500,'https://nykaa.com',    '3 MONTHS FREE','2025-12-31',89,'https://logo.clearbit.com/nykaa.com'),
('Mamaearth', '25% off on hair care range',      'Shampoo, conditioner, serums.',                 'a0000001-0000-0000-0000-000000000006','budget',   200,'https://mamaearth.in', '25% OFF',    '2025-12-31', 71, 'https://logo.clearbit.com/mamaearth.in'),
('Mamaearth', '₹200 off on skincare kits',       'Complete face care kits.',                      'a0000001-0000-0000-0000-000000000006','standard', 350,'https://mamaearth.in', '₹200 OFF',   '2025-12-31', 67, 'https://logo.clearbit.com/mamaearth.in'),
('Cult.fit',  '1 Free fitness class',            'Yoga, Zumba, or HIIT. Any centre.',            'a0000001-0000-0000-0000-000000000006','budget',   200,'https://cult.fit',      'FREE CLASS', '2025-12-31', 74, 'https://logo.clearbit.com/cult.fit'),
('Cult.fit',  '1-Month Cult Pass free',           'Unlimited classes at any centre.',              'a0000001-0000-0000-0000-000000000006','premium',  500,'https://cult.fit',      '1 MONTH FREE','2025-12-31',84,'https://logo.clearbit.com/cult.fit');

-- ── SPORTS ────────────────────────────────────────────────────────────────────

INSERT INTO coupons (brand_name, title, description, category_id, tier, points_required, redemption_url, discount_label, valid_until, demand_score, brand_logo_url) VALUES
('Decathlon', '10% off on all sports gear',      'Footwear, apparel, equipment.',                 'a0000001-0000-0000-0000-000000000007','budget',   200,'https://decathlon.in', '10% OFF',    '2025-12-31', 76, 'https://logo.clearbit.com/decathlon.com'),
('Decathlon', '15% off on cycling products',     'Cycles, helmets, accessories.',                 'a0000001-0000-0000-0000-000000000007','standard', 350,'https://decathlon.in', '15% OFF',    '2025-12-31', 72, 'https://logo.clearbit.com/decathlon.com'),
('Decathlon', '₹1000 off on premium sports gear','Fitness equipment above ₹5000.',               'a0000001-0000-0000-0000-000000000007','premium',  500,'https://decathlon.in', '₹1000 OFF',  '2025-12-31', 79, 'https://logo.clearbit.com/decathlon.com'),
('Puma',      '20% off on running shoes',        'All Puma running collection.',                  'a0000001-0000-0000-0000-000000000007','budget',   200,'https://in.puma.com',  '20% OFF',    '2025-12-31', 81, 'https://logo.clearbit.com/puma.com'),
('Puma',      '25% off on sportswear',           'T-shirts, shorts, track pants.',               'a0000001-0000-0000-0000-000000000007','standard', 350,'https://in.puma.com',  '25% OFF',    '2025-12-31', 78, 'https://logo.clearbit.com/puma.com'),
('Puma',      '₹800 off on premium collections', 'Ferrari, BMW collections.',                     'a0000001-0000-0000-0000-000000000007','premium',  500,'https://in.puma.com',  '₹800 OFF',   '2025-12-31', 83, 'https://logo.clearbit.com/puma.com');

-- Update demand scores for all existing coupons
UPDATE coupons SET demand_score = 50 WHERE demand_score IS NULL;
