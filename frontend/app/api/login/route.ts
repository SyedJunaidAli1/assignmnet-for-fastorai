import { NextResponse } from "next/server";
import { loginWithOtp } from "@/lib/fastor";
import type { FastorUser } from "@/lib/types";

/** POST /api/login — proxy for POST /v1/pwa/user/login (verifies the OTP) */
export async function POST(request: Request) {
  let body: { phone?: string; otp?: string; dialCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Malformed JSON body" }, { status: 400 });
  }

  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const otp = String(body.otp ?? "").replace(/\D/g, "");

  if (phone.length !== 10) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid 10-digit mobile number" },
      { status: 400 },
    );
  }
  if (otp.length !== 6) {
    return NextResponse.json(
      { success: false, error: "Please enter the 6-digit code" },
      { status: 400 },
    );
  }

  try {
    const result = await loginWithOtp(phone, otp, body.dialCode ?? "+91");
    const data = result.data ?? {};
    const token = typeof data.token === "string" ? data.token : "";

    if (result.status !== "Success" || !token) {
      return NextResponse.json(
        { success: false, error: result.message ?? "Invalid OTP, please try again" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, token, user: data as FastorUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Login failed" },
      { status: 502 },
    );
  }
}
