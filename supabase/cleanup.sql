-- =====================================================
-- COMPLETE CLEANUP SCRIPT 
-- Run this FIRST before running extended-schema.sql
-- =====================================================

-- Drop all policies first
DROP POLICY IF EXISTS "Anyone can view pending orders" ON pending_orders;
DROP POLICY IF EXISTS "Anyone can add pending orders" ON pending_orders;
DROP POLICY IF EXISTS "Anyone can delete pending orders" ON pending_orders;
DROP POLICY IF EXISTS "Anyone can view merged orders" ON merged_orders;
DROP POLICY IF EXISTS "Anyone can add merged orders" ON merged_orders;
DROP POLICY IF EXISTS "Anyone can delete merged orders" ON merged_orders;
DROP POLICY IF EXISTS "Anyone can view order history" ON order_history;
DROP POLICY IF EXISTS "Anyone can add order history" ON order_history;
DROP POLICY IF EXISTS "Anyone can delete order history" ON order_history;

-- Extended schema policies
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can read toppings" ON toppings;
DROP POLICY IF EXISTS "Admins can manage toppings" ON toppings;
DROP POLICY IF EXISTS "Anyone can read sizes" ON sizes;
DROP POLICY IF EXISTS "Admins can manage sizes" ON sizes;
DROP POLICY IF EXISTS "Anyone can read users" ON users;

-- Drop triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_old_history() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS order_history CASCADE;
DROP TABLE IF EXISTS merged_orders CASCADE;
DROP TABLE IF EXISTS pending_orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sizes CASCADE;
DROP TABLE IF EXISTS toppings CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Verify cleanup
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('pending_orders', 'merged_orders', 'order_history', 
                       'categories', 'products', 'toppings', 'sizes', 'users');
  
  IF table_count = 0 THEN
    RAISE NOTICE '✅ Cleanup completed successfully!';
    RAISE NOTICE '✅ All tables dropped. Ready to run schema.sql + extended-schema.sql';
  ELSE
    RAISE WARNING '⚠️  % table(s) still exist. Please check manually.', table_count;
  END IF;
END $$;
