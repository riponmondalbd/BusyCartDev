'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { Tag, Plus, Trash2, Percent } from 'lucide-react';

export default function SuperAdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discountValue: '', discountType: 'PERCENTAGE', expiresAt: '', usageLimit: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi('/coupon/all');
        setCoupons(Array.isArray(res) ? res : res.data || []);
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('403')) router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, discountValue: parseFloat(form.discountValue), usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null };
      const res = await fetchApi('/coupon/create', { method: 'POST', body: JSON.stringify(payload) });
      setCoupons([res.data || res, ...coupons]);
      setForm({ code: '', discountValue: '', discountType: 'PERCENTAGE', expiresAt: '', usageLimit: '' });
      setShowForm(false);
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this coupon?')) return;
    try {
      await fetchApi(`/coupon/delete/${id}`, { method: 'DELETE' });
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Promotional Codes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Generate and manage discount tokens</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Plus size={18} /> Generate Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--error-color)' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>New Promotional Token</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code</label>
                <input type="text" className="input-field" placeholder="SUMMER20" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Discount Value</label>
                <input type="number" className="input-field" placeholder="20" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type</label>
                <select className="input-field" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expires At</label>
                <input type="datetime-local" className="input-field" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Usage Limit</label>
                <input type="number" className="input-field" placeholder="Unlimited" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>Deploy Token</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-color)' }}>Scanning coupon matrix...</div>
      ) : coupons.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No coupons deployed yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {coupons.map(c => (
            <div key={c.id} className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(255,75,75,0.2)', position: 'relative' }}>
              <button onClick={() => handleDelete(c.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,75,75,0.15)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Tag size={20} color="var(--error-color)" />
                </div>
                <h3 style={{ fontFamily: 'monospace', fontSize: '1.4rem', letterSpacing: '2px', color: 'var(--error-color)' }}>{c.code}</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Percent size={12} /> {c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : '$'} off
                </span>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                  Used: {c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ''}
                </span>
              </div>
              {c.expiresAt && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                  Expires: {new Date(c.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
