-- Katuu Milk Tea Ordering - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PENDING ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pending_orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'merged'))
);

CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON pending_orders(created_at DESC);

COMMENT ON TABLE pending_orders IS 'Orders from guests waiting to be merged by staff';
COMMENT ON COLUMN pending_orders.items IS 'Array of order items (product, toppings, size, etc.)';

-- ============================================
-- MERGED ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS merged_orders (
  id TEXT PRIMARY KEY,
  pending_order_ids TEXT[] NOT NULL,
  customer_names TEXT[] NOT NULL,
  total_items INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  merged_by TEXT NOT NULL,
  merged_at TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_merged_orders_merged_at ON merged_orders(merged_at DESC);
CREATE INDEX IF NOT EXISTS idx_merged_orders_merged_by ON merged_orders(merged_by);

COMMENT ON TABLE merged_orders IS 'Final merged orders by staff/admin';
COMMENT ON COLUMN merged_orders.pending_order_ids IS 'IDs of pending orders that were merged';
COMMENT ON COLUMN merged_orders.items IS 'All items from merged pending orders';

-- ============================================
-- ORDER HISTORY TABLE (Guest Personal History)
-- ============================================
CREATE TABLE IF NOT EXISTS order_history (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product JSONB NOT NULL,
  toppings JSONB NOT NULL,
  size JSONB NOT NULL,
  sugar TEXT NOT NULL,
  ice TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_history_customer ON order_history(customer_name);
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON order_history(created_at DESC);

COMMENT ON TABLE order_history IS 'Personal order history for guests (temporary)';
COMMENT ON COLUMN order_history.product IS 'Product details as JSON';
COMMENT ON COLUMN order_history.toppings IS 'Array of toppings as JSON';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merged_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Pending Orders Policies
CREATE POLICY "Anyone can view pending orders"
  ON pending_orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert pending orders"
  ON pending_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete pending orders"
  ON pending_orders FOR DELETE
  USING (true);

CREATE POLICY "Anyone can update pending orders"
  ON pending_orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Merged Orders Policies
CREATE POLICY "Anyone can view merged orders"
  ON merged_orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert merged orders"
  ON merged_orders FOR INSERT
  WITH CHECK (true);

-- Order History Policies
CREATE POLICY "Anyone can view order history"
  ON order_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert order history"
  ON order_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete order history"
  ON order_history FOR DELETE
  USING (true);

-- ============================================
-- CLEANUP FUNCTION
-- ============================================

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete order history older than 7 days
  DELETE FROM order_history
  WHERE created_at < NOW() - INTERVAL '7 days';

  -- Delete merged orders older than 30 days
  DELETE FROM merged_orders
  WHERE merged_at < NOW() - INTERVAL '30 days';

  -- Delete pending orders older than 24 hours
  DELETE FROM pending_orders
  WHERE created_at < NOW() - INTERVAL '24 hours';

  RAISE NOTICE 'Cleanup completed';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_data IS 'Clean up old orders (run daily via cron)';

-- ============================================
-- REALTIME SETUP (Optional)
-- ============================================

-- Enable realtime for pending orders
ALTER PUBLICATION supabase_realtime ADD TABLE pending_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE merged_orders;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- You can add sample data here if needed

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pending_orders', 'merged_orders', 'order_history');

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('pending_orders', 'merged_orders', 'order_history');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Supabase database setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - pending_orders';
  RAISE NOTICE '  - merged_orders';
  RAISE NOTICE '  - order_history';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Copy your Supabase URL and anon key';
  RAISE NOTICE '  2. Create .env file in project root';
  RAISE NOTICE '  3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
  RAISE NOTICE '  4. Run: npm run dev';
  RAISE NOTICE '';
END $$;

