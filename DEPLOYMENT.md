# Deploying Shaqal Trade — Vercel (frontend) + Railway (backend, Postgres, Redis)

Three moving parts:

| Piece | Where | Why it matters |
|---|---|---|
| This Next.js app | **Vercel** | Landing page + app shell. Fully static until you hit the API. |
| `Shaqal-backend` Spring Boot jar | **Railway** (Dockerfile at repo root) | Login, deals, KYC, admin console. |
| Postgres + Redis | **Railway** (plugins, same project) | The app fails fast without a real DB, a `JWT_SECRET` and a storage key. |

---

## 1. Backend on Railway (~10 min)

1. [railway.app](https://railway.app) → **New Project** → name it e.g. `shaqal`.
2. **＋ New → GitHub Repo** → pick `SHAQAL-LTD/Shaqal-backend` (root directory = repo root;
   Railway detects the `Dockerfile` and builds the jar with Maven — first build takes a few minutes).
3. Service → **Settings**:
   - **Healthcheck Path:** `/actuator/health`
   - **Service Name:** leave as the repo name (references below use your names, autocomplete helps).
4. **＋ New → Database → Postgres** and **＋ New → Database → Redis** in the same project.

### Backend service → Variables tab (RAW editor)

```bash
# ── Profile: "production" (same one render.yaml uses) ──
SPRING_PROFILES_ACTIVE=production

# ── Postgres — Railway's native PG* names; the app builds the JDBC URL ──
# (jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE?sslmode=require) itself.
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}

# ── Redis ──
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# ── Secrets (generate both locally, never commit them) ──
JWT_SECRET=<openssl rand -base64 48>
STORAGE_ENCRYPTION_KEY_HEX=<openssl rand -hex 32>   # exactly 64 hex chars

# ── App wiring ──
CORS_ALLOWED_ORIGINS=https://*.vercel.app
FRONTEND_URL=https://<your-vercel-project>.vercel.app
STORAGE_LOCAL_ROOT=/tmp/shaqal-storage
RESEND_API_KEY=<optional — without it, verification/reset emails silently no-op>
```

Notes:
- All five `PG*` variables are **required** — the production profile fails fast at boot if any
  is missing (no silent fallback to a wrong database).
- `${{Postgres.…}}` / `${{Redis.…}}` are Railway **reference variables** — pick them from the
  autocomplete so the value follows the plugin. They require both services to exist first.
- `SPRING_PROFILES_ACTIVE=production` **overrides** the `prod` profile baked into the Dockerfile;
  `prod` forces S3/Spaces storage, `production` uses local disk (right choice for a demo).
- `STORAGE_LOCAL_ROOT=/tmp/shaqal-storage` is required: the container runs as a non-root user and
  cannot write to `/app/storage`. Files live on ephemeral disk — add a Railway Volume at
  `/data` and point this variable at it if you need documents to survive redeploys.
- `CORS_ALLOWED_ORIGINS` fail-closes when empty in this profile — the frontend is blocked entirely
  without it. `https://*.vercel.app` covers every preview deployment; add your custom domain later.

5. **Deploy.** When green, `https://<service>.up.railway.app/actuator/health` must return `{"status":"UP"}`.
   That base URL is the API host for step 3.

### First accounts

A fresh database has no users. Register normally through the deployed frontend, then promote
yourself to admin in Railway → Postgres → **Data** tab (the platform login endpoint rejects
admin accounts, so this account signs in **only** at `/users`, the operations console):

```sql
UPDATE users
   SET role = 'ADMIN', email_verified = TRUE, verification_status = 'APPROVED', is_active = TRUE
 WHERE email_lower = '<the email you registered>';

INSERT INTO user_authorities (user_id, authority)
SELECT id, 'ROLE_ADMIN' FROM users WHERE email_lower = '<the email you registered>'
ON CONFLICT DO NOTHING;
```

To reuse the local demo data instead (test broker, blocked deals, KYC rows):

```bash
docker exec shaqal-db pg_dump -U shaqal -d shaqal --no-owner --no-privileges > shaqal-demo.sql
railway connect   # or psql "$RAILWAY_POSTGRES_URL" — then paste/restore shaqal-demo.sql
```

---

## 2. Frontend on Vercel (~3 min)

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `SHAQAL-LTD/Shaqaal-frontend`
   (branch `main`). Framework, build command (`npx next build`) and install command are picked up
   from `vercel.json` — leave them as detected.
2. **Settings → Environment Variables** (Production **and** Preview):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<service>.up.railway.app/api/v1` |

   The `/api/v1` suffix is mandatory — `src/lib/api.ts` appends paths like `/auth/login` to it.
3. **Deploy.** Share `https://<project>.vercel.app` with the team.

Gotchas:
- `NEXT_PUBLIC_*` is **inlined at build time** — changing it does nothing until you redeploy.
- The legacy `env` block in `vercel.json` used `@api-url`-style placeholders (Vercel injects those
  literally, which would break every API call) — it has been removed; project settings own env now.
- No Sentry SDK is installed, so no `SENTRY_*` variables are needed.

---

## 3. Demo-day checklist

1. `…vercel.app` loads the landing page (works even if the API is down).
2. Register + sign in → dashboard hits `…up.railway.app/api/v1`.
3. Operations console at `/users` with the promoted admin account.
4. If you attach a custom domain to Vercel, append it to `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL`
   on Railway and redeploy the backend.

Frontend gates before every push: `npx tsc --noEmit` · `npx eslint .` (≤ 24 errors / 27 warnings) ·
`NEXT_PUBLIC_API_URL=… npm run build`. Backend: `./mvnw -B -ntp verify -Dapi.version=1.44`.
