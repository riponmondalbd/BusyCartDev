'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, LayoutGrid } from 'lucide-react';
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

  useEffect(() => {
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
          console.error('Failed to fetch user profile', err);
          // If token is invalid, clear it
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
          <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
               <input 
                 type="text" 
                 placeholder="Search for hardware, modules, or cyberware..." 
                 style={{ flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0.75rem 1.25rem', outline: 'none' }}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button type="submit" style={{ background: 'var(--primary-color)', border: 'none', padding: '0 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <Search size={20} color="#000" />
               </button>
            </div>
          </form>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
            <Link href="/wishlist" style={{ position: 'relative', color: 'var(--text-secondary)' }}>
              <Heart size={24} />
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '10px' }}>{wishlistCount}</span>
            </Link>
            
            <Link href="/cart" style={{ position: 'relative', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={24} />
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '10px' }}>{cartCount}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>My Cart</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>${Number(cartTotal).toFixed(2)}</span>
              </div>
            </Link>

            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/dashboard" style={{ 
                  width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', 
                  border: '2px solid var(--primary-color)', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} color="var(--primary-color)" />
                  )}
                </Link>
              </div>
            ) : (
              <Link href="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700 }}>
                LOGIN / REGISTER
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
               <Link href="/products?sort=newest" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>New Arrivals</Link>
               <Link href="/products?deals=true" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hot Deals</Link>
               <Link href="/products?sort=bestseller" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bestsellers</Link>
               <Link href="/products?category=modules" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Modules</Link>
               <Link href="/products?category=hardware" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hardware</Link>
            </div>
        </div>
      </div>
    </header>
  );
}
