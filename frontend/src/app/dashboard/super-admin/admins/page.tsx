'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { ShieldCheck, ShieldOff } from 'lucide-react';

const ROLES = ['USER', 'ADMIN', 'SUPER_ADMIN'];

export default function SuperAdminAdminsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, adminsRes] = await Promise.all([
          fetchApi('/super/admin/users'),
          fetchApi('/super/admin/admins')
        ]);
        const combined = [
          ...(Array.isArray(usersRes) ? usersRes : usersRes.data || []),
          ...(Array.isArray(adminsRes) ? adminsRes : adminsRes.data || [])
        ];
        setUsers(combined);
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('403')) router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const updateRole = async (userId: string, role: string) => {
    try {
      await fetchApi(`/super/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err: any) { alert(err.message); }
  };

  const roleColor = (r: string) => r === 'SUPER_ADMIN' ? 'var(--error-color)' : r === 'ADMIN' ? '#ffcc00' : 'var(--primary-color)';

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Access Delegation</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage user clearance levels and promote staff members</p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-color)' }}>Loading user directory...</div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                {['Identity', 'Email', 'Current Role', 'Change Clearance'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor(u.role)}, var(--bg-color))`, border: `2px solid ${roleColor(u.role)}`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: roleColor(u.role) }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: `color-mix(in srgb, ${roleColor(u.role)} 15%, transparent)`,
                      border: `1px solid ${roleColor(u.role)}`,
                      color: roleColor(u.role) }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <select
                      value={u.role}
                      onChange={e => updateRole(u.id, e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
