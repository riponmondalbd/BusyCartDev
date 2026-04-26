'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { 
  ShoppingBag, Zap, ShieldCheck, Globe, 
  ChevronLeft, ChevronRight, ArrowRight, 
  Eye, Heart, Star, ShoppingCart, Timer,
  Trophy, TrendingUp, Sparkles, LayoutGrid, Menu,
  Cpu, MousePointer2, Smartphone, Monitor
} from 'lucide-react';

const sliderData = [
  {
    title: "Quantum Series X",
    tagline: "Unleash Pure Performance",
    desc: "The next generation of neural processing is here. Experience zero-latency computing.",
    price: "From $1,299",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    color: "#66fcf1"
  },
  {
    title: "Urban Cyberware",
    tagline: "Future of Street Fashion",
    desc: "Merging high-performance tech with street aesthetics. Water-resistant and neon-integrated.",
    price: "New Collection",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    color: "#ff003c"
  }
];

export default function ElectroMarketplaceHome() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlider, setActiveSlider] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetchApi('/category/all').catch(() => ({ data: [] })),
          fetchApi('/product/products').catch(() => ({ data: [] }))
        ]);
        setCategories(catsRes.data || []);
        setProducts(prodsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      
      {/* 1. Hero Section with Sidebar */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem' }}>
          {/* Vertical Category Sidebar (Electro Style) */}
          <aside className="glass-panel" style={{ width: '280px', flexShrink: 0, padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', fontWeight: 800 }}>
              <LayoutGrid size={20} /> BROWSE SECTORS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {categories.slice(0, 8).map(cat => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} style={{ 
                  padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.02)'
                }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  {cat.name} <ChevronRight size={14} />
                </Link>
              ))}
              <Link href="/categories" style={{ padding: '1rem 1.5rem', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem' }}>View All Categories</Link>
            </div>
          </aside>

          {/* Main Slider */}
          <div style={{ flex: 1, position: 'relative', height: '500px', borderRadius: '16px', overflow: 'hidden' }}>
            {sliderData.map((slide, i) => (
              <div key={i} style={{
                position: 'absolute', inset: 0, opacity: i === activeSlider ? 1 : 0,
                transition: 'opacity 1s ease', display: 'flex', alignItems: 'center'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: `url(${slide.image}) center/cover`, opacity: 0.6 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(11,12,16,0.9) 20%, transparent 80%)' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: '4rem', maxWidth: '500px' }}>
                  <span style={{ color: slide.color, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>{slide.tagline}</span>
                  <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '1rem 0', lineHeight: 1 }}>{slide.title}</h1>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{slide.desc}</p>
                  <Link href="/products" className="btn-primary" style={{ background: slide.color, color: '#000', border: 'none' }}>Initialize Order</Link>
                </div>
              </div>
            ))}
            <div style={{ position: 'absolute', bottom: '2rem', right: '4rem', display: 'flex', gap: '0.75rem' }}>
              {sliderData.map((_, i) => (
                <button key={i} onClick={() => setActiveSlider(i)} style={{ width: i === activeSlider ? '30px' : '10px', height: '10px', borderRadius: '5px', background: i === activeSlider ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: '0.3s' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Special Deals Header Section */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            { title: "Limited Time Offers", color: 'var(--error-color)', desc: "Up to 50% Off Modules" },
            { title: "New Sector Arrivals", color: 'var(--primary-color)', desc: "Latest Hardware Drops" },
            { title: "Refurbished Tech", color: 'var(--secondary-color)', desc: "Eco-Friendly Efficiency" },
          ].map((box, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${box.color}` }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: box.color, marginBottom: '0.25rem' }}>{box.title}</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{box.desc}</h4>
              </div>
              <ArrowRight size={24} color="rgba(255,255,255,0.2)" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Deal of the Week (Electro Specialty) */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
            {/* Deal Spotlight */}
            <div className="glass-panel" style={{ padding: '2rem', border: '2px solid var(--primary-color)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Deal of the Day</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                   {[
                     { val: '08', unit: 'Hrs' }, { val: '45', unit: 'Min' }, { val: '12', unit: 'Sec' }
                   ].map((t, i) => (
                     <div key={i} style={{ background: 'rgba(102,252,241,0.1)', padding: '0.5rem', borderRadius: '4px', minWidth: '50px' }}>
                       <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>{t.val}</p>
                       <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t.unit}</p>
                     </div>
                   ))}
                </div>
              </div>
              {products[0] && (
                <div style={{ textAlign: 'center' }}>
                  <img src={products[0].images?.[0]} style={{ width: '100%', height: '200px', objectFit: 'contain', marginBottom: '1.5rem' }} />
                  <Link href={`/products/${products[0].id}`} style={{ fontWeight: 700, display: 'block', marginBottom: '1rem' }}>{products[0].name}</Link>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>${products[0].price}</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>${(products[0].price * 1.5).toFixed(2)}</span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      <span>Available: 15</span>
                      <span>Sold: 45</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '75%', background: 'var(--primary-color)' }} />
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%' }}>Acquire Now</button>
                </div>
              )}
            </div>

            {/* Product Tabs/Grid */}
            <div>
              <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                 {['Trending', 'Bestsellers', 'New Arrivals'].map((tab, i) => (
                   <button key={tab} style={{ 
                     background: 'none', border: 'none', padding: '1rem 0', 
                     color: i === 0 ? 'var(--primary-color)' : 'var(--text-secondary)',
                     fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                     borderBottom: i === 0 ? '3px solid var(--primary-color)' : '3px solid transparent'
                   }}>{tab}</button>
                 ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {products.slice(1, 7).map(prod => (
                  <div key={prod.id} className="product-card" style={{ padding: '1.25rem' }}>
                     <div style={{ height: '160px', marginBottom: '1rem', position: 'relative' }}>
                        <img src={prod.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <div className="product-card-actions" style={{ top: '0.5rem' }}>
                          <button className="action-btn" style={{ width: '32px', height: '32px' }}><Heart size={14} /></button>
                          <button className="action-btn" style={{ width: '32px', height: '32px' }}><TrendingUp size={14} /></button>
                        </div>
                     </div>
                     <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.25rem' }}>{prod.category?.name}</p>
                     <Link href={`/products/${prod.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', height: '2.5rem', overflow: 'hidden', marginBottom: '0.5rem' }}>{prod.name}</Link>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>${prod.price}</span>
                        <button style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--primary-color)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}><ShoppingCart size={16} /></button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Grid (Electro Visual Style) */}
      <section style={{ padding: '4rem 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
           <h2 className="section-title">Department Catalog</h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
              {categories.map(cat => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                   <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: `url(${cat.image}) center/cover`, borderRadius: '12px' }} />
                   <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cat.name}</p>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Explore &rarr;</p>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* 5. Support Features */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          {[
            { icon: Trophy, title: "Industry Standard", desc: "Top-rated hardware 2026" },
            { icon: Zap, title: "Zero Latency", desc: "Express sector fulfillment" },
            { icon: ShieldCheck, title: "Secure Trade", desc: "100% Biometric Verified" },
            { icon: Sparkles, title: "Expert Support", desc: "24/7 Neural Assistant" },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
              <f.icon size={40} color="var(--primary-color)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
