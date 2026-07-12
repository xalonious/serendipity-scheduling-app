# Serendipity Scheduling Site & Game API

A staff scheduling platform and Roblox game API for the Serendipity Support
Center. The application gives staff one place to organize shifts and training
sessions while exposing protected endpoints that keep Roblox experiences in
sync with community data.

## Overview

The project consists of a React website and an Express API. Staff authenticate
with Roblox OAuth, after which their rank in the Serendipity Roblox group
determines which scheduling actions they can perform. Guests can still view the
published shift and training calendars.

The backend also serves Roblox-oriented integrations for changing group ranks,
looking up public games and game passes, retrieving special nametags, and
forwarding approved Discord webhook messages. MySQL stores scheduling data and
shift history, while MongoDB stores special-tag records.

## Features

- Responsive weekly shift calendar with desktop and mobile views
- Public viewing of upcoming shifts and training sessions
- Roblox OAuth login with group-rank authorization
- Staff-created shifts with ownership-aware editing and deletion
- Manager controls for editing or removing other staff members' shifts
- Estimated Robux rewards based on shift timing, recent coverage, cooldowns,
  and weekly limits
- Weekly training schedule with fixed Eastern Time slots
- Training claim limits and rank-based clearing permissions
- Historical shift archiving and weekly Robux CSV exports
- API-key-protected endpoints for Roblox game servers
- Roblox group-rank, public game, and game-pass integrations
- MongoDB-backed special nametags for in-game use
- Validated Discord webhook proxy requests
- Health check, structured logging, CORS, Helmet, and cookie-based sessions

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript |
| Authentication | Roblox OAuth 2.0, JWT, HTTP-only cookies |
| Relational data | MySQL, Prisma ORM |
| Document data | MongoDB, Mongoose |
| Roblox integration | Roblox Open Cloud, noblox.js |

## Project structure

```text
.
├── frontend/                 # React and Vite web application
│   ├── src/api/              # API client modules
│   ├── src/components/       # Shared schedule and navigation components
│   └── src/pages/            # Home, shifts, trainings, FAQ, and legal pages
├── backend/                  # Express API
│   ├── config/               # Development and production configuration
│   ├── prisma/               # MySQL schema and migrations
│   └── src/
│       ├── rest/             # HTTP route handlers
│       ├── service/          # Authentication, schedule, and game logic
│       ├── validation/       # Joi request schemas
│       └── data/             # Database setup, seeds, and maintenance jobs
├── LICENSE
└── README.md
```

## Prerequisites

- Node.js 18.18 or newer
- npm
- A MySQL database
- A MongoDB database
- A Roblox OAuth 2.0 application
- A Roblox Open Cloud API key for group-rank changes

For local authentication, register this callback URL in the Roblox OAuth
application:

```text
http://localhost:8000/api/auth/roblox/callback
```

The current development configuration expects the frontend at
`http://localhost:5173` and the backend at `http://localhost:8000`.

## Setup

Install the frontend and backend dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Copy the backend environment example and configure it:

```bash
cd backend
cp .env.example .env
```

Use the following as a guide. Generate unique, private values for every secret.

```env
NODE_ENV="development"
PORT="8000"

MYSQL_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
MONGODB_URL="mongodb://HOST:27017/serendipity"

ROBLOX_CLIENT_ID="YOUR_ROBLOX_OAUTH_CLIENT_ID"
ROBLOX_CLIENT_SECRET="YOUR_ROBLOX_OAUTH_CLIENT_SECRET"
OPEN_CLOUD_API_KEY="YOUR_ROBLOX_OPEN_CLOUD_API_KEY"

API_KEY="YOUR_PRIVATE_GAME_API_KEY"
AUTH_JWT_SECRET="YOUR_JWT_SIGNING_SECRET"
SESSION_SECRET="YOUR_SESSION_SECRET"
JWT_EXPIRY="3600"
```

Create `frontend/.env` and point the frontend clients at the local API:

```env
VITE_BACKEND_URL="http://localhost:8000"
VITE_API_URL="http://localhost:8000/api"
```

Apply the Prisma migrations and seed the current week's training slots:

```bash
cd backend
npx prisma migrate dev
npm run seed
```

The training seed replaces existing training slots with ten daily slots for
each day of the current Monday-to-Sunday week. Times are created in
`America/New_York` and stored as UTC.

## Running locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The API health check is available at
`http://localhost:8000/api/health/ping`.

