'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Check } from 'lucide-react';

export default function SuperAdminInventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', discount: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [prodsRes, catsRes] = await Promise.all([
          fetchApi('/product/products').catch(() => []),
          fetchApi('/category/all').catch(() => []),
        ]);
        setProducts(Array.isArray(prodsRes) ? prodsRes : prodsRes.data || []);
        setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('403')) router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const resetForm = () => { setForm({ name: '', description: '', price: '', stock: '', categoryId: '', discount: '' }); setEditingProduct(null); setShowForm(false); };

  const openEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, categoryId: p.categoryId || '', discount: p.discount || '' });
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), discount: parseFloat(form.discount || '0') };
    try {
      if (editingProduct) {
        await fetchApi(`/product/products/${editingProduct.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
      } else {
        const res = await fetchApi('/product/create', { method: 'POST', body: JSON.stringify(payload) });
        setProducts([res.data || res, ...products]);
      }
      resetForm();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product from the inventory?')) return;
    try {
      await fetchApi(`/product/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Inventory Architect</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{products.length} products in the database</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Plus size={18} /> New Product
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { key: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Quantum Processor X' },
                { key: 'price', label: 'Price ($)', type: 'number', placeholder: '99.99' },
                { key: 'stock', label: 'Stock Quantity', type: 'number', placeholder: '100' },
                { key: 'discount', label: 'Discount (%)', type: 'number', placeholder: '0' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</label>
                  <input type={type} className="input-field" placeholder={placeholder}
                    value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key !== 'discount'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</label>
                <select className="input-field" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description</label>
              <textarea className="input-field" placeholder="Describe this product module..." rows={3}
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} /> {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-color)' }}>Loading inventory...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {products.map(p => (
            <div key={p.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ height: '160px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'var(--glass-border)' }}>
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ImageIcon size={40} color="var(--border-color)" />}
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>${p.price}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stock: {p.stock}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => openEdit(p)}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: 'rgba(102,252,241,0.08)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,75,75,0.08)', border: '1px solid rgba(255,75,75,0.3)', color: 'var(--error-color)', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
