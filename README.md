# ☕ Cafe Manager

Hệ thống quản lý quán cafe full-stack với Next.js, Prisma, và Tailwind CSS.

## Tính năng

- **📊 Tổng quan (Dashboard)** — Doanh thu, đơn hàng hôm nay, cảnh báo kho, biểu đồ 7 ngày
- **🛒 Quản lý đơn hàng (POS)** — Giao diện chọn món, tạo đơn, theo dõi trạng thái
- **🍽️ Thực đơn** — CRUD món ăn, phân loại, bật/tắt bán
- **📦 Kho nguyên liệu** — Theo dõi tồn kho, cảnh báo sắp hết, nhập/xuất kho
- **📖 Công thức** — Gắn nguyên liệu với món, tự động trừ kho khi có đơn
- **👥 Nhân viên** — Quản lý tài khoản, phân quyền (Admin/Manager/Staff)

## Yêu cầu

- Node.js >= 18
- npm hoặc yarn

## Cài đặt & Chạy

```bash
# Clone repo
git clone https://github.com/your-username/cafe-manager.git
cd cafe-manager

# Cài dependencies
npm install

# Tạo database và seed dữ liệu mẫu
npm run db:push
npm run db:seed

# Chạy development
npm run dev
```

Mở http://localhost:3000

### Tài khoản demo
- **Admin:** admin@cafe.com / admin123
- **Staff:** staff@cafe.com / staff123

## Deploy lên Hostinger

### Option 1: VPS (khuyến nghị)

```bash
# 1. Upload code lên VPS
git clone https://github.com/your-username/cafe-manager.git
cd cafe-manager

# 2. Cài Node.js (trên Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Cài dependencies & build
npm install
npm run db:push
npm run db:seed
npm run build

# 4. Chạy với PM2
npm install -g pm2
pm2 start npm --name "cafe-manager" -- start
pm2 startup
pm2 save
```

### Option 2: MySQL (thay vì SQLite)

Sửa file `.env` và `prisma/schema.prisma`:

```env
# .env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
```

```prisma
# prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

```bash
npm run db:push
npm run db:seed
```

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/login/          # Trang đăng nhập
│   ├── (dashboard)/           # Các trang chính (yêu cầu đăng nhập)
│   │   ├── dashboard/         # Tổng quan
│   │   ├── orders/            # Quản lý đơn + POS
│   │   ├── menu/              # Thực đơn
│   │   ├── inventory/         # Kho nguyên liệu
│   │   ├── recipes/           # Công thức
│   │   └── employees/         # Nhân viên
│   └── api/                   # REST API endpoints
├── components/                # Shared components
├── lib/                       # Utilities, auth, prisma client
└── types/                     # TypeScript types
prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Dữ liệu mẫu
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite/MySQL via Prisma ORM
- **Auth:** NextAuth.js (JWT)
- **UI:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
