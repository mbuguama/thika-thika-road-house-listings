# Connect254 Deployment

Connect254 is split into:

- `frontend/`: static HTML, CSS, JavaScript, and PWA files for Vercel.
- `backend/`: Node.js, Express, Socket.io API for Render, Railway, or a VPS.
- Neon PostgreSQL for the database.
- Cloudinary for profile photos.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Add your Neon `DATABASE_URL`, `JWT_SECRET`, and optional Cloudinary/SMTP values.

4. Run the database:

   ```bash
   npm run db:setup
   ```

   You can also check the database later with:

   ```bash
   npm run db:check
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:5100`.

## Frontend on Vercel

Deploy the `kenya-connect` folder to Vercel using `vercel.json`. The static frontend is served from `frontend/`.

If the backend is hosted separately, edit `frontend/js/config.js`:

```js
window.KENYA_CONNECT_API_BASE = 'https://your-backend.example.com/api';
```

## Backend on Render or Railway

Use:

```bash
npm install
npm start
```

Required environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_ORIGIN`

Recommended:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Seed accounts

All seeded accounts use:

```text
Password123!
```

Admin:

```text
admin@kenyaconnect.local
```
