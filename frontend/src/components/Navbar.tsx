'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, LayoutGrid } from 'lucide-react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <header style={{ width: '100%', zIndex: 1000, position: 'sticky', top: 0 }}>
      {/* Top Utility Bar */}
      <div style={{ background: '#0b0c10', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Welcome to the Future of Commerce. Worldwide Delivery.</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <Link href="/track-order" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Track Order</Link>
             <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
             <Link href="/help" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Help Center</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav style={{ background: 'rgba(11, 12, 16, 0.95)', backdropFilter: 'blur(10px)', borderBottom: 'var(--glass-border)', padding: '1.25rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          {/* Logo */}
          <Link href="/" className="logo" style={{ flexShrink: 0 }}>
            Busy<span>Cart</span>
          </Link>

          {/* Search Bar (Electro Style) */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
               <input 
                 type="text" 
                 placeholder="Search for hardware, modules, or cyberware..." 
                 style={{ flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0.75rem 1.25rem', outline: 'none' }}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button style={{ background: 'var(--primary-color)', border: 'none', padding: '0 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <Search size={20} color="#000" />
               </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
            <Link href="/wishlist" style={{ position: 'relative', color: 'var(--text-secondary)' }}>
              <Heart size={24} />
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '10px' }}>0</span>
            </Link>
            
            <Link href="/cart" style={{ position: 'relative', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={24} />
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '10px' }}>0</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>My Cart</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>$0.00</span>
              </div>
            </Link>

            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Category Bar (Secondary Nav) */}
      <div style={{ background: 'rgba(11, 12, 16, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
              <Menu size={20} /> ALL DEPARTMENTS
           </div>
           <div style={{ display: 'flex', gap: '2rem' }}>
              <Link href="/products" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>New Arrivals</Link>
              <Link href="/categories" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hot Deals</Link>
              <Link href="/products" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bestsellers</Link>
              <Link href="/products" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Modules</Link>
              <Link href="/products" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hardware</Link>
           </div>
        </div>
      </div>
    </header>
  );
}
