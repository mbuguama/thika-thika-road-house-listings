# Connect254 API

Base URL: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `GET /auth/verify-email`

## Users

- `GET /users/me`
- `DELETE /users/me`

## Profiles

- `GET /profiles`
- `GET /profiles/:id`
- `GET /profiles/me`
- `PUT /profiles/me`
- `POST /profiles/me/photos`
- `GET /profiles/favorites`
- `POST /profiles/:id/favorite`

## Discovery

- `GET /search`

Query filters:

- `town`
- `gender`
- `relationship_goal`
- `min_age`
- `max_age`
- `verified=true`
- `sort=active|newest|popular|nearest`
- `page`
- `limit`

## Matching

- `GET /matches`
- `POST /matches/:profileId/action`

Action body:

```json
{ "type": "like" }
```

Allowed types: `like`, `super_like`, `pass`.

## Messages

- `GET /messages/:matchId`
- `POST /messages/:matchId`
- `POST /messages/:matchId/read`

## Notifications

- `GET /notifications`
- `POST /notifications/:id/read`

## Reports

- `POST /reports`

## Admin

Admin only:

- `GET /admin/dashboard`
- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `PATCH /admin/profiles/:profileId/verify`
- `GET /admin/reports`
- `PATCH /admin/reports/:id`
