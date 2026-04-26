'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const loadCart = async () => {
    try {
      const res = await fetchApi('/cart/my-cart');
      setCart(res.data || res);
    } catch (err: any) {
      if (err.message.includes('401')) {
        router.push('/login');
      } else {
        console.error('Cart load error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    
    try {
      await fetchApi(`/cart/update/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQty })
      });
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetchApi(`/cart/remove/${itemId}`, { method: 'DELETE' });
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCart = async () => {
    try {
      await fetchApi('/cart/clear', { method: 'DELETE' });
      setCart(null);
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async () => {
    setCouponError('');
    setCouponSuccess(false);
    try {
      await fetchApi('/coupon/apply', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode })
      });
      setCouponSuccess(true);
      loadCart(); // Reload to see updated prices
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleCheckout = async () => {
    setPlacingOrder(true);
    try {
      // 1. Create order
      const order = await fetchApi('/order/create', { method: 'POST' });
      
      // 2. Simulate payment
      if (order && (order.id || order.data?.id)) {
        const orderId = order.id || order.data?.id;
        await fetchApi('/payment/simulate', {
          method: 'POST',
          body: JSON.stringify({ orderId, method: "Stripe Simulation" })
        });
      }
      
      alert('Order Confirmed & Payment Processed Successfully!');
      router.push('/profile');
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary-color)' }}>Accessing Cart Matrix...</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>Shopping Matrix</h1>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your matrix is empty.</h2>
          <Link href="/products" className="btn-primary">Browse Modules</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleClearCart} style={{ background: 'transparent', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Clear Matrix [X]
              </button>
            </div>
            {items.map((item: any, idx: number) => (
              <div key={item.id || `cart-item-${idx}`} className="glass-panel" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                   {item.product?.images?.[0] && (
                     <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.product?.name || 'Unknown Module'}</h3>
                  <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>${item.price}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '0.25rem 0.5rem' }}>
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0 0.5rem' }}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0 0.5rem' }}>+</button>
                </div>
                <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}>
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${cart?.totalAmount || 0}</span>
            </div>
            
            {cart?.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--success-color)' }}>
                <span>Discount Applied</span>
                <span>-${cart.discountAmount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total Compute</span>
              <span style={{ color: 'var(--primary-color)' }}>
                ${(cart?.totalAmount || 0) - (cart?.discountAmount || 0)}
              </span>
            </div>

            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Promo Code</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="Enter code" 
                />
                <button onClick={applyCoupon} className="btn-primary" style={{ padding: '0.75rem' }}>Apply</button>
              </div>
              {couponError && <p style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{couponError}</p>}
              {couponSuccess && <p style={{ color: 'var(--success-color)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Code accepted.</p>}
            </div>

            <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={placingOrder}>
              {placingOrder ? 'Processing Transfer...' : 'Execute Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
