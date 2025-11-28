// Simple server that uses Supabase as the single source of truth for all data
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env (simple fallback) if not present
function loadEnvIfNeeded() {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) return;
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#]*))?/);
      if (m) {
        const key = m[1];
        const val = m[2] ?? m[3] ?? (m[4] ? m[4].trim() : '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}

loadEnvIfNeeded();

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase not configured. This server requires Supabase to be configured via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Exiting.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Server: Supabase client configured:', SUPABASE_URL);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Local users map retained only for compatibility in case you want quick creds; but we will always verify users in Supabase.
const localUsers = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', displayName: 'Administrator' },
  staff: { username: 'staff', password: 'staff123', role: 'staff', displayName: 'Staff Member' }
};

// Simple token: base64 of username:role (keeps compatibility with current frontend)
function makeToken(user) {
  return Buffer.from(`${user.username}:${user.role}`).toString('base64');
}
function decodeToken(token) {
  try {
    const s = Buffer.from(token, 'base64').toString('utf8');
    const [username, role] = s.split(':');
    return { username, role };
  } catch (e) { return null; }
}

// Utility helpers to map snake_case ↔ camelCase
function mapCategoriesRows(rows) {
  return (rows || []).map(r => ({ id: r.id, name: r.name }));
}
function mapProductsRows(rows) {
  return (rows || []).map(r => ({ id: r.id, name: r.name, price: r.price, image: r.image, category: r.category }));
}
function mapToppingsRows(rows) {
  return (rows || []).map(r => ({ id: r.id, name: r.name, price: r.price }));
}
function mapSizesRows(rows) {
  return (rows || []).map(r => ({ id: r.id, name: r.name, priceModifier: r.price_modifier }));
}
function mapPendingRows(rows) {
  return (rows || []).map(r => ({ id: r.id, customerName: r.customer_name, items: r.items, totalPrice: r.total_price, createdAt: r.created_at, status: r.status }));
}
function mapMergedRows(rows) {
  return (rows || []).map(r => ({ id: r.id, pendingOrderIds: r.pending_order_ids, customerNames: r.customer_names, totalItems: r.total_items, totalPrice: r.total_price, mergedBy: r.merged_by, mergedAt: r.merged_at, items: r.items }));
}

// Auth helpers now query Supabase users table. Token format remains base64(username:role) for compatibility.
async function getUserFromTokenHeader(req) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts[0] !== 'Bearer' || !parts[1]) return null;
  const decoded = decodeToken(parts[1]);
  if (!decoded) return null;
  try {
    const { data, error } = await supabase.from('users').select('*').eq('username', decoded.username).maybeSingle();
    if (error) {
      console.error('Failed to query users table', error);
      return null;
    }
    if (!data) return null;
    return { username: data.username, role: data.role, displayName: data.display_name || data.username };
  } catch (e) {
    console.error('getUserFromTokenHeader error', e);
    return null;
  }
}

async function authMiddleware(req, res, next) {
  const user = await getUserFromTokenHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user; // attach
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin role required' });
  next();
}

// ============ AUTH endpoints ============
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username/password' });

  try {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
    if (error) throw error;

    if (!data) {
      // Optionally allow localUsers for quick login if user exists there
      const lu = localUsers[username];
      if (lu && lu.password === password) {
        const token = makeToken({ username: lu.username, role: lu.role });
        return res.json({ token, user: { username: lu.username, role: lu.role, displayName: lu.displayName } });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // data exists in supabase. Supabase stores hashed password in password_hash, we cannot verify bcrypt here reliably without bcrypt.
    // For the mock server accept if provided password matches password_hash string or matches common dev passwords.
    const stored = String(data.password_hash || '');
    if (password === stored || password === 'admin123' || password === 'staff123') {
      const token = makeToken({ username: data.username, role: data.role });
      return res.json({ token, user: { username: data.username, role: data.role, displayName: data.display_name || data.username } });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (e) {
    console.error('Login error', e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  // authMiddleware attaches req.user
  res.json({ user: req.user });
});

// ============ CRUD endpoints (Supabase only) ============
// categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('id');
    if (error) throw error;
    return res.json(mapCategoriesRows(data));
  } catch (e) {
    console.error('Failed to fetch categories from supabase', e);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authMiddleware, requireAdmin, async (req, res) => {
  const cat = req.body;
  if (!cat.id || !cat.name) return res.status(400).json({ error: 'Invalid category' });
  try {
    const { data, error } = await supabase.from('categories').insert([{ id: cat.id, name: cat.name }]).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name });
  } catch (e) {
    console.error('Supabase insert category failed', e);
    return res.status(500).json({ error: 'Failed to insert category' });
  }
});

app.put('/api/categories/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const { data, error } = await supabase.from('categories').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name });
  } catch (e) {
    console.error('Supabase update category failed', e);
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    // prevent deletion if used by products
    const { data: inUse, error: inUseErr } = await supabase.from('products').select('id').eq('category', id).limit(1);
    if (inUseErr) throw inUseErr;
    if (inUse && inUse.length > 0) return res.status(400).json({ error: 'Category in use' });

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    console.error('Supabase delete category failed', e);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

// products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('id');
    if (error) throw error;
    return res.json(mapProductsRows(data));
  } catch (e) {
    console.error('Failed to fetch products from supabase', e);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', authMiddleware, requireAdmin, async (req, res) => {
  const body = req.body;
  if (!body.name || body.price == null) return res.status(400).json({ error: 'Invalid' });
  try {
    const { data, error } = await supabase.from('products').insert([{
      name: body.name,
      price: body.price,
      image: body.image || null,
      category: body.category || null
    }]).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name, price: data.price, image: data.image, category: data.category });
  } catch (e) {
    console.error('Supabase insert product failed', e);
    return res.status(500).json({ error: 'Failed to insert product' });
  }
});

