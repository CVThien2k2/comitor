# Tra cứu cấu hình môi trường

## 1) Mục tiêu

Tập trung danh sách biến môi trường chính đang dùng trong dự án để cấu hình đúng khi chạy local/deploy.

## 2) Vị trí file cấu hình

- Backend: `apps/backend/.env.example`
- Web: `apps/web/.env.example`
- Database package: `packages/database/.env.example`

## 3) Nhóm biến chính (Backend)

### 3.1 Runtime & URL
- `PORT`
- `BACKEND_URL`
- `FRONTEND_URL`
- `NODE_ENV`

### 3.2 Database
- `DATABASE_URL`

### 3.3 Auth
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

### 3.4 Platform integration
- `ZALO_OA_ID`
- `ZALO_OA_SECRET_KEY`
- `META_APP_ID`
- `META_APP_SECRET_KEY`
- `META_VERIFY_TOKEN`
- `META_REDIRECT_URI`

### 3.5 Storage
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_REGION`

### 3.6 Email
- `RESEND_API_KEY`
- `EMAIL_FROM`

## 4) Nhóm biến chính (Web)

- `NEXT_PUBLIC_ENV`
- `NEXT_PUBLIC_API_URL`

## 5) Quy tắc cập nhật

- Thêm biến mới vào `.env.example` tương ứng ngay khi thêm code dùng biến đó.
- Không commit giá trị secret thật vào repo.
- Tên biến phải thống nhất giữa code và file ví dụ.
