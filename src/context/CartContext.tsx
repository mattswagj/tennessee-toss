"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { MenuItem } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────

export interface RegularCartItem {
  cartId: string;
  type: "regular";
  item: MenuItem;
  quantity: number;
}

export interface CustomSaladItem {
  cartId: string;
  type: "custom";
  base: string;
  baseName_en: string;
  baseName_es: string;
  toppings: { id: string; name_en: string; name_es: string }[];
  protein: MenuItem | null;
  dressing: MenuItem | null;
  price: number;
  quantity: number;
}

export type CartItem = RegularCartItem | CustomSaladItem;

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: MenuItem) => void;
  addCustomSalad: (salad: Omit<CustomSaladItem, "cartId" | "type" | "quantity">) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
}

// ── Context ───────────────────────────────────────────────────

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  addItem: () => {},
  addCustomSalad: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

// ── Provider ──────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.type === "regular" && i.item.id === item.id
      );
      if (existing) {
        return prev.map((i) =>
          i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { cartId: item.id, type: "regular", item, quantity: 1 },
      ];
    });
  }, []);

  const addCustomSalad = useCallback(
    (salad: Omit<CustomSaladItem, "cartId" | "type" | "quantity">) => {
      const cartId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [
        ...prev,
        { ...salad, cartId, type: "custom", quantity: 1 },
      ]);
    },
    []
  );

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    const price =
      i.type === "regular" ? i.item.price : i.price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        addCustomSalad,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
