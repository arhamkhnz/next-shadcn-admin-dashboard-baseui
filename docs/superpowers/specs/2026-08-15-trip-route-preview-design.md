# Trip Route Preview and Customer Filtering Design

**Date:** 2026-08-15
**Status:** Approved for implementation

## Goal

Make customer trips fast to inspect without leaving the list, replace the raw trip record page with an operations-focused route view, and restore the broken Customers screen and customer selector.

The finished experience must preserve the existing LiftNGo admin design system, contextual three-dot actions, responsive behavior, authentication boundary, and light/dark/system themes.

## Confirmed Problems

### Trip list

- Operators must open a separate page to understand a trip.
- Pickup and destination are not visible together.
- Customer and driver UUIDs are more prominent than useful identity information.
- The list has no spatial context or route preview.

### Trip detail

- The page is a long generic key/value dump.
- Customer and driver objects are shown as raw JSON.
- Pickup and destination coordinates are separated from their addresses.
- There is no route map, live driver context, trip timeline, or visual fare summary.

### Customers

- The frontend sends `filter.role=$eq:CUSTOMER`.
- `Users.role` is a PostgreSQL enum array, so scalar equality produces `invalid input syntax for type integer: "CUSTOMER"`.
- `nestjs-paginate` maps `$contains` to TypeORM `ArrayContains`, but the backend currently permits only `FilterOperator.EQ` for `role`.
- The same broken query is used by both the Customers page and the Create trip customer selector.

## Selected Interaction Model

### Desktop trip workspace

The Customer trips screen becomes a two-column operations workspace at large breakpoints:

- The left column contains search, filters, trip rows, refresh, and contextual actions.
- The right column is a sticky trip preview.
- Hovering a row, focusing it with the keyboard, or clicking it updates the preview.
- Hover selection uses a short delay to avoid flickering while the pointer crosses rows.
- The first trip is selected initially when records exist.
- Clicking **View full details** or the trip code opens the trip detail route.
- The three-dot menu remains available and does not change the hover selection contract.

The preview contains:

- Trip code and status.
- Customer and assigned driver names when present.
- Vehicle, fare, distance, duration, and creation time.
- Pickup and destination addresses with compact coordinates.
- A small OpenStreetMap showing pickup, destination, and the route.

### Mobile trip workspace

- Trips remain readable cards rather than a compressed table.
- Tapping a card opens a bottom sheet containing the same preview content.
- The sheet provides **View full details** and contextual actions.
- Hover-only information always has a focus, tap, or visible-text equivalent.

## Full Trip Detail

The generic `RecordDetail` is replaced for trips only by a dedicated `TripDetail` screen.

### Header and summary

- Trip code is the primary title.
- Status, vehicle type, source, and booking type are badges.
- Summary metrics show fare, distance, estimated duration, and elapsed/current phase time where possible.
- Back navigation and relevant safe actions remain visible.

### Route map

- Use Leaflet with OpenStreetMap tiles, matching the existing live driver map.
- Pickup and destination use distinct accessible markers.
- The preferred path is a road-following GeoJSON route returned by an open routing service through a server-side admin endpoint.
- Render the route as two polylines: a wide translucent halo and a narrower high-contrast path, with smoothing enabled.
- When an assigned driver has a fleet location, show the current or last-known driver marker and label it explicitly.
- Fit map bounds to pickup, destination, route geometry, and driver location.
- Hovering or focusing pickup/destination markers displays the complete address and coordinates.
- Hovering or focusing the route displays route distance, duration, and whether it is road-routed or approximate.
- Selecting a location updates a visible location inspector so the same information works on touch devices.

### Route sourcing and fallback

- Add a same-origin server route that accepts only validated origin/destination coordinates.
- The routing base URL is configurable and defaults to the approved open-routing endpoint for the current low-volume environment.
- Request GeoJSON geometry to avoid client-side encoded-polyline decoding.
- Apply a timeout, bounded response size, and short server cache.
- Never expose backend credentials or arbitrary upstream URLs to the browser.
- If routing fails, draw a deterministic curved approximate path between the two valid endpoints and label it **Approximate route**.
- If either endpoint is invalid or missing, show the textual locations and a designed map-unavailable state.

### Operational information

The page uses focused sections instead of raw JSON:

- **Journey:** pickup, destination, coordinates, distance, duration, vehicle.
- **People:** customer, driver, sender, and receiver identity/contact information.
- **Timeline:** created, accepted, arrived, picked up, in transit, delivered, cancelled, and updated states when available.
- **Fare and payment:** estimate, actual fare, GST, platform fee, discount, total, currency, and booking type.
- **Exceptions:** cancellation reason, scheduling, source, and missing-assignment states.
- UUIDs remain available in secondary metadata with copy support but are not primary labels.

