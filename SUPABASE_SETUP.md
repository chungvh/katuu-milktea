# Supabase Configuration Guide

## 🔴 Real-time Updates Không Hoạt Động?

**Root Cause:** Supabase chưa được configured → App đang dùng `localStorage` fallback thay vì Supabase database thật.

## ✅ Solution: Setup Supabase

### Bước 1: Tạo Supabase Project

1. Vào **https://supabase.com**
2. Đăng ký/Đăng nhập
3. Tạo project mới:
   - Organization: Chọn hoặc tạo mới
   - Project name: `milk-tea-ordering` (hoặc tên khác)
   - Database password: Đặt password mạnh
   - Region: Southeast Asia (Singapore) - gần Việt Nam nhất

### Bước 2: Get API Credentials

Sau khi project tạo xong:

1. Vào **Settings** → **API**
2. Copy 2 values:
   - **Project URL** (ví dụ: `https://abcxyz.supabase.co`)
   - **anon public** key (trong phần "Project API keys")

### Bước 3: Tạo File `.env.local`

Tạo file `.env.local` tại root project với nội dung:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Thay `your-project` và `your-anon-key-here` bằng values thật từ bước 2.

### Bước 4: Run Database Schemas

**Important:** Bạn cần run **2 files SQL** theo thứ tự:

#### 4.1. Run cleanup.sql (nếu đã run schema trước đó)

1. Vào **SQL Editor** trong Supabase dashboard
2. Copy toàn bộ content từ file **`supabase/cleanup.sql`**
3. Paste vào SQL Editor
4. Click **Run**
5. ✅ Should see: "Cleanup completed successfully!"

#### 4.2. Run schema.sql (Base schema - 3 core tables)

1. Vào **SQL Editor** (tab mới hoặc clear editor)
2. Copy toàn bộ content từ file **`supabase/schema.sql`**
3. Paste vào SQL Editor  
4. Click **Run**
5. ✅ Creates: `pending_orders`, `merged_orders`, `order_history`

#### 4.3. Run extended-schema.sql (Full schema với menu data)

1. Vào **SQL Editor** (tab mới hoặc clear editor)
2. Copy toàn bộ content từ file **`supabase/extended-schema.sql`**
3. Paste vào SQL Editor
4. Click **Run**
5. ✅ Creates và inserts data:
   - `categories` (5 rows)
   - `products` (30 rows - All menu items!)
   - `toppings` (12 rows)
   - `sizes` (2 rows)
   - `users` (2 rows: admin, staff)

**Verify:** Sau khi run, check Messages tab sẽ thấy:
```
✅ Extended schema setup completed!

Data inserted:
  - Categories: 5 rows
  - Products: 30 rows
  - Toppings: 12 rows  
  - Sizes: 2 rows
  - Users: 2 rows
```

### Bước 5: Enable Realtime

1. Vào **Database** → **Replication**
2. Enable Realtime cho 2 tables:
   - ✅ `pending_orders`
   - ✅ `merged_orders`
3. Click **Save**

### Bước 6: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

Check console log - Should see:
```
✅ Supabase configured: https://your-project.supabase.co
🔴 Setting up Realtime subscriptions...
```

## 🎉 Test Real-time

1. Open app in 2 browser tabs
2. Tab 1 (Guest): Tạo order mới → "Đặt Hàng"
3. Tab 2 (Admin): Navigate to `/pending`
4. ✅ Tab 2 should auto-update ngay lập tức!
5. ✅ Browser notification should appear

## 📝 Notes

- `.env.local` đã có trong `.gitignore` → safe, không commit lên Git
- Anon key is safe to expose (đã có Row Level Security)
- Free tier Supabase: 500MB database, 2GB bandwidth/month
- Realtime: 200 concurrent connections (free tier)

## 🐛 Troubleshooting

**Nếu vẫn không work:**

1. Check console log có `✅ Supabase configured` không
2. Check network tab có requests đến `supabase.co` không
3. Check Realtime subscriptions:
   ```javascript
   // Should see in console:
   🔴 Setting up Realtime subscriptions...
   📦 Pending order change: {eventType: 'INSERT', ...}
   ```
4. Verify Row Level Security policies enabled (đã có trong schema.sql)

**Nếu database connection error:**
- Check Supabase project status (Dashboard)
- Verify VITE_SUPABASE_URL correct (no trailing slash)
- Check VITE_SUPABASE_ANON_KEY copied đúng (rất dài, ~100+ chars)
