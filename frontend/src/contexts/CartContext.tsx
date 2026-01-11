// frontend/src/contexts/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface CartItem {
  book_id: string;
  title: string;
  price: number;
  quantity: number;
  cover_image_url: string | null;
  stock_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (bookId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ute_bookshop_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  // ✅ Lazy initialization - Load từ localStorage 1 lần duy nhất khi khởi tạo
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (error) {
          console.error('Error loading cart:', error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    }
    return [];
  });
  
  // ✅ useRef để track lần render đầu tiên (không trigger re-render)
  const isInitialMount = useRef(true);

  // ✅ Lưu cart vào localStorage mỗi khi items thay đổi (bỏ qua lần đầu)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  // Tính tổng số lượng items
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng tiền
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Thêm sách vào giỏ hàng
  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.book_id === newItem.book_id);
      
      if (existingItem) {
        // Nếu đã có trong giỏ, tăng số lượng
        const newQuantity = existingItem.quantity + 1;
        
        // Kiểm tra không vượt quá tồn kho
        if (newQuantity > newItem.stock_quantity) {
          alert(`Chỉ còn ${newItem.stock_quantity} sản phẩm trong kho!`);
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.book_id === newItem.book_id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Thêm mới vào giỏ
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  // Xóa sách khỏi giỏ hàng
  const removeFromCart = (bookId: string) => {
    setItems(prevItems => prevItems.filter(item => item.book_id !== bookId));
  };

  // Cập nhật số lượng
  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(bookId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.book_id === bookId) {
          // Kiểm tra không vượt quá tồn kho
          if (quantity > item.stock_quantity) {
            alert(`Chỉ còn ${item.stock_quantity} sản phẩm trong kho!`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setItems([]);
  };

  // Kiểm tra sách đã có trong giỏ chưa
  const isInCart = (bookId: string) => {
    return items.some(item => item.book_id === bookId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}