# CRM Backend REST API

Backend for a CRM system where every counselor (employee) has an account keyed by their
email id, prospective clients submit enquiries through a **public enquiry form** (no auth
required), and counselors can see all enquiries and **claim** the ones they work on —
claimed enquiries become private to that counselor.

**Stack:** Node.js (>= 18) · Express 5 (latest) · MongoDB + Mongoose 9 (latest) ·
JWT (`jsonwebtoken`) · password hashing with Node's built-in `crypto` (scrypt) ·
dotenv · ES Modules · no other third-party packages

## Quick start

```bash
cd backend
npm install          # install dependencies
# adjust .env if needed (a working .env ships with the repo)
npm run dev          # or: npm start
```

Requires a running MongoDB at the URI from `.env` (default
`mongodb://127.0.0.1:27017/crm_backend`). Node >= 18.

```bash
node scripts/smoke.js   # optional: end-to-end test of every acceptance criterion
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | HTTP port |
| `NODE_ENV` | `development` | (reserved; logging behavior) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/crm_backend` | MongoDB connection string |
| `JWT_SECRET` | — | Signing key for auth tokens (dev default ships in `.env`; always replace in production) |
| `JWT_EXPIRES_IN` | `1h` | Token lifetime, e.g. `30m`, `1h`, `12h` |

## Project structure

```
backend/
├── server.js                    # entry point: connect DB -> start Express -> graceful shutdown
├── package.json / .env / .env.example
├── scripts/
│   └── smoke.js                 # end-to-end acceptance-criteria test (node scripts/smoke.js)
└── src/
    ├── app.js                   # express app wiring + route mounting + error handler
    ├── config/db.js             # mongoose connection
    ├── models/userModel.js      # counselor account (scrypt password hashing)
    ├── models/leadModel.js      # enquiry + claim state
    ├── controllers/
    │   ├── authController.js    # register / login / me (+ JWT signing)
    │   ├── leadController.js    # public pool / claim / my leads (counselor APIs)
    │   └── publicController.js  # enquiry form APIs (no auth)
    ├── routes/
    │   ├── authRoutes.js        # /api/auth/*
    │   ├── publicRoutes.js      # /api/public/*  (deliberately unauthenticated)
    │   └── leadRoutes.js        # /api/leads/*   (JWT-protected router)
    ├── middleware/
    │   ├── auth.js              # JWT verification -> attaches req.user
    │   └── errorHandler.js      # central error -> { success, error } JSON
    └── validators/validate.js   # tiny field validator (trim/pattern/min/max/optional)
```

## Route map

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create counselor account (1 per email id) |
| POST | `/api/auth/login` | none | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Profile of logged-in counselor |
| POST | `/api/public/leads` | **none** | Enquiry form submission (prospective client) |
| GET | `/api/public/leads` | **none** | Whitelisted enquiry data for the shared form page |
| GET | `/api/leads/public` | JWT | All **unclaimed** enquiries (public pool) |
| POST | `/api/leads/:id/claim` | JWT | Claim an enquiry -> becomes private to you |
| GET | `/api/leads/mine` | JWT | Enquiries claimed by the logged-in counselor |

Every response is `{ "success": boolean, ...data }`; failures are
`{ "success": false, "error": "message" }`. The JWT is sent as
`Authorization: Bearer <token>`.

`GET /` (root) returns a self-documenting endpoint index.

## API reference

### POST /api/auth/register
Creates the counselor's CRM account. Email is unique — one account per email id.
Encryption-style note: passwords are stored as scrypt hashes, never in plain text.

```jsonc
// request
{ "name": "Priya Sharma", "email": "priya@company.com", "password": "password123" }
// 201
{
  "success": true,
  "message": "Account created. Please log in.",
  "user": { "name": "Priya Sharma", "email": "priya@company.com", "_id": "...", "createdAt": "...", "updatedAt": "..." }
}
// 400 -> first validation error   |   409 -> "Email is already registered"
```

### POST /api/auth/login
Returns the JWT for endpoints under `/api/auth/me`, `/api/leads/*`.

```jsonc
// request
{ "email": "priya@company.com", "password": "password123" }
// 200
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h",
  "user": { ... }
}
// 400 validation  |  401 "Invalid email or password"
```

### GET /api/auth/me — requires JWT
Returns the logged-in counselor (minus password fields). `401` if the token is
missing, expired, or invalid, or the account was deleted.

### POST /api/public/leads — **no auth**
Enquiry form a prospective client fills out (shared link / online campaign).
Creates an **unclaimed** enquiry visible to every counselor.

```jsonc
// request (phone & message optional)
{ "name": "Rahul Verma", "email": "rahul@student.com", "phone": "9876543210",
  "courseInterest": "Data Science", "message": "Wants weekend batches" }
// 201
{ "success": true, "message": "Thank you! Your enquiry has been received. A counselor will contact you soon.",
  "lead": { "_id": "...", "name": "Rahul Verma", "courseInterest": "Data Science" } }
// 400 -> e.g. "Name is required", "A valid email is required", "Course interest is required"
```

