"use client";

import { useWishlist } from "@/store/WishlistContext";
import { fetchApi } from "@/utils/api";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  LayoutGrid,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const sliderData = [
  {
    title: "Quantum Series X",
    tagline: "Unleash Pure Performance",
    desc: "The next generation of neural processing is here. Experience zero-latency computing.",
    price: "From $1,299",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    color: "#66fcf1",
  },
  {
    title: "Urban Cyberware",
    tagline: "Future of Street Fashion",
    desc: "Merging high-performance tech with street aesthetics. Water-resistant and neon-integrated.",
    price: "New Collection",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    color: "#ff003c",
  },
];

type CountdownParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

type ProductSummary = {
  id: string;
  name: string;
  price: number;
  discount?: number | null;
  stock: number;
  images?: string[];
  category?: { name?: string | null } | null;
};

type DealOfDayRecord = {
  productId: string;
  endsAt: string;
  product: ProductSummary;
};

function getCountdownParts(endsAt?: string | null): CountdownParts {
  if (!endsAt) {
    return { hours: "00", minutes: "00", seconds: "00" };
  }

  const remaining = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function ElectroMarketplaceHome() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [dealOfDay, setDealOfDay] = useState<DealOfDayRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlider, setActiveSlider] = useState(0);
  const [activeTab, setActiveTab] = useState("Trending");
  const [countdown, setCountdown] = useState<CountdownParts>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const { wishlistedIds, toggleWishlist } = useWishlist();

  const handleToggleWishlist = async (id: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Authentication required. Redirecting to login terminal...");
      router.push("/login");
      return;
    }
    try {
      await toggleWishlist(id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Action failed";
      toast.error(message);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      if (activeTab === "New Arrivals") return true;
      if (activeTab === "Bestsellers") return p.price > 100;
      if (activeTab === "Trending") return p.discount > 0 || p.price < 200;
      return true;
    })
    .slice(0, 8);

  const dealProduct = dealOfDay?.product;
  const dealPrice = dealProduct
    ? Math.max(0, dealProduct.price - (dealProduct.discount || 0))
    : 0;
  const dealOriginalPrice = dealProduct?.price || 0;

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, prodsRes, dealRes] = await Promise.all([
          fetchApi("/category/all").catch(() => []),
          fetchApi("/product/products").catch(() => []),
          fetchApi("/deal-of-day/current").catch(() => ({ data: null })),
        ]);
        setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
        setProducts(Array.isArray(prodsRes) ? prodsRes : prodsRes.data || []);
        setDealOfDay(dealRes.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownParts(dealOfDay?.endsAt));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [dealOfDay?.endsAt]);

  return (
    <div
      style={{ background: "var(--bg-color)", color: "var(--text-primary)" }}
    >
      {/* 1. Hero Section with Sidebar */}
      <section style={{ padding: "2rem 0" }}>
        <div className="container" style={{ display: "flex", gap: "2rem" }}>
          {/* Vertical Category Sidebar (Electro Style) */}
          <aside
            className="glass-panel"
            style={{
              width: "280px",
              flexShrink: 0,
              padding: "1rem 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "0 1.5rem 1rem",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "var(--primary-color)",
                fontWeight: 800,
              }}
            >
              <LayoutGrid size={20} /> BROWSE SECTORS
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  style={{
                    padding: "0.875rem 1.5rem",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "0.2s",
                    borderBottom: "1px solid rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--primary-color)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  {cat.name} <ChevronRight size={14} />
                </Link>
              ))}
              <Link
                href="/categories"
                style={{
                  padding: "1rem 1.5rem",
                  color: "var(--primary-color)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                View All Categories
              </Link>
            </div>
          </aside>

          {/* Main Slider */}
          <div
            style={{
              flex: 1,
              position: "relative",
              height: "500px",
              borderRadius: "16px",
              overflow: "hidden",
              background: "#000",
            }}
          >
            {sliderData.map((slide, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: i === activeSlider ? 1 : 0,
                  transition: "opacity 1s ease",
                  display: "flex",
                  alignItems: "center",
                  zIndex: i === activeSlider ? 1 : 0,
                }}
              >
                <img
                  src={slide.image}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(11,12,16,0.95) 20%, transparent 80%)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "4rem",
                    maxWidth: "500px",
                  }}
                >
                  <span
                    style={{
                      color: slide.color,
                      fontWeight: 800,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontSize: "0.8rem",
                    }}
                  >
                    {slide.tagline}
                  </span>
                  <h1
                    style={{
                      fontSize: "3.5rem",
                      fontWeight: 900,
                      margin: "1rem 0",
                      lineHeight: 1,
                    }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "2rem",
                    }}
                  >
                    {slide.desc}
                  </p>
                  <Link
                    href="/products"
                    className="btn-primary"
                    style={{
                      background: slide.color,
                      color: "#000",
                      border: "none",
                    }}
                  >
                    Initialize Order
                  </Link>
                </div>
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                bottom: "2rem",
                right: "4rem",
                display: "flex",
                gap: "0.75rem",
              }}
            >
              {sliderData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlider(i)}
                  style={{
                    width: i === activeSlider ? "30px" : "10px",
                    height: "10px",
                    borderRadius: "5px",
                    background:
                      i === activeSlider
                        ? "var(--primary-color)"
                        : "rgba(255,255,255,0.2)",
                    border: "none",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Special Deals Header Section */}
      <section style={{ padding: "2rem 0" }}>
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              title: "Limited Time Offers",
              color: "var(--error-color)",
              desc: "Up to 50% Off Modules",
            },
            {
              title: "New Sector Arrivals",
              color: "var(--primary-color)",
              desc: "Latest Hardware Drops",
            },
            {
              title: "Refurbished Tech",
              color: "var(--secondary-color)",
              desc: "Eco-Friendly Efficiency",
            },
          ].map((box, i) => (
            <div
              key={i}
              className="glass-panel"
              style={{
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderLeft: `4px solid ${box.color}`,
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: box.color,
                    marginBottom: "0.25rem",
                  }}
                >
                  {box.title}
                </p>
                <h4 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  {box.desc}
                </h4>
              </div>
              <ArrowRight size={24} color="rgba(255,255,255,0.2)" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Deal of the Day */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 3fr",
              gap: "2rem",
            }}
          >
            {/* Deal Spotlight */}
            <div
              className="glass-panel"
              style={{
                padding: "2rem",
                border: "2px solid var(--primary-color)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                  }}
                >
                  Deal of the Day
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
                  {dealOfDay?.endsAt
                    ? `Ends ${new Date(dealOfDay.endsAt).toLocaleString()}`
                    : "Waiting for the admin team to publish a deal."}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {[
                    { val: countdown.hours, unit: "Hrs" },
                    { val: countdown.minutes, unit: "Min" },
                    { val: countdown.seconds, unit: "Sec" },
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(102,252,241,0.1)",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        minWidth: "50px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          color: "var(--primary-color)",
                        }}
                      >
                        {t.val}
                      </p>
                      <p
                        style={{
                          fontSize: "0.6rem",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {t.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {dealProduct ? (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={dealProduct.images?.[0]}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                      marginBottom: "1.5rem",
                    }}
                  />
                  <Link
                    href={`/products/${dealProduct.id}`}
                    style={{
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "1rem",
                    }}
                  >
                    {dealProduct.name}
                  </Link>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "var(--primary-color)",
                      }}
                    >
                      ${dealPrice.toFixed(2)}
                    </span>
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ${dealOriginalPrice.toFixed(2)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                    }}
                  >
                    {dealProduct.stock} units available right now
                  </p>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span>Live deal</span>
                      <span>{Math.max(0, dealProduct.stock)} stock</span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(100, Math.max(10, dealProduct.stock || 0))}%`,
                          background: "var(--primary-color)",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Link
                      href={`/products/${dealProduct.id}`}
                      className="btn-primary"
                      style={{ flex: 1, textAlign: "center" }}
                    >
                      Buy Now
                    </Link>
                    <button
                      onClick={() => handleToggleWishlist(dealProduct.id)}
                      style={{
                        background: "none",
                        border: "1px solid var(--border-color)",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: wishlistedIds.has(dealProduct.id)
                          ? "var(--error-color)"
                          : "var(--text-secondary)",
                      }}
                    >
                      <Heart
                        size={20}
                        fill={
                          wishlistedIds.has(dealProduct.id)
                            ? "var(--error-color)"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="glass-panel"
                  style={{
                    padding: "2rem",
                    minHeight: "320px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Sparkles
                    size={42}
                    color="var(--primary-color)"
                    style={{ marginBottom: "1rem" }}
                  />
                  <h4
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "1.1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No Deal Configured Yet
                  </h4>
                  <p style={{ maxWidth: "360px", marginBottom: "1.5rem" }}>
                    The admin team can publish a product and countdown from the
                    dashboard.
                  </p>
                  <Link href="/products" className="btn-primary">
                    Browse Products
                  </Link>
                </div>
              )}
            </div>

            {/* Product Tabs/Grid */}
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  marginBottom: "2rem",
                }}
              >
                {["Trending", "Bestsellers", "New Arrivals"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "1rem 0",
                      color:
                        activeTab === tab
                          ? "var(--primary-color)"
                          : "var(--text-secondary)",
                      fontWeight: 800,
                      fontSize: "1rem",
                      cursor: "pointer",
                      borderBottom:
                        activeTab === tab
                          ? "3px solid var(--primary-color)"
                          : "3px solid transparent",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "2rem",
                }}
              >
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="product-card"
                    style={{ padding: "1.25rem" }}
                  >
                    <div
                      className="product-image-wrapper"
                      style={{
                        height: "160px",
                        marginBottom: "1rem",
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
                    </div>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        fontWeight: 800,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {prod.category?.name}
                    </p>
                    <Link
                      href={`/products/${prod.id}`}
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        display: "block",
                        height: "2.5rem",
                        overflow: "hidden",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {prod.name}
                    </Link>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          color: "var(--primary-color)",
                          fontSize: "1.1rem",
                        }}
                      >
                        ${prod.price}
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleToggleWishlist(prod.id)}
                          style={{
                            background: "none",
                            border: "1px solid var(--border-color)",
                            padding: "0.4rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: wishlistedIds.has(prod.id)
                              ? "var(--error-color)"
                              : "var(--text-secondary)",
                          }}
                        >
                          <Heart
                            size={16}
                            fill={
                              wishlistedIds.has(prod.id)
                                ? "var(--error-color)"
                                : "none"
                            }
                          />
                        </button>
                        <Link
                          href={`/products/${prod.id}`}
                          style={{
                            background: "none",
                            border: "1px solid var(--border-color)",
                            color: "var(--primary-color)",
                            padding: "0.4rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          <ShoppingCart size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Grid (Electro Visual Style) */}
      <section
        style={{ padding: "4rem 0", background: "rgba(255,255,255,0.01)" }}
      >
        <div className="container">
          <h2 className="section-title">Department Catalog</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="glass-panel"
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--primary-color)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "transparent")
                }
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 1rem",
                    background: `url(${cat.image}) center/cover`,
                    borderRadius: "12px",
                  }}
                />
                <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {cat.name}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.25rem",
                  }}
                >
                  Explore &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Support Features */}
      <section style={{ padding: "5rem 0" }}>
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "3rem",
          }}
        >
          {[
            {
              icon: Trophy,
              title: "Industry Standard",
              desc: "Top-rated hardware 2026",
            },
            {
              icon: Zap,
              title: "Zero Latency",
              desc: "Express sector fulfillment",
            },
            {
              icon: ShieldCheck,
              title: "Secure Trade",
              desc: "100% Biometric Verified",
            },
            {
              icon: Sparkles,
              title: "Expert Support",
              desc: "24/7 Neural Assistant",
            },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "1.5rem" }}>
              <f.icon
                size={40}
                color="var(--primary-color)"
                style={{ flexShrink: 0 }}
              />
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>
                  {f.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
