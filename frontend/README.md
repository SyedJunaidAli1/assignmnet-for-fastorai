# Fastor — Next.js Frontend

Pixel-focused implementation of the **Fastor mobile food-delivery design** (Figma) wired to the
**Fastor staging APIs** from the Postman collection.

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/` | Sign Up | `+91` phone input with custom numeric keypad, “Get OTP” |
| `/verify` | 6-digit code | OTP boxes, 30s resend timer, numeric keypad, verify + login |
| `/home` | Home | Location header, search, filters/cart actions, Best Seller rail, promo banner, Popular Items, **live restaurants from the API** |
| `/product/[id]` | Product detail | Image, price + quantity stepper, description, portion picker, Add to cart |

## Run it

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Optional environment variable (server-only, defaults to staging):

```bash
# .env.local
FASTOR_API_BASE=https://staging.fastor.ai
```

## Demo credentials

The staging API accepts any 10-digit Indian mobile number and the default OTP **`123456`**
(e.g. `9818979450`, the number from the Postman collection).

1. Enter any 10-digit number → **Get OTP**
2. Enter `123456` → **Continue**
3. You land on the home screen and the app fetches restaurants with your JWT.

## API integration (Postman collection)

| Step | Postman request | Used in | How |
|---|---|---|---|
| 1 | `POST /v1/pwa/user/register` (`phone`, `dial_code`) | Sign Up | `POST /api/register` proxy |
| 2 | `POST /v1/pwa/user/login` (`phone`, `otp`, `dial_code`) | Verify | `POST /api/login` proxy |
| 3 | `GET /v1/m/restaurant?city_id=118` (Bearer JWT) | Home | `GET /api/restaurants` proxy |

### Why the proxy?

The staging API does **not** return `Access-Control-Allow-Origin`, so a browser `fetch`
straight to `staging.fastor.ai` is blocked by CORS. The Next.js **Route Handlers** in
`app/api/*` run on the server, forward the request to Fastor, and return clean JSON to the
client. The JWT never leaves the browser except through that same-origin proxy.

## Auth flow

```
Sign Up (/)
  └─ POST /api/register ──► staging /v1/pwa/user/register  → "otp sent"
Verify (/verify)
  └─ POST /api/login    ──► staging /v1/pwa/user/login     → { token, user }
       └─ token + user saved in localStorage
Home (/home)
  └─ GET /api/restaurants (Authorization: Bearer token)
       └─ staging /v1/m/restaurant?city_id=118
```

- `lib/session.ts` — localStorage session (token, user), pending phone, and cart helpers
- `lib/fastor.ts` — server-only API client used by the route handlers
- Protected screens redirect to `/` when no token is present; a `401` from the API clears
  the session and sends the user back to Sign Up

## Project structure

```
frontend/
├── app/
│   ├── layout.tsx               # Poppins font, metadata, viewport
│   ├── globals.css              # Tailwind v4 theme (brand colour, keypad styles)
│   ├── page.tsx                 # Sign Up
│   ├── verify/page.tsx          # OTP verification
│   ├── home/page.tsx            # Home
│   ├── product/[id]/page.tsx    # Product route (async params, Next 16)
│   └── api/
│       ├── register/route.ts    # proxy → /v1/pwa/user/register
│       ├── login/route.ts       # proxy → /v1/pwa/user/login
│       └── restaurants/route.ts # proxy → /v1/m/restaurant
├── components/
│   ├── MobileShell.tsx          # phone-width column, centered on desktop
│   ├── StatusBar.tsx            # iOS status bar from the design
│   ├── Keypad.tsx               # numeric keypad (signup + OTP)
│   ├── BackButton.tsx
│   └── ProductDetail.tsx        # client product screen
└── lib/
    ├── data.ts                  # design content (dishes, orders, portions)
    ├── fastor.ts                # server-side staging API client
    ├── session.ts               # token/user/cart storage helpers
    └── types.ts
```

## Tech

- **Next.js 16** (App Router, Turbopack, async `params`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- `next/font` (Poppins) and `next/image` (remote images allow-listed in `next.config.ts`)

## Behaviour notes

- Quantity stepper, portion selection and Add to cart are interactive; the cart is
  persisted in `localStorage` and the cart badge on the home screen reflects it.
- The “Best Seller” rail, promo banner and “Popular Items” cards match the design and link
  to their product detail pages.
- “Restaurants near you” is real data: loading skeletons, empty state, and a retry state
  if the API call fails.
