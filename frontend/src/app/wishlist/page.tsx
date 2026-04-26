'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const res = await fetchApi('/wishlist/all');
      setWishlist(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      if (err.message.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await fetchApi(`/wishlist/remove/${productId}`, { method: 'DELETE' });
      setWishlist(wishlist.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary-color)' }}>Loading Wishlist...</div>;
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>Saved Modules (Wishlist)</h1>

      {wishlist.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your wishlist is empty.</h2>
          <Link href="/products" className="btn-primary">Browse Modules</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {wishlist.map((item) => {
            const prod = item.product;
            if (!prod) return null;
            return (
              <div key={item.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'var(--glass-border)', position: 'relative' }}>
                  <button onClick={() => handleRemove(prod.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontSize: '1.2rem', width: '30px', height: '30px', borderRadius: '50%' }}>
                    &times;
                  </button>
                  {prod.images && prod.images[0] ? (
                    <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>No Image</span>
                  )}
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{prod.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>${prod.price}</span>
                    <Link href={`/products/${prod.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
