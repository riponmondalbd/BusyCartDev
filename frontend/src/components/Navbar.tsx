'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <nav className="navbar">
      <div className="container nav-content">
        <Link href="/" className="logo">
          Busy<span>Cart</span>
        </Link>
        <div className="nav-links">
          <Link href="/products" className="nav-link">Products</Link>
          <Link href="/categories" className="nav-link">Categories</Link>
          
          {isLoggedIn && (
            <Link href="/wishlist" className="nav-link">Wishlist</Link>
          )}

          <Link href="/cart" className="nav-link">Cart (0)</Link>
          
          {isLoggedIn ? (
            <Link href="/profile" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Profile
            </Link>
          ) : (
            <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
