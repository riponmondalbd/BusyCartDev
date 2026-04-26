'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { 
  Package, Heart, RefreshCw, UserCircle, 
  Users, Database, Layers, Tag 
} from 'lucide-react';

export default function DashboardOverview() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi('/user/profile');
        setProfile(data);
      } catch {
        // Layout handles redirect
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;

  const role = profile?.role || 'USER';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const roleColor = isSuperAdmin ? 'var(--error-color)' : isAdmin ? '#ffcc00' : 'var(--primary-color)';

  const stats = [
    { label: 'My Orders', icon: Package, href: '/dashboard/orders', color: 'var(--primary-color)' },
    { label: 'Wishlist', icon: Heart, href: '/dashboard/wishlist', color: 'var(--primary-color)' },
    { label: 'Refunds', icon: RefreshCw, href: '/dashboard/refunds', color: 'var(--primary-color)' },
    { label: 'My Profile', icon: UserCircle, href: '/dashboard/profile', color: 'var(--primary-color)' },
    ...(isAdmin ? [
      { label: 'User DB', icon: Users, href: '/dashboard/admin/users', color: '#ffcc00' },
      { label: 'Order Matrix', icon: Database, href: '/dashboard/admin/orders', color: '#ffcc00' },
    ] : []),
    ...(isSuperAdmin ? [
      { label: 'Inventory', icon: Layers, href: '/dashboard/super-admin/inventory', color: 'var(--error-color)' },
      { label: 'Coupons', icon: Tag, href: '/dashboard/super-admin/coupons', color: 'var(--error-color)' },
    ] : []),
  ];

  return (
    <div style={{ padding: '2.5rem' }}>
      <div className="glass-panel" style={{ 
        padding: '3rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(31,33,40,0.8) 0%, rgba(11,12,16,0.9) 100%)'
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '35%', height: '100%', background: `radial-gradient(circle at right, color-mix(in srgb, ${roleColor} 15%, transparent) 0%, transparent 70%)` }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            System <span style={{ color: roleColor }}>Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px' }}>
            Welcome back, {profile?.name}. Your identity has been verified. Access all system terminals via the navigation sidebar.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: roleColor, boxShadow: `0 0 10px ${roleColor}` }}></span>
        Quick Access Matrix
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {stats.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ 
              padding: '2rem', textAlign: 'center', borderTop: `2px solid ${item.color}`, 
              transition: 'all 0.3s ease', cursor: 'pointer' 
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 30px color-mix(in srgb, ${item.color} 15%, transparent)`;
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <item.icon size={32} color={item.color} style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem' }}>{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
