"use client";

import { fetchApi } from "@/utils/api";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "@/components/Skeleton";

export default function SingleProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [topSellingRelated, setTopSellingRelated] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchApi(`/product/products/${id}`);
        const productData = res.success && res.product ? res.product : (res.data || res);
        setProduct(productData);

        // Fetch related products from same category
        if (productData.categoryId) {
          const relatedRes = await fetchApi(`/product/products?limit=20&category=${productData.category?.slug || ''}`);
          const allRelated = Array.isArray(relatedRes) ? relatedRes : relatedRes.data || [];
          
          // Filter out current product
          const filteredRelated = allRelated.filter((p: any) => p.id !== id);
          
          setRelatedProducts(filteredRelated.slice(0, 4));
          setTopSellingRelated([...filteredRelated]
            .sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0))
            .slice(0, 4)
          );
        }

        // Check wishlist
        const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setIsWishlisted(saved.includes(id));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let next;
    if (saved.includes(id)) {
      next = saved.filter((sid: string) => sid !== id);
      setIsWishlisted(false);
    } else {
      next = [...saved, id];
      setIsWishlisted(true);
    }
    localStorage.setItem("wishlist", JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("wishlist-update", { detail: next.length }),
    );
  };

  const totalProduct = Number(product?.stock ?? 0);
  const isOutOfStock = totalProduct <= 0;
  const handleAddToCart = async (
    showNotification = true,
    isBuyAction = false,
  ) => {
    if (!id) return false;

    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return false;
    }

    if (isBuyAction) setIsBuying(true);
    else setIsAdding(true);

    try {
      await fetchApi("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId: id, quantity }),
      });

      // Notify Navbar to update cart counts
      window.dispatchEvent(new CustomEvent("cart-refresh"));

      if (showNotification) {
        toast.success(
          `${quantity} Module(s) successfully integrated into your cart matrix.`,
        );
      }
      return true;
    } catch (err: any) {
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        toast.error("Authentication required. Redirecting to terminal login.");
        router.push("/login");
      } else {
        toast.error(err.message || "Error during module transfer.");
      }
      return false;
    } finally {
      if (isBuyAction) setIsBuying(false);
      else setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false, true);
    if (success) {
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "8rem" }}>
        <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          <div>
            <Skeleton height="600px" borderRadius="24px" />
            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1.5rem" }}>
              <Skeleton width="100px" height="100px" borderRadius="16px" />
              <Skeleton width="100px" height="100px" borderRadius="16px" />
              <Skeleton width="100px" height="100px" borderRadius="16px" />
            </div>
          </div>
          <div>
            <Skeleton width="150px" height="30px" borderRadius="30px" style={{ marginBottom: "1rem" }} />
            <Skeleton height="60px" style={{ marginBottom: "1rem" }} />
            <Skeleton width="200px" height="20px" style={{ marginBottom: "2rem" }} />
            <Skeleton height="40px" width="200px" style={{ marginBottom: "3rem" }} />
            <Skeleton height="150px" style={{ marginBottom: "3rem" }} />
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Skeleton height="50px" borderRadius="12px" style={{ flex: 1 }} />
              <Skeleton height="50px" borderRadius="12px" style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container"
        style={{
          padding: "10rem 0",
          textAlign: "center",
          color: "var(--error-color)",
          fontWeight: 900,
          fontSize: "2rem",
        }}
      >
        404: PRODUCT DATA NOT FOUND
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div
      style={{
        background: "var(--bg-color)",
        color: "var(--text-primary)",
        paddingBottom: "5rem",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "1.5rem 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/products"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <ChevronLeft size={18} /> BACK TO SECTORS
          </Link>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={toggleWishlist}
              style={{
                background: "none",
                border: "none",
                color: isWishlisted
                  ? "var(--error-color)"
                  : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <Heart
                size={18}
                fill={isWishlisted ? "var(--error-color)" : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem" }}>
        <div
          className="product-detail-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
          }}
        >
          <div>
            <div
              className="glass-panel"
              style={{
                position: "relative",
                width: "100%",
                height: "auto",
                aspectRatio: "1/1",
                maxHeight: "600px",
                borderRadius: "24px",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid rgba(102,252,241,0.1)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              {images.length > 0 && (
                <div style={{ position: "relative", width: "100%", height: "100%", padding: "2rem" }}>
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    style={{
                      objectFit: "contain",
                    }}
                    priority
                  />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    style={{
                      position: "absolute",
                      left: "1rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      transition: "0.3s",
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    style={{
                      position: "absolute",
                      right: "1rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      transition: "0.3s",
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  left: "2rem",
                  padding: "1rem",
                  background: "rgba(11,12,16,0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--primary-color)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}
                >
                  Visual State
                </p>
                <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                  Holographic Render 4K
                </p>
              </div>
            </div>

            {images.length > 1 && (
              <div
                style={{ display: "flex", gap: "1.25rem", marginTop: "1.5rem" }}
              >
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border:
                        activeImage === idx
                          ? "2px solid var(--primary-color)"
                          : "2px solid transparent",
                      background: "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "0.3s",
                      padding: "0.5rem",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx}`}
                        fill
                        style={{
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "2rem" }}>
              <span
                style={{
                  background: "rgba(102,252,241,0.1)",
                  color: "var(--primary-color)",
                  padding: "0.5rem 1rem",
                  borderRadius: "30px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {product.category?.name || "Unassigned Sector"}
              </span>
              <h1
                className="responsive-title"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  fontWeight: 900,
                  marginTop: "1rem",
                  lineHeight: 1.1,
                }}
              >
                {product.name}
              </h1>
              <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    fontWeight: 800,
                  }}
                >
                  SKU:{" "}
                  <span style={{ color: "var(--primary-color)" }}>
                    {product.sku || `BC-${id?.slice(0, 8).toUpperCase()}`}
                  </span>
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    fontWeight: 800,
                  }}
                >
                  STATUS:{" "}
                  <span
                    style={{
                      color: isOutOfStock
                        ? "var(--error-color)"
                        : "var(--success-color)",
                    }}
                  >
                    {isOutOfStock ? "OUT OF STOCK" : "AVAILABLE"}
                  </span>
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                marginBottom: "3rem",
              }}
            >
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    fontWeight: 900,
                    color: "var(--primary-color)",
                  }}
                >
                  ${Number(product.price || 0).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  height: "40px",
                  width: "1px",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                  }}
                >
                  TAX INCLUDED
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: isOutOfStock
                      ? "var(--error-color)"
                      : "var(--success-color)",
                    fontWeight: 700,
                  }}
                >
                  {isOutOfStock ? "OUT OF STOCK" : "IN STOCK & READY"}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Box size={18} color="var(--primary-color)" /> CORE DESCRIPTION
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                }}
              >
                {product.description ||
                  "The specifications for this module are currently encrypted."}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                marginTop: "auto",
              }}
            >
              <div
                style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      background: "none",
                      color: isOutOfStock ? "rgba(255,255,255,0.4)" : "#fff",
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                      fontSize: "1.5rem",
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      width: "50px",
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        totalProduct && q >= totalProduct ? q : q + 1,
                      )
                    }
                    disabled={isOutOfStock}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      background: "none",
                      color: isOutOfStock ? "rgba(255,255,255,0.4)" : "#fff",
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                      fontSize: "1.25rem",
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      fontWeight: 800,
                    }}
                  >
                    ESTIMATED TOTAL
                  </p>
                  <p
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 900,
                      color: "var(--primary-color)",
                    }}
                  >
                    ${(Number(product.price || 0) * quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1.5rem" }}>
                <button
                  onClick={() => handleAddToCart(true, false)}
                  disabled={isAdding || isBuying || isOutOfStock}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "1.25rem",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    color: "#fff",
                  }}
                >
                  <ShoppingCart size={20} style={{ marginRight: "0.5rem" }} />{" "}
                  {isAdding ? "ADDING..." : "ADD TO CART"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isAdding || isBuying || isOutOfStock}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "1.25rem",
                    borderRadius: "12px",
                    boxShadow: "0 0 30px rgba(102,252,241,0.2)",
                  }}
                >
                  <Zap size={20} style={{ marginRight: "0.5rem" }} />{" "}
                  {isBuying ? "PREPARING..." : "BUY NOW"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: "8rem" }}>
          <div className="container">
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <Zap size={28} color="var(--primary-color)" /> RELATED MODULES
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
              {relatedProducts.map((prod) => (
                <Link key={prod.id} href={`/products/${prod.id}`} className="glass-panel" style={{ padding: "1.5rem", transition: "0.3s", display: "flex", flexDirection: "column" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <div style={{ height: "180px", marginBottom: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                    <Image src={prod.images?.[0] || "/placeholder.jpg"} alt={prod.name} fill style={{ objectFit: "contain", padding: "1rem" }} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>{prod.name}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <span style={{ fontWeight: 800, color: "var(--primary-color)" }}>${prod.price}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>VIEW SECTOR &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Selling Related Section */}
      {topSellingRelated.length > 0 && (
        <section style={{ marginTop: "6rem" }}>
          <div className="container">
            <div className="glass-panel" style={{ padding: "3rem", border: "1px solid var(--primary-color)", background: "rgba(102,252,241,0.02)" }}>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "3rem", textAlign: "center", textTransform: "uppercase", letterSpacing: "2px" }}>
                Top Rated in this Sector
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2.5rem" }}>
                {topSellingRelated.map((prod) => (
                  <div key={prod.id} style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                    <Link href={`/products/${prod.id}`} style={{ width: "80px", height: "80px", flexShrink: 0, background: "rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                      <Image src={prod.images?.[0] || "/placeholder.jpg"} alt={prod.name} fill style={{ objectFit: "contain", padding: "0.5rem" }} />
                    </Link>
                    <div>
                      <Link href={`/products/${prod.id}`} style={{ fontWeight: 700, fontSize: "0.95rem", display: "block", marginBottom: "0.25rem" }}>{prod.name}</Link>
                      <p style={{ color: "var(--primary-color)", fontWeight: 800, fontSize: "1rem" }}>${prod.price}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{prod.numReviews || 0} TRANSMISSIONS</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
