import type { Dish, OrderItem, Portion } from "./types";

/** Static content taken from the Figma design. */

export const dishes: Record<string, Dish> = {
  pizza: {
    id: "pizza",
    name: "Lorem ipsum dolor sit amet",
    price: 14,
    priceLabel: "₹14.00",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  sushi: {
    id: "sushi",
    name: "Salmon Sushi Platter",
    price: 103,
    priceLabel: "₹103.0",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    description:
      "Fresh salmon nigiri and maki rolls, hand-rolled to order and served with wasabi and pickled ginger.",
  },
  salad: {
    id: "salad",
    name: "Grilled Chicken Salad",
    price: 50,
    priceLabel: "₹50.0",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    description:
      "Crisp greens, cherry tomatoes, olives and grilled chicken tossed in a light lemon-herb dressing.",
  },
  pasta: {
    id: "pasta",
    name: "Garden Veg Pasta",
    price: 12.99,
    priceLabel: "₹12.99",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80",
    description:
      "Penne pasta with seasonal vegetables, basil and a slow-cooked tomato sauce.",
  },
  dessert: {
    id: "dessert",
    name: "Berry Cream Cupcake",
    price: 8.2,
    priceLabel: "₹8.20",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    description:
      "Vanilla sponge topped with whipped cream and fresh seasonal berries.",
  },
};

export const bestSellers: Dish[] = [dishes.sushi, dishes.salad, dishes.pasta, dishes.dessert];

export const orders: OrderItem[] = [
  {
    id: "order-1",
    title: "Strawberry Shake",
    datetime: "29 Nov, 01:20 pm",
    priceLabel: "₹20.00",
    itemsLabel: "2 items",
    image:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "order-2",
    title: "Chicken Burger",
    datetime: "17 Oct, 01:20 pm",
    priceLabel: "₹20.00",
    itemsLabel: "1 item",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  },
];

export const portions: Portion[] = [
  { id: "personal", label: "Personal (4 Slides)", price: "$0.00" },
  { id: "medium", label: "Medium (8 Slides)", price: "$3.00" },
  { id: "familiar", label: "Familiar (10 Slides)", price: "$6.00" },
  { id: "jumbo", label: "Jumbo (12 Slides)", price: "$10.00" },
];

export const promoImage =
  "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80";
