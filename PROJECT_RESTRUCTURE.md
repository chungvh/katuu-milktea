Mục tiêu: chuyển repo sang cấu trúc MVC (Model / View / Controller) cho frontend React + services.

Tóm tắt mô hình MVC áp dụng cho dự án React hiện tại
- Models: data layer / API clients / types (services/*.ts, lib/supabase.ts)
- Views: UI components & pages (components/* và các màn hình lớn)
- Controllers: business logic / state orchestration (contexts/*, controller hooks)

Đề xuất cấu trúc thư mục mới (dưới thư mục `src/`)

src/
  controllers/        # React contexts, custom hooks that orchestrate business logic
  models/             # Data access layer (supabase / REST wrappers), types
  views/              # All React components and pages
    components/       # Reusable UI components
    pages/            # Page-level components (AdminPanel, Dashboard, Ordering)
    assets/           # icons/images
  config/             # supabase client, env/config
  utils/              # helper functions
  App.tsx
  index.tsx

Lộ trình an toàn (3 bước) - sẽ thực hiện từng bước theo thứ tự
1) Skeleton & dry-run copy (AN TOÀN)
   - Tạo `src/` skeleton và script `scripts/refactor-dryrun.js` (mặc định dry-run)
   - Script sẽ copy (không xóa) các thư mục chính sang nơi mới theo mapping
   - Chạy dry-run để xem danh sách file được copy mà không thay đổi repo
2) Copy thực tế (Non-destructive) - tạo `src/` thực tế
   - Chạy script với --apply để sao chép file thật sự vào src/
   - Chạy TypeScript check / get_errors
   - Sửa imports trên những file trong `src/` (bằng script hoặc thủ công)
3) Chuyển đổi hoàn tất (Destructive / switch)
   - Khi mọi thứ ổn: cập nhật `tsconfig.json` (baseUrl) / vite config nếu cần
   - Thay entry point (ví dụ chuyển import App từ root -> src/App)
   - Xóa file nguồn cũ hoặc giữ làm backup / commit vào branch

Script `scripts/refactor-dryrun.js`
- Là script Node đơn giản: nó đọc các mapping pre-defined và liệt kê/copy file.
- Mặc định chỉ dry-run (in những file sẽ được tạo). Dùng `--apply` để thực hiện copy.

Ghi chú quan trọng
- Không tự động chỉnh import path trong bước đầu. Ta sẽ copy file trước, sau đó cập nhật import paths dần dần.
- Một số file "page-like" (ví dụ `AdminPanel.tsx`, `Dashboard.tsx`, `OrderHistory.tsx`, `App.tsx`) cần được di chuyển thủ công hoặc script nâng cao để sửa đường dẫn. Tôi có script hỗ trợ nhưng khuyến nghị chạy dry-run và review kết quả.

Tiếp theo
- Nếu bạn OK với kế hoạch này, tôi sẽ tạo các file skeleton và script dry-run trong repo, rồi chạy dry-run để hiển thị các thay đổi được đề xuất.
