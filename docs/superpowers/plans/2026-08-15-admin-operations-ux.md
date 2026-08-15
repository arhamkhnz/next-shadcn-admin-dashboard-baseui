# LiftNGo Admin Operations UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver contextual row actions, human-readable responsive resources, a structured driver record, and an
OpenStreetMap fleet view, then deploy the verified result to Vercel.

**Architecture:** Extend the shared `OperationsResource` and `ResourceTable` boundary with serializable action
configuration and reusable display helpers. Keep mutations in a client-side row-action component that uses the existing
Base UI wrappers and revalidates SWR. Replace the Google map integration with a client-only Leaflet adapter driven by
the existing fleet endpoint.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, SWR, Base UI/shadcn, Tailwind CSS v4, Vitest, Testing
Library, Leaflet, OpenStreetMap raster tiles, Vercel CLI.

## Global Constraints

- Preserve the existing light, dark, and system theme behavior and semantic tokens.
- Do not modify files in `src/components/ui/` or `src/components/calendar/`.
- Keep pages as Server Components; browser-only mapping and interactive actions live in focused Client Components.
- All backend reads and writes continue through `/api/backend/*`.
- Never ask the admin to paste a record ID for an action.
- Use the standard OpenStreetMap tile URL only for current low-volume usage, retain attribution, and support an env
  override.

---

### Task 1: Shared display and action contracts

**Files:**
- Create: `src/components/admin/resource-types.ts`
- Modify: `src/lib/display.ts`
- Test: `src/lib/display.test.ts`
- Test: `src/components/admin/resource-types.test.ts`

**Interfaces:**
- Produces `ResourceAction`, `ResourceActionField`, and serializable condition types.
- Produces `recordLabel(row, preferredKeys)`, `resolveRecordEndpoint(template, row, idKey)`, `formatResourceValue(key,
  value)`, and `summarizeObject(key, value)`.

- [ ] Write failing table-driven tests proving rupee formatting, readable personal/vehicle summaries, label fallback,
  endpoint encoding, and action conditions.
- [ ] Run `npm test -- src/lib/display.test.ts src/components/admin/resource-types.test.ts` and confirm failures are
  caused by missing functions.
- [ ] Implement the minimal contracts and pure helpers.
- [ ] Re-run the focused tests and confirm they pass.

### Task 2: Contextual row action menu

**Files:**
- Create: `src/components/admin/resource-actions.tsx`
- Create: `src/components/admin/resource-actions.test.tsx`
- Modify: `src/components/admin/operations-resource.tsx`

**Interfaces:**
- Consumes `ResourceAction` and pure endpoint/condition helpers.
- Produces `<ResourceActions row actions idKey labelKeys onCompleted />`.

- [ ] Write failing interaction tests: accessible three-dot trigger, automatic ID endpoint substitution, required field
  submission, destructive confirmation, backend error retention, success toast, and completion callback.
- [ ] Run `npm test -- src/components/admin/resource-actions.test.tsx` and verify the expected failures.
- [ ] Implement the dropdown, form dialog, alert dialog, loading state, and toast feedback with local shadcn wrappers.
- [ ] Pass `actions`, `actionIdKey`, and `labelKeys` through `OperationsResource`; revalidate after success.
- [ ] Re-run the focused tests.

### Task 3: Responsive human-readable resources

**Files:**
- Modify: `src/components/admin/resource-table.tsx`
- Create: `src/components/admin/resource-table.test.tsx`
- Modify: `src/components/admin/resource-screen.tsx`

**Interfaces:**
- Consumes rows, string columns, optional link configuration, optional action configuration, and display helpers.
- Produces equivalent desktop table and narrow-screen record summaries.

- [ ] Write failing tests proving raw JSON is not printed, rupees and statuses are formatted, a labelled action menu is
  present, and the mobile summary contains the same primary record information.
- [ ] Run the focused test and confirm failures.
- [ ] Implement a desktop table hidden below `md`, a mobile summary list hidden from `md`, shortened secondary IDs,
  search over formatted values, and a right-aligned action column.
- [ ] Update `ResourceScreen` to forward the serializable action configuration.
- [ ] Re-run focused and existing display tests.

### Task 4: Wire all existing operational actions to their rows

