import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
    } catch {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.personas, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, refreshCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
