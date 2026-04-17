import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface Product {
  discountedPrice: string;
  discount: number;
  _id: string;
  title: string;
  price: string;
  image?: string;
  description: string;
  category: string;
  is_for_rent: boolean;
  rent_price: string;
  is_for_sale: boolean;
  condition: string;
  availability_status: string;
  dimensions: string;
  location: string;
  created_by: string;
  created_at: string;
  images: string[];
  quantity?: number;
  totalPrice?: string; // To hold the total price for each item
}

interface CartContextType {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
  updateCartCount: () => void;
  addToCart: (product: Product, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);

  const updateCartCount = useCallback(() => {
    const userId = localStorage.getItem("token");
    if (userId) {
      const storedCart = JSON.parse(localStorage.getItem(`cart_${userId}`) || "[]");
      setCart(storedCart);
    }
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    const userId = localStorage.getItem("token");
    if (!userId) {
      alert("Please log in to add items to the cart.");
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem(`cart_${userId}`) || "[]");
    storedCart.push({
      ...product,
      quantity,
      totalPrice: (parseFloat(product.price) * quantity).toFixed(2),
    });
    localStorage.setItem(`cart_${userId}`, JSON.stringify(storedCart));
    setCart(storedCart); // Update the cart state immediately
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, [updateCartCount]);

  return (
    <CartContext.Provider value={{ cart, setCart, updateCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};