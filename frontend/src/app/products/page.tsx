"use client";

import { fetchApi } from "@/utils/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetchApi("/category/all").catch(() => ({ data: [] })),
          fetchApi("/product/products").catch(() => ({ data: [] })),
        ]);

        const cats = Array.isArray(catsRes) ? catsRes : catsRes.data || [];
        const prods = Array.isArray(prodsRes) ? prodsRes : prodsRes.data || [];

        setCategories(cats);
        setProducts(prods);

        // Check for search query in URL
        const q = searchParams.get("search");
        if (q) setSearchQuery(q);

        // Check for category slug in URL
        const categorySlug = searchParams.get("category");
        if (categorySlug) {
          const cat = cats.find((c: any) => c.slug === categorySlug);
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

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.categoryId === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header & Search */}
        <div
          className="glass-panel"
          style={{
            padding: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Core Inventory
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Browse the complete futuristic collection
            </p>
          </div>
          <div style={{ flex: "1 1 300px", maxWidth: "500px" }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by product name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(0,0,0,0.3)",
                padding: "1rem 1.5rem",
                borderRadius: "30px",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
          {/* Filters Sidebar */}
          <aside
            className="glass-panel"
            style={{ width: "250px", padding: "1.5rem", flexShrink: 0 }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "0.75rem",
              }}
            >
              Categories
            </h3>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <li>
                <button
                  onClick={() => setActiveCategory("all")}
                  style={{
                    background: "none",
                    border: "none",
                    color:
                      activeCategory === "all"
                        ? "var(--primary-color)"
                        : "var(--text-secondary)",
                    fontWeight: activeCategory === "all" ? "bold" : "normal",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontSize: "1rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color:
                        activeCategory === cat.id
                          ? "var(--primary-color)"
                          : "var(--text-secondary)",
                      fontWeight: activeCategory === cat.id ? "bold" : "normal",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      fontSize: "1rem",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
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
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="glass-panel"
                      style={{ height: "350px" }}
                    ></div>
                  ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "2rem",
                }}
              >
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="glass-panel"
                    style={{
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        height: "200px",
                        background: "rgba(255,255,255,0.02)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderBottom: "var(--glass-border)",
                      }}
                    >
                      {prod.images && prod.images[0] ? (
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ color: "var(--text-secondary)" }}>
                          [Image Data Missing]
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        padding: "1.5rem",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.2rem",
                          marginBottom: "0.5rem",
                          color: "var(--text-primary)",
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
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "var(--primary-color)",
                          }}
                        >
                          ${prod.price}
                        </span>
                        <Link
                          href={`/products/${prod.id}`}
                          className="btn-primary"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
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
