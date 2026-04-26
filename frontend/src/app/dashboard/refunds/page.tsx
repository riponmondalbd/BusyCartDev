'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefunds = async () => {
      try {
        const data = await fetchApi('/refund/my-refunds');
        setRefunds(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRefunds();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'var(--success-color)';
      case 'REJECTED': return 'var(--error-color)';
      case 'PENDING': return '#ffcc00';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Refund Logs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor the status of your return protocols.</p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-color)' }}>Scanning refund status...</div>
      ) : refunds.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active refund requests found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {refunds.map((refund) => (
            <div key={refund.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Order Context</p>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>#{refund.orderId.split('-')[0].toUpperCase()}</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Reason: {refund.reason}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  color: getStatusColor(refund.status), 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1rem'
                }}>
                  {refund.status === 'APPROVED' && <CheckCircle size={18} />}
                  {refund.status === 'REJECTED' && <XCircle size={18} />}
                  {refund.status === 'PENDING' && <Clock size={18} />}
                  {refund.status}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {new Date(refund.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
