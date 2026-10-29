import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/fastor";

/** POST /api/register — proxy for POST /v1/pwa/user/register */
export async function POST(request: Request) {
  let body: { phone?: string; dialCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Malformed JSON body" }, { status: 400 });
  }

  const phone = String(body.phone ?? "").replace(/\D/g, "");
  if (phone.length !== 10) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid 10-digit mobile number" },
      { status: 400 },
    );
  }

  try {
    const result = await sendOtp(phone, body.dialCode ?? "+91");
    if (result.status !== "Success") {
      return NextResponse.json(
        { success: false, error: result.message ?? "Could not send OTP" },
        { status: 502 },
      );
    }
    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not send OTP" },
      { status: 502 },
    );
  }
}
