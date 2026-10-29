"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import StatusBar from "@/components/StatusBar";
import { bestSellers, orders, promoImage } from "@/lib/data";
import { cartCount, clearSession, getToken, getUser } from "@/lib/session";
import type { FastorUser, Restaurant } from "@/lib/types";

type LoadState = "loading" | "ready" | "error";

/** Restaurant logo with a graceful initial-letter fallback (staging logos can 404). */
function RestaurantAvatar({ restaurant }: { restaurant: Restaurant }) {
  const [failed, setFailed] = useState(false);
  const showImage = restaurant.logo && !failed;

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
      {showImage ? (
        <Image
          src={restaurant.logo}
          alt={restaurant.restaurant_name}
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[17px] font-semibold text-brand">
          {restaurant.restaurant_name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<FastorUser | null>(null);
  const [items, setItems] = useState(0);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const loadRestaurants = useCallback(async (token: string) => {
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as {
        success?: boolean;
        restaurants?: Restaurant[];
        error?: string;
      };

      if (response.status === 401) {
        clearSession();
        router.replace("/");
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Could not load restaurants");
      }

      setRestaurants(data.restaurants ?? []);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load restaurants");
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }
    // Client-only values (localStorage) - read after mount so the prerendered
    // HTML stays stable and hydration cannot mismatch.
    // Client-only value (localStorage) - read after mount so the prerendered
    // HTML stays stable and hydration cannot mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
    setItems(cartCount());
    void loadRestaurants(token);
  }, [loadRestaurants, router]);

  const logout = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex-1 pb-10">
        {/* location + account */}
        <header className="px-6">
          <p className="text-[11px] leading-4 text-neutral-400">Current Locations</p>
          <div className="mt-0.5 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-ink">Model Town, New Delhi</p>
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="relative h-8 w-8 overflow-hidden rounded-full bg-neutral-100 ring-2 ring-white"
            >
              {user?.user_image ? (
                <Image src={user.user_image} alt="" fill sizes="32px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[12px] font-semibold text-neutral-500">
                  {user?.user_mobile?.slice(-2) ?? "F"}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* search + quick actions */}
        <div className="mt-4 flex items-center gap-2.5 px-6">
          <div className="flex h-[52px] flex-1 items-center gap-2.5 rounded-xl bg-[#f4f4f5] px-3.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Karan"
              aria-label="Search dishes and restaurants"
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-neutral-400"
            />
          </div>

          <button
            type="button"
            aria-label="Filters"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-brand text-white transition active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="7" r="2.2" stroke="currentColor" strokeWidth="2" />
              <circle cx="8" cy="17" r="2.2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Cart"
            className="relative flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#4c8df6] text-white transition active:scale-95"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5.5 8.5h13l-1 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8l-1-11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {items > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
                {items}
              </span>
            ) : null}
          </button>
        </div>

        {/* best sellers */}
        <section className="mt-7">
          <h2 className="px-6 text-[20px] font-semibold tracking-[-0.01em] text-ink">Best Seller</h2>
          <div className="no-scrollbar mt-3.5 flex gap-3 overflow-x-auto px-6 pb-1">
            {bestSellers.map((dish) => (
              <Link
                key={dish.id}
                href={`/product/${dish.id}`}
                className="group relative block h-[118px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100"
              >
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  sizes="104px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 rounded-md bg-brand px-2 py-[3px] text-[11px] font-semibold text-white shadow-sm">
                  {dish.priceLabel}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* promo banner */}
        <section className="mt-5 px-6">
          <div className="relative h-[150px] overflow-hidden rounded-2xl bg-brand text-white">
            <span className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10" aria-hidden="true" />
            <span className="absolute -bottom-10 left-10 h-20 w-20 rounded-full bg-black/5" aria-hidden="true" />
            <div className="relative z-10 flex h-full max-w-[190px] flex-col justify-center pl-5">
              <p className="text-[13px] leading-snug text-white/95">
                Experience our delicious new dish
              </p>
              <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.02em]">30% OFF</p>
            </div>
            <div className="absolute inset-y-0 right-0 w-[54%]">
              <Image src={promoImage} alt="Pizza offer" fill sizes="230px" className="object-cover" />
              <span className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-brand to-transparent" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            <span className="h-1.5 w-4 rounded-full bg-brand" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          </div>
        </section>

        {/* popular items / recent orders */}
        <section className="mt-7">
          <h2 className="px-6 text-[20px] font-semibold tracking-[-0.01em] text-ink">Popular Items</h2>
          <div className="mt-1 px-6">
            {orders.map((order, index) => (
              <article
                key={order.id}
                className={`flex gap-3 py-4 ${index !== orders.length - 1 ? "border-b border-neutral-100" : ""}`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  <Image src={order.image} alt={order.title} fill sizes="64px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-semibold text-ink">{order.title}</h3>
                  <p className="mt-0.5 text-[12px] text-neutral-500">{order.datetime}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="h-7 rounded-full bg-brand px-3 text-[11px] font-medium text-white transition active:scale-95"
                    >
                      Cancel Order
                    </button>
                    <button
                      type="button"
                      className="h-7 rounded-full bg-brand-soft px-3 text-[11px] font-medium text-brand transition active:scale-95"
                    >
                      Track Driver
                    </button>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-semibold text-ink">{order.priceLabel}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">{order.itemsLabel}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* live restaurants from the Fastor API */}
        <section className="mt-6">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
              Restaurants near you
            </h2>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              Live
            </span>
          </div>

          <div className="mt-2 px-6">
            {state === "loading" ? (
              <div className="space-y-2.5" aria-label="Loading restaurants">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex animate-pulse items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-neutral-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 rounded bg-neutral-100" />
                      <div className="h-2.5 w-4/5 rounded bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {state === "error" ? (
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-center">
                <p className="text-[12px] text-neutral-500">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    const token = getToken();
                    if (token) void loadRestaurants(token);
                  }}
                  className="mt-2 rounded-full bg-brand px-4 py-1.5 text-[11px] font-medium text-white"
                >
                  Retry
                </button>
              </div>
            ) : null}

            {state === "ready" && restaurants.length === 0 ? (
              <p className="py-3 text-[12px] text-neutral-500">No restaurants found for this city.</p>
            ) : null}

            {state === "ready"
              ? restaurants.slice(0, 6).map((restaurant, index) => (
                  <div
                    key={`${restaurant.restaurant_id}-${index}`}
                    className={`flex items-center gap-3 py-2.5 ${
                      index !== Math.min(restaurants.length, 6) - 1 ? "border-b border-neutral-100" : ""
                    }`}
                  >
                    <RestaurantAvatar restaurant={restaurant} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {restaurant.restaurant_name}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-neutral-500">
                        {restaurant.address_complete ?? "Address not available"}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="m9 5 7 7-7 7"
                        stroke="#c4c4c6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))
              : null}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
