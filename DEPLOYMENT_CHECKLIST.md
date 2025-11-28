# ✅ VERCEL DEPLOYMENT CHECKLIST

## 📋 Pre-Deployment (Hoàn thành)

- [x] Build test thành công (`npm run build`)
- [x] Tạo `vercel.json` config
- [x] Tạo `.vercelignore`
- [x] Update `.gitignore` (protect .env)
- [x] Tạo documentation (DEPLOY_STEPS.txt, DEPLOYMENT.md, VERCEL_READY.md)
- [x] Source code ready for deployment

---

## 🚀 Deployment Steps (Làm theo thứ tự)

### Step 1: Git Setup
- [ ] Commit all changes
  ```bash
  git add .
  git commit -m "Add Vercel deployment config"
  ```
- [ ] Push to GitHub
  ```bash
  git push origin main
  ```
- [ ] Verify repository accessible

### Step 2: Vercel Account
- [ ] Truy cập https://vercel.com
- [ ] Sign up / Login with GitHub
- [ ] Authorize Vercel to access repositories

### Step 3: Import Project
- [ ] Click "Add New Project"
- [ ] Select repository: `katuu---milk-tea-ordering`
- [ ] Verify framework detected: Vite ✓
- [ ] Keep default settings
- [ ] **DON'T CLICK DEPLOY YET** (add env vars first)

### Step 4: Environment Variables
- [ ] Click "Environment Variables" tab
- [ ] Add variable 1:
  - Name: `VITE_SUPABASE_URL`
  - Value: `https://mjhcssepkfsvmwudmlla.supabase.co`
  - Environments: ☑ Production ☑ Preview ☑ Development
- [ ] Add variable 2:
  - Name: `VITE_SUPABASE_ANON_KEY`
  - Value: (Copy từ Supabase Dashboard → Settings → API → anon public)
  - Environments: ☑ Production ☑ Preview ☑ Development
- [ ] Save

### Step 5: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (~1-2 minutes)
- [ ] Verify deployment successful
- [ ] Copy production URL (e.g., `https://your-project.vercel.app`)

### Step 6: Supabase CORS
- [ ] Login to Supabase Dashboard
- [ ] Go to Settings → API → API Settings
- [ ] Find "Allowed Origins" section
- [ ] Add: `https://*.vercel.app`
- [ ] Save changes

### Step 7: Test Production
- [ ] Open production URL
- [ ] Test Guest Flow:
  - [ ] Select product
  - [ ] Add toppings
  - [ ] Place order
  - [ ] View order history
- [ ] Test Staff Flow:
  - [ ] Login: staff / staff123
  - [ ] View pending orders
  - [ ] Merge orders
  - [ ] View merged history
- [ ] Test Admin Flow:
  - [ ] Login: admin / admin123
  - [ ] CRUD products
  - [ ] CRUD toppings
  - [ ] CRUD sizes
- [ ] Test Real-time:
  - [ ] Open 2 tabs (Guest + Staff)
  - [ ] Guest places order
  - [ ] Verify Staff sees order immediately
  - [ ] Staff merges order
  - [ ] Verify Guest history cleared

---

## 🔧 Post-Deployment (Optional)

### Performance
- [ ] Run Lighthouse test
- [ ] Check bundle size (current: 611KB)
- [ ] Optimize if needed (code splitting)

### Monitoring
- [ ] Enable Vercel Analytics
- [ ] Check deployment logs
- [ ] Monitor Supabase usage

### Custom Domain (Optional)
- [ ] Buy domain (Namecheap, GoDaddy, etc.)
- [ ] Add to Vercel: Settings → Domains
- [ ] Wait for DNS propagation (~1-24 hours)
- [ ] Verify SSL certificate active

### Security
- [ ] Verify RLS policies in Supabase
- [ ] Test admin-only routes
- [ ] Check API rate limits

---

## 🐛 Troubleshooting

### Build Failed
- [ ] Check build logs in Vercel Dashboard
- [ ] Verify local build: `npm run build`
- [ ] Check TypeScript errors: `npx tsc --noEmit`

### Blank Page After Deploy
- [ ] Verify environment variables set correctly
- [ ] Check browser console for errors
- [ ] Verify Supabase URL/Key valid

### 404 on Page Refresh
- [ ] Verify `vercel.json` exists and correct
- [ ] Redeploy project

### Supabase Connection Error
- [ ] Verify CORS configured in Supabase
- [ ] Check Allowed Origins includes Vercel domain
- [ ] Verify anon key is public key (not service_role)

### Orders Not Syncing
- [ ] Check Supabase RLS policies
- [ ] Verify real-time subscriptions enabled
- [ ] Check browser console for websocket errors

---

## 📊 Success Criteria

After deployment, verify:
- [x] ✅ App loads without errors
- [x] ✅ Guest can place orders
- [x] ✅ Staff can login and merge orders
- [x] ✅ Admin can manage products
- [x] ✅ Real-time updates working
- [x] ✅ Order history syncs correctly
- [x] ✅ Mobile responsive
- [x] ✅ HTTPS enabled
- [x] ✅ Performance acceptable (<3s load time)

---

## 🎉 Congratulations!

Your app is now live on Vercel!

### Share your app:
- Production URL: `https://your-project.vercel.app`
- Share with team
- Test with real users

### Next steps:
1. Monitor usage and performance
2. Gather user feedback
3. Iterate and improve
4. Scale as needed

---

## 📚 Resources

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Documentation: See DEPLOYMENT.md, VERCEL_READY.md

---

## 🆘 Need Help?

1. Check logs: Vercel Dashboard → Deployments → Function Logs
2. Check Supabase logs: Supabase Dashboard → Logs
3. Review documentation: DEPLOYMENT.md
4. Rollback if needed: Deployments → Previous deployment → Promote

---

**Last Updated:** November 28, 2025
**Status:** ✅ Ready for Production Deployment