## Environment variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Yes | Use `development` or `production` to select environment-specific CORS, cookie, and OAuth settings. |
| `PORT` | Yes | Port used by the Express server; local OAuth configuration expects `8000`. |
| `MYSQL_URL` | Yes | Prisma-compatible MySQL connection string for schedules and shift history. |
| `MONGODB_URL` | Yes | MongoDB connection string for special-tag records. |
| `ROBLOX_CLIENT_ID` | Yes | Roblox OAuth application client ID. |
| `ROBLOX_CLIENT_SECRET` | Yes | Roblox OAuth application client secret. |
| `OPEN_CLOUD_API_KEY` | Yes for rank changes | Roblox Open Cloud key used by the rank-change game endpoint. |
| `API_KEY` | Yes | Bearer token required by every `/api/game` route. |
| `AUTH_JWT_SECRET` | Production | Secret used to sign authentication JWTs. Development has a local fallback in config. |
| `SESSION_SECRET` | Recommended | Secret used to sign Express session cookies; never rely on the fallback in production. |
| `JWT_EXPIRY` | No | Authentication-cookie lifetime in seconds; defaults to `3600`. |
| `LOG_LEVEL` | No | Winston log level; defaults to `info`. |

### Frontend

| Variable | Description |
| --- | --- |
| `VITE_BACKEND_URL` | Backend origin used for Roblox login and logout redirects. |
| `VITE_API_URL` | Base URL used by Axios, normally the backend origin followed by `/api`. |

Variables prefixed with `VITE_` are bundled into the client and must never
contain secrets.

## Authentication and permissions

Login uses Roblox OAuth with the `openid profile` scopes. The backend retrieves
the user's rank in Roblox group `4346739` and only admits staff at rank `200` or
higher.

| Rank | Access |
| --- | --- |
| Guest | View shifts and training slots |
| 200+ | Sign in and manage personal shifts |
| 210+ | Claim and unclaim training slots |
| 240+ | Clear another staff member's training claim and manage other users' shifts |

Successful logins use an HTTP-only `auth_token` cookie. A Roblox refresh token
may also be retained in an HTTP-only cookie so returning staff can renew their
session without completing the full authorization flow again.

## API overview

All paths below are relative to `/api`.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health/ping` | Public | Check whether the API is responding. |
| `GET` | `/auth/roblox` | Public | Begin Roblox OAuth login. |
| `GET` | `/auth/roblox/callback` | OAuth callback | Complete login and create auth cookies. |
| `GET` | `/auth/me` | Staff JWT | Return the signed-in staff profile. |
| `GET` | `/auth/logout` | Public | Clear the current auth cookie. |
| `GET` | `/shift` | Public | List shifts. |
| `GET` | `/shift/worth` | Staff JWT | Estimate the reward for a proposed shift. |
| `POST` | `/shift` | Staff JWT | Create a shift for the signed-in user. |
| `PATCH` | `/shift/:id` | Staff JWT | Update an owned shift, or any shift as a manager. |
| `DELETE` | `/shift/:id` | Staff JWT | Delete an owned shift, or any shift as a manager. |
| `GET` | `/training` | Public | List training slots. |
| `PUT` | `/training/:id` | Rank 210+ | Claim, unclaim, or clear a training slot. |

The following game endpoints all require an `Authorization` header containing
the configured game API key:

```http
Authorization: Bearer YOUR_PRIVATE_GAME_API_KEY
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/game/changerank` | Change a Roblox group membership to a requested display rank. |
| `GET` | `/game/getgamepasses` | Return on-sale game passes for a universe. |
| `GET` | `/game/getgames` | Return public games owned by a Roblox user. |
| `GET` | `/game/getspecialtag` | Return a user's configured `EOTM`, `Booster`, or `CC` tags. |
| `POST` | `/game/webhookproxy` | Forward validated content or an embed to a Discord webhook. |

Keep `API_KEY`, `OPEN_CLOUD_API_KEY`, and the Roblox client secret on trusted
servers. They must not be embedded in a Roblox client script or exposed by the
frontend.

## Scheduling behavior

Training claims are capped at five sessions per user. A user can release their
own claim, while rank 240+ staff can clear claims belonging to someone else.

Shift rewards are calculated by the backend and range from 1 to 15 Robux when
eligible. The calculation considers historical coverage across the week,
recent shifts, a weekly reward pool, a per-user weekly shift limit, and a
60-minute cooldown between rewarded shifts. Reward history uses Eastern Time
for business-week boundaries.

## Scripts

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create a production bundle. |
| `npm run lint` | Run ESLint across the frontend. |
| `npm run preview` | Preview the production build locally. |
| `npm run serve` | Serve `dist` on port `5555`. |

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Run the TypeScript API with automatic restarts. |
| `npm run build` | Compile the backend to `dist`. |
| `npm start` | Run the compiled production server. |
| `npm run initdb` | Create or apply a development Prisma migration named `init`. |
| `npm run seed` | Replace and seed the current week's training slots. |
| `npm run resetshifts` | Archive completed shifts, purge old history, and generate Robux CSV exports. |

`npm run resetshifts` writes reports to `backend/exports`. It archives claimed
past shifts, removes past unclaimed shifts, retains 90 days of historical data,
and rebuilds the cumulative `robux-totals.csv` report. Run it as a controlled
maintenance job after backing up production data.

## License

This project is licensed under the
[PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use, resale, and
offering the software as a paid service are not permitted.
