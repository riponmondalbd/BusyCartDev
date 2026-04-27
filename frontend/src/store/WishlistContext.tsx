"use client";

import { fetchApi } from "@/utils/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface WishlistContextType {
  wishlistedIds: Set<string>;
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetchApi("/wishlist/all");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const ids = new Set<string>(
        data
          .map((item: any) => item?.productId)
          .filter(
            (productId: unknown): productId is string =>
              typeof productId === "string" && productId.length > 0,
          ),
      );
      setWishlistedIds(ids);
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (id: string) => {
    const isWishlisted = wishlistedIds.has(id);

    try {
      if (isWishlisted) {
        await fetchApi(`/wishlist/remove/${id}`, { method: "DELETE" });
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await fetchApi("/wishlist/add", {
          method: "POST",
          body: JSON.stringify({ productId: id }),
        });
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      throw err;
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistedIds, loading, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