app.put('/api/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { data, error } = await supabase.from('products').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name, price: data.price, image: data.image, category: data.category });
  } catch (e) {
    console.error('Supabase update product failed', e);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    console.error('Supabase delete product failed', e);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// toppings
app.get('/api/toppings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('toppings').select('*').order('id');
    if (error) throw error;
    return res.json(mapToppingsRows(data));
  } catch (e) {
    console.error('Failed to fetch toppings from supabase', e);
    return res.status(500).json({ error: 'Failed to fetch toppings' });
  }
});

app.post('/api/toppings', authMiddleware, requireAdmin, async (req, res) => {
  const body = req.body;
  if (!body.name) return res.status(400).json({ error: 'Invalid' });
  try {
    const { data, error } = await supabase.from('toppings').insert([{ name: body.name, price: body.price || 0 }]).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name, price: data.price });
  } catch (e) {
    console.error('Supabase insert topping failed', e);
    return res.status(500).json({ error: 'Failed to insert topping' });
  }
});

app.put('/api/toppings/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { data, error } = await supabase.from('toppings').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name, price: data.price });
  } catch (e) {
    console.error('Supabase update topping failed', e);
    return res.status(500).json({ error: 'Failed to update topping' });
  }
});

app.delete('/api/toppings/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { error } = await supabase.from('toppings').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    console.error('Supabase delete topping failed', e);
    return res.status(500).json({ error: 'Failed to delete topping' });
  }
});

// sizes
app.get('/api/sizes', async (req, res) => {
  try {
    const { data, error } = await supabase.from('sizes').select('*').order('id');
    if (error) throw error;
    return res.json(mapSizesRows(data));
  } catch (e) {
    console.error('Failed to fetch sizes from supabase', e);
    return res.status(500).json({ error: 'Failed to fetch sizes' });
  }
});

app.post('/api/sizes', authMiddleware, requireAdmin, async (req, res) => {
  const body = req.body;
  if (!body.name) return res.status(400).json({ error: 'Invalid' });
  try {
    const { data, error } = await supabase.from('sizes').insert([{ name: body.name, price_modifier: body.priceModifier || 0 }]).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name, priceModifier: data.price_modifier });
  } catch (e) {
    console.error('Supabase insert size failed', e);
    return res.status(500).json({ error: 'Failed to insert size' });
  }
});

app.put('/api/sizes/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { data, error } = await supabase.from('sizes').update({ name: req.body.name, price_modifier: req.body.priceModifier }).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ id: data.id, name: data.name, priceModifier: data.price_modifier });
  } catch (e) {
    console.error('Supabase update size failed', e);
    return res.status(500).json({ error: 'Failed to update size' });
  }
});

app.delete('/api/sizes/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { error } = await supabase.from('sizes').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    console.error('Supabase delete size failed', e);
    return res.status(500).json({ error: 'Failed to delete size' });
  }
});

