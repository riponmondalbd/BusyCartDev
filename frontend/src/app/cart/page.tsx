"use client";

import { fetchApi } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const loadCart = async (isInitial = false) => {
    try {
      const res = await fetchApi("/cart/my-cart");
      const data = res.data || res;
      setCart(data);

      // Notify Navbar of cart update
      window.dispatchEvent(new CustomEvent("cart-update", { detail: data }));
    } catch (err: any) {
      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        router.push("/login");
      } else {
        console.error("Cart load error:", err);
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    const initCart = async () => {
      // Clear coupon on entry to ensure "not by default"
      try {
        await fetchApi("/coupon/remove", { method: "DELETE" });
      } catch (err) {
        // Ignore if no coupon was there
      }
      loadCart(true);
    };

    initCart();

    // Ensure coupon is removed when navigating away
    return () => {
      fetchApi("/coupon/remove", { method: "DELETE" }).catch(() => {});
    };
  }, []);

  const handleUpdateQuantity = async (
    itemId: string,
    currentQty: number,
    change: number,
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    // 1. Optimistic UI Update
    const previousCart = { ...cart };
    const updatedItems = cart.items.map((item: any) => {
      if (item.itemId === itemId) {
        return {
          ...item,
          quantity: newQty,
          itemTotal: Number(item.price) * newQty,
        };
      }
      return item;
    });

    const newSubtotal = updatedItems.reduce(
      (acc: number, item: any) => acc + item.itemTotal,
      0,
    );
    const discount = cart.discountAmount || 0;

    const nextCart = {
      ...cart,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal - discount,
      totalItems: updatedItems.reduce(
        (acc: number, item: any) => acc + item.quantity,
        0,
      ),
    };

    setCart(nextCart);
    window.dispatchEvent(new CustomEvent("cart-update", { detail: nextCart }));

    // 2. Background API call
    try {
      await fetchApi(`/cart/update/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      });
      // We no longer call loadCart() here to prevent race conditions during rapid clicks
    } catch (err: any) {
      // Revert if failed
      setCart(previousCart);
      window.dispatchEvent(
        new CustomEvent("cart-update", { detail: previousCart }),
      );
      toast.error(err.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousCart = { ...cart };
    const updatedItems = cart.items.filter((i: any) => i.itemId !== itemId);

    const newSubtotal = updatedItems.reduce(
      (acc: number, item: any) => acc + item.itemTotal,
      0,
    );
    const discount = cart.discountAmount || 0;

    const nextCart = {
      ...cart,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal - discount,
      totalItems: updatedItems.reduce(
        (acc: number, item: any) => acc + item.quantity,
        0,
      ),
    };

    setCart(nextCart);
    window.dispatchEvent(new CustomEvent("cart-update", { detail: nextCart }));

    try {
      await fetchApi(`/cart/remove/${itemId}`, { method: "DELETE" });
    } catch (err: any) {
      setCart(previousCart);
      window.dispatchEvent(
        new CustomEvent("cart-update", { detail: previousCart }),
      );
      toast.error(err.message || "Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await fetchApi("/cart/clear", { method: "DELETE" });
      setCart(null);
      setCouponCode("");
      setCouponSuccess(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to clear cart");
    }
  };

  const applyCoupon = async () => {
    setCouponError("");
    setCouponSuccess(false);
    try {
      await fetchApi("/coupon/apply", {
        method: "POST",
        body: JSON.stringify({ code: couponCode }),
      });
      setCouponSuccess(true);
      loadCart(); // Reload to see updated prices
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: "4rem 0",
          textAlign: "center",
          color: "var(--primary-color)",
        }}
      >
        Accessing Cart Matrix...
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      <h1
        style={{
          fontSize: "2.5rem",
          color: "var(--text-primary)",
          marginBottom: "2rem",
        }}
      >
        Shopping Matrix
      </h1>

      {items.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "4rem", textAlign: "center" }}
        >
          <h2
            style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}
          >
            Your matrix is empty.
          </h2>
          <Link href="/products" className="btn-primary">
            Browse Modules
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "3rem",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleClearCart}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--error-color)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Clear Cart [X]
              </button>
            </div>
            {items.map((item: any, idx: number) => (
              <div
                key={item.itemId || `cart-item-${idx}`}
                className="glass-panel"
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  padding: "1.5rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                    {item.name || "Unknown Module"}
                  </h3>
                  <p
                    style={{
                      color: "var(--primary-color)",
                      fontWeight: "bold",
                    }}
                  >
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    border: "1px solid var(--border-color)",
                    borderRadius: "30px",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(item.itemId, item.quantity, -1)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      padding: "0 0.5rem",
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800 }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.stock && item.quantity >= item.stock) {
                        toast.error(
                          `Only ${item.stock} units available in the matrix.`,
                        );
                        return;
                      }
                      handleUpdateQuantity(item.itemId, item.quantity, 1);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      padding: "0 0.5rem",
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{ minWidth: "80px", textAlign: "right" }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    ${Number(item.itemTotal).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.itemId)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--error-color)",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "0.5rem",
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "1rem",
              }}
            >
              Order Summary
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>Subtotal</span>
              <span>${Number(cart?.subtotal || 0).toFixed(2)}</span>
            </div>

            {cart?.discountAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  color: "var(--success-color)",
                }}
              >
                <span>Discount Applied</span>
                <span>-${Number(cart.discountAmount).toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-color)",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              <span>Total Compute</span>
              <span style={{ color: "var(--primary-color)" }}>
                ${Number(cart?.total || 0).toFixed(2)}
              </span>
            </div>

            <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.5rem",
                }}
              >
                Promo Code
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  className="input-field"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                />
                <button
                  onClick={applyCoupon}
                  className="btn-primary"
                  style={{ padding: "0.75rem" }}
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p
                  style={{
                    color: "var(--error-color)",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {couponError}
                </p>
              )}
              {couponSuccess && (
                <p
                  style={{
                    color: "var(--success-color)",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Code accepted.
                </p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary"
              style={{ width: "100%", padding: "1rem" }}
              disabled={placingOrder}
            >
              {placingOrder ? "Processing Transfer..." : "Execute Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
