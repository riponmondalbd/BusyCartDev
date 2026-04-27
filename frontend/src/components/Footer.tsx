'use client';

import { fetchApi } from '@/utils/api';
import { ArrowRight, Cpu, Globe, Mail, MapPin, MessageSquare, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await fetchApi('/category/all');
        setCategories((res.data || res).slice(0, 5));
      } catch (err) {
        console.error('Footer categories load failed', err);
      }
    };
    loadCats();
  }, []);

  return (
    <footer style={{
      background: '#0b0c10',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '5rem 0 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--primary-color)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
          
          {/* Brand Column */}
          <div>
            <Link href="/" className="logo" style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'inline-block' }}>
              Busy<span>Cart</span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Defining the next generation of digital commerce. We provide secure, high-performance hardware and modules for the futuristic builder.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[
                { Icon: Globe, url: 'https://riponmondalbd.vercel.app/', label: 'Website' },
                { Icon: Terminal, url: 'https://github.com/riponmondalbd', label: 'GitHub' },
                { Icon: Cpu, url: 'https://www.linkedin.com/in/riponmondalbd/', label: 'LinkedIn' },
                { Icon: MessageSquare, url: 'https://wa.me/8801956149980', label: 'WhatsApp' }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                    transition: '0.3s', border: '1px solid rgba(255,255,255,0.05)'
                  }} 
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                >
                  <item.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Sectors */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Shop Sectors</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products?category=${cat.slug}`} style={{ color: 'var(--text-secondary)', transition: '0.2s', fontSize: '0.95rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link href="/categories" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>Explore All &rarr;</Link></li>
            </ul>
          </div>

          {/* User Console */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>User Console</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Dashboard', url: '/dashboard' },
                { name: 'My Wishlist', url: '/wishlist' },
                { name: 'Shopping Cart', url: '/cart' },
                { name: 'Track Order', url: '/track-order' },
                { name: 'Help Center', url: '/help' }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.url} style={{ color: 'var(--text-secondary)', transition: '0.2s', fontSize: '0.95rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Stay Integrated</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Subscribe for latest hardware drops and neural updates.</p>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <input type="text" placeholder="Email Address..." aria-label="Newsletter email" style={{ 
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
                borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' 
              }} />
              <button aria-label="Subscribe to newsletter" style={{ position: 'absolute', right: '5px', top: '5px', bottom: '5px', background: 'var(--primary-color)', border: 'none', borderRadius: '6px', padding: '0 1rem', cursor: 'pointer' }}>
                <ArrowRight size={18} color="#000" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--primary-color)" /> Dhaka, Bangladesh
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Mail size={16} color="var(--primary-color)" /> support@busycart.tech
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div 
          className="footer-bottom"
          style={{ 
            paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem'
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} BusyCart Terminal. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Privacy Protocol</Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
