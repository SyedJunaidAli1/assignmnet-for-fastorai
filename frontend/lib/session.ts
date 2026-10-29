"use client";

import type { CartLine, FastorUser, Session } from "./types";

const TOKEN_KEY = "fastor.token";
const USER_KEY = "fastor.user";
const PHONE_KEY = "fastor.phone";
const CART_KEY = "fastor.cart";

const canUseStorage = () => typeof window !== "undefined";

/* ------------------------------- session ------------------------------- */

export function saveSession(session: Session) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): FastorUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as FastorUser) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(PHONE_KEY);
}

/* -------------------------- signup phone number ------------------------- */

export function savePhone(phone: string) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(PHONE_KEY, phone);
}

export function getPhone(): string | null {
  if (!canUseStorage()) return null;
  return window.sessionStorage.getItem(PHONE_KEY);
}

/* --------------------------------- cart -------------------------------- */

export function getCart(): CartLine[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function addToCart(line: CartLine) {
  if (!canUseStorage()) return;
  const cart = getCart();
  const existing = cart.find((item) => item.dishId === line.dishId && item.portion === line.portion);
  if (existing) {
    existing.quantity += line.quantity;
  } else {
    cart.push(line);
  }
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function cartCount(): number {
  return getCart().reduce((total, line) => total + line.quantity, 0);
}
