# Triển Khai Và Vận Hành

## Runtime topology hiện tại

Docker Compose đang định nghĩa các service chính:

- `backend` (NestJS)
- `web` (Next.js)
- `redis`
- `loki`
- `promtail`
- `grafana`

## Build images

- Backend: multi-stage image, build `@workspace/database` trước rồi build `backend`.
- Web: multi-stage image, build `database` + `ui` + `web` trước khi đóng gói runtime.

## CI/CD

Workflow deploy chính: `.github/workflows/docker-deploy.yml`

- Trigger khi push vào `main` và commit message chứa `deploy`, hoặc manual dispatch.
- Runner self-hosted pull code, `docker compose build`, `docker compose up -d`.

## Docs publishing

Workflow docs tại `docs/.github/workflows/docs.yml`:

- Cài `zensical`
- `zensical build --clean`
- publish lên GitHub Pages

## Environment variables

### Backend quan trọng

- Core: `PORT`, `NODE_ENV`, `FRONTEND_URL`, `DATABASE_URL`, `REDIS_URL`
- Auth: `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- Zalo OA: `ZALO_OA_ID`, `ZALO_OA_SECRET_KEY`
- Meta: `META_APP_ID`, `META_APP_SECRET_KEY`, `META_VERIFY_TOKEN`
- S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION`
- Email: `RESEND_API_KEY`, `EMAIL_FROM`

### Web quan trọng

- `NEXT_PUBLIC_ENV`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ZALO_OA_REQUEST_PERMISSION_APP_URL`
- `NEXT_PUBLIC_META_REDIRECT_URI`
- `NEXT_PUBLIC_META_APP_ID`

## Health checks

- Liveness: `GET /live`
- Readiness: `GET /ready`
- Overall: `GET /health`

Readiness check hiện gồm DB query (`SELECT 1`) và Redis ping.

## Logging & observability

- Promtail đọc Docker logs qua `docker_sd_configs`.
- Loki lưu logs theo label container/service.
- Grafana được provision sẵn datasource Loki.
