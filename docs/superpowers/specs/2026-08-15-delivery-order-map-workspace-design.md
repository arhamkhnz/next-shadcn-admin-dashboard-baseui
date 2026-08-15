# Delivery Order Map Workspace Design

## Goal

Make delivery-order monitoring as fast and spatially clear as trip monitoring. An operator should be able to inspect pickup, drop, route, order state, rider location, contacts, value, and timing without copying record IDs or losing the orders list.

## Selected Interaction

- Desktop: a persistent right-side preview sits beside a compact order table. Hovering a row for 120 ms, focusing it with the keyboard, or clicking it updates the preview.
- Mobile and tablet: orders render as readable cards. Tapping **Preview route** opens the same content in a bottom sheet.
- The three-dot row menu contains **View details** and never asks the operator to re-enter the order ID.
- The detail page is directly addressable at `/dashboard/orders/[id]` and keeps the order identity in context for every operation.

## Information Architecture

The list shows the partner reference, state, pickup and drop, assigned rider, and last update. The preview shows an OpenStreetMap road route, pickup/drop coordinates, distance, customer fee, declared value, item summary, promised time, partner reference, and current or last-known rider location when available.

The detail page shows:

1. route map and rider location;
2. pickup/drop contacts and exact coordinates;
3. order summary and commercial values;
4. lifecycle timeline;
5. driver offers;
6. state-aware operational intervention cards;
7. copyable order, rider, and partner identifiers.

## Data And Security

- `GET /api/v1/operations/platform/orders/:id` returns the existing platform order entity to authorized ADMIN, DISPATCHER, and RELATIONSHIP_ADVISOR roles.
- The list continues to use `GET /api/v1/operations/platform/orders?limit=200`.
- Timeline, offers, and fleet data remain behind the authenticated same-origin admin proxy.
- Road geometry uses the existing authenticated `/api/maps/route` proxy with coordinate validation, timeout, payload limits, and OpenStreetMap attribution.
- No customer, partner, or rider identifiers are inserted into third-party route requests; only pickup/drop coordinates are sent.

## Normalization

`normaliseOrder()` absorbs API naming variants and nested pricing metadata. It must produce stable pickup/drop locations, a human-readable reference, state, distance, contacts, fee/value, timestamps, and raw data. Missing coordinates render an information panel instead of a broken map.

## Error And Empty States

- Keep the previous list while refreshing.
- Show a retryable error when orders fail to load.
- Show a clear empty state when no orders exist or a search has no matches.
- Show route-unavailable copy when coordinates are absent.
- Timeline and offer failures are isolated so the route and core order data remain usable.

## Accessibility

- Rows are keyboard-focusable and expose selected state.
- Every three-dot button has an order-specific accessible label.
- Pickup, drop, and rider locations are buttons with visible address and coordinate inspectors.
- Status is never communicated by color alone.
- Mobile preview uses a titled, dismissible bottom sheet.

## Verification

Automated tests cover normalization, pricing fallbacks, route labels, hover/focus selection, mobile preview, action links, detail sections, and rider-to-order matching. Browser verification covers the deployed desktop list, row action menu, full detail route, mobile sheet, and console errors.
