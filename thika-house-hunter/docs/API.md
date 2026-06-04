# API Reference

Base URL: `/api`

Most protected routes accept a JWT in either the `Authorization: Bearer <token>` header or the `token` cookie.

## Health

- `GET /health` - checks API and Neon database connectivity.

## Auth

- `POST /auth/register`
  - Body: `{ "name": "Jane", "email": "jane@example.com", "password": "Password123!", "role": "renter" }`
- `POST /auth/login`
  - Body: `{ "email": "jane@example.com", "password": "Password123!" }`
- `POST /auth/logout`
- `GET /auth/me` - protected

## Users

- `GET /users/profile` - protected
- `PUT /users/profile` - protected
- `GET /users` - admin
- `GET /users/:id` - admin
- `DELETE /users/:id` - admin

## Properties

- `GET /properties`
  - Query: `query`, `type`, `budget`, `min_price`, `max_price`, `sort`, `limit`, `offset`
- `POST /properties` - landlord/admin
- `GET /properties/:id`
- `PUT /properties/:id` - owner/admin
- `DELETE /properties/:id` - owner/admin
- `POST /properties/:id/images` - owner/admin, accepts one `image` upload stored in Neon or an `image_url`
- `GET /properties/images/:imageId` - streams an uploaded image from Neon

## Favorites

- `GET /favorites` - protected
- `POST /favorites/:propertyId` - protected
- `DELETE /favorites/:propertyId` - protected

## Bookings

- `GET /bookings` - protected
- `POST /bookings` - protected
  - Body: `{ "property_id": "...", "viewing_date": "2026-06-10T10:00:00Z", "message": "..." }`
- `PATCH /bookings/:id/status` - landlord/admin

## Reviews

- `GET /reviews/property/:propertyId`
- `POST /reviews/property/:propertyId` - protected
- `PUT /reviews/:id` - review owner/admin
- `DELETE /reviews/:id` - review owner/admin

## Payments

- `GET /payments/config` - protected, returns M-Pesa readiness and product prices
- `GET /payments` - protected, lists the signed-in user's payments
- `GET /payments/:id` - protected
- `POST /payments/mpesa/stk-push` - protected
  - Body: `{ "purpose": "landlord_verification", "phone": "07..." }`
  - Body: `{ "purpose": "featured_listing", "property_id": "...", "phone": "07..." }`
- `POST /payments/:id/query` - protected, checks Daraja STK status
- `POST /payments/mpesa/callback` - Safaricom Daraja callback

## Ads

- `GET /ads/config` - public automatic ad provider config
- `GET /ads?placement=tenant_explore_top&limit=1` - public active tenant ads
- `POST /ads/:id/impression` - public impression tracking
- `POST /ads/:id/click` - public click tracking
- `GET /admin/ads` - admin ad campaigns
- `POST /admin/ads` - admin creates a campaign
- `PATCH /admin/ads/:id` - admin updates status or campaign fields

Tenant placements: `tenant_home`, `tenant_explore_top`, `tenant_explore_inline`, `tenant_property_sidebar`, `tenant_favorites`, `tenant_profile`.

## Dashboards

- `GET /landlord/dashboard` - landlord/admin
- `GET /landlord/properties` - landlord/admin
- `GET /admin/dashboard` - admin
- `GET /admin/users` - admin
- `GET /admin/properties/pending` - admin
- `PATCH /admin/properties/:id/approve` - admin
- `PATCH /admin/properties/:id/deactivate` - admin

## Contact

- `POST /contact`
  - Body: `{ "name": "Jane", "email": "jane@example.com", "subject": "Viewing", "message": "..." }`
