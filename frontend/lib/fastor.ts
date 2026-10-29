/**
 * Server-side client for the Fastor staging API.
 *
 * The staging API does not send CORS headers, so the browser can never call it
 * directly. Every request goes through our own Next.js route handlers
 * (`/api/register`, `/api/login`, `/api/restaurants`) which call these helpers.
 */

const API_BASE = process.env.FASTOR_API_BASE ?? "https://staging.fastor.ai";

type ApiEnvelope<T> = {
  status?: string;
  status_code?: number;
  data?: T;
  message?: string;
  error?: string;
};

async function postForm<T>(path: string, body: Record<string, string>): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!json) {
    throw new Error(`Unexpected response from Fastor API (${res.status})`);
  }
  return json;
}

/** POST /v1/pwa/user/register — sends the login OTP to the phone number. */
export async function sendOtp(phone: string, dialCode = "+91") {
  return postForm<string>("/v1/pwa/user/register", { phone, dial_code: dialCode });
}

/** POST /v1/pwa/user/login — verifies the OTP and returns the JWT + user. */
export async function loginWithOtp(phone: string, otp: string, dialCode = "+91") {
  return postForm<{ token?: string } & Record<string, unknown>>("/v1/pwa/user/login", {
    phone,
    otp,
    dial_code: dialCode,
  });
}

/** GET /v1/m/restaurant?city_id=118 — requires the JWT from login. */
export async function fetchRestaurants(token: string, cityId = "118") {
  const res = await fetch(`${API_BASE}/v1/m/restaurant?city_id=${encodeURIComponent(cityId)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw Object.assign(new Error("Session expired. Please sign in again."), { status: 401 });
  }

  const json = (await res.json().catch(() => null)) as ApiEnvelope<{
    results?: Array<Record<string, unknown>>;
  }> | null;

  if (!json || json.status !== "Success") {
    throw new Error(json?.message ?? "Could not load restaurants");
  }

  return (json.data?.results ?? []).map((item) => ({
    restaurant_id: String(item.restaurant_id ?? ""),
    restaurant_name: String(item.restaurant_name ?? "Restaurant"),
    address_complete:
      item.address_complete && item.address_complete !== "null"
        ? String(item.address_complete)
        : null,
    logo: String(item.logo ?? ""),
  }));
}
