# Full Stack Developer Assignment — CRM API + Fastor React App

This repository contains both parts of the assignment:

| Part | Folder | What it is | Detailed docs |
|---|---|---|---|
| 1. CRM Backend REST API | [`backend/`](./backend) | Node.js + Express + MongoDB CRM where counselors claim enquiries, secured with JWT | [backend/README.md](./backend/README.md) |
| 2. React (Next.js) App | [`frontend/`](./frontend) | Next.js 16 implementation of the Fastor mobile design, wired to the Fastor staging APIs | [frontend/README.md](./frontend/README.md) |

---

## Repository layout

```
assignmnet-for-fastorai/
├── README.md              ← you are here
├── backend/               CRM REST API (Node.js / Express / MongoDB / JWT)
└── frontend/              Fastor React app (Next.js 16 / TypeScript / Tailwind v4)
```

---

## Part 1 — CRM Backend REST API (`backend/`)

Backend for a CRM where each employee/counselor has an account keyed by their email id,
prospective clients submit enquiries through a **public form** (no auth), and counselors see
all enquiries and **claim** the ones they work on — claimed enquiries become private to that
counselor.

**Stack:** Node.js · Express 5 · MongoDB + Mongoose 9 · JWT (`jsonwebtoken`) · scrypt password
hashing via Node's built-in `crypto` · dotenv · ES Modules.

**Endpoints**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create counselor account (1 per email id) |
| POST | `/api/auth/login` | none | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Logged-in counselor profile |
| POST | `/api/public/leads` | **none** | Public enquiry form submission |
| GET | `/api/public/leads` | **none** | Whitelisted enquiry data for the shared form |
| GET | `/api/leads/public` | JWT | All unclaimed enquiries (public pool) |
| POST | `/api/leads/:id/claim` | JWT | Claim an enquiry → private to you |
| GET | `/api/leads/mine` | JWT | Enquiries claimed by the logged-in counselor |

**Acceptance criteria coverage**

- Employee login/register → `/api/auth/register`, `/api/auth/login`
- Public form API without authentication → `/api/public/leads`
- Claim leads → `POST /api/leads/:id/claim` (atomic, race-safe → `409` if already claimed)
- Fetch unclaimed leads → `GET /api/leads/public`
- Fetch leads claimed by logged-in user → `GET /api/leads/mine`

**Run it**

```bash
cd backend
npm install
npm run dev          # http://localhost:5000  (needs MongoDB at MONGO_URI)
node scripts/smoke.js # end-to-end test of every acceptance criterion
```

> Tested against a live MongoDB: `scripts/smoke.js` passes **14/14** checks (register, login,
> duplicate email, JWT protection, public form, claim, double-claim blocked, pool removal,
> owner-only `/mine`, cross-counselor isolation).

Full API reference, request/response examples, data models, status codes and business rules:
**[backend/README.md](./backend/README.md)**

---

## Part 2 — Fastor React App (`frontend/`)

A **Next.js 16** (App Router, React 19, TypeScript, Tailwind CSS v4) implementation of the
Fastor mobile food-delivery design, integrated with the **Fastor staging APIs** from the
Postman collection.

**Screens**

| Route | Screen |
|---|---|
| `/` | Sign Up — +91 phone input, custom numeric keypad, “Get OTP” |
| `/verify` | 6-digit OTP — OTP boxes, 30s resend timer, numeric keypad |
| `/home` | Home — location header, search, filter/cart actions, Best Seller rail, 30% OFF banner, Popular Items, **live restaurants from the API** |
| `/product/[id]` | Product detail — image, price, quantity stepper, portion picker, Add to cart |

**API integration (Postman collection)**

| Step | Fastor staging request | Used in | Proxy |
|---|---|---|---|
| 1 | `POST /v1/pwa/user/register` | Sign Up | `POST /api/register` |
| 2 | `POST /v1/pwa/user/login` | Verify OTP | `POST /api/login` |
| 3 | `GET /v1/m/restaurant?city_id=118` (Bearer JWT) | Home | `GET /api/restaurants` |

The staging API sends no CORS headers, so the browser cannot call it directly — the Next.js
route handlers proxy every request server-side.

**Run it**

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Demo login: any 10-digit mobile number + OTP **`123456`**.

> Verified in the browser: signup → OTP → JWT login → home loads live restaurants, cart badge
> updates, portion/quantity interactions work. `npm run lint` is clean and `npm run build`
> passes.

Screen details, auth flow, project structure and behaviour notes:
**[frontend/README.md](./frontend/README.md)**

---

## Quick start (both parts)

```bash
# Terminal 1 — CRM API (needs MongoDB)
cd backend
npm install
npm run dev          # http://localhost:5000

# Terminal 2 — Fastor app
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Both projects are independent; the frontend does not depend on the backend.

## Requirements met

| Requirement | Status |
|---|---|
| Node.js backend | ✅ `backend/` |
| Express framework | ✅ Express 5 |
| JWT authentication | ✅ `jsonwebtoken`, Bearer tokens |
| PostgreSQL / MySQL / MongoDB | ✅ MongoDB + Mongoose |
| REST API only (CRM) | ✅ JSON endpoints, documented |
| Public form without authentication | ✅ `/api/public/*` |
| Claim / unclaimed / my-leads APIs | ✅ all implemented and tested |
| Next.js app in `frontend/` | ✅ Next.js 16 + TypeScript |
| Figma screens implemented | ✅ Sign Up, OTP, Home, Product detail |
| Postman APIs integrated | ✅ register, login, restaurants |
