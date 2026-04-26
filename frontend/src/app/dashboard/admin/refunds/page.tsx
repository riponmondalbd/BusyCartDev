'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminRefundsPage() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi('/refund/get-all-refunds');
        setRefunds(Array.isArray(res) ? res : res.data || []);
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('403')) router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleAction = async (refundId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetchApi(`/admin/refund/${refundId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setRefunds(refunds.map(r => r.id === refundId ? { ...r, status } : r));
    } catch (err: any) { alert(err.message); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      SUCCEEDED: { color: 'var(--success-color)', icon: CheckCircle },
      FAILED: { color: 'var(--error-color)', icon: XCircle },
      PENDING: { color: '#ffcc00', icon: Clock },
    };
    const cfg = map[status] || map.PENDING;
    const Icon = cfg.icon;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: cfg.color, fontWeight: 700, fontSize: '0.85rem' }}>
        <Icon size={14} /> {status}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Refund Processing</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and action incoming refund requests</p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-color)' }}>Loading refund protocols...</div>
      ) : refunds.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No refund requests pending.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {refunds.map(r => (
            <div key={r.id} className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <p style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontWeight: 700 }}>
                    Order #{r.orderId?.split('-')[0].toUpperCase()}
                  </p>
                  {statusBadge(r.status)}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Reason:</strong> {r.reason}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  User: {r.user?.name || r.user?.email || 'Unknown'} · Submitted: {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                </p>
              </div>
              {r.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '140px' }}>
                  <button
                    onClick={() => handleAction(r.id, 'APPROVED')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(0,230,118,0.1)', border: '1px solid var(--success-color)', color: 'var(--success-color)', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'REJECTED')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,75,75,0.1)', border: '1px solid var(--error-color)', color: 'var(--error-color)', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
