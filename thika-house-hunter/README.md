# Thika House Hunter

Thika House Hunter is a rental listings web app for browsing verified homes, saving favorites, handling landlord dashboards, and managing inquiries.

## Stack

- Static HTML, CSS, and vanilla JavaScript client
- Express API
- Neon Postgres via `@neondatabase/serverless`
- JWT authentication
- M-Pesa/Daraja payment records and STK Push flow
- Tenant ad placements with direct sponsor tracking and automatic AdSense fallback

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and paste your Neon `DATABASE_URL`.

3. Create the database tables:

   ```bash
   npm run db:schema
   ```

4. Add sample data:

   ```bash
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open `http://localhost:5000` in your browser.