## Customer Filtering Fix

### Backend

- Permit `FilterOperator.CONTAINS` for `userConfig.filterableColumns.role`.
- Keep scalar equality disabled for the enum-array role field to prevent recurrence.
- Add a regression test proving `CUSTOMER` filtering uses array containment semantics.
- Preserve pagination, sorting, selected fields, and authorization behavior.

### Frontend

- Change both customer queries to `filter.role=$contains:CUSTOMER`.
- Add a shared constant/helper so the Customers screen and Create trip selector cannot drift.
- Add a regression test that rejects the old `$eq` query.
- Retain the existing retry and designed error state for genuine backend failures.

## Component Boundaries

- `trip-types.ts`: normalised trip, person, location, and route contracts.
- `trip-route.ts`: coordinate validation, fallback curve generation, bounds, route response parsing, and display helpers.
- `trip-route-map.tsx`: reusable Leaflet map for preview and detail sizes.
- `trip-preview.tsx`: compact summary and map.
- `trips-workspace.tsx` or the evolved `trips-screen.tsx`: selection, hover/focus/tap behavior, search, and responsive layout.
- `trip-detail.tsx`: structured full trip page.
- Same-origin route API: validated open-routing proxy with timeout/cache/fallback-safe errors.
- Existing `ResourceTable` remains generic; trip-specific hover behavior must not complicate unrelated resources.

## Data Flow

1. The trips list loads from the existing authenticated `/api/backend/trips` proxy.
2. List payload coordinates populate the preview immediately without another trip request.
3. The route map requests route geometry from the new same-origin route endpoint only when both endpoints are valid.
4. The full detail page loads `/api/backend/trips/:id` and optionally the fleet snapshot to locate the assigned driver.
5. SWR caches trip, route, and fleet reads and refreshes active operational data without clearing the previous display.
6. Route failure changes only the map path to the approximate fallback; trip information remains available.

## Accessibility and Interaction Rules

- Hover behavior must also work with keyboard focus.
- Touch devices use explicit tap/sheet behavior.
- Map markers and route layers have accessible names and visible detail equivalents.
- Status is never communicated by color alone.
- Focus remains visible, menus remain keyboard-operable, and opening/closing a sheet restores focus.
- Reduced-motion preferences disable animated map flying and nonessential transitions.

## Security and Reliability

- Coordinate inputs are finite, range-checked, and length-bounded at the server boundary.
- The routing endpoint cannot be used as an open proxy.
- Mutation protection, secure session cookies, and the existing backend allow-list remain unchanged.
- OpenStreetMap attribution stays visible.
- Routing and map errors do not expose upstream response bodies or internal configuration.
- Customer filtering remains server-side so pagination and authorization are not bypassed by client filtering.

## Testing and Verification

### Automated

- Customer role filter regression in backend and frontend.
- Coordinate validation and normalisation.
- Route GeoJSON parsing and invalid response rejection.
- Curved fallback geometry and bounds.
- Trip preview selection by hover, keyboard focus, and tap.
- Full trip detail renders human-readable sections with no raw JSON.
- Map fallback and missing-location states.
- Existing authentication, proxy, resource action, and fleet tests continue to pass.

### Browser verification

- Desktop trip hover updates the sticky preview without navigation.
- Keyboard focus produces the same preview.
- Three-dot actions still work independently.
- Full detail shows the routed path, both endpoints, complete address/coordinate inspectors, and assigned driver location when available.
- Mobile cards open the preview sheet and the full detail remains usable at 390 × 844.
- Light, dark, and system themes remain legible.
- Customers load successfully and the Create trip selector lists customers.

## Deployment

1. Implement and verify the backend role-array filter change.
2. Push only to backend branch `new-dev` and monitor `.github/workflows/new-dev-deploy.yml`.
3. Confirm HTTP 200 from the backend readiness endpoint and exercise the corrected customer query.
4. Implement and verify the frontend trip experience against the deployed backend.
5. Deploy a Vercel preview, verify authentication and critical flows, then promote it to production.
6. Confirm the production alias, browser behavior, security headers, and absence of new runtime errors.

## Out of Scope

- Turn-by-turn navigation or dispatch editing.
- Historical GPS breadcrumb reconstruction when the backend has not recorded it.
- Changing the customer-facing or driver-facing apps.
- Replacing the existing admin authentication model.
- Self-hosting a routing engine in this iteration.
