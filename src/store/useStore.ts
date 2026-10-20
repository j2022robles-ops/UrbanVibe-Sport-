import { useState, useEffect } from 'react';
import { CartProduct, CartItem, CustomerData, AREQUIPA_DISTRICTS } from '../utils/pricing';
import { INITIAL_PRODUCTS } from '../data/products';

export interface User {
  id: string;
  nombre: string;
  email: string;
  whatsapp?: string;
  role: 'user' | 'admin';
}

interface AppState {
  products: CartProduct[];
  cart: CartItem[];
  favorites: string[];
  user: User | null;
  coupon: string;
  cartOpen: boolean;
  toast: string;
  searchOpen: boolean;
  videoOpen: boolean;
  sizeGuideOpen: boolean;
  districts: Record<string, number>;
}

const STORAGE_KEYS = {
  CART: 'uv_cart_v1',
  FAVORITES: 'uv_favs_v1',
  USER: 'uv_user_v1',
  COUPON: 'uv_coupon_v1'
};

function getSaved<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setSaved<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

let globalState: AppState = {
  products: INITIAL_PRODUCTS,
  cart: typeof window !== 'undefined' ? getSaved<CartItem[]>(STORAGE_KEYS.CART, []) : [],
  favorites: typeof window !== 'undefined' ? getSaved<string[]>(STORAGE_KEYS.FAVORITES, ['polo-misti', 'hoodie-heavyweight']) : ['polo-misti', 'hoodie-heavyweight'],
  user: typeof window !== 'undefined' ? getSaved<User | null>(STORAGE_KEYS.USER, null) : null,
  coupon: typeof window !== 'undefined' ? getSaved<string>(STORAGE_KEYS.COUPON, '') : '',
  cartOpen: false,
  toast: '',
  searchOpen: false,
  videoOpen: false,
  sizeGuideOpen: false,
  districts: AREQUIPA_DISTRICTS
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addToCart = (product: CartProduct, color: string, talla: string, cantidad = 1) => {
    const existingIndex = globalState.cart.findIndex(
      item => item.product.slug === product.slug && item.color === color && item.talla === talla
    );

    let nextCart: CartItem[];
    if (existingIndex > -1) {
      nextCart = [...globalState.cart];
      nextCart[existingIndex] = {
        ...nextCart[existingIndex],
        cantidad: nextCart[existingIndex].cantidad + cantidad
      };
    } else {
      nextCart = [...globalState.cart, { product, color, talla, cantidad }];
    }

    globalState = { ...globalState, cart: nextCart, cartOpen: true };
    setSaved(STORAGE_KEYS.CART, nextCart);
    emitChange();
  };

  const removeFromCart = (slug: string, color: string, talla: string) => {
    const nextCart = globalState.cart.filter(
      item => !(item.product.slug === slug && item.color === color && item.talla === talla)
    );
    globalState = { ...globalState, cart: nextCart };
    setSaved(STORAGE_KEYS.CART, nextCart);
    emitChange();
  };

  const updateQuantity = (slug: string, color: string, talla: string, delta: number) => {
    const nextCart = globalState.cart
      .map(item => {
        if (item.product.slug === slug && item.color === color && item.talla === talla) {
          const nextQty = item.cantidad + delta;
          return nextQty > 0 ? { ...item, cantidad: nextQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    globalState = { ...globalState, cart: nextCart };
    setSaved(STORAGE_KEYS.CART, nextCart);
    emitChange();
  };

  const clearCart = () => {
    globalState = { ...globalState, cart: [] };
    setSaved(STORAGE_KEYS.CART, []);
    emitChange();
  };

  const toggleFavorite = (slug: string) => {
    const exists = globalState.favorites.includes(slug);
    const nextFavs = exists
      ? globalState.favorites.filter(s => s !== slug)
      : [...globalState.favorites, slug];

    globalState = { ...globalState, favorites: nextFavs };
    setSaved(STORAGE_KEYS.FAVORITES, nextFavs);
    notify(exists ? 'Prenda retirada de tus favoritos' : 'Prenda guardada en tus favoritos');
    emitChange();
  };

  const setCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    globalState = { ...globalState, coupon: upper };
    setSaved(STORAGE_KEYS.COUPON, upper);
    emitChange();
  };

  const setCartOpen = (open: boolean) => {
    globalState = { ...globalState, cartOpen: open };
    emitChange();
  };

  const setSearchOpen = (open: boolean) => {
    globalState = { ...globalState, searchOpen: open };
    emitChange();
  };

  const setVideoOpen = (open: boolean) => {
    globalState = { ...globalState, videoOpen: open };
    emitChange();
  };

  const setSizeGuideOpen = (open: boolean) => {
    globalState = { ...globalState, sizeGuideOpen: open };
    emitChange();
  };

  const notify = (msg: string) => {
    globalState = { ...globalState, toast: msg };
    emitChange();
    if (msg) {
      setTimeout(() => {
        if (globalState.toast === msg) {
          globalState = { ...globalState, toast: '' };
          emitChange();
        }
      }, 4000);
    }
  };

  const setUser = (user: User | null) => {
    globalState = { ...globalState, user };
    setSaved(STORAGE_KEYS.USER, user);
    emitChange();
  };

  const logout = () => {
    globalState = { ...globalState, user: null };
    setSaved(STORAGE_KEYS.USER, null);
    notify('Sesión finalizada.');
    emitChange();
  };

  const fetchProducts = async () => {
    try {
      const { fetchProductsFromDb } = await import('../services/db');
      const firestoreProds = await fetchProductsFromDb();
      if (firestoreProds && firestoreProds.length > 0) {
        globalState = { ...globalState, products: firestoreProds };
        emitChange();
        return;
      }
    } catch {}

    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          globalState = { ...globalState, products: data };
          emitChange();
        }
      }
    } catch {
      // fallback to initial products
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.districts) {
          globalState = { ...globalState, districts: data.districts };
          emitChange();
        }
      }
    } catch {
      // fallback
    }
  };

  return {
    ...globalState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    setCoupon,
    setCartOpen,
    setSearchOpen,
    setVideoOpen,
    setSizeGuideOpen,
    notify,
    setUser,
    logout,
    fetchProducts,
    fetchConfig
  };
}
