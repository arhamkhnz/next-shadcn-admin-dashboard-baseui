# LiftNGo Admin Operations UX Design

## Goal

Make every operational action available from the record it affects, remove raw backend-shaped presentation, make all
lists usable on narrow screens, and show live plus last-known driver locations without requiring a commercial map key.

## Approved Direction

Use one shared resource-list pattern across the existing admin rather than bespoke table implementations. Desktop
screens retain compact tables; narrow screens use record summaries that expose the same fields without horizontal page
scrolling. Every actionable row gets an accessible overflow menu labelled for that record.

## Record Actions

- The menu automatically selects the record and never asks the administrator to paste a UUID.
- Navigation actions open the existing detail route.
- Mutating actions open a compact form dialog when extra values are required.
- High-risk actions use an alert dialog, show the selected record, require the configured reason or note, disable while
  submitting, and close only after success.
- Successful mutations display a toast and revalidate the affected resource. Failed mutations keep the dialog open and
  show the backend error.
- Support cases expose reply and status actions; safety incidents expose acknowledge and resolve; fraud signals expose
  review status; finance disputes expose resolution; approvals expose approve; driver rows expose state change.

## Data Presentation

- Prefer the human identifier (trip code, person name, company name, vehicle registration, category) as the primary
  value.
- Display UUIDs only as shortened, copyable secondary values where operationally useful.
- Render known structured fields such as driver personal and vehicle data as readable summaries, never raw JSON.
- Format paise fields as Indian rupees and ISO timestamps as local date/time.
- Provide useful empty states, result counts, loading skeletons, retry actions, and consistent refresh feedback.

## Responsive Behaviour

- At medium and larger widths, show a compact table with the actions column pinned visually to the right.
- Below the medium breakpoint, show stacked record summaries with primary fields, statuses, and the same action menu.
- Toolbars wrap without clipping; tabs use a horizontally scrollable local strip when necessary.
- No screen may introduce page-level horizontal overflow.

## Driver Details

- Replace raw account JSON with labelled personal, account, vehicle, and compliance fields.
- Keep state changes contextual to the driver and improve reason/note copy.
- Use tabs for Overview, Documents, Location, and Access activity so documents, location history, devices, and sessions
  no longer create one unbounded page.
- Limit dense histories to a useful initial set and retain search within the active section.

## OpenStreetMap Driver Map

- Use Leaflet with the standard OpenStreetMap raster tile endpoint for the current low-volume admin use case.
- Always show OpenStreetMap attribution; do not prefetch or bulk-download tiles.
- Allow a public tile URL environment override so the application can move to a commercial or self-hosted OSM provider
  without rewriting the component.
- Show every fleet record with a valid coordinate: green for online, neutral for offline last-known position, and red for
  an active safety incident.
- Marker selection and driver-list selection stay synchronized. The detail panel shows driver, vehicle, state, active
  work, coordinate, capture time, freshness, accuracy, speed, battery, and network.
- Drivers without a location remain visible in the list with a clear no-location state.
- Refresh fleet data every ten seconds and preserve the selected driver when possible.

## Accessibility and Security

- Use the existing Base UI/shadcn primitives for menus, dialogs, alert dialogs, tabs, buttons, inputs, and toast output.
- Icon-only controls have record-specific accessible names; menus and dialogs remain keyboard operable; focus returns to
  the trigger after close.
- Mutation endpoints continue through the authenticated same-origin backend proxy. No credentials, API tokens, or
  backend URLs are exposed to the client.
- Risky actions require confirmation and preserve backend authorization, audit logging, and four-eyes approval rules.

## Verification

- Test shared formatting, record labelling, action endpoint resolution, conditional actions, mutation success/error
  behaviour, responsive record rendering, and fleet marker classification.
- Run the complete Vitest suite, Biome checks, TypeScript/Next production build, and authenticated browser checks at
  desktop and mobile sizes.
- Deploy a preview, verify login, actions-menu availability, driver markers, light/dark themes, and responsive layout,
  then promote the same artifact to production.
