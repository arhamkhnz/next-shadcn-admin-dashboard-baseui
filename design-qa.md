# Design QA

Reference: `C:/Users/JRDEVA~1/AppData/Local/Temp/codex-clipboard-6f1177cb-9390-485b-b50b-ee610c67f7aa.png`

Production captures:

- `docs/superpowers/audits/customer-grid-production.png`
- `docs/superpowers/audits/order-map-grid-production.png`
- `docs/superpowers/audits/order-detail-map-production.png`

## Checks

- The List/Grid selector is visible beside search and uses the existing neutral design system.
- List remains the default when a tab has no saved preference.
- Grid selection survives a production reload and is isolated from other dashboard routes.
- Customer cards preserve record actions and expose readable labels instead of raw JSON.
- Trip and delivery layouts preserve the persistent route preview in both modes.
- Delivery cards remain one column beside the preview at medium desktop widths and split only when enough width is available.
- OpenStreetMap tiles, routed paths, pickup/drop markers, coordinates, and full detail links render in production.
- Keyboard focus, pressed states, search, refresh, three-dot actions, and detail navigation are present and operable.
- Light and dark/system theme support remains intact.

final result: passed
