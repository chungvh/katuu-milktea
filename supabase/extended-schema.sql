-- Extended Schema for Products, Toppings, Sizes, and Auth
-- Run this AFTER the main schema.sql

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_id ON categories(id);

COMMENT ON TABLE categories IS 'Product categories (Trà Sữa, Cafe, etc.)';

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  category TEXT REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

COMMENT ON TABLE products IS 'All available products';

-- ============================================
-- TOPPINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS toppings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_toppings_name ON toppings(name);

COMMENT ON TABLE toppings IS 'Available toppings';

-- ============================================
-- SIZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sizes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_modifier INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sizes IS 'Available sizes (M, L)';

-- ============================================
-- USERS TABLE (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'guest')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON TABLE users IS 'User accounts for admin and staff';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read for menu items
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read toppings" ON toppings;
CREATE POLICY "Anyone can read toppings"
  ON toppings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read sizes" ON sizes;
CREATE POLICY "Anyone can read sizes"
  ON sizes FOR SELECT
  USING (true);

-- Admin can manage menu items
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Admins can manage toppings" ON toppings;
CREATE POLICY "Admins can manage toppings"
  ON toppings FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Admins can manage sizes" ON sizes;
CREATE POLICY "Admins can manage sizes"
  ON sizes FOR ALL
  USING (true);

-- Users table - public read for authentication
DROP POLICY IF EXISTS "Anyone can read users" ON users;
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  USING (true);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Categories
INSERT INTO categories (id, name) VALUES
  ('milk-tea', 'Trà Sữa'),
  ('fruit-tea', 'Trà Trái Cây'),
  ('fresh-milk', 'Sữa Tươi'),
  ('cafe', 'Cafe'),
  ('latte', 'Latte')
ON CONFLICT (id) DO NOTHING;

-- Products (Trà Sữa)
INSERT INTO products (id, name, price, image, category) VALUES
  (1, 'Trà Sữa Katuu', 30000, 'https://picsum.photos/id/101/400/400', 'milk-tea'),
  (2, 'Trà Sữa Truyền Thống', 20000, 'https://picsum.photos/id/102/400/400', 'milk-tea'),
  (3, 'Trà Sữa Okinawa', 20000, 'https://picsum.photos/id/103/400/400', 'milk-tea'),
  (4, 'Trà Sữa Lai', 20000, 'https://picsum.photos/id/104/400/400', 'milk-tea'),
  (5, 'Trà Sữa Olong', 23000, 'https://picsum.photos/id/106/400/400', 'milk-tea'),
  (6, 'Trà Sữa Olong Lài', 23000, 'https://picsum.photos/id/111/400/400', 'milk-tea'),
  (7, 'Trà Sữa Matcha', 23000, 'https://picsum.photos/id/112/400/400', 'milk-tea'),
  (8, 'Trà Sữa Chocolate', 23000, 'https://picsum.photos/id/113/400/400', 'milk-tea'),
  (9, 'Trà Sữa Chocomint', 23000, 'https://picsum.photos/id/114/400/400', 'milk-tea'),
  (10, 'Trà Sữa Hạt Dẻ Phô Mai', 27000, 'https://picsum.photos/id/115/400/400', 'milk-tea'),
  (11, 'Trà Sữa Kem Macchiato', 27000, 'https://picsum.photos/id/116/400/400', 'milk-tea'),
  (12, 'Trà Sữa Kem Trứng Cháy', 27000, 'https://picsum.photos/id/117/400/400', 'milk-tea'),

  -- Trà Trái Cây
  (13, 'Trà Trái Cây Nhiệt Đới', 33000, 'https://picsum.photos/id/201/400/400', 'fruit-tea'),
  (14, 'Trà Vải Lài', 30000, 'https://picsum.photos/id/202/400/400', 'fruit-tea'),
  (15, 'Trà Đào', 30000, 'https://picsum.photos/id/203/400/400', 'fruit-tea'),
  (16, 'Trà Ổi Hồng Ruby', 30000, 'https://picsum.photos/id/204/400/400', 'fruit-tea'),
  (17, 'Trà Cam Bưởi Xí Muội', 30000, 'https://picsum.photos/id/205/400/400', 'fruit-tea'),
  (18, 'Lục Trà Chanh Dây Macchiato', 30000, 'https://picsum.photos/id/206/400/400', 'fruit-tea'),
  (19, 'Lục Trà Chanh Mật Ong', 25000, 'https://picsum.photos/id/207/400/400', 'fruit-tea'),

  -- Sữa Tươi
  (20, 'Sữa Tươi Trân Châu Đường Đen', 28000, 'https://picsum.photos/id/301/400/400', 'fresh-milk'),
  (21, 'Sữa Tươi Trà Xanh Trân Châu Đường Đen', 30000, 'https://picsum.photos/id/302/400/400', 'fresh-milk'),
  (22, 'Sữa Tươi Choco Trân Châu Đường Đen', 30000, 'https://picsum.photos/id/303/400/400', 'fresh-milk'),

  -- Cafe
  (23, 'Cafe Đen', 15000, 'https://picsum.photos/id/401/400/400', 'cafe'),
  (24, 'Cafe Sữa', 18000, 'https://picsum.photos/id/402/400/400', 'cafe'),
  (25, 'Bạc Xỉu', 20000, 'https://picsum.photos/id/403/400/400', 'cafe'),
  (26, 'Cafe Kem Sữa', 25000, 'https://picsum.photos/id/404/400/400', 'cafe'),
  (27, 'Cafe Sữa Tươi Sương Sáo', 25000, 'https://picsum.photos/id/405/400/400', 'cafe'),

  -- Latte
  (28, 'Matcha Latte', 30000, 'https://picsum.photos/id/501/400/400', 'latte'),
  (29, 'Choco Latte', 30000, 'https://picsum.photos/id/502/400/400', 'latte'),
  (30, 'Matcha Oreo Phô Mai', 35000, 'https://picsum.photos/id/503/400/400', 'latte')
