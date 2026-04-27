"use client";

import { fetchApi } from "@/utils/api";
import { Clock3, PlusCircle, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ProductSummary = {
  id: string;
  name: string;
  price: number;
  stock: number;
  images?: string[];
};

type DealOfDayRecord = {
  productId: string;
  endsAt: string;
  product?: ProductSummary | null;
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function DealOfDayAdminPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [currentDeal, setCurrentDeal] = useState<DealOfDayRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [form, setForm] = useState({ productId: "", endsAt: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, dealRes] = await Promise.all([
        fetchApi("/product/products?limit=1000").catch(() => ({ data: [] })),
        fetchApi("/deal-of-day/current").catch(() => ({ data: null })),
      ]);

      const loadedProducts = productsRes.data || [];
      const deal = dealRes.data || null;

      setProducts(loadedProducts);
      setCurrentDeal(deal);
      setForm({
        productId: deal?.productId || "",
        endsAt: toDateTimeLocal(deal?.endsAt),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load deal settings";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadData();
    };

    void initialize();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        productId: form.productId,
        endsAt: new Date(form.endsAt).toISOString(),
      };

      const response = await fetchApi("/deal-of-day/current", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setCurrentDeal(response.data || null);
      toast.success("Deal of the day updated");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to save deal";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Remove the current deal of the day?")) return;

    setSaving(true);
    try {
      await fetchApi("/deal-of-day/current", { method: "DELETE" });
      setCurrentDeal(null);
      setForm({ productId: "", endsAt: "" });
      toast.success("Deal removed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to clear deal";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(
    (product) => product.id === form.productId,
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          Deal of the Day
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Set the featured product and the countdown used on the homepage.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.9fr)",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        <div
          className="glass-panel"
          style={{ padding: "2rem", border: "1px solid var(--primary-color)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "0.25rem",
                }}
              >
                Current Deal
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {currentDeal
                  ? "Homepage is using a live deal."
                  : "No active deal has been published yet."}
              </p>
            </div>
            <Sparkles size={22} color="var(--primary-color)" />
          </div>

          {currentDeal ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>Product</span>
                <strong>
                  {currentDeal.product?.name || currentDeal.productId}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>Ends At</span>
                <strong>{new Date(currentDeal.endsAt).toLocaleString()}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>Price</span>
                <strong>${(currentDeal.product?.price || 0).toFixed(2)}</strong>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }}
            >
              Publish a product below to start the countdown on the homepage.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <label className="label">Featured Product</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search product by name"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  style={{ marginBottom: "0.6rem" }}
                />
                <select
                  className="input-field"
                  value={form.productId}
                  onChange={(event) =>
                    setForm({ ...form, productId: event.target.value })
                  }
                  required
                >
                  <option value="">Select a product</option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Countdown Ends At</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.endsAt}
                  onChange={(event) =>
                    setForm({ ...form, endsAt: event.target.value })
                  }
                  required
                />
              </div>
            </div>

            {selectedProduct && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {selectedProduct.images?.[0] ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {selectedProduct.name}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    ${selectedProduct.price.toFixed(2)} base price •{" "}
                    {selectedProduct.stock} in stock
                  </p>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                disabled={saving || loading || !currentDeal}
              >
                <RotateCcw size={16} /> Clear
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                disabled={saving || loading}
              >
                <PlusCircle size={16} /> {saving ? "Saving..." : "Save Deal"}
              </button>
            </div>
          </form>
        </div>

        <div
          className="glass-panel"
          style={{ padding: "2rem", border: "1px solid var(--border-color)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <Clock3 size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              Publishing Notes
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gap: "0.9rem",
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
            }}
          >
            <p>
              Use a future end time so the homepage countdown has visible time
              to run.
            </p>
            <p>
              The same deal is exposed to both admin and super-admin dashboards.
            </p>
            <p>
              The homepage pulls the current deal automatically and updates
              every second.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