**Files:**
- Modify: `src/app/(main)/dashboard/support/page.tsx`
- Modify: `src/app/(main)/dashboard/safety/page.tsx`
- Modify: `src/app/(main)/dashboard/finance/page.tsx`
- Modify: `src/app/(main)/dashboard/approvals/page.tsx`
- Modify: `src/app/(main)/dashboard/drivers/page.tsx`
- Modify: `src/app/(main)/dashboard/customers/page.tsx`
- Modify: `src/app/(main)/dashboard/orders/page.tsx`
- Modify: `src/app/(main)/dashboard/partners/page.tsx`
- Modify: `src/app/(main)/dashboard/verification/page.tsx`
- Modify: `src/components/admin/trips-screen.tsx`
- Test: `src/components/admin/operations-pages.test.tsx`

**Interfaces:**
- Page action configurations remain JSON-serializable Server-to-Client props.

- [ ] Write a failing configuration test covering every existing manual-UID workflow and every list/detail navigation
  action.
- [ ] Run the focused test and confirm actions are missing.
- [ ] Remove standalone manual-ID consoles and attach reply/status, acknowledge/resolve, fraud review, dispute review,
  approval, driver state, and detail navigation actions to their appropriate resource.
- [ ] Prefer human-readable columns on each page and keep IDs secondary.
- [ ] Re-run focused tests.

### Task 5: Structured driver detail

**Files:**
- Modify: `src/components/admin/driver-detail.tsx`
- Create: `src/components/admin/driver-detail.test.tsx`

**Interfaces:**
- Uses existing driver, document, location, availability, device, and session endpoints unchanged.

- [ ] Write failing tests proving the page shows labelled driver and vehicle fields without a JSON block, groups content
  into tabs, and submits state changes for the fixed driver ID.
- [ ] Run the focused test and verify failures.
- [ ] Implement overview definition lists, contextual state form, and Documents/Location/Access tabs with useful empty
  copy and bounded initial histories.
- [ ] Re-run the focused tests.

### Task 6: OpenStreetMap live fleet

**Files:**
- Create: `src/components/admin/fleet-map.ts`
- Create: `src/components/admin/fleet-map.test.ts`
- Modify: `src/components/admin/live-driver-map.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces pure `classifyFleetRider`, `fleetRidersWithLocations`, and `fleetBounds` helpers.
- The client component dynamically imports Leaflet and reads `NEXT_PUBLIC_OSM_TILE_URL` with
  `https://tile.openstreetmap.org/{z}/{x}/{y}.png` fallback.

- [ ] Write failing tests for online/offline/safety marker classification, coordinate filtering, and bounds.
- [ ] Run the focused test and verify missing behaviour.
- [ ] Install `leaflet@^1.9` and `@types/leaflet`, remove the unused Google Maps loader and types.
- [ ] Implement Leaflet map initialization, attributed tiles, circle markers, selection synchronization, fit bounds,
  cleanup, and a full driver list including no-location records.
- [ ] Import Leaflet CSS globally and preserve responsive height/layout.
- [ ] Re-run focused tests.

### Task 7: Full verification and Vercel deployment

**Files:**
- Modify only files required by failures discovered during verification.

**Interfaces:**
- Produces one tested Vercel deployment promoted to the existing production alias.

- [ ] Run `npm test -- --run` and fix product regressions using a failing test first.
- [ ] Run `npm run check` and `npm run build`.
- [ ] Start the local app and inspect login, trips, support, safety, finance, drivers, driver detail, and map using the
  in-app browser at desktop and 390px mobile widths; verify both light and dark themes.
- [ ] Deploy a Vercel preview with `vercel deploy --yes`, inspect it, and repeat authenticated smoke checks.
- [ ] Promote the verified artifact with `vercel promote <preview-url>`.
- [ ] Inspect production status and scan recent error logs.

## Self-Review

- Spec coverage: contextual actions, responsive resources, raw-data removal, driver detail grouping, OpenStreetMap,
  accessibility, authenticated proxying, tests, and deployment all map to explicit tasks.
- Placeholder scan: the plan contains no deferred implementation placeholders.
- Type consistency: `ResourceAction` is defined once, passed through resource wrappers, and consumed by the row action
  component; map helpers operate on the same fleet record shape consumed by the map UI.
