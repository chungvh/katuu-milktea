<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🧋 Milk Tea Ordering System - Boba Bliss

A modern, real-time milk tea ordering application with admin panel and staff management.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/katuu---milk-tea-ordering)

## ✨ Features

### 🎯 Guest (Customer)
- Browse products by category
- Customize drinks (size, sugar, ice, toppings)
- Real-time order tracking
- Order history management
- Responsive design

### 👨‍💼 Staff
- View pending orders in real-time
- Merge multiple orders
- Process and finalize orders
- View order history

### 👑 Admin
- Complete CRUD for products
- Manage toppings, sizes, categories
- View all orders and statistics
- User management

### 🚀 Technical Features
- **Real-time Updates**: Supabase subscriptions
- **Authentication**: Role-based access (Guest/Staff/Admin)
- **Database**: Supabase PostgreSQL
- **State Management**: React Context API
- **UI/UX**: Tailwind CSS + Custom animations
- **Type Safety**: Full TypeScript
- **Build Tool**: Vite 6

---

## 🏗️ Tech Stack

```
Frontend:     React 19 + TypeScript
Build Tool:   Vite 6
Styling:      Tailwind CSS
Database:     Supabase (PostgreSQL)
Auth:         Supabase Auth
Real-time:    Supabase Subscriptions
Hosting:      Vercel (recommended)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account ([supabase.com](https://supabase.com))
- Git

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/katuu---milk-tea-ordering.git
   cd katuu---milk-tea-ordering
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Update with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Setup Database**
   
   Run SQL scripts in Supabase SQL Editor:
   ```bash
   # 1. Basic schema
   supabase/schema.sql
   
   # 2. Extended features
   supabase/extended-schema.sql
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

6. **Default Accounts**
   ```
   Admin:  admin  / admin123
   Staff:  staff  / staff123
   Guest:  No login required
   ```

---

## 🌐 Deploy to Vercel

**Your app is READY for Vercel deployment!**

### Quick Deploy (5 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Vercel auto-detects Vite

3. **Add Environment Variables**
   ```
   VITE_SUPABASE_URL=https://mjhcssepkfsvmwudmlla.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy!**
   - Click "Deploy"
   - Wait ~1 minute
   - Your app is live! 🎉

### 📚 Detailed Deployment Guides

- **Quick Steps**: `DEPLOY_STEPS.txt` (5-step guide)
- **Overview**: `VERCEL_READY.md` (Why Vercel?)
- **Full Guide**: `DEPLOYMENT.md` (Step-by-step)
- **Checklist**: `DEPLOYMENT_CHECKLIST.md` (Track progress)

---

## 📁 Project Structure

```
src/
├── config/          # Supabase configuration
├── controllers/     # Context providers (Auth, Order, Theme)
├── models/          # Services & business logic
│   ├── authService.ts
│   ├── orderService.ts
│   ├── adminService.ts
│   └── types.ts
├── views/
│   ├── pages/       # Page components
│   └── components/  # Reusable UI components
├── routes/          # Route protection
└── utils/           # Helper functions

supabase/
├── schema.sql       # Database schema
└── extended-schema.sql  # Additional tables
```

---

## 🔐 Environment Variables

Required variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** Variables must start with `VITE_` to be exposed to the client.

---

## 🧪 Testing

### Test Scenarios

**Guest Flow:**
1. Browse products
2. Customize and add to cart
3. Place order
4. View order history

**Staff Flow:**
1. Login as staff
2. View pending orders
3. Merge and process orders
4. Verify order completion

**Admin Flow:**
1. Login as admin
2. CRUD products
3. Manage toppings/sizes
4. View all orders

---

## 📊 Database Schema

### Main Tables
- `users` - User accounts (admin/staff/guest)
- `products` - Milk tea products
- `toppings` - Available toppings
- `sizes` - Size options
- `categories` - Product categories
- `pending_orders` - Active orders
- `merged_orders` - Completed orders

### Row Level Security (RLS)
- ✅ Public read access for products/toppings
- ✅ Authenticated write access for orders
- ✅ Admin-only access for management tables

---

## 🎨 Customization

### Update Branding
- Edit colors in `tailwind.config.js`
- Update logo/images in `src/assets/`
- Modify theme in `src/controllers/ThemeContext.tsx`

### Add New Features
- New products: Admin Panel → Products → Add
- New categories: Admin Panel → Categories → Add
- New toppings: Admin Panel → Toppings → Add

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Supabase Connection Issues
- Verify environment variables
- Check Supabase project status
- Verify RLS policies enabled

### Real-time Not Working
- Check Supabase real-time enabled
- Verify subscription code in components
- Check browser console for errors

---

## 📈 Performance

Current metrics:
- Build time: ~2 seconds
- Bundle size: 611 KB (169 KB gzipped)
- Lighthouse score: 90+ (expected)

### Optimization Tips
- Code splitting (lazy load routes)
- Image optimization
- Reduce bundle size

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

- **Documentation**: Check `DEPLOYMENT.md` and `VERCEL_READY.md`
- **Issues**: Open GitHub issue
- **Questions**: Contact via email

---

## 🎉 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 What's Next?

- [ ] Add payment integration
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support

---

<div align="center">

**Made with ❤️ for Boba Lovers**

[Live Demo](#) • [Documentation](DEPLOYMENT.md) • [Report Bug](#) • [Request Feature](#)

</div>

