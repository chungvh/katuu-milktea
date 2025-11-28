# 🚀 Deployment Guide - Vercel

## ✅ Prerequisites
1. **Supabase Project** đã setup và có dữ liệu:
   - Products, Toppings, Sizes, Categories
   - Users (admin/staff)
   - RLS policies đã enable

2. **Git Repository** (GitHub/GitLab/Bitbucket)

---

## 📦 Bước 1: Chuẩn bị Source Code

### 1.1 Kiểm tra Build Local
```bash
npm install
npm run build
npm run preview
```
- Đảm bảo build thành công không lỗi
- Test preview site chạy đúng

### 1.2 Commit Code
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## 🌐 Bước 2: Deploy lên Vercel

### Option A: Deploy qua Vercel Dashboard (Recommended)

1. **Truy cập** https://vercel.com
2. **Login** với GitHub/GitLab/Bitbucket
3. Click **"Add New Project"**
4. **Import** repository của bạn
5. **Configure Project:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install`

6. **Environment Variables** - Thêm các biến sau:
   ```
   VITE_SUPABASE_URL=https://mjhcssepkfsvmwudmlla.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

7. Click **"Deploy"**

### Option B: Deploy qua Vercel CLI

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🔐 Bước 3: Configure Environment Variables

Trong Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://mjhcssepkfsvmwudmlla.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | Production, Preview, Development |

⚠️ **QUAN TRỌNG**: Không commit `.env` hoặc `.env.local` vào Git!

---

## 🔄 Bước 4: Configure Supabase CORS

Trong Supabase Dashboard:
1. Vào **Settings** → **API**
2. **Allowed Origins** → Thêm:
   ```
   https://your-project.vercel.app
   https://*.vercel.app
   ```

---

## ✅ Bước 5: Verify Deployment

Sau khi deploy thành công:

1. **Test Guest Flow:**
   - Truy cập site: `https://your-project.vercel.app`
   - Đặt hàng mới
   - Kiểm tra lịch sử đơn hàng

2. **Test Staff/Admin Flow:**
   - Login với `staff/staff123` hoặc `admin/admin123`
   - Chốt đơn hàng
   - Kiểm tra tổng hợp đơn hàng

3. **Test Real-time:**
   - Mở 2 tab: 1 Guest, 1 Staff
   - Guest đặt hàng → Staff thấy ngay lập tức

---

## 🐛 Troubleshooting

### Build Failed
```bash
# Local test build
npm run build

# Check for errors
npm run preview
```

### Environment Variables Not Working
- Đảm bảo tên biến bắt đầu với `VITE_`
- Redeploy sau khi thêm env vars
- Check browser console: `import.meta.env.VITE_SUPABASE_URL`

### 404 on Refresh
- ✅ Đã fix bằng `vercel.json` rewrites
- Tất cả routes sẽ fallback về `index.html`

### CORS Error
- Thêm Vercel domain vào Supabase Allowed Origins
- Check browser Network tab

---

## 🚀 Auto Deployment

Vercel tự động deploy khi:
- ✅ Push code lên `main` branch → Production
- ✅ Push lên branch khác → Preview deployment
- ✅ Pull Request → Preview deployment với unique URL

---

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: Page views, performance
- **Logs**: Runtime logs, build logs
- **Deployment History**: Rollback if needed

### Supabase Dashboard
- **Database**: Monitor queries
- **Auth**: User sessions
- **Logs**: API calls, errors

---

## 💰 Cost

### Vercel Free Tier (Hobby)
- ✅ 100 GB bandwidth/month
- ✅ 100 deployments/day
- ✅ Automatic HTTPS
- ✅ Unlimited projects

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users

**→ Hoàn toàn FREE cho dự án nhỏ/vừa!**

---

## 🎯 Next Steps

1. **Custom Domain** (Optional):
   - Vercel Settings → Domains → Add domain
   - Example: `bobaorder.com`

2. **Performance Optimization**:
   - Enable Vercel Edge Network (auto)
   - Compress images
   - Code splitting (Vite làm tự động)

3. **Monitoring**:
   - Setup Vercel Analytics
   - Setup error tracking (Sentry)

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Docs](https://supabase.com/docs)

---

## ✨ Quick Deploy Checklist

- [ ] Supabase đã setup xong (tables, users, RLS)
- [ ] Local build test thành công
- [ ] Code đã push lên Git
- [ ] Tạo project trên Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test trên production URL
- [ ] Configure Supabase CORS
- [ ] Test all features (Guest/Staff/Admin)

🎉 **DONE!** Your app is live on Vercel!
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}

