"use client";

import { fetchApi } from "@/utils/api";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

type Banner = {
  id: string;
  title: string;
  tagline?: string;
  desc?: string;
  price?: string;
  image: string;
  color?: string;
  link?: string;
  isActive: boolean;
  order: number;
};

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/banner/admin/all");
      setBanners(res.data || []);
    } catch (err) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleEdit = (banner: Banner) => {
    setCurrentBanner(banner);
    setIsEditing(true);
    setSelectedFile(null);
  };

  const handleAddNew = () => {
    setCurrentBanner({
      title: "",
      tagline: "",
      desc: "",
      price: "",
      color: "#66fcf1",
      link: "/products",
      isActive: true,
      order: 0
    });
    setIsEditing(true);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to terminate this visual transmission? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--error-color)",
      cancelButtonColor: "#333",
      confirmButtonText: "Yes, delete it!",
      background: "#1f2833",
      color: "#fff",
      customClass: {
        popup: "glass-panel"
      }
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/banner/delete/${id}`, { method: "DELETE" });
        toast.success("Banner deleted successfully");
        loadBanners();
      } catch (err) {
        toast.error("Deletion failed");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBanner?.title) return toast.error("Title is required");
    if (!currentBanner.id && !selectedFile) return toast.error("Image is required for new banners");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", currentBanner.title);
      formData.append("tagline", currentBanner.tagline || "");
      formData.append("desc", currentBanner.desc || "");
      formData.append("price", currentBanner.price || "");
      formData.append("color", currentBanner.color || "#66fcf1");
      formData.append("link", currentBanner.link || "/products");
      formData.append("order", String(currentBanner.order || 0));
      formData.append("isActive", String(currentBanner.isActive));
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const url = currentBanner.id 
        ? `/banner/update/${currentBanner.id}` 
        : "/banner/create";
      
      const method = currentBanner.id ? "PUT" : "POST";

      const data = await fetchApi(url, {
        method,
        body: formData
      });

      if (data.success) {
        toast.success(currentBanner.id ? "Banner updated" : "Banner created");
        setIsEditing(false);
        loadBanners();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Banner Console</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage the visual transmissions displayed on the primary homepage terminal.</p>
        </div>
        {!isEditing && (
          <button onClick={handleAddNew} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Initialize New Banner
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="glass-panel" style={{ padding: "2rem", maxWidth: "800px", border: "1px solid var(--primary-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{currentBanner?.id ? "Modify Banner Specs" : "Draft New Visual"}</h2>
            <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label className="label">Primary Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={currentBanner?.title} 
                  onChange={e => setCurrentBanner({...currentBanner, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label">Technical Tagline</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={currentBanner?.tagline} 
                  onChange={e => setCurrentBanner({...currentBanner, tagline: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label">System Description</label>
              <textarea 
                className="input-field" 
                style={{ minHeight: "100px", resize: "vertical" }}
                value={currentBanner?.desc} 
                onChange={e => setCurrentBanner({...currentBanner, desc: e.target.value})}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label className="label">Price/Label</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. From $1,299"
                  value={currentBanner?.price} 
                  onChange={e => setCurrentBanner({...currentBanner, price: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Accent Color (HEX)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input 
                    type="color" 
                    style={{ width: "42px", height: "42px", padding: "0", border: "none", background: "none", cursor: "pointer" }}
                    value={currentBanner?.color} 
                    onChange={e => setCurrentBanner({...currentBanner, color: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="input-field" 
                    value={currentBanner?.color} 
                    onChange={e => setCurrentBanner({...currentBanner, color: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="label">Navigation Link</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={currentBanner?.link} 
                  onChange={e => setCurrentBanner({...currentBanner, link: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "end" }}>
              <div>
                <label className="label">Visual Asset (Image)</label>
                <input 
                  type="file" 
                  className="input-field" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  accept="image/*"
                />
                {currentBanner?.image && !selectedFile && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>Current asset is active</p>
                )}
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Sequence Order</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={currentBanner?.order} 
                    onChange={e => setCurrentBanner({...currentBanner, order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input 
                    type="checkbox" 
                    checked={currentBanner?.isActive} 
                    onChange={e => setCurrentBanner({...currentBanner, isActive: e.target.checked})}
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="label" style={{ marginBottom: 0, cursor: "pointer" }}>Active Transmission</label>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Abort Change</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Synchronizing..." : "Commit Specs"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>Recalibrating Banner Database...</div>
          ) : banners.length === 0 ? (
            <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
              <p>No visual banners found in the system. Initialize your first transmission.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="glass-panel" style={{ 
                padding: "1.25rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "2rem",
                borderLeft: `4px solid ${banner.isActive ? banner.color : '#333'}`,
                opacity: banner.isActive ? 1 : 0.6
              }}>
                <div style={{ width: "120px", height: "70px", borderRadius: "8px", overflow: "hidden", background: "#000", flexShrink: 0 }}>
                  <img src={banner.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{banner.title}</h3>
                    {banner.isActive ? <Eye size={14} color="var(--primary-color)" /> : <EyeOff size={14} color="var(--error-color)" />}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{banner.tagline || 'No Tagline'}</p>
                </div>

                <div style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: "0.8rem", minWidth: "100px" }}>
                   <p>Order: {banner.order}</p>
                   <p style={{ color: banner.color }}>{banner.color}</p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={banner.link} target="_blank" rel="noreferrer" style={{ 
                    padding: "0.5rem", borderRadius: "6px", background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)"
                  }}>
                    <ExternalLink size={18} />
                  </a>
                  <button onClick={() => handleEdit(banner)} style={{ 
                    padding: "0.5rem", borderRadius: "6px", background: "rgba(102,252,241,0.1)", color: "var(--primary-color)", border: "none", cursor: "pointer"
                  }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} style={{ 
                    padding: "0.5rem", borderRadius: "6px", background: "rgba(255,75,75,0.1)", color: "var(--error-color)", border: "none", cursor: "pointer"
                  }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
