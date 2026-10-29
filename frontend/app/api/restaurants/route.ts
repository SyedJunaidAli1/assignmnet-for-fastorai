import { NextResponse } from "next/server";
import { fetchRestaurants } from "@/lib/fastor";

/** GET /api/restaurants — proxy for GET /v1/m/restaurant?city_id=118 */
export async function GET(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });
  }

  const token = header.slice(7);
  try {
    const restaurants = await fetchRestaurants(token);
    return NextResponse.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    const status = (error as { status?: number }).status === 401 ? 401 : 502;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not load restaurants",
      },
      { status },
    );
  }
}
