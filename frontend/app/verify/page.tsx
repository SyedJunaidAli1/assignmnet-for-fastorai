"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import StatusBar from "@/components/StatusBar";
import BackButton from "@/components/BackButton";
import Keypad from "@/components/Keypad";
import { getPhone, saveSession } from "@/lib/session";
import type { FastorUser } from "@/lib/types";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const formatPhone = (phone: string) =>
  phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : `+91 ${phone}`;

export default function VerifyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getPhone();
    if (!stored) {
      router.replace("/");
      return;
    }
    // Client-only value (sessionStorage) - read after mount so the prerendered
    // HTML stays stable and hydration cannot mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhone(stored);
  }, [router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const handleDigit = (digit: string) => {
    setError(null);
    setOtp((current) => {
      if (current.length >= OTP_LENGTH) return current;
      return current + digit;
    });
  };

  const handleBackspace = () => {
    setError(null);
    setOtp((current) => {
      return current.slice(0, -1);
    });
  };

  const continueToHome = async () => {
    if (otp.length !== OTP_LENGTH || loading || !phone) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, dialCode: "+91" }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        token?: string;
        user?: FastorUser;
        error?: string;
      };

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.error ?? "Invalid OTP, please try again");
      }

      saveSession({ token: data.token, user: data.user as FastorUser });
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const resend = useCallback(async () => {
    if (!phone || resending) return;
    setResending(true);
    setError(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, dialCode: "+91" }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error ?? "Could not resend OTP");
      setSeconds(RESEND_SECONDS);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend OTP");
    } finally {
      setResending(false);
    }
  }, [phone, resending]);

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex flex-1 flex-col px-6 pb-4">
        <BackButton fallback="/" />

        <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          6-digit code
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-neutral-500">
          Please enter the code we&apos;ve sent to
          <span className="mt-0.5 block font-semibold text-ink">{formatPhone(phone)}</span>
        </p>

        <div className="mt-9 flex items-center gap-2" role="group" aria-label="6-digit code">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const filled = index < otp.length;
            const active = index === otp.length && otp.length < OTP_LENGTH;
            return (
              <div key={index} className="flex items-center gap-2">
                {index === 3 ? (
                  <span className="mx-0.5 h-px w-4 bg-neutral-300" aria-hidden="true" />
                ) : null}
                <div
                  className={`flex h-[56px] w-[45px] items-center justify-center rounded-lg border-2 text-[20px] font-medium transition ${
                    error
                      ? "border-red-300"
                      : active
                        ? "border-brand"
                        : filled
                          ? "border-neutral-400"
                          : "border-neutral-200"
                  }`}
                >
                  {filled ? otp[index] : active ? <span className="h-5 w-0.5 bg-brand" /> : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-[13px] text-neutral-500">
          {seconds > 0 ? (
            <>
              <span>I didn&apos;t receive a code</span>
              <span className="font-semibold text-brand tabular-nums">
                (00:{String(seconds).padStart(2, "0")})
              </span>
            </>
          ) : (
            <>
              <span>I didn&apos;t receive a code</span>
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="font-semibold text-brand underline-offset-2 hover:underline disabled:opacity-60"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            </>
          )}
        </div>

        <p className="mt-2 text-[11px] text-neutral-400">Demo OTP: 123456</p>

        {error ? (
          <p className="mt-3 animate-shake text-[12px] text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex-1" />

        <button
          type="button"
          onClick={continueToHome}
          disabled={otp.length !== OTP_LENGTH || loading}
          className="h-14 w-full rounded-xl bg-brand text-[16px] font-medium text-white transition enabled:active:scale-[0.99] disabled:bg-brand/45"
        >
          {loading ? "Verifying…" : "Continue"}
        </button>
      </div>

      <Keypad onDigit={handleDigit} onBackspace={handleBackspace} />
    </MobileShell>
  );
}
