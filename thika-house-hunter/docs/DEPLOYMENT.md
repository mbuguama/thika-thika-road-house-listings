# Deployment

## Local

```bash
npm install
npm run db:schema
npm run db:seed
npm run dev
```

Open `http://localhost:5000`.

## Environment Variables

Required:

- `DATABASE_URL`
- `JWT_SECRET`

Optional:

- `CLIENT_ORIGIN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

Listing photos uploaded from the landlord, agent, or broker dashboard are stored in Neon through the `property_images` table, so no separate image hosting service is required.

M-Pesa/Daraja payments:

- `MPESA_ENV` - `sandbox` or `production`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_PARTY_B` - defaults to `MPESA_SHORTCODE` if blank
- `MPESA_TRANSACTION_TYPE` - usually `CustomerPayBillOnline`
- `MPESA_CALLBACK_URL` - public HTTPS URL ending in `/api/payments/mpesa/callback`
- `PLATFORM_VERIFICATION_FEE` - default `300`
- `FEATURED_LISTING_FEE` - default `500`
- `FEATURED_LISTING_DAYS` - default `7`

For local Daraja callback testing, expose `localhost:5000` with a public HTTPS tunnel and set `MPESA_CALLBACK_URL` to that tunnel URL.

Automatic tenant ads:

- `AUTO_ADS_PROVIDER` - currently `adsense`
- `GOOGLE_ADSENSE_CLIENT` - your AdSense publisher client, for example `ca-pub-1234567890123456`
- `GOOGLE_ADSENSE_AUTO_ADS` - `true` to load site-wide Auto ads
- `GOOGLE_ADSENSE_TEST_MODE` - `true` only for testing ad units
- `GOOGLE_ADSENSE_SLOT_TENANT_HOME`
- `GOOGLE_ADSENSE_SLOT_TENANT_EXPLORE_TOP`
- `GOOGLE_ADSENSE_SLOT_TENANT_EXPLORE_INLINE`
- `GOOGLE_ADSENSE_SLOT_TENANT_PROPERTY_SIDEBAR`
- `GOOGLE_ADSENSE_SLOT_TENANT_FAVORITES`
- `GOOGLE_ADSENSE_SLOT_TENANT_PROFILE`

Direct sponsor campaigns from the admin dashboard show first. If no direct campaign is active for a tenant placement, the page falls back to the matching AdSense slot when configured. Site-wide Auto ads can also run with only `GOOGLE_ADSENSE_CLIENT` and `GOOGLE_ADSENSE_AUTO_ADS=true`.

## Vercel

The included `vercel.json` routes `/api/*` to the Express server and serves files from `client/`.

Add the same environment variables in Vercel project settings, then deploy from the project root.

After deployment, run the schema and seed commands locally against the production Neon connection string, or run the SQL files in the Neon SQL editor.
