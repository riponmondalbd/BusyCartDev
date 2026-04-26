'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function RefundsPage() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefunds = async () => {
      try {
        const res = await fetchApi('/refund/my-refunds');
        setRefunds(Array.isArray(res) ? res : res.data || []);
      } catch (err: any) {
        if (err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadRefunds();
  }, [router]);

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary-color)' }}>Retrieving Refund Data...</div>;
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>Refund Status Logs</h1>

      {refunds.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-secondary)' }}>No refund protocols initiated.</h2>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {refunds.map((refund) => (
            <div key={refund.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Order #{refund.orderId?.split('-')[0] || 'Unknown'}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Reason: {refund.reason}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Submitted: {new Date(refund.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.9rem',
                  background: refund.status === 'APPROVED' ? 'rgba(0, 230, 118, 0.1)' : refund.status === 'REJECTED' ? 'rgba(255, 75, 75, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: refund.status === 'APPROVED' ? 'var(--success-color)' : refund.status === 'REJECTED' ? 'var(--error-color)' : 'var(--text-secondary)'
                }}>
                  Status: {refund.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
