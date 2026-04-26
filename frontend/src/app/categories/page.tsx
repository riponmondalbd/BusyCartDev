'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { ChevronRight, LayoutGrid } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const result = await fetchApi('/category/all');
        // Backend returns { success: true, data: [...] }
        setCategories(result.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    getCategories();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(102,252,241,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Explore Categories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse our curated selection of futuristic products across multiple specialized departments.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ 
              height: '350px', 
              position: 'relative', 
              overflow: 'hidden', 
              transition: 'transform 0.3s ease, border-color 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}>
              {/* Category Image */}
              <div style={{ 
                height: '100%', 
                width: '100%', 
                background: cat.image ? `url(${cat.image}) center/cover` : 'rgba(255,255,255,0.05)',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0
              }} />
              
              {/* Gradient Overlay */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(11,12,16,0.95) 20%, rgba(11,12,16,0.2))',
                zIndex: 1
              }} />

              {/* Content */}
              <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                padding: '2rem', 
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
                  <LayoutGrid size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Department</span>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>{cat.name}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginTop: '1rem',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  View Collection <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
