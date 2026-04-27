"use client";

import Skeleton from "@/components/Skeleton";
import { useWishlist } from "@/store/WishlistContext";
import { fetchApi } from "@/utils/api";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Cpu,
  Globe,
  Heart,
  LayoutGrid,
  Server,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Image from "next/image";
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
  image?: string | null;
};

type ProductSummary = {
  id: string;
  name: string;
  price: number;
  discount?: number | null;
  stock: number;
  images?: string[];
  category?: { name?: string | null } | null;
  numReviews?: number | null;
  averageRating?: number | null;
  createdAt?: string;
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
  const [banners, setBanners] = useState<any[]>([]);
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

  const filteredProducts = [...products]
    .filter((p) => {
      if (activeTab === "New Arrivals") return true;
      if (activeTab === "Bestsellers") return (p.numReviews || 0) >= 0; // In a real app, this would be sales count
      if (activeTab === "Trending") {
        // Consider as trending if it has a discount, strong rating, some reviews, or is recently added
        const hasDiscount = (p.discount || 0) > 0;
        const highRating = (p.averageRating || 0) >= 4;
        const someReviews = (p.numReviews || 0) > 0;
        const createdAt = p.createdAt ? new Date(p.createdAt).getTime() : 0;
        const thirtyDays = 1000 * 60 * 60 * 24 * 30;
        const recent = Date.now() - createdAt < thirtyDays && createdAt > 0;
        return hasDiscount || highRating || someReviews || recent;
      }
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "New Arrivals") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (activeTab === "Bestsellers") {
        return (b.numReviews || 0) - (a.numReviews || 0);
      }
      if (activeTab === "Trending") {
        // Prioritize by rating, then discount, then number of reviews
        const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        const discountDiff = (b.discount || 0) - (a.discount || 0);
        if (discountDiff !== 0) return discountDiff;
        return (b.numReviews || 0) - (a.numReviews || 0);
      }
      return 0;
    })
    .slice(0, 6);

  const dealProduct = dealOfDay?.product;
  const dealPrice = dealProduct
    ? Math.max(0, dealProduct.price - (dealProduct.discount || 0))
    : 0;
  const dealOriginalPrice = dealProduct?.price || 0;

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, prodsRes, dealRes, bannersRes] = await Promise.all([
          fetchApi("/category/all").catch(() => []),
          fetchApi("/product/products?limit=50").catch(() => []),
          fetchApi("/deal-of-day/current").catch(() => ({ data: null })),
          fetchApi("/banner/active").catch(() => ({ data: [] })),
        ]);
        setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
        setProducts(Array.isArray(prodsRes) ? prodsRes : prodsRes.data || []);
        setDealOfDay(dealRes.data || null);

        const fetchedBanners = bannersRes.data || bannersRes;
        if (Array.isArray(fetchedBanners) && fetchedBanners.length > 0) {
          setBanners(fetchedBanners);
        } else {
          setBanners(sliderData); // Fallback to initial designs if none in DB
        }
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

  // Auto-slide effect for the carousel
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlider((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div
      style={{ background: "var(--bg-color)", color: "var(--text-primary)" }}
    >
      {/* 1. Hero Section with Sidebar */}
      <section style={{ padding: "1.5rem 0", background: "var(--bg-color)" }}>
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "row", // Will be handled by media query manually if needed, but let's keep it robust
            gap: "2rem",
            minHeight: "500px",
          }}
        >
          <style>{`
            @media (max-width: 992px) {
              .responsive-flex-wrapper {
                flex-direction: column !important;
              }
              .main-banner-terminal {
                height: 400px !important;
                width: 100% !important;
              }
            }
          `}</style>

          <div
            className="responsive-flex-wrapper"
            style={{ display: "flex", width: "100%", gap: "2rem" }}
          >
            {/* Sidebar Departments - Hidden on smaller screens */}
            <aside
              className="glass-panel hidden-mobile"
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
                {categories.length > 0
                  ? categories.slice(0, 8).map((cat) => (
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
                          (e.currentTarget.style.color =
                            "var(--text-secondary)")
                        }
                      >
                        {cat.name} <ChevronRight size={14} />
                      </Link>
                    ))
                  : Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} style={{ padding: "0.875rem 1.5rem" }}>
                          <Skeleton width="80%" height="15px" />
                        </div>
                      ))}
              </div>
            </aside>

            {/* Main Slider - Guaranteed Visibility */}
            <div
              className="main-banner-terminal"
              style={{
                flex: 1,
                position: "relative",
                height: "500px",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#000",
                display: "block",
                zIndex: 5,
              }}
            >
              {banners.length > 0 ? (
                banners.map((slide, i) => (
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
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      style={{
                        objectFit: "cover",
                        opacity: 0.6,
                      }}
                      priority={i === 0}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(90deg, rgba(11,12,16,0.95) 40%, rgba(11,12,16,0.4) 70%, transparent 100%)",
                        zIndex: 1,
                      }}
                    />
                    <div
                      className="slider-content"
                      style={{
                        position: "relative",
                        zIndex: 10,
                        padding: "2.5rem",
                        maxWidth: "600px",
                      }}
                    >
                      <span
                        style={{
                          color: slide.color || "var(--primary-color)",
                          fontWeight: 800,
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                        }}
                      >
                        {slide.tagline}
                      </span>
                      <h1
                        className="responsive-title"
                        style={{
                          fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                          fontWeight: 900,
                          margin: "0.75rem 0",
                          lineHeight: 1.1,
                          color: "#fff",
                        }}
                      >
                        {slide.title}
                      </h1>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          marginBottom: "1.5rem",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {slide.desc}
                      </p>
                      <Link
                        href={slide.link || "/products"}
                        className="btn-primary"
                        style={{
                          background: slide.color || "var(--primary-color)",
                          color: "#000",
                          border: "none",
                          padding: "0.8rem 2rem",
                          display: "inline-block",
                        }}
                      >
                        Initialize Order
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <Skeleton height="100%" borderRadius="16px" />
              )}

              {/* Dots */}
              {banners.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    zIndex: 100,
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlider(i)}
                      style={{
                        width: i === activeSlider ? "28px" : "10px",
                        height: "10px",
                        borderRadius: "5px",
                        background:
                          i === activeSlider
                            ? "var(--primary-color)"
                            : "rgba(255,255,255,0.2)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Terminal Performance Metrics */}
      <section
        style={{
          padding: "4rem 0",
          background:
            "linear-gradient(180deg, transparent, rgba(102,252,241,0.02), transparent)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              icon: Globe,
              label: "Global Node Traffic",
              val: "1.2GB/s",
              color: "var(--primary-color)",
            },
            {
              icon: Activity,
              label: "Active Module Sync",
              val: "99.98%",
              color: "var(--secondary-color)",
            },
            {
              icon: Cpu,
              label: "Neural Load",
              val: "12.4 PFLOPS",
              color: "var(--primary-color)",
            },
            {
              icon: Server,
              label: "Encrypted Sectors",
              val: "4,092",
              color: "var(--secondary-color)",
            },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center", padding: "1rem" }}>
              <stat.icon
                size={32}
                color={stat.color}
                style={{ marginBottom: "1rem", opacity: 0.8 }}
              />
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  marginBottom: "0.25rem",
                }}
              >
                {stat.val}
              </h3>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Special Deals Header Section */}
      <section style={{ padding: "1.5rem 0" }}>
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  {box.desc}
                </h4>
              </div>
              <ArrowRight size={24} color="rgba(255,255,255,0.2)" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Deal of the Day */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <div
            className="deal-grid"
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
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "200px",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Image
                      src={dealProduct.images?.[0] || "/placeholder.jpg"}
                      alt={dealProduct.name}
                      fill
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>
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
              ) : loading ? (
                <div style={{ textAlign: "center" }}>
                  <Skeleton
                    height="200px"
                    borderRadius="12px"
                    style={{ marginBottom: "1.5rem" }}
                  />
                  <Skeleton
                    width="80%"
                    height="20px"
                    style={{ margin: "0 auto 1rem" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Skeleton width="60px" height="25px" />
                    <Skeleton width="60px" height="25px" />
                  </div>
                  <Skeleton width="100%" height="45px" borderRadius="8px" />
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
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Image
                          src={prod.images?.[0] || "/placeholder.jpg"}
                          alt={prod.name}
                          fill
                          style={{
                            objectFit: "contain",
                          }}
                        />
                      </div>
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
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "3rem",
            }}
          >
            <div>
              <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
                Department Catalog
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Access secure hardware sectors across the global grid.
              </p>
            </div>
            <Link
              href="/products"
              style={{
                color: "var(--primary-color)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              VIEW ALL SECTORS &rarr;
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "2rem",
            }}
          >
            {categories.length > 0
              ? categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="category-card"
                    style={{
                      padding: "2rem 1.5rem",
                      textAlign: "center",
                      transition:
                        "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      display: "block",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        margin: "0 auto 1.5rem",
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <Image
                        src={
                          cat.image ||
                          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={cat.name ? `${cat.name} category` : "Category"}
                        width={70}
                        height={70}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                        sizes="70px"
                        priority={false}
                      />
                    </div>
                    <h4
                      style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {cat.name}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        opacity: 0.6,
                      }}
                    >
                      Module Access
                    </p>
                  </Link>
                ))
              : Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="glass-panel"
                      style={{ padding: "2rem 1.5rem", textAlign: "center" }}
                    >
                      <Skeleton
                        width="70px"
                        height="70px"
                        circle
                        style={{ margin: "0 auto 1.5rem" }}
                      />
                      <Skeleton
                        width="60%"
                        height="15px"
                        style={{ margin: "0 auto 0.5rem" }}
                      />
                      <Skeleton
                        width="40%"
                        height="10px"
                        style={{ margin: "0 auto" }}
                      />
                    </div>
                  ))}
          </div>
        </div>
      </section>

      {/* NEW: 6. Partner Manufacturing Ecosystem */}
      <section
        style={{
          padding: "4rem 0",
          background: "rgba(0,0,0,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "var(--text-secondary)",
              letterSpacing: "3px",
              marginBottom: "3rem",
              textTransform: "uppercase",
            }}
          >
            Strategic Hardware Partners
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "4rem",
              alignItems: "center",
              opacity: 0.4,
            }}
          >
            {[
              "CYBERDYNE",
              "TYRELL CORP",
              "WEYLAND-YUTANI",
              "OSCORP",
              "STARK TECH",
            ].map((brand) => (
              <span
                key={brand}
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  letterSpacing: "4px",
                }}
              >
                {brand}
              </span>
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
