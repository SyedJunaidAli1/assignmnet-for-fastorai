/** Shared types for the Fastor staging API. */

export type FastorUser = {
  user_id: string;
  user_name: string;
  user_gender?: string | null;
  user_email: string;
  dial_code: string;
  user_mobile: string;
  user_image?: string | null;
  member_since?: string;
  refer_code?: string;
  first_order?: boolean;
  mobile_verified?: boolean;
  is_new_user?: boolean;
};

export type Restaurant = {
  restaurant_id: string;
  restaurant_name: string;
  address_complete: string | null;
  logo: string;
};

export type Session = {
  token: string;
  user: FastorUser;
};

export type Portion = {
  id: string;
  label: string;
  price: string;
};

export type Dish = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  image: string;
  description: string;
};

export type OrderItem = {
  id: string;
  title: string;
  datetime: string;
  priceLabel: string;
  itemsLabel: string;
  image: string;
};

export type CartLine = {
  dishId: string;
  name: string;
  priceLabel: string;
  portion: string;
  quantity: number;
};
