"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import StatusBar from "@/components/StatusBar";
import BackButton from "@/components/BackButton";
import { dishes, portions } from "@/lib/data";
import { addToCart, getToken } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const dish = dishes[id] ?? dishes.pizza;
  const [quantity, setQuantity] = useState(3);
  const [portion, setPortion] = useState(portions[0].id);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const add = () => {
    const selected = portions.find((option) => option.id === portion) ?? portions[0];
    addToCart({
      dishId: dish.id,
      name: dish.name,
      priceLabel: dish.priceLabel,
      portion: selected.label,
      quantity,
    });
    setToast(true);
  };

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-4">
        <div className="pt-1">
          <BackButton fallback="/home" />
        </div>

        <div className="relative mt-3 h-[230px] w-full shrink-0 overflow-hidden rounded-3xl bg-neutral-100">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[26px] font-bold tracking-[-0.02em] text-brand">{dish.priceLabel}</p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition active:scale-95 disabled:bg-brand/40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
            <span className="w-5 text-center text-[17px] font-semibold text-ink">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => Math.min(99, value + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <h1 className="mt-5 text-[21px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {dish.name}
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-neutral-500">{dish.description}</p>

        <section className="mt-7">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">Personal portion</h2>
          <div className="mt-2">
            {portions.map((option) => {
              const selected = option.id === portion;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPortion(option.id)}
                  className={`flex w-full items-center justify-between border-b border-dotted border-neutral-200 py-3.5 text-left last:border-0 ${
                    selected ? "" : "opacity-90"
                  }`}
                >
                  <span className="text-[14px] text-neutral-700">{option.label}</span>
                  <span className="flex items-center gap-4">
                    <span className="text-[14px] text-neutral-400">{option.price}</span>
                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition ${
                        selected ? "border-brand" : "border-neutral-300"
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex-1" />

        <div className="sticky bottom-0 -mx-6 mt-6 bg-white/95 px-6 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <button
            type="button"
            onClick={add}
            className="h-14 w-full rounded-xl bg-brand text-[16px] font-medium text-white transition active:scale-[0.99]"
          >
            Add to cart
          </button>
        </div>
      </div>

      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white shadow-lg transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        Added {quantity} × {dish.name} to cart
      </div>
    </MobileShell>
  );
}
