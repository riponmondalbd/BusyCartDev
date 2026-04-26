'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, API_BASE_URL } from '@/utils/api';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [activeRefundOrder, setActiveRefundOrder] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetchApi('/order/my-orders');
      setOrders(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      if (err.message.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDownloadInvoice = async (orderId: string) => {
    // Generate invoice returns a PDF or a URL. Assuming it returns a URL or file stream.
    // For simplicity, we can just open the endpoint in a new tab if it's a GET request that streams a PDF.
    const token = localStorage.getItem('token');
    if (token) {
      window.open(`${API_BASE_URL}/invoice/generate/${orderId}?token=${token}`, '_blank');
    }
  };

  const handleRefundRequest = async (orderId: string) => {
    try {
      await fetchApi('/refund', {
        method: 'POST',
        body: JSON.stringify({ orderId, reason: refundReason })
      });
      alert('Refund request submitted successfully.');
      setActiveRefundOrder(null);
      setRefundReason('');
      loadOrders(); // Reload to potentially show status changes
    } catch (err: any) {
      alert(err.message || 'Failed to submit refund request.');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary-color)' }}>Retrieving Order History...</div>;
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>Order History Logs</h1>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No transaction records found.</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>Transaction #{order.id.split('-')[0]}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                    {order.status}
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>${order.totalAmount}</h3>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Items Acquired</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {order.orderItems?.map((item: any) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <span>{item.product?.name || 'Unknown Item'} x {item.quantity}</span>
                      <span>${item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleDownloadInvoice(order.id)}
                  className="btn-primary" 
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Download Invoice
                </button>
                
                {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? (
                  <button 
                    onClick={() => setActiveRefundOrder(activeRefundOrder === order.id ? null : order.id)}
                    className="btn-primary" 
                    style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Request Refund
                  </button>
                ) : null}
              </div>

              {activeRefundOrder === order.id && (
                <div style={{ marginTop: '1.5rem', background: 'rgba(255, 75, 75, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 75, 75, 0.2)' }}>
                  <h4 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>Initiate Refund Protocol</h4>
                  <textarea 
                    className="input-field" 
                    placeholder="Please detail the reason for your refund request..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    style={{ minHeight: '80px', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)' }}
                  />
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setActiveRefundOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                    <button 
                      onClick={() => handleRefundRequest(order.id)} 
                      className="btn-primary"
                      style={{ background: 'var(--error-color)', color: '#fff', border: 'none', padding: '0.5rem 1.5rem' }}
                      disabled={!refundReason.trim()}
                    >
                      Submit Protocol
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
