'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlistItems = async () => {
      try {
        const savedIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (savedIds.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // Fetch all products and filter locally (simplest for now)
        const res = await fetchApi('/product/products');
        const allProducts = Array.isArray(res) ? res : res.data || [];
        
        const filtered = allProducts.filter((p: any) => savedIds.includes(p.id));
        setWishlistProducts(filtered);
      } catch (err) {
        console.error('Error loading wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistItems();
  }, []);

  const removeItem = (id: string) => {
    const savedIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const nextIds = savedIds.filter((sid: string) => sid !== id);
    localStorage.setItem('wishlist', JSON.stringify(nextIds));
    setWishlistProducts(prev => prev.filter(p => p.id !== id));
    
    // Notify other components (Navbar)
    window.dispatchEvent(new CustomEvent('wishlist-update', { detail: nextIds.length }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(102,252,241,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Synchronizing Saved Modules...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>Saved Modules</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your curated selection of futuristic hardware.</p>
        </div>
        <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: 700 }}>
          <ArrowLeft size={20} /> Back to Catalog
        </Link>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '6rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 2rem' }}>
            <Heart size={40} color="var(--text-secondary)" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>You haven't initialized any modules in your wishlist yet.</p>
          <Link href="/products" className="btn-primary" style={{ padding: '1rem 3rem' }}>Explore Catalog</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {wishlistProducts.map((prod) => (
            <div key={prod.id} className="product-card" style={{ padding: '1.5rem' }}>
              <div className="product-image-wrapper" style={{ height: '220px', marginBottom: '1.5rem' }}>
                <img src={prod.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <button 
                  onClick={() => removeItem(prod.id)}
                  style={{ 
                    position: 'absolute', top: '1rem', right: '1rem', 
                    background: 'rgba(255,75,75,0.1)', border: '1px solid var(--error-color)',
                    color: 'var(--error-color)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer'
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>{prod.category?.name || 'HARDWARE'}</p>
                  <Link href={`/products/${prod.id}`} style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0', display: 'block' }}>{prod.name}</Link>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>${prod.price}</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href={`/products/${prod.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '0.75rem' }}>
                  Inspect
                </Link>
                <button style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--primary-color)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
