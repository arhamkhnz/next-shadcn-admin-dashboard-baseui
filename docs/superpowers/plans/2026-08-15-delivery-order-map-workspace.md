# Delivery Order Map Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a map-first delivery-order workspace that mirrors the proven trip preview behavior while showing delivery-specific operational data.

**Architecture:** Add a typed order normalizer and order-specific workspace/detail components. Reuse the existing secure route proxy and map renderer through a small generic route-map interface. Add one role-protected backend read endpoint for direct order detail loading and combine order data with fleet, timeline, and offer feeds in the admin client.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, SWR, shadcn/ui, Leaflet, OpenStreetMap, OSRM route proxy, Vitest, Testing Library, NestJS, TypeORM, Jest.

## Global Constraints

- Preserve the current LiftNGo admin theme, navigation, typography, spacing, and status-badge patterns.
- Support light, dark, and system themes without adding other theme choices.
- Never require an operator to type the current order ID to view details or perform an order-scoped action.
- Send only coordinates to the external route service.
- Keep backend deployment isolated to branch `new-dev`, path `/home/ubuntu/new-dev-liftngo`, and Compose project `new-dev-liftngo`.

---

### Task 1: Order detail API

**Files:**
- Modify: `../liftngo-backend/src/platform/operations/operations.service.ts`
- Modify: `../liftngo-backend/src/platform/operations/operations.controller.ts`
- Test: `../liftngo-backend/src/platform/operations/operations.service.spec.ts`

**Interfaces:**
- Consumes: `PlatformOrderEntity` and the existing authenticated operations controller.
- Produces: `OperationsService.order(id: string): Promise<PlatformOrderEntity>` and `GET operations/platform/orders/:id`.

- [ ] **Step 1: Write the failing service test**

```ts
it('returns one delivery order by id', async () => {
  orderRepository.findOne.mockResolvedValue(order);
  await expect(service.order(order.id)).resolves.toEqual(order);
  expect(orderRepository.findOne).toHaveBeenCalledWith({ where: { id: order.id } });
});
```

- [ ] **Step 2: Run the focused test and verify `service.order` is missing**

Run: `corepack yarn test src/platform/operations/operations.service.spec.ts --runInBand`

- [ ] **Step 3: Implement the minimal service and controller methods**

```ts
async order(id: string) {
  const order = await this.dataSource.getRepository(PlatformOrderEntity).findOne({ where: { id } });
  if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
  return order;
}
```

The controller route uses `@Auth([Roles.ADMIN, Roles.DISPATCHER, Roles.RELATIONSHIP_ADVISOR])`.

- [ ] **Step 4: Run the focused backend test and confirm it passes**

- [ ] **Step 5: Commit only the backend endpoint and its test to `new-dev`**

### Task 2: Order normalization and rider matching

**Files:**
- Create: `src/components/admin/order-types.ts`
- Create: `src/components/admin/order-route.ts`
- Create: `src/components/admin/order-route.test.ts`
- Modify: `src/components/admin/fleet-map.ts`
- Modify: `src/components/admin/fleet-map.test.ts`

**Interfaces:**
- Produces: `normaliseOrder(value: unknown): AdminOrder`.
- Produces: `findFleetRiderForOrder(riders: FleetRider[], order: AdminOrder): FleetRider | undefined`.
- `AdminOrder` includes `id`, `reference`, `state`, `pickup`, `drop`, `riderId`, `partnerId`, `distanceMeters`, `customerFeePaise`, `declaredValuePaise`, `itemSummary`, `promisedAt`, `createdAt`, `updatedAt`, and `raw`.

- [ ] **Step 1: Write failing tests for flat API fields, nested pricing fallback, missing fields, and active-work rider matching**

```ts
expect(normaliseOrder(apiOrder)).toMatchObject({
  reference: 'FOOD-1001',
  pickup: { address: 'MI Road', latitude: 26.915, longitude: 75.812 },
  drop: { address: 'Bani Park', latitude: 26.932, longitude: 75.793 },
  customerFeePaise: 4900,
});
```

- [ ] **Step 2: Run the focused tests and verify imports/functions are missing**

