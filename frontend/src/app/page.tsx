'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetchApi('/category/all').catch(() => []),
          fetchApi('/product/products').catch(() => [])
        ]);
        
        // Use arrays or wrap in array if backend returns object
        setCategories(Array.isArray(catsRes) ? catsRes.slice(0, 4) : catsRes.data ? catsRes.data.slice(0, 4) : []);
        setProducts(Array.isArray(prodsRes) ? prodsRes.slice(0, 8) : prodsRes.data ? prodsRes.data.slice(0, 8) : []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 0', 
        textAlign: 'center', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(102, 252, 241, 0.15) 0%, transparent 70%)',
          zIndex: -1, borderRadius: '50%'
        }}></div>
        <div className="container">
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Step Into The <span style={{ color: 'var(--primary-color)', textShadow: '0 0 20px rgba(102, 252, 241, 0.4)' }}>Future</span> <br/> Of Shopping
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Experience lightning-fast performance, unparalleled security, and a stunning aesthetic tailored for the modern consumer.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/products" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'rgba(102, 252, 241, 0.1)' }}>
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container" style={{ padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></span>
          Top Categories
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass-panel" style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Scanning...</span>
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((cat: any) => (
              <Link href={`/products?category=${cat.id}`} key={cat.id} className="glass-panel" style={{ 
                padding: '2rem', textAlign: 'center', transition: 'transform 0.3s ease', cursor: 'pointer'
              }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{cat.name}</h3>
              </Link>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No categories found. System empty.</p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ padding: '4rem 2rem', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></span>
            New Arrivals
          </h2>
          <Link href="/products" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>View All Items &rarr;</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="glass-panel" style={{ height: '350px' }}></div>
            ))
          ) : products.length > 0 ? (
            products.map((prod: any) => (
              <div key={prod.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'var(--glass-border)' }}>
                   {prod.images && prod.images[0] ? (
                     <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <span style={{ color: 'var(--text-secondary)' }}>[Image Data Missing]</span>
                   )}
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{prod.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>
                    {prod.description?.substring(0, 60)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>${prod.price}</span>
                    <Link href={`/products/${prod.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>No products available in the database.</p>
          )}
        </div>
      </section>
    </div>
  );
}
