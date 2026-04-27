"use client";

import { fetchApi } from "@/utils/api";
import {
  Box,
  Image as ImageIcon,
  LayoutGrid,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";
import toast from "react-hot-toast";

export default function InventoryHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products",
  );
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    discount: "",
  });
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const productFileRef = useRef<HTMLInputElement>(null);

  // Category Form State
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [categoryFile, setCategoryFile] = useState<File | null>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetchApi("/product/products").catch(() => ({ data: [] })),
        fetchApi("/category/all").catch(() => ({ data: [] })),
      ]);
      setProducts(prodsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Product Actions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("stock", productForm.stock);
      formData.append("categoryId", productForm.categoryId);
      formData.append("discount", productForm.discount || "0");

      productFiles.forEach((file) => formData.append("images", file));

      if (editingProduct) {
        await fetchApi(`/product/products/${editingProduct.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await fetchApi("/product/create", { method: "POST", body: formData });
      }

      await loadData();
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        discount: "",
      });
      setProductFiles([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Category Actions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryForm.name);
      formData.append("slug", categoryForm.slug);
      if (categoryFile) formData.append("image", categoryFile);

      if (editingCategory) {
        await fetchApi(`/category/update/${editingCategory.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await fetchApi("/category/create", { method: "POST", body: formData });
      }

      await loadData();
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "" });
      setCategoryFile(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will delete the category and all its products.",
      )
    )
      return;
    try {
      await fetchApi(`/category/delete/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetchApi(`/product/products/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          Inventory Architect
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          System-wide management for categories and product modules.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            background:
              activeTab === "products"
                ? "var(--primary-color)"
                : "rgba(255,255,255,0.03)",
            color: activeTab === "products" ? "#0b0c10" : "var(--text-primary)",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            transition: "0.2s",
          }}
        >
          <Box size={18} /> Product Catalog
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            background:
              activeTab === "categories"
                ? "var(--primary-color)"
                : "rgba(255,255,255,0.03)",
            color:
              activeTab === "categories" ? "#0b0c10" : "var(--text-primary)",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            transition: "0.2s",
          }}
        >
          <LayoutGrid size={18} /> Categories
        </button>
      </div>

      {/* Product View */}
      {activeTab === "products" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "1.5rem",
            }}
          >
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Plus size={18} /> Create Product
            </button>
          </div>

          {showProductForm && (
            <div
              className="glass-panel"
              style={{
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid var(--primary-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ fontSize: "1.4rem" }}>
                  {editingProduct ? "Edit Module" : "Forge New Module"}
                </h2>
                <button
                  onClick={() => setShowProductForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleProductSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label className="label">Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Stock</label>
                    <input
                      type="number"
                      className="input-field"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Discount (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={productForm.discount}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input-field"
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          categoryId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Description</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div style={{ marginBottom: "2rem" }}>
                  <label className="label">Image Modules (Max 5)</label>
                  <div
                    onClick={() => productFileRef.current?.click()}
                    style={{
                      padding: "2rem",
                      border: "2px dashed var(--border-color)",
                      borderRadius: "12px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--primary-color)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--border-color)")
                    }
                  >
                    <UploadCloud
                      size={32}
                      color="var(--primary-color)"
                      style={{ marginBottom: "1rem" }}
                    />
                    <p style={{ color: "var(--text-secondary)" }}>
                      {productFiles.length > 0
                        ? `${productFiles.length} files selected`
                        : "Drag or click to upload visuals"}
                    </p>
                    <input
                      type="file"
                      multiple
                      ref={productFileRef}
                      hidden
                      onChange={(e) =>
                        setProductFiles(Array.from(e.target.files || []))
                      }
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Processing..."
                      : editingProduct
                        ? "Save Changes"
                        : "Initialize Product"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="glass-panel" style={{ overflow: "hidden" }}>
                  <Skeleton height="180px" />
                  <div style={{ padding: "1.25rem" }}>
                    <Skeleton width="70%" height="20px" style={{ marginBottom: "0.5rem" }} />
                    <Skeleton width="100%" height="15px" style={{ marginBottom: "1rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Skeleton height="35px" style={{ flex: 1 }} borderRadius="8px" />
                      <Skeleton height="35px" style={{ flex: 1 }} borderRadius="8px" />
                    </div>
                  </div>
                </div>
              ))
            ) : products.map((p) => (
              <div
                key={p.id}
                className="glass-panel"
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    height: "180px",
                    background: "rgba(255,255,255,0.02)",
                    position: "relative",
                  }}
                >
                  {p.images?.[0] ? (
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <ImageIcon
                      size={40}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                      }}
                    />
                  )}
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {p.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "var(--primary-color)",
                      fontWeight: 700,
                      marginBottom: "1rem",
                    }}
                  >
                    <span>${p.price}</span>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      Stock: {p.stock}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({
                            name: p.name,
                            description: p.description || "",
                            price: p.price.toString(),
                            stock: p.stock.toString(),
                            categoryId: p.categoryId,
                            discount: p.discount?.toString() || "",
                          });
                          setShowProductForm(true);
                        }}
                        aria-label={`Edit ${p.name}`}
                        style={{
                          flex: 1,
                          padding: "0.6rem",
                          borderRadius: "8px",
                          border: "1px solid var(--border-color)",
                          background: "rgba(255,255,255,0.03)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        aria-label={`Delete ${p.name}`}
                        style={{
                          flex: 1,
                          padding: "0.6rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,75,75,0.3)",
                          background: "rgba(255,75,75,0.05)",
                          color: "var(--error-color)",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category View */}
      {activeTab === "categories" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "1.5rem",
            }}
          >
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Plus size={18} /> New Category
            </button>
          </div>

          {showCategoryForm && (
            <div
              className="glass-panel"
              style={{
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid var(--primary-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ fontSize: "1.4rem" }}>
                  {editingCategory
                    ? "Modify Category"
                    : "Establish New Category"}
                </h2>
                <button
                  onClick={() => setShowCategoryForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCategorySubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <label className="label">Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Slug</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="electronics-gadgets"
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          slug: e.target.value.toLowerCase().replace(/ /g, "-"),
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "2rem" }}>
                  <label className="label">Cover Visual</label>
                  <div
                    onClick={() => categoryFileRef.current?.click()}
                    style={{
                      padding: "2rem",
                      border: "2px dashed var(--border-color)",
                      borderRadius: "12px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <UploadCloud
                      size={32}
                      color="var(--primary-color)"
                      style={{ marginBottom: "1rem" }}
                    />
                    <p style={{ color: "var(--text-secondary)" }}>
                      {categoryFile
                        ? categoryFile.name
                        : "Click to upload category cover"}
                    </p>
                    <input
                      type="file"
                      ref={categoryFileRef}
                      hidden
                      onChange={(e) =>
                        setCategoryFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Processing..."
                      : editingCategory
                        ? "Update Category"
                        : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((c) => (
              <div
                key={c.id}
                className="glass-panel"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                    background: c.image
                      ? `url(${c.image}) center/cover`
                      : "rgba(255,255,255,0.05)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{c.name}</p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.8rem",
                      alignItems: "center",
                      marginTop: "0.2rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {c.slug}
                    </p>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: "rgba(102,252,241,0.1)",
                        color: "var(--primary-color)",
                        padding: "0.1rem 0.5rem",
                        borderRadius: "10px",
                        fontWeight: 600,
                      }}
                    >
                      {products.filter((p) => p.categoryId === c.id).length}{" "}
                      Modules
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={() => {
                      setEditingCategory(c);
                      setCategoryForm({ name: c.name, slug: c.slug });
                      setShowCategoryForm(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-color)",
                      cursor: "pointer",
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--error-color)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; transition: 0.2s; font-weight: 600; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
