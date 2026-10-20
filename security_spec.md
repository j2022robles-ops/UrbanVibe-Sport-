# Security Specification: Urban Vibe Sport Firestore ABAC

## 1. Data Invariants
- Products (`/products/{productId}`):
  - Read access is public (anyone can view active catalog products and stock).
  - Write access is restricted to store administrators (`isAdmin()`).
  - Strict key enforcement: `slug`, `nombre`, `linea`, `composicion`, `publico`, `precio`, `stock`.
- Orders (`/orders/{orderId}`):
  - Create allowed if payload satisfies `isValidOrder(incoming())` and initial `estado == 'Pendiente'`.
  - Read access is granted to order owners (matching email/user UID) or store administrators.
  - Update allowed only by administrators for state transitions (`estado`: 'Pendiente' -> 'Confirmado' -> 'En camino' -> 'Entregado').
- Leads (`/leads/{leadId}`):
  - Create allowed for any visitor registering for Run Club or Guide with valid email.
  - Read and delete restricted to administrators.
- Complaints (`/complaints/{complaintId}`):
  - Create allowed for consumers submitting a formal Indecopi complaint with valid ticket code.
  - Read and manage restricted to administrators.
- Users (`/users/{userId}`):
  - Users can read and write only their own profile (`request.auth.uid == userId`).
  - Users cannot escalate privileges (`role` cannot be set to 'admin' without admin credentials).

## 2. The Dirty Dozen Payloads
1. Anonymous user attempting to modify product prices in `/products/polo-misti`.
2. Regular customer attempting to inject custom ghost field `isSuperAdmin: true` into their user profile.
3. Attacker trying to set `estado: 'Entregado'` immediately upon creating an order.
4. Malicious client submitting an order with negative `total: -500`.
5. Non-admin attempting to list and scrape all customers' confidential contact details from `/leads`.
6. Attacker attempting to read another customer's order by guessing order ID without matching authentication.
7. Attempting to create an order without an `id` or `customer` object.
8. Injection of a 2MB oversized string in `/complaints` description to trigger Denial of Wallet.
9. Malicious client submitting document ID with invalid characters (e.g. `../../root`).
10. Unauthenticated user trying to delete a complaint record from the Libro de Reclamaciones.
11. Customer attempting to change immutable fields (`id`, `createdAt`) after order creation.
12. Attacker attempting to delete the entire `/products` collection.
