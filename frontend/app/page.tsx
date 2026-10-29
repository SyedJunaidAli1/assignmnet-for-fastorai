"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import StatusBar from "@/components/StatusBar";
import BackButton from "@/components/BackButton";
import Keypad from "@/components/Keypad";
import { savePhone } from "@/lib/session";

export default function SignUpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    setError(null);
    setPhone((current) => (current.length >= 10 ? current : current + digit));
  };

  const handleBackspace = () => {
    setError(null);
    setPhone((current) => current.slice(0, -1));
  };

  const getOtp = async () => {
    if (phone.length !== 10 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, dialCode: "+91" }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Could not send OTP. Please try again.");
      }

      savePhone(phone);
      router.push("/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex flex-1 flex-col px-6 pb-4">
        <BackButton />

        <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          Sign Up to Fastor
        </h1>
        <p className="mt-3 max-w-[330px] text-[15px] leading-6 text-neutral-500">
          Let us know your mobile number and we will send you an OTP for verification.
        </p>

        <div className="mt-9">
          <div
            className={`flex h-[58px] items-center rounded-xl border bg-[#f5f5f6] px-4 transition ${
              error ? "border-red-300" : "border-[#e9e9ea] focus-within:border-brand/60"
            }`}
          >
            <span className="text-[15px] font-medium text-ink">+91</span>
            <span className="mx-3 h-5 w-px bg-[#d9d9db]" aria-hidden="true" />
            <input
              value={phone}
              onChange={(event) => {
                setError(null);
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
              }}
              inputMode="none"
              autoComplete="tel"
              aria-label="Mobile number"
              placeholder="– 00000"
              className="w-full bg-transparent text-[15px] tracking-wide text-ink outline-none placeholder:text-neutral-400"
            />
          </div>
          {error ? (
            <p className="mt-2 animate-shake text-[12px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={getOtp}
          disabled={phone.length !== 10 || loading}
          className="h-14 w-full rounded-xl bg-brand text-[16px] font-medium text-white transition enabled:active:scale-[0.99] disabled:bg-brand/45"
        >
          {loading ? "Sending OTP…" : "Get OTP"}
        </button>

        <p className="mx-auto mt-3 text-center text-[11px] leading-4 text-neutral-500">
          By clicking, I accept the <span className="font-semibold text-neutral-700">Terms &amp; Conditions</span> and{" "}
          <span className="font-semibold text-neutral-700">Privacy Policy</span>
        </p>
      </div>

      <Keypad onDigit={handleDigit} onBackspace={handleBackspace} />
    </MobileShell>
  );
}