Run: `npx vitest run src/components/admin/order-route.test.ts src/components/admin/fleet-map.test.ts`

- [ ] **Step 3: Implement the minimal typed normalizer and matcher**

- [ ] **Step 4: Run focused tests and confirm they pass**

### Task 3: Shared operational route map

**Files:**
- Modify: `src/components/admin/trip-route-map.tsx`
- Modify: `src/components/admin/trip-route.test.ts`
- Create: `src/components/admin/order-preview.tsx`

**Interfaces:**
- Produces: `OperationalRouteMap({ subject, driverLocation })` where `subject` contains `id`, `label`, `pickup`, and `destination`.
- Preserves: `TripRouteMap({ trip, driverLocation })` as a compatibility wrapper.
- Produces: `OrderPreview({ order, riderLocation })`.

- [ ] **Step 1: Add a failing test that an order preview exposes pickup, drop, coordinates, values, and a detail link**

- [ ] **Step 2: Run the focused test and verify the component is missing**

- [ ] **Step 3: Generalize the existing route-map internals without changing trip behavior, then implement the order preview**

- [ ] **Step 4: Run trip and order route tests and confirm both pass**

### Task 4: Responsive order workspace

**Files:**
- Create: `src/components/admin/order-workspace.tsx`
- Create: `src/components/admin/order-workspace.test.tsx`
- Create: `src/components/admin/orders-screen.tsx`
- Modify: `src/app/(main)/dashboard/orders/page.tsx`

**Interfaces:**
- `OrdersScreen` fetches orders every 15 seconds and fleet every 10 seconds.
- `OrderWorkspace` consumes normalized API rows and a `Record<string, TripDriverLocation>` indexed by rider and active order IDs.

- [ ] **Step 1: Write failing tests for default preview, pointer/focus selection, three-dot detail action, search, and mobile bottom sheet**

- [ ] **Step 2: Run the workspace test and verify the component is missing**

- [ ] **Step 3: Implement the table/cards/preview layout using the existing trip workspace interaction timings and breakpoints**

- [ ] **Step 4: Replace the generic orders `ResourceScreen` with `OrdersScreen`**

- [ ] **Step 5: Run the focused workspace tests and confirm they pass**

### Task 5: Full order detail page

**Files:**
- Create: `src/components/admin/order-detail.tsx`
- Create: `src/components/admin/order-detail.test.tsx`
- Modify: `src/app/(main)/dashboard/orders/[id]/page.tsx`

**Interfaces:**
- `OrderDetail` fetches order, fleet, timeline, and offers independently.
- `OrderDetailView` renders the route, rider state, contacts, values, timeline, offers, actions, and copyable identifiers.

- [ ] **Step 1: Write a failing test for route, state, contacts, values, timeline, offers, identifiers, and fixed-ID actions**

- [ ] **Step 2: Run the detail test and verify the component is missing**

- [ ] **Step 3: Implement the detail view and replace the current generic tables**

- [ ] **Step 4: Run focused detail tests and confirm they pass**

### Task 6: Verification and deployment

**Files:**
- Create or update: `design-qa.md`

**Interfaces:**
- Produces a verified Vercel production deployment and a successful isolated `new-dev` backend deployment.

- [ ] **Step 1: Run frontend tests, type-check, Biome, and production build**

Run: `npx vitest run --pool=forks --maxWorkers=4`, `npx tsc --noEmit`, `npx biome check <task files>`, and `npm run build`.

- [ ] **Step 2: Run backend build, type-check, and full Jest suite**

Run: `corepack yarn build`, `corepack yarn type-check`, and `corepack yarn test --runInBand`.

- [ ] **Step 3: Push the backend commit to `new-dev` and verify the GitHub Actions workflow plus readiness endpoint**

- [ ] **Step 4: Run the admin locally, capture the order list and detail page, compare them with the supplied screenshot and trip reference, and fix all P0-P2 findings**

- [ ] **Step 5: Deploy the frontend to Vercel production and verify the aliased URL, primary interactions, responsive bottom sheet, and error logs**
