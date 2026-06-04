# Connect254

Connect254 is a production-ready full-stack starter for an adults-only social discovery and dating platform built for Kenya.

It includes:

- Mobile-first Vanilla HTML/CSS/JavaScript frontend.
- PWA manifest and service worker.
- Node.js and Express backend.
- Neon PostgreSQL schema and seed script.
- JWT authentication with bcrypt password hashing.
- Password reset and email verification flows.
- Cloudinary-ready profile photo upload.
- Socket.io real-time messaging foundation.
- Discovery/search, likes, super likes, mutual matches, favorites, reports, notifications, premium subscriptions, and admin moderation APIs.
- Admin analytics dashboard.
- Privacy, terms, contact, premium, messaging, dashboard, auth, discovery, and profile pages.

## Structure

```text
frontend/
  index.html
  css/
  js/
  assets/
  pages/
  components/

backend/
  routes/
  controllers/
  middleware/
  services/
  config/
  utils/
  database/
  uploads/
```

## Quick start

```bash
npm install
copy .env.example .env
npm run db:setup
npm run dev
```

Before running `npm run db:setup`, paste your Neon connection string into `.env`:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Open:

```text
http://localhost:5100
```

## Safety position

Connect254 is adults-only. The platform is designed around consent, verification, moderation, reporting, and respectful social discovery. It does not support minors, coercion, harassment, impersonation, or paid intimacy arrangements.

## Completion status

The original prompt has been converted into a checked completion list in `docs/COMPLETION_CHECKLIST.md`.

Seed admin login:

```text
admin@kenyaconnect.local
Password123!
```