### GET /api/public/leads — **no auth**
Whitelisted listing for the shared form page: only `_id`, `name`, `courseInterest`
for the 50 most recent enquiries. Claim state and any internal data are never exposed.
Useful to power a public enquiry/landing page without leaking counselor data.

### GET /api/leads/public — requires JWT
The counselor's shared pool: every enquiry with `status: "unclaimed"`, newest first.
Enquiries claimed by anyone are absent immediately (private leads live only in their
owner's `/mine`). Fields returned: `name`, `email`, `phone`, `courseInterest`,
`message`, `status`, `claimedBy`, `claimedAt`, timestamps.

```jsonc
// 200
{ "success": true, "count": 3, "leads": [ { "_id": "...", "name": "...", "status": "unclaimed", ... } ] }
```

### POST /api/leads/:id/claim — requires JWT
Assigns an enquiry to the logged-in counselor. **Atomic and race-safe:** the claim
update only matches a lead that is still `unclaimed`, so two counselors hitting the
same lead simultaneously produce exactly one winner.

```jsonc
// 200
{ "success": true,
  "message": "Enquiry claimed successfully. It is now private to priya@company.com.",
  "lead": { ..., "status": "claimed", "claimedBy": "<userId>", "claimedAt": "..." } }
// 400 "Invalid lead id"  |  409 "This enquiry has already been claimed or was deleted"
```

### GET /api/leads/mine — requires JWT
The logged-in counselor's **private** enquiries, newest claim first. All fields as in
`/public`. `401` without JWT — no one else's claimed leads are ever returned.

## Data models

| User | |
|---|---|
| `name` | string, required |
| `email` | string, required, unique (case-normalized) — one CRM account per email id |
| `passwordHash` | scrypt hash (`salt:hash`, Node built-in `crypto`), stripped from all responses |
| timestamps | `createdAt`, `updatedAt` |

| Lead (enquiry) | |
|---|---|
| `name` | string, required |
| `email` | string, required, lowercased |
| `phone` | string, optional, max 20 |
| `courseInterest` | string, required, max 120 |
| `message` | string, optional, max 1000 |
| `status` | `unclaimed` \| `claimed` |
| `claimedBy` | ref User, set on claim |
| `claimedAt` | date, set on claim |
| timestamps | `createdAt`, `updatedAt` |

## Business rules enforced

1. One counselor account per email id (409 on duplicate).
2. Enquiry submissions from the form need no login (`/api/public/*`).
3. All unclaimed enquiries visible to every counselor (`/api/leads/public`).
4. Claiming makes an enquiry private: removed from the public pool, listed only for
   its owner, and another counselor's claim attempt is rejected (409).
5. A counselor sees only their own claimed leads — claims of other counselors are
   never readable.

## Status codes

| Code | Meaning |
|---|---|
| 200 | success |
| 201 | resource created |
| 400 | validation error, malformed JSON, or invalid id format |
| 401 | missing/expired/invalid JWT, or bad login credentials |
| 409 | duplicate email, or lead already claimed (race-safe) |
| 500 | handled internal error (details logged server-side, never leaked) |

## Example flow

```bash
# 1. Counselor registers
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya@company.com","password":"password123"}'

# 2. Counselor logs in, save the token
curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"priya@company.com","password":"password123"}'
# -> { "token": "eyJ..." }
TOKEN=eyJ...

# 3. Prospective client submits the enquiry form (shared link - no auth)
curl -X POST localhost:5000/api/public/leads -H "Content-Type: application/json" \
  -d '{"name":"Rahul Verma","email":"rahul@student.com","phone":"9876543210","courseInterest":"Data Science","message":"Wants weekend batches"}'

# 4. Counselor sees the public pool
curl localhost:5000/api/leads/public -H "Authorization: Bearer $TOKEN"

# 5. Counselor claims the enquiry -> it leaves the public pool forever
curl -X POST localhost:5000/api/leads/<leadId>/claim -H "Authorization: Bearer $TOKEN"

# 6. Counselor lists their private enquiries
curl localhost:5000/api/leads/mine -H "Authorization: Bearer $TOKEN"

# 7. Another counselor target the same lead -> 409 already claimed
curl -X POST localhost:5000/api/leads/<leadId>/claim -H "Authorization: Bearer $OTHER_TOKEN"
```

## Acceptance criteria coverage

- **API for Employee login/register** -> `POST /api/auth/register`, `POST /api/auth/login`
- **Public form API without authentication** -> `POST /api/public/leads` (and `GET` variant)
- **API to claim leads** -> `POST /api/leads/:id/claim`
- **API to fetch unclaimed leads** -> `GET /api/leads/public`
- **API to fetch leads claimed by logged-in users** -> `GET /api/leads/mine`

All five are exercised by `node scripts/smoke.js` (last verified: 14/14 passing).
