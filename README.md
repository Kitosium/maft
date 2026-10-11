**MAFT** is a math formula library

![Home Screenshots](screenshots/desktop/dark/home.png)

## 🔑 Setup

Copy `.env.example` to `.env` and fill in your values:

```sh
cp .env.example .env
```

| Var | Meaning |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `GOOGLE_KEY_JSON` | Google OAuth client JSON — `client_id`, `client_secret`, `redirect_uris` |
| `JWT_SECRET` | secret for signing the auth JWT |
| `ADMIN_EMAILS` | comma-separated emails granted the ADMIN role |
| `FRONTEND_URL` | frontend origin — CORS + OAuth redirect (default `http://localhost:3000`) |
| `BACKEND_PORT` | backend port (default `8000`) |
| `BACKEND_URL` | backend origin the frontend proxies to (default `http://localhost:8000`) |

Add `${FRONTEND_URL}/api/auth/callback` as an **Authorized redirect URI** in the [Google Cloud console](https://console.cloud.google.com/apis/credentials). Then push the schema and seed the database:

```sh
npm run db:push
npm run db:seed
```

## ▶️ Run

```sh
npm run dev:backend    # backend  → :8000
npm run dev:frontend   # frontend → :3000
```

## 🛠️ Scripts

| Command | What it does |
| --- | --- |
| `npm run build` | build backend + frontend |
| `npm run check` | type-check |
| `npm run audit` | enforce code style |
| `npm run smoke` | API smoke test (backend must be running) |
| `npm run screenshot` | capture dark/light × mobile/desktop shots |

## 🤝 Contributing

Issues and pull requests are welcome. Dev loop: `npm run check` · `npm run audit` · `npm run smoke`.
