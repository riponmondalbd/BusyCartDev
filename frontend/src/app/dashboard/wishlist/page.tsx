'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { Heart, ShoppingCart, Trash2, PackageSearch } from 'lucide-react';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi('/wishlist/all');
        setWishlist(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      await fetchApi(`/wishlist/remove/${productId}`, { method: 'DELETE' });
      setWishlist(wishlist.filter(item => item.productId !== productId));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Saved Modules</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal collection of bookmarked components.</p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-color)' }}>Accessing storage matrix...</div>
      ) : wishlist.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <PackageSearch size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your wishlist is currently empty.</p>
          <Link href="/products" className="btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wishlist.map((item) => (
            <div key={item.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'var(--glass-border)' }}>
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Heart size={40} color="var(--border-color)" />
                )}
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.product?.name}</h3>
                <p style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1.25rem' }}>${item.product?.price}</p>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                  <Link href={`/products/${item.product?.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    View
                  </Link>
                  <button 
                    onClick={() => removeFromWishlist(item.productId)}
                    style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.2)', color: 'var(--error-color)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,75,75,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,75,75,0.1)'}
                  >
                    <Trash2 size={18} />
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
