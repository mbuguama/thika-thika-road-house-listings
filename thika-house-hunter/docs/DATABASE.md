# Database Guide

The app uses Neon Postgres through the official `@neondatabase/serverless` driver.

## Setup

1. Create a Neon project and copy the pooled connection string.
2. Add it to `.env`:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
   ```

3. Run the schema:

   ```bash
   npm run db:schema
   ```

4. Add sample records:

   ```bash
   npm run db:seed
   ```

## Tables

- `users` - renters, landlords, and admins
- `estates` - Thika neighborhoods or estates
- `properties` - rental listings
- `property_images` - listing images, including uploaded image data stored in Neon
- `favorites` - saved homes
- `bookings` - viewing requests
- `reviews` - listing reviews
- `contact_messages` - contact form and inquiry submissions
- `payments` - M-Pesa payment requests, receipts, statuses, and callback data
- `ad_campaigns` - tenant-facing sponsor campaigns, placements, impressions, and clicks

Featured listings use `properties.featured_until`. Paid featured listings appear above standard listings while that timestamp is still active.

## Seed Accounts

All sample accounts use this password:

```text
Password123!
```

- `admin@thikahousehunter.local`
- `landlord@thikahousehunter.local`
- `renter@thikahousehunter.local`
