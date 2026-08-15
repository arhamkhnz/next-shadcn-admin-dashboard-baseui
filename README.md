# LiftNGo Admin

Secure single-administrator operations console for LiftNGo. It connects to the NestJS API in `../liftngo-backend` and covers live fleet locations, customer trips, delivery orders, customers, drivers, partners, verification documents, finance, support, safety, approvals, audit, and platform configuration.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Keep `BACKEND_API_URL=http://localhost:8081/api/v1` for the local backend.
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` to a browser-restricted Google Maps JavaScript API key. Restrict it to the admin host and only the Maps JavaScript API.
4. Start the backend, then run `npm install` and `npm run dev` here.

The admin app is available at `http://localhost:3000`. All backend traffic goes through the authenticated same-origin `/api/backend` boundary; access and rotating refresh tokens remain in HTTP-only cookies and are never exposed to client JavaScript.

## Configure the one administrator

In `liftngo-backend`, run the migrations and bootstrap credentials for the existing active ADMIN user:

```powershell
$env:LIFTNGO_ADMIN_USER_ID = "existing-admin-user-uuid"
$env:LIFTNGO_ADMIN_USERNAME = "admin"
$env:LIFTNGO_ADMIN_PASSWORD = "use-a-unique-strong-password"
corepack yarn db:migration:run
corepack yarn admin:bootstrap
```

The password must be at least 14 characters and meet the backend complexity rules. Running the bootstrap command again rotates the password, increments the credential version, and revokes active refresh sessions.

## Verification

```powershell
npm test -- --run
npm run build
```

The UI supports Light, Dark, and System modes only. Operational mutations are audited by the backend where supported, sensitive document links expire after 15 minutes, and high-risk changes use the approval queue.
