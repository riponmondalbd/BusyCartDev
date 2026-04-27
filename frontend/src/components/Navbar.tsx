'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, LayoutGrid, XCircle } from 'lucide-react';
import { fetchApi } from '@/utils/api';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // ... existing event listeners ...
    const handleWishlistUpdate = (e: any) => setWishlistCount(e.detail);
    window.addEventListener('wishlist-update', handleWishlistUpdate);

    const handleCartUpdate = (e: any) => {
      if (e.detail) {
        setCartCount(e.detail.totalItems || 0);
        setCartTotal(e.detail.total || 0);
      }
    };
    window.addEventListener('cart-update', handleCartUpdate);

    const fetchCartData = async () => {
      const cartRes = await fetchApi('/cart/my-cart').catch(() => null);
      if (cartRes) {
        const data = cartRes.data || cartRes;
        setCartCount(data.totalItems || 0);
        setCartTotal(data.total || 0);
      }
    };

    window.addEventListener('cart-refresh', fetchCartData);

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      
      if (token) {
        try {
          const res = await fetchApi('/user/profile');
          setUser(res.data || res);
          await fetchCartData();
        } catch (err) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } else {
        setCartCount(0);
        setCartTotal(0);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('wishlist-update', handleWishlistUpdate);
      window.removeEventListener('cart-update', handleCartUpdate);
      window.removeEventListener('cart-refresh', fetchCartData);
    };
  }, []);

  return (
    <header style={{ width: '100%', zIndex: 1000, position: 'sticky', top: 0 }}>
      {/* Top Utility Bar - Hidden on Mobile */}
      <div className="hidden-mobile" style={{ background: '#0b0c10', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem 0' }}>
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
      <nav style={{ background: 'rgba(11, 12, 16, 0.95)', backdropFilter: 'blur(10px)', borderBottom: 'var(--glass-border)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile Menu Toggle */}
            <button 
              className="show-mobile" 
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" className="logo" style={{ flexShrink: 0, fontSize: '1.25rem' }}>
              Busy<span>Cart</span>
            </Link>
          </div>

          {/* Modernized Search Bar - Desktop Only */}
          <form 
            className="hidden-mobile" 
            onSubmit={handleSearch} 
            style={{ 
              flex: 1, 
              maxWidth: '100%', 
              position: 'relative',
              margin: '0 3rem'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%',
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '50px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '2px 6px 2px 1.25rem',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(102,252,241,0.3)'}
            onMouseLeave={e => {
              if (document.activeElement !== e.currentTarget.querySelector('input')) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }
            }}
            >
               <Search size={16} color="var(--text-secondary)" style={{ opacity: 0.6 }} />
               <input 
                 type="text" 
                 placeholder="Initialize hardware query..." 
                 style={{ 
                   flex: 1, 
                   background: 'none', 
                   border: 'none', 
                   color: '#fff', 
                   padding: '0.6rem 0.75rem', 
                   outline: 'none', 
                   fontSize: '0.85rem',
                   letterSpacing: '0.5px'
                 }}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--primary-color)')}
                 onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(255,255,255,0.1)')}
               />
               <button 
                 type="submit" 
                 style={{ 
                   background: 'var(--primary-color)', 
                   border: 'none', 
                   width: '32px',
                   height: '32px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   transition: '0.2s',
                   boxShadow: '0 0 10px rgba(102,252,241,0.2)'
                 }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
               >
                 <ArrowRight size={14} color="#000" />
               </button>
            </div>
          </form>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/wishlist" className="hidden-mobile" style={{ position: 'relative', color: 'var(--text-secondary)' }}>
              <Heart size={22} />
              {wishlistCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '10px' }}>{wishlistCount}</span>}
            </Link>
            
            <Link href="/cart" style={{ position: 'relative', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={22} />
                {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '10px' }}>{cartCount}</span>}
              </div>
              <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6 }}>CART</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)' }}>${Number(cartTotal).toFixed(2)}</span>
              </div>
            </Link>

            {isLoggedIn ? (
              <Link href="/dashboard" style={{ 
                width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', 
                border: '2px solid var(--primary-color)', background: 'rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={20} color="var(--primary-color)" />
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-primary hidden-mobile" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Category Bar - Desktop Only */}
      <div className="hidden-mobile" style={{ background: 'rgba(11, 12, 16, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.6rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              <Menu size={18} /> ALL DEPARTMENTS
           </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
               <Link href="/products?sort=newest" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>New Arrivals</Link>
               <Link href="/products?deals=true" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hot Deals</Link>
               <Link href="/products?sort=bestseller" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bestsellers</Link>
               <Link href="/products?category=modules" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Modules</Link>
               <Link href="/products?category=hardware" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hardware</Link>
            </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} 
          />
          <div style={{ 
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px', 
            background: '#0b0c10', borderRight: '1px solid var(--border-color)',
            padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
                Busy<span>Cart</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}>
               <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    style={{ flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0.6rem 1rem', outline: 'none' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" style={{ background: 'var(--primary-color)', border: 'none', padding: '0 1rem' }}>
                    <Search size={18} color="#000" />
                  </button>
               </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <Link href="/products?sort=newest" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>New Arrivals</Link>
               <Link href="/products?deals=true" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Hot Deals</Link>
               <Link href="/products?sort=bestseller" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Bestsellers</Link>
               <Link href="/products?category=modules" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Modules</Link>
               <Link href="/products?category=hardware" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Hardware</Link>
               <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
               <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track Order</Link>
               <Link href="/help" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Help Center</Link>
               <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>My Wishlist</Link>
            </div>

            {!isLoggedIn && (
               <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center', marginTop: 'auto' }}>
                 LOGIN / REGISTER
               </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import { ArrowRight } from 'lucide-react';