ON CONFLICT (id) DO NOTHING;

-- Toppings
INSERT INTO toppings (id, name, price) VALUES
  (1, 'Trân Châu Đen', 5000),
  (2, 'Trân Châu Trắng', 5000),
  (3, 'Rau Câu Phô Mai', 5000),
  (4, 'Pudding', 5000),
  (5, 'Sương Sáo', 5000),
  (6, 'Phô Mai Tươi', 5000),
  (7, 'Hạt Thủy Tinh', 5000),
  (8, 'Đào Miếng', 7000),
  (9, 'Trái Vải', 7000),
  (10, 'Kem Macchiato', 7000),
  (11, 'Kem Trứng Cháy', 7000),
  (12, 'Full Topping', 10000)
ON CONFLICT (id) DO NOTHING;

-- Sizes
INSERT INTO sizes (id, name, price_modifier) VALUES
  (1, 'Size M', 0),
  (2, 'Size L', 5000)
ON CONFLICT (id) DO NOTHING;

-- Default users (password is plain text for demo)
-- In a real app, this should be a secure bcrypt hash
INSERT INTO users (username, password_hash, role, display_name) VALUES
  ('admin', 'admin123', 'admin', 'Administrator'),
  ('staff', 'staff123', 'staff', 'Staff Member')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
  cat_count INTEGER;
  prod_count INTEGER;
  top_count INTEGER;
  size_count INTEGER;
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO prod_count FROM products;
  SELECT COUNT(*) INTO top_count FROM toppings;
  SELECT COUNT(*) INTO size_count FROM sizes;
  SELECT COUNT(*) INTO user_count FROM users;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Extended schema setup completed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Data inserted:';
  RAISE NOTICE '  - Categories: % rows', cat_count;
  RAISE NOTICE '  - Products: % rows', prod_count;
  RAISE NOTICE '  - Toppings: % rows', top_count;
  RAISE NOTICE '  - Sizes: % rows', size_count;
  RAISE NOTICE '  - Users: % rows', user_count;
  RAISE NOTICE '';
END $$;

