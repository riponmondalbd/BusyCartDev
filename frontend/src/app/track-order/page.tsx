'use client';

import { useState } from 'react';
import { fetchApi } from '@/utils/api';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const statusSteps = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetchApi(`/order/track/${orderId.trim()}`);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Order not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to locate order in the matrix.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Track Your Shipment
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Enter your unique tracking signature to monitor live transit status.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleTrack} className="glass-panel" style={{ padding: '2rem', marginBottom: '4rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. 550e8400-e29b...)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              aria-label="Order Tracking ID"
              style={{ 
                width: '100%', padding: '1rem 1.5rem 1rem 3rem', borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
                color: '#fff', fontSize: '1rem', outline: 'none'
              }} 
            />
            <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 2rem', borderRadius: '12px', fontWeight: 800 }}>
            {loading ? 'SCANNING...' : 'TRACK'}
          </button>
        </form>

        {error && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--error-color)', background: 'rgba(255,0,60,0.02)' }}>
            <AlertCircle size={40} color="var(--error-color)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--error-color)', fontWeight: 700 }}>{error}</p>
          </div>
        )}

        {order && (
          <div className="glass-panel" style={{ padding: '3rem' }}>
            {/* Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Tracking Order</p>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{order.id}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Status</p>
                <span style={{ 
                  background: 'rgba(102,252,241,0.1)', color: 'var(--primary-color)', 
                  padding: '0.5rem 1rem', borderRadius: '30px', fontWeight: 800, fontSize: '0.9rem' 
                }}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Progress Tracker */}
            <div style={{ marginBottom: '5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '4px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
              <div style={{ 
                position: 'absolute', top: '24px', left: '0', height: '4px', background: 'var(--primary-color)', 
                width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%`, 
                zIndex: 1, transition: 'width 1s ease' 
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {statusSteps.map((step, i) => {
                  const isActive = getStatusIndex(order.status) >= i;
                  return (
                    <div key={step} style={{ textAlign: 'center', width: '100px' }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: '50%', background: isActive ? 'var(--primary-color)' : '#1f2833',
                        border: '4px solid #0b0c10', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isActive ? '#000' : 'rgba(255,255,255,0.2)', transition: '0.5s'
                      }}>
                        {i === 0 && <Clock size={20} />}
                        {i === 1 && <CheckCircle size={20} />}
                        {i === 2 && <Truck size={20} />}
                        {i === 3 && <Package size={20} />}
                      </div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={18} color="var(--primary-color)" /> Items Manifest
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        <Image src={item.product.images?.[0] || "/placeholder.jpg"} alt={item.product.name} fill style={{ objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.product.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Total Cost:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !loading && !error && (
          <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
              <Search size={64} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Awaiting Input</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              Your order ID can be found in your confirmation neural transmission (email) or in your dashboard history.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