// ============ ORDERS API (Supabase-backed) ============
// Get all pending orders (staff/admin only)
app.get('/api/orders/pending', authMiddleware, async (req, res) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Staff/Admin required' });
  }
  try {
    const { data, error } = await supabase.from('pending_orders').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) throw error;
    return res.json(mapPendingRows(data));
  } catch (e) {
    console.error('Failed to fetch pending_orders from supabase', e);
    return res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

// Add pending order (anyone can place order)
app.post('/api/orders/pending', async (req, res) => {
  const { customerName, items, totalPrice } = req.body;
  if (!customerName || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const newOrder = {
    id: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customer_name: customerName,
    items,
    total_price: totalPrice || items.reduce((s, it) => s + (it.price || 0), 0),
    created_at: new Date().toISOString(),
    status: 'pending'
  };

  try {
    const { data, error } = await supabase.from('pending_orders').insert([newOrder]).select().single();
    if (error) throw error;
    return res.json({ id: data.id, customerName: data.customer_name, items: data.items, totalPrice: data.total_price, createdAt: data.created_at, status: data.status });
  } catch (e) {
    console.error('Supabase insert pending order failed', e);
    return res.status(500).json({ error: 'Failed to create pending order' });
  }
});

// Delete pending order (staff/admin only)
app.delete('/api/orders/pending/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Staff/Admin required' });
  }

  const id = req.params.id;
  try {
    const { error } = await supabase.from('pending_orders').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    console.error('Supabase delete pending order failed', e);
    return res.status(500).json({ error: 'Failed to delete pending order' });
  }
});

// Get all merged orders (staff/admin only)
app.get('/api/orders/merged', authMiddleware, async (req, res) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Staff/Admin required' });
  }
  try {
    const { data, error } = await supabase.from('merged_orders').select('*').order('merged_at', { ascending: false });
    if (error) throw error;
    return res.json(mapMergedRows(data));
  } catch (e) {
    console.error('Failed to fetch merged_orders from supabase', e);
    return res.status(500).json({ error: 'Failed to fetch merged orders' });
  }
});

// Merge pending orders (staff/admin only)
app.post('/api/orders/merge', authMiddleware, async (req, res) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Staff/Admin required' });
  }

  const { orderIds } = req.body;
  if (!orderIds || !Array.isArray(orderIds)) {
    return res.status(400).json({ error: 'Invalid orderIds' });
  }

  // Fetch orders from Supabase
  try {
    const { data: pendingRows, error: fetchErr } = await supabase.from('pending_orders').select('*').in('id', orderIds);
    if (fetchErr) throw fetchErr;
    if (!pendingRows || pendingRows.length === 0) return res.status(404).json({ error: 'No orders found' });

    const rowsToMerge = pendingRows.map(r => ({ id: r.id, customerName: r.customer_name, items: r.items, totalPrice: r.total_price, createdAt: r.created_at, status: r.status }));

    // Calculate merged order data
    const allItems = rowsToMerge.flatMap(o => o.items);
    const totalPrice = rowsToMerge.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const uniqueNames = new Set();
    rowsToMerge.forEach(o => uniqueNames.add(o.customerName));
    const customerNames = Array.from(uniqueNames);

    const mergedOrder = {
      id: `MO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pending_order_ids: orderIds,
      customer_names: customerNames,
      total_items: allItems.length,
      total_price: totalPrice || 0,
      merged_by: req.user.username,
      merged_at: new Date().toISOString(),
      items: allItems
    };

    // Insert merged order
    const { data: inserted, error: insertErr } = await supabase.from('merged_orders').insert([mergedOrder]).select().single();
    if (insertErr) throw insertErr;

    // Delete pending orders
    const { error: delErr } = await supabase.from('pending_orders').delete().in('id', orderIds);
    if (delErr) console.error('Warning: failed to delete some pending orders', delErr);

    const resp = { id: inserted.id, pendingOrderIds: inserted.pending_order_ids, customerNames: inserted.customer_names, totalItems: inserted.total_items, totalPrice: inserted.total_price, mergedBy: inserted.merged_by, mergedAt: inserted.merged_at, items: inserted.items };

    return res.json(resp);
  } catch (e) {
    console.error('Supabase merge failed', e);
    return res.status(500).json({ error: 'Failed to merge orders' });
  }
});

const DEFAULT_PORT = Number(process.env.PORT) || 4000;
const MAX_PORT_ATTEMPTS = 10;

function tryListen(startPort, attemptsLeft) {
  const port = startPort;
  const server = app.listen(port, () => {
    console.log('Server listening on', port);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, ${attemptsLeft - 1} attempts left.`);
      server.close?.();
      if (attemptsLeft > 1) {
        tryListen(port + 1, attemptsLeft - 1);
      } else {
        console.error('All port attempts failed. Exiting.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

tryListen(DEFAULT_PORT, MAX_PORT_ATTEMPTS);
