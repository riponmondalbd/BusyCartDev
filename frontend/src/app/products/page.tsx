"use client";

import Skeleton from "@/components/Skeleton";
import { fetchApi } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

type ProductSummary = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  images?: string[];
  categoryId?: string | null;
  color?: string | null;
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [activeColor, setActiveColor] = useState<string>("all");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxInventoryPrice, setMaxInventoryPrice] = useState(10000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sort = searchParams.get("sort") || "newest";
        const deals = searchParams.get("deals") || "false";
        const categorySlug = searchParams.get("category");
        const q = searchParams.get("search") || "";

        let apiUrl = `/product/products?limit=200&sort=${sort}&deals=${deals}`;
        if (categorySlug) apiUrl += `&category=${categorySlug}`;
        if (q) apiUrl += `&search=${encodeURIComponent(q)}`;

        const [catsRes, prodsRes] = await Promise.all([
          fetchApi("/category/all").catch(() => ({ data: [] })),
          fetchApi(apiUrl).catch(() => ({ data: [] })),
        ]);

        const cats = Array.isArray(catsRes) ? catsRes : catsRes.data || [];
        const prods = Array.isArray(prodsRes) ? prodsRes : prodsRes.data || [];

        setCategories(cats);
        setProducts(prods);

        // Set dynamic price bounds based on current inventory
        if (prods.length > 0) {
          const highestPrice = Math.ceil(
            Math.max(...prods.map((p: any) => Number(p.price) || 0)),
          );
          setMaxInventoryPrice(highestPrice);
          setPriceRange([0, highestPrice]);
        }

        if (q) setSearchQuery(q);
        if (deals === "true") setDealsOnly(true);
        if (sort) setSortOption(sort);

        if (categorySlug) {
          const cat = cats.find(
            (c: CategorySummary) => c.slug === categorySlug,
          );
          if (cat) setActiveCategory(cat.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Reset to page 1 when filters or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortOption, activeColor, priceRange]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.categoryId === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesColor =
      activeColor === "all" ||
      (p.color && String(p.color).toLowerCase() === activeColor.toLowerCase());
    const matchesPrice =
      Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1];
    return matchesCategory && matchesSearch && matchesColor && matchesPrice;
  });

  const availableColors = Array.from(
    new Set(
      products
        .map((p) => (p.color ? String(p.color).trim() : ""))
        .filter((color) => color.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    const colorA = String(a.color || "").toLowerCase();
    const colorB = String(b.color || "").toLowerCase();

    if (sortOption === "price_low_high") return priceA - priceB;
    if (sortOption === "price_high_low") return priceB - priceA;
    if (sortOption === "color_a_z") return colorA.localeCompare(colorB);
    if (sortOption === "color_z_a") return colorB.localeCompare(colorA);
    return 0;
  });

  // Pagination logic
  const itemsPerPage = 20;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div
          className="glass-panel"
          style={{
            padding: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(31, 40, 51, 0.9) 0%, rgba(11, 12, 16, 0.9) 100%)",
            border: "1px solid rgba(102, 252, 241, 0.1)",
          }}
        >
          <div style={{ maxWidth: "800px" }}>
            <h1
              className="responsive-title"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                color: "var(--text-primary)",
                marginBottom: "0.75rem",
                letterSpacing: "-1px",
              }}
            >
              {searchParams.get("deals") === "true"
                ? "HOT DEALS"
                : searchParams.get("sort") === "newest"
                  ? "NEW ARRIVALS"
                  : searchParams.get("sort") === "bestseller"
                    ? "BESTSELLERS"
                    : activeCategory !== "all"
                      ? categories
                          .find((c) => c.id === activeCategory)
                          ?.name?.toUpperCase() || "CATEGORY"
                      : "CORE INVENTORY"}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
                opacity: 0.8,
              }}
            >
              {searchParams.get("deals") === "true"
                ? "Premium modules at calibrated price points."
                : "Browse the complete futuristic collection of high-performance modules."}
            </p>
          </div>
          <div
            style={{ width: "100%", maxWidth: "600px", position: "relative" }}
          >
            <input
              type="text"
              className="input-field"
              placeholder="Query the database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(0,0,0,0.4)",
                padding: "1.25rem 2rem",
                borderRadius: "50px",
                width: "100%",
                border: "1px solid var(--border-color)",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                textAlign: "center",
              }}
            />
          </div>
        </div>

        <div
          className="products-layout"
          style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}
        >
          {/* Filters Sidebar */}
          <aside
            className="glass-panel hidden-mobile"
            style={{
              width: "280px",
              padding: "2rem",
              flexShrink: 0,
              position: "sticky",
              top: "100px",
              display: "flex",
              flexDirection: "column",
              gap: "3rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  color: "var(--primary-color)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                  display: "block",
                }}
              >
                Sectors
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={() => setActiveCategory("all")}
                  style={{
                    background: "none",
                    border: "none",
                    color:
                      activeCategory === "all"
                        ? "var(--primary-color)"
                        : "var(--text-secondary)",
                    textAlign: "left",
                    padding: "0.5rem 0",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    transition: "0.2s",
                    display: "block",
                    width: "100%",
                  }}
                >
                  All Modules
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color:
                        activeCategory === cat.id
                          ? "var(--primary-color)"
                          : "var(--text-secondary)",
                      textAlign: "left",
                      padding: "0.5rem 0",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      transition: "0.2s",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  color: "var(--primary-color)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                  display: "block",
                }}
              >
                Configuration
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 700,
                    }}
                  >
                    SORT PRIORITY
                  </label>
                  <select
                    className="input-field"
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      width: "100%",
                    }}
                  >
                    <option value="default">Release Date</option>
                    <option value="price_low_high">Price: Low to High</option>
                    <option value="price_high_low">Price: High to Low</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 700,
                    }}
                  >
                    COLOR THEME
                  </label>
                  <select
                    className="input-field"
                    value={activeColor}
                    onChange={(event) => setActiveColor(event.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      width: "100%",
                    }}
                  >
                    <option value="all">All Specs</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        fontWeight: 700,
                      }}
                    >
                      PRICE RANGE
                    </label>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--primary-color)",
                        fontWeight: 800,
                      }}
                    >
                      ${priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxInventoryPrice}
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    style={{
                      width: "100%",
                      accentColor: "var(--primary-color)",
                      height: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      $0
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ${maxInventoryPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "2rem",
                }}
              >
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="glass-panel"
                      style={{ padding: "1.25rem", height: "350px" }}
                    >
                      <Skeleton
                        height="180px"
                        borderRadius="8px"
                        style={{ marginBottom: "1rem" }}
                      />
                      <Skeleton
                        height="15px"
                        width="40%"
                        style={{ marginBottom: "0.5rem" }}
                      />
                      <Skeleton
                        height="25px"
                        width="80%"
                        style={{ marginBottom: "1rem" }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "auto",
                        }}
                      >
                        <Skeleton height="25px" width="30%" />
                        <Skeleton
                          height="25px"
                          width="30%"
                          borderRadius="6px"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div style={{ flex: 1 }}>
                <div
                  className="product-grid-5"
                  style={{
                    marginBottom: "2rem",
                  }}
                >
                  {paginatedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="glass-panel"
                      style={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        background: "rgba(255,255,255,0.02)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.borderColor =
                          "var(--primary-color)";
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.05)";
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.02)";
                      }}
                    >
                      <div
                        style={{
                          height: "180px",
                          background: "#000",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        {prod.images && prod.images[0] ? (
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              style={{
                                objectFit: "cover",
                                opacity: 0.85,
                              }}
                            />
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.7rem",
                            }}
                          >
                            DATA_MISSING
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          padding: "1.25rem",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            color: "var(--primary-color)",
                            textTransform: "uppercase",
                            marginBottom: "0.5rem",
                            letterSpacing: "1px",
                          }}
                        >
                          {categories.find((c) => c.id === prod.categoryId)
                            ?.name || "MODULE"}
                        </p>
                        <h3
                          style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            marginBottom: "0.75rem",
                            color: "var(--text-primary)",
                            lineHeight: 1.3,
                            height: "2.6rem",
                            overflow: "hidden",
                          }}
                        >
                          {prod.name}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "auto",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 900,
                              color: "#fff",
                            }}
                          >
                            ${prod.price}
                          </span>
                          <Link
                            href={`/products/${prod.id}`}
                            className="btn-primary"
                            style={{
                              padding: "0.4rem 0.8rem",
                              fontSize: "0.75rem",
                              borderRadius: "6px",
                              background: "none",
                              border: "1px solid var(--primary-color)",
                              color: "var(--primary-color)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--primary-color)";
                              e.currentTarget.style.color = "#000";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.color =
                                "var(--primary-color)";
                            }}
                          >
                            INITIATE
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "2rem",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background:
                        currentPage === 1
                          ? "rgba(255,255,255,0.05)"
                          : "var(--primary-color)",
                      color:
                        currentPage === 1
                          ? "rgba(255,255,255,0.4)"
                          : "var(--bg-color)",
                      border: "none",
                      borderRadius: "8px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      transition: "all 0.3s ease",
                    }}
                  >
                    ← PREVIOUS
                  </button>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                          padding: "0.5rem 0.85rem",
                          background:
                            currentPage === i + 1
                              ? "var(--primary-color)"
                              : "rgba(255,255,255,0.08)",
                          color:
                            currentPage === i + 1
                              ? "var(--bg-color)"
                              : "rgba(255,255,255,0.6)",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                          minWidth: "36px",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background:
                        currentPage === totalPages
                          ? "rgba(255,255,255,0.05)"
                          : "var(--primary-color)",
                      color:
                        currentPage === totalPages
                          ? "rgba(255,255,255,0.4)"
                          : "var(--bg-color)",
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      transition: "all 0.3s ease",
                    }}
                  >
                    NEXT →
                  </button>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Page {currentPage} of {totalPages} ({sortedProducts.length}{" "}
                  total products)
                </div>
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{ padding: "4rem", textAlign: "center" }}
              >
                <h3
                  style={{ color: "var(--text-secondary)", fontSize: "1.5rem" }}
                >
                  No modules found matching your query.
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <ProductsPageContent />
    </Suspense>
  );
}
