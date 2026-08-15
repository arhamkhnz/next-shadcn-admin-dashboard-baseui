# Trip Route Preview and Customer Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent trip-hover preview and structured interactive trip route page, repair enum-array customer filtering, and deploy the verified backend and frontend changes.

**Architecture:** Keep customer-role filtering in the NestJS API using PostgreSQL array containment. In the Next.js admin, isolate trip normalisation, route acquisition, Leaflet rendering, preview selection, and full-detail composition into focused modules. Route geometry comes through an authenticated same-origin server route backed by a configurable OSRM endpoint, with a deterministic approximate curve as the client fallback.

**Tech Stack:** NestJS 11, TypeORM 0.3, nestjs-paginate 10, Jest, Next.js 16 App Router, React 19, TypeScript, SWR, Leaflet 1.9, Base UI/shadcn, Tailwind CSS 4, Vitest, Testing Library, AWS ECR/EC2 deployment, Vercel.

## Global Constraints

- Preserve the LiftNGo admin visual language, contextual three-dot actions, light/dark/system themes, and mobile card patterns.
- Use OpenStreetMap tiles with visible attribution and an open-routing server behind a same-origin authenticated route.
- Never expose arbitrary upstream URLs, credentials, access tokens, or upstream error bodies to the browser.
- Hover must also work with keyboard focus; touch devices need an explicit tap/sheet equivalent.
- Keep customer filtering server-side; do not replace it with client filtering.
- Backend deployment may target only branch `new-dev`, `/home/ubuntu/new-dev-liftngo`, and Compose project `new-dev-liftngo`.
- Frontend deployment must use linked Vercel project `admin-liftngo-new-dev`; verify a preview before promotion.
- Preserve unrelated dirty-worktree changes and stage only task-owned files.
- OSRM route requests use longitude before latitude, `geometries=geojson`, and `overview=full`: [OSRM route service](https://project-osrm.org/docs/v5.24.0/api/#route-service).
- Leaflet rendering follows `Polyline`, `Tooltip`, and `fitBounds`: [Leaflet reference](https://leafletjs.com/reference.html#polyline).

## File Structure

Backend repository `C:/Users/J R Deva Dattan/Desktop/liftngo-backend`:

- `src/api/v1/users/users.dto.ts`: permit the array-compatible role filter.
- `src/api/v1/users/users.dto.spec.ts`: prevent scalar equality regression.

Frontend repository `C:/Users/J R Deva Dattan/Desktop/admin-liftngo`:

- `src/lib/api/customer-query.ts`: one customer endpoint contract.
- `src/components/admin/trip-types.ts`: trip, person, route, and driver-location contracts.
- `src/components/admin/trip-route.ts`: normalisation, validation, fallback curve, bounds, formatting.
- `src/lib/maps/open-route.ts`: OSRM URL construction and response validation.
- `src/app/api/maps/route/route.ts`: authenticated, bounded OSRM proxy.
- `src/components/admin/trip-route-map.tsx`: reusable Leaflet preview/detail map.
- `src/components/admin/trip-preview.tsx`: compact route summary.
- `src/components/admin/trip-workspace.tsx`: desktop hover/focus selection and mobile sheet.
- `src/components/admin/trip-detail.tsx`: dedicated structured trip page.
- Co-located `*.test.ts`/`*.test.tsx` files cover every pure and interactive boundary.

---

### Task 8: Run complete quality and browser verification

**Files:**
- Verify all task-owned backend and frontend files.
- Do not modify generated build output.

- [ ] **Step 1: Run the required backend pre-push gate**

```powershell
yarn build
yarn type-check
yarn test --runInBand
```

Run from `C:/Users/J R Deva Dattan/Desktop/liftngo-backend`. Expected: all exit 0.

- [ ] **Step 2: Run frontend formatting and static checks**

```powershell
npx biome check src/components/admin/trip-types.ts src/components/admin/trip-route.ts src/components/admin/trip-route-map.tsx src/components/admin/trip-preview.tsx src/components/admin/trip-workspace.tsx src/components/admin/trip-detail.tsx src/lib/maps/open-route.ts src/app/api/maps/route/route.ts src/lib/api/customer-query.ts
npx tsc --noEmit
```

- [ ] **Step 3: Run the complete frontend test and production build gates**

```powershell
npx vitest run --maxWorkers=4
npm run build
```

Expected: all tests pass and the Next.js production build exits 0.

- [ ] **Step 4: Start the frontend against new-dev and verify in the user's chosen browser**

Verify at desktop and mobile widths:

1. Admin login succeeds.
2. Customers loads without the enum/integer error.
3. Create Trip customer options load.
4. Desktop trip hover and keyboard focus update the persistent preview.
5. Mobile `Preview route` opens the bottom sheet.
6. Full details show readable trip/customer/driver/fare/timing information and no raw JSON.
7. Pickup, destination, route, location inspector, coordinates, and available driver location render.
8. Three-dot row actions continue to work.
9. Light, dark, and system themes remain legible.
10. Network or routing failure shows the approximate curve and does not blank the page.

- [ ] **Step 5: Inspect the final diff and repository status**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; unrelated user changes remain unstaged and untouched.

---

### Task 9: Deploy backend and frontend, then verify production

**Files:**
- Backend deployment metadata: `.github/workflows/new-dev-deploy.yml` (read-only).
- Frontend Vercel link: `.vercel/project.json` (read-only).

- [ ] **Step 1: Publish the backend change to the isolated `new-dev` branch**

Push only the verified backend commit to `origin/new-dev`. Do not merge or push to `dev` or `main`.

- [ ] **Step 2: Monitor the configured GitHub Actions deployment**

```powershell
gh run list --workflow new-dev-deploy.yml --branch new-dev --limit 5
```

Wait for the run corresponding to the pushed commit to complete successfully.

- [ ] **Step 3: Verify backend health and the repaired customer filter**

Require HTTP 200 from `https://new-dev-liftngo.duckdns.org/api/v1/platform/observability/ready`. Through the authenticated admin frontend boundary, verify `users?limit=100&filter.role=$contains:CUSTOMER` returns customer data rather than a PostgreSQL cast error.

- [ ] **Step 4: Create and inspect a Vercel preview deployment**

Deploy the current verified frontend worktree to the linked `admin-liftngo-new-dev` project, inspect deployment status/logs, and run the browser checklist against its preview URL.

- [ ] **Step 5: Promote only the verified preview to production**

Promote the exact verified deployment, inspect the production deployment, and confirm the canonical frontend URL serves the updated trip workspace and detail page.

- [ ] **Step 6: Record final evidence**

Capture backend workflow result, readiness HTTP status, Vercel deployment ID/URL, production URL, and the exact test/build commands that passed.

---

## Plan Self-Review

- [ ] Every requirement from the approved design is mapped to a task and an observable verification step.
- [ ] Every implementation task starts with a failing test before production code.
- [ ] Shared interfaces are explicit: `AdminTrip`, `TripRoute`, `TripDriverLocation`, customer query constants, and the route API contract.
- [ ] Error handling is specified for invalid coordinates, routing timeout/failure, fleet failure, trip failure, and backend enum-array filtering.
- [ ] Security boundaries are explicit: authenticated same-origin route access, fixed upstream, validated coordinates/protocol, timeout, response cap, safe errors, and no secret exposure.
- [ ] Accessibility covers keyboard focus, touch/mobile parity, reduced motion, semantic status, visible inspectors, and non-hover access.
- [ ] Deployment instructions preserve backend isolation and require preview verification before Vercel promotion.
- [ ] No placeholder implementation language remains.

### Task 5: Build the reusable interactive trip map

**Files:**
- Create: `src/components/admin/trip-route-map.tsx`
- Modify: `src/components/admin/trip-types.ts`
- Modify: `src/components/admin/trip-route.ts`
- Modify: `src/components/admin/trip-route.test.ts`

**Interfaces:**
- `TripRouteMap` receives a normalised trip, optional route geometry, optional matched driver location, compact/full mode, and a selected-location callback.
- The component emits a visible location inspector for pickup, destination, or driver selection.

- [ ] **Step 1: Extend helper tests for map-ready labels and fallback selection**

Assert that a server route is preferred, an approximate curve is returned when it is unavailable, and pickup/destination inspector labels include the complete address and six-decimal coordinates.

- [ ] **Step 2: Run the focused helper test and verify the new expectations fail**

```powershell
npx vitest run src/components/admin/trip-route.test.ts
```

- [ ] **Step 3: Implement the Leaflet map using the existing live-map pattern**

Dynamically import Leaflet on the client, render OpenStreetMap tiles with attribution, add pickup, destination, and optional driver markers, draw a white route halo under the blue path, and fit bounds without animated motion when reduced motion is requested.

- [ ] **Step 4: Make every map detail usable beyond hover**

Use safe DOM construction with `textContent` for tooltips. Marker hover/focus and map-adjacent buttons must update a visible inspector with full address, six-decimal coordinates, driver availability, and last-update time. Label fallback geometry as `Approximate route`.

- [ ] **Step 5: Run focused tests and type-check the component**

```powershell
npx vitest run src/components/admin/trip-route.test.ts
npx tsc --noEmit
```

- [ ] **Step 6: Commit the map component**

```powershell
git add -- src/components/admin/trip-route-map.tsx src/components/admin/trip-types.ts src/components/admin/trip-route.ts src/components/admin/trip-route.test.ts
git commit -m "feat: add interactive trip route map"
```

---

### Task 6: Replace the trips table with the preview workspace

**Files:**
- Create: `src/components/admin/trip-preview.tsx`
- Create: `src/components/admin/trip-workspace.tsx`
- Create: `src/components/admin/trip-workspace.test.tsx`
- Modify: `src/components/admin/trips-screen.tsx`

**Interfaces:**
- Desktop: a list/table and sticky 400 px preview column.
- Mobile: compact trip cards and a Base UI bottom sheet.
- Both retain search, filtering, refresh, create-trip, pagination, and contextual three-dot actions.

- [ ] **Step 1: Write failing interaction tests**

Render two trips. Assert first-trip default selection, delayed pointer-hover preview selection, immediate keyboard-focus selection, cancellation when the pointer leaves before 120 ms, a mobile preview sheet, and a working `View full details` link.

- [ ] **Step 2: Run the focused test and verify the missing workspace fails**

```powershell
npx vitest run src/components/admin/trip-workspace.test.tsx
```

- [ ] **Step 3: Implement the compact preview**

Show route map, trip code/status, pickup/destination, timing, distance, fare, customer, driver, vehicle, and an explicit details action. Fetch route geometry only for the active preview and retain the approximate curve during upstream failure.

- [ ] **Step 4: Implement desktop hover/focus selection**

Use a 120 ms pointer-enter timer, cancel it on leave, update immediately on row focus/click, preserve the row's three-dot menu, and keep the right preview sticky without covering the table.

- [ ] **Step 5: Implement the mobile tap equivalent**

Use existing responsive card patterns and the existing Base UI Sheet. Make `Preview route` open the same preview as a bottom sheet; do not depend on hover or row-wide accidental activation.

- [ ] **Step 6: Integrate the workspace into `TripsScreen`**

Use SWR against `/api/backend/trips?limit=100`, the existing payload-row adapter, 15-second refresh, existing loading/error controls, and the existing create-trip dialog. Remove only the generic trip table rendering that the workspace replaces.

- [ ] **Step 7: Run focused tests**

```powershell
npx vitest run src/components/admin/trip-workspace.test.tsx src/components/admin/trip-route.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit the trip workspace**

```powershell
git add -- src/components/admin/trip-preview.tsx src/components/admin/trip-workspace.tsx src/components/admin/trip-workspace.test.tsx src/components/admin/trips-screen.tsx
git commit -m "feat: add trip preview workspace"
```

---

### Task 7: Replace raw trip records with a structured route-detail page

**Files:**
- Create: `src/components/admin/trip-detail.tsx`
- Create: `src/components/admin/trip-detail.test.tsx`
- Modify: `src/app/(main)/dashboard/trips/[id]/page.tsx`

**Interfaces:**
- The page fetches the trip and fleet independently.
- Fleet data enriches the map only when the assigned driver can be matched; fleet failure never blocks trip details.

- [ ] **Step 1: Write a failing detail-page component test**

Assert an accessible trip heading, status, route map region, pickup/destination summaries, fare/timing metrics, customer and driver cards, timeline, copyable compact IDs, and absence of raw JSON strings such as `{"id":`.

- [ ] **Step 2: Run the focused test and verify the missing detail component fails**

```powershell
npx vitest run src/components/admin/trip-detail.test.tsx
```

- [ ] **Step 3: Implement the structured trip detail component**

Compose a route header, summary metrics, large `TripRouteMap`, route/location inspector, operational timeline, customer/driver cards, fare/payment card, exceptions section, and compact identifiers. Use semantic headings and status text in addition to colour.

- [ ] **Step 4: Wire the route page**

Fetch `/api/backend/trips/{id}` plus the existing fleet endpoint. Normalise both payloads, match the assigned driver by ID, render a useful trip-specific error if the trip fails, and continue without a driver marker if fleet loading fails.

- [ ] **Step 5: Run focused tests**

```powershell
npx vitest run src/components/admin/trip-detail.test.tsx src/components/admin/trip-workspace.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the detail experience**

```powershell
git add -- src/components/admin/trip-detail.tsx src/components/admin/trip-detail.test.tsx "src/app/(main)/dashboard/trips/[id]/page.tsx"
git commit -m "feat: add structured trip route details"
```

---

### Task 3: Define trip contracts and deterministic route helpers

**Files:**
- Create: `src/components/admin/trip-types.ts`
- Create: `src/components/admin/trip-route.ts`
- Create: `src/components/admin/trip-route.test.ts`

**Interfaces:**
- `AdminTrip` normalises the API's trip, customer, driver, fare, timing, and location fields.
- `TripRoute` stores route positions as Leaflet `[latitude, longitude]` tuples.
- `TripDriverLocation` carries online or last-known driver position metadata.

- [ ] **Step 1: Write failing helper tests with a realistic `LOCALRIDE1001` fixture**

Cover coordinate validation, API normalisation, distance/duration formatting, route bounds, and the fallback route. Require the fallback curve to contain 25 positions and preserve the exact pickup and destination endpoints.

- [ ] **Step 2: Run the focused test and verify the missing module fails**

```powershell
npx vitest run src/components/admin/trip-route.test.ts
```

- [ ] **Step 3: Implement the smallest typed helper boundary**

Export `normaliseTrip`, `validLocation`, `curvedFallbackRoute`, `tripRouteBounds`, `routeForDisplay`, `formatDistance`, and `formatDuration`. Parse unknown API data defensively, reject non-finite/out-of-range coordinates, and keep currency/status data intact.

- [ ] **Step 4: Run the focused test**

```powershell
npx vitest run src/components/admin/trip-route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the contracts and helpers**

```powershell
git add -- src/components/admin/trip-types.ts src/components/admin/trip-route.ts src/components/admin/trip-route.test.ts
git commit -m "feat: add trip route data helpers"
```

---

### Task 4: Add the authenticated open-route boundary

**Files:**
- Create: `src/lib/maps/open-route.ts`
- Create: `src/lib/maps/open-route.test.ts`
- Create: `src/app/api/maps/route/route.ts`
- Create: `src/app/api/maps/route/route.test.ts`

**Interfaces:**
- `buildOsrmRouteUrl` accepts validated pickup/destination coordinates and a fixed server base URL.
- `parseOsrmRoute` accepts unknown upstream JSON and returns a safe `TripRoute` or `null`.
- `GET /api/maps/route` accepts only numeric `pickupLat`, `pickupLng`, `destinationLat`, and `destinationLng` query parameters.

- [ ] **Step 1: Write failing unit tests for OSRM URL and GeoJSON parsing**

Assert longitude-before-latitude ordering, `overview=full`, `geometries=geojson`, and GeoJSON `[longitude, latitude]` conversion to Leaflet `[latitude, longitude]` positions.

- [ ] **Step 2: Write failing route-handler tests**

Cover missing admin cookies (`401`), cross-origin mutation protection (`403`), invalid coordinates (`400`), a successful fixed-upstream response (`200`), and a safe generic upstream failure (`502`) with no leaked body.

- [ ] **Step 3: Run both tests and verify the missing implementations fail**

```powershell
npx vitest run src/lib/maps/open-route.test.ts src/app/api/maps/route/route.test.ts
```

- [ ] **Step 4: Implement URL construction and response parsing**

Use `OPEN_ROUTE_BASE_URL`, defaulting to `https://router.project-osrm.org`. Accept only `http:` or `https:` configured bases, construct the fixed `/route/v1/driving/...` path, and require one valid LineString route with finite coordinates.

- [ ] **Step 5: Implement the route handler**

Reuse `readAdminTokens` and `isSameOrigin`, validate all four coordinate parameters, call the fixed upstream with `AbortSignal.timeout(4500)`, cap accepted response size at 1 MB, return `Cache-Control: private, max-age=60`, and expose only stable safe error messages.

- [ ] **Step 6: Run focused tests**

```powershell
npx vitest run src/lib/maps/open-route.test.ts src/app/api/maps/route/route.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the route boundary**

```powershell
git add -- src/lib/maps/open-route.ts src/lib/maps/open-route.test.ts src/app/api/maps/route/route.ts src/app/api/maps/route/route.test.ts
git commit -m "feat: proxy open trip routes securely"
```

---

### Task 1: Repair backend enum-array role filtering

**Files:**
- Create: `C:/Users/J R Deva Dattan/Desktop/liftngo-backend/src/api/v1/users/users.dto.spec.ts`
- Modify: `C:/Users/J R Deva Dattan/Desktop/liftngo-backend/src/api/v1/users/users.dto.ts`

**Interfaces:**
- Consumes: `FilterOperator.CONTAINS` from `nestjs-paginate`.
- Produces: `userConfig.filterableColumns.role === [FilterOperator.CONTAINS]`.

- [ ] **Step 1: Write the failing configuration test**

```ts
import { FilterOperator } from 'nestjs-paginate';
import { userConfig } from './users.dto';

describe('userConfig role filtering', () => {
  it('uses PostgreSQL array containment for enum-array roles', () => {
    expect(userConfig.filterableColumns?.role).toEqual([FilterOperator.CONTAINS]);
    expect(userConfig.filterableColumns?.role).not.toContain(FilterOperator.EQ);
  });
});
```

- [ ] **Step 2: Run the focused test and verify the old equality configuration fails**

Run from the backend repository:

```powershell
yarn test src/api/v1/users/users.dto.spec.ts --runInBand
```

Expected: FAIL because `role` currently permits `FilterOperator.EQ`.

- [ ] **Step 3: Apply the smallest backend fix**

```ts
filterableColumns: {
  role: [FilterOperator.CONTAINS],
  status: [FilterOperator.EQ],
  createdAt: [FilterOperator.GT, FilterOperator.GTE, FilterOperator.LT, FilterOperator.LTE],
},
```

- [ ] **Step 4: Verify focused and backend quality gates**

```powershell
yarn test src/api/v1/users/users.dto.spec.ts --runInBand
yarn build
yarn type-check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit only the backend filter change**

```powershell
git add -- src/api/v1/users/users.dto.ts src/api/v1/users/users.dto.spec.ts
git commit -m "fix: filter user roles with array containment"
```

---

### Task 2: Centralise the frontend customer query

**Files:**
- Create: `src/lib/api/customer-query.ts`
- Create: `src/lib/api/customer-query.test.ts`
- Modify: `src/app/(main)/dashboard/customers/page.tsx`
- Modify: `src/components/admin/trips-screen.tsx`

**Interfaces:**
- Produces `CUSTOMERS_ENDPOINT` and `CUSTOMERS_API_ENDPOINT`.
- Consumers are the Customers page and Create trip customer selector.

- [ ] **Step 1: Write the failing query test**

```ts
import { describe, expect, it } from "vitest";
import { CUSTOMERS_API_ENDPOINT, CUSTOMERS_ENDPOINT } from "./customer-query";

describe("customer role query", () => {
  it("uses array containment rather than scalar equality", () => {
    expect(CUSTOMERS_ENDPOINT).toBe("users?limit=100&filter.role=$contains:CUSTOMER");
    expect(CUSTOMERS_API_ENDPOINT).toBe(`/api/backend/${CUSTOMERS_ENDPOINT}`);
    expect(CUSTOMERS_ENDPOINT).not.toContain("$eq:CUSTOMER");
  });
});
```

- [ ] **Step 2: Run it and verify the missing module fails**

```powershell
npx vitest run src/lib/api/customer-query.test.ts
```

- [ ] **Step 3: Add shared constants and replace both hard-coded queries**

```ts
export const CUSTOMERS_ENDPOINT = "users?limit=100&filter.role=$contains:CUSTOMER";
export const CUSTOMERS_API_ENDPOINT = `/api/backend/${CUSTOMERS_ENDPOINT}`;
```

- [ ] **Step 4: Verify focused tests**

```powershell
npx vitest run src/lib/api/customer-query.test.ts src/app/login/login-form.test.tsx
```

- [ ] **Step 5: Commit the frontend query fix**

```powershell
git add -- src/lib/api/customer-query.ts src/lib/api/customer-query.test.ts "src/app/(main)/dashboard/customers/page.tsx" src/components/admin/trips-screen.tsx
git commit -m "fix: load customer roles with array containment"
```

---
