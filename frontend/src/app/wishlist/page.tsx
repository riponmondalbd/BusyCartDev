"use client";

import { fetchApi } from "@/utils/api";
import { ArrowLeft, Heart, Lock, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAndLoad = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      setAuthenticated(true);

      try {
        const res = await fetchApi("/wishlist/all");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setWishlistItems(data);
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("wishlist-update", { detail: data.length }),
          );
        }, 0);
      } catch (err: any) {
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          setAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAndLoad();
  }, []);

  const removeItem = async (productId: string) => {
    try {
      await fetchApi(`/wishlist/remove/${productId}`, { method: "DELETE" });
      setWishlistItems((prev) => {
        const next = prev.filter((item) => item.productId !== productId);
        window.dispatchEvent(
          new CustomEvent("wishlist-update", { detail: next.length }),
        );
        return next;
      });
    } catch (err) {
      console.error("Removal failed:", err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(102,252,241,0.1)",
            borderTopColor: "var(--primary-color)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "var(--text-secondary)" }}>
          Decrypting Secure Wishlist...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div
        className="container"
        style={{ padding: "8rem 0", textAlign: "center" }}
      >
        <div
          className="glass-panel"
          style={{ padding: "4rem", maxWidth: "600px", margin: "0 auto" }}
        >
          <Lock
            size={60}
            color="var(--error-color)"
            style={{ marginBottom: "2rem" }}
          />
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              marginBottom: "1.5rem",
            }}
          >
            Access Denied
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "3rem",
              fontSize: "1.1rem",
            }}
          >
            Wishlist protocols are encrypted and locked to individual user
            identities. Please authenticate to access your saved modules.
          </p>
          <Link
            href="/login"
            className="btn-primary"
            style={{ padding: "1rem 3rem" }}
          >
            Authenticate Terminal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "5rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
            }}
          >
            Personal Wishlist
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Securely stored hardware selections for your identity.
          </p>
        </div>
        <Link
          href="/products"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--primary-color)",
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={20} /> Back to Catalog
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "6rem", textAlign: "center" }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 2rem",
            }}
          >
            <Heart size={40} color="var(--text-secondary)" />
          </div>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            No Data Found
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>
            Your personal wishlist buffer is currently empty.
          </p>
          <Link
            href="/products"
            className="btn-primary"
            style={{ padding: "1rem 3rem" }}
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2.5rem",
          }}
        >
          {wishlistItems.map((item) => {
            const prod = item.product;
            if (!prod) return null;
            return (
              <div
                key={item.id}
                className="product-card"
                style={{ padding: "1.5rem" }}
              >
                <div
                  className="product-image-wrapper"
                  style={{
                    height: "220px",
                    marginBottom: "1.5rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={prod.images?.[0]}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <button
                    onClick={() => removeItem(prod.id)}
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "rgba(255,75,75,0.1)",
                      border: "1px solid var(--error-color)",
                      color: "var(--error-color)",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      SAVED MODULE
                    </p>
                    <Link
                      href={`/products/${prod.id}`}
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        margin: "0.5rem 0",
                        display: "block",
                      }}
                    >
                      {prod.name}
                    </Link>
                  </div>
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--primary-color)",
                    }}
                  >
                    ${prod.price}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <Link
                    href={`/products/${prod.id}`}
                    className="btn-primary"
                    style={{ flex: 1, textAlign: "center", padding: "0.75rem" }}
                  >
                    Buy Now
                  </Link>
                  <button
                    style={{
                      background: "none",
                      border: "1px solid var(--border-color)",
                      color: "var(--primary-color)",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
