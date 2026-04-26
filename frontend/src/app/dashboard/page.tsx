'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { 
  UserCircle, Package, RefreshCw, Heart, 
  Users, Layers, ArrowRightLeft, Database, 
  ShieldAlert, Tag 
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi('/user/profile');
        setProfile(data);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(102, 252, 241, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--primary-color)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Authenticating Identity...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const role = profile?.role || 'USER';

  const NavCard = ({ href, icon: Icon, title, description, colorVar }: any) => (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div 
        className="glass-panel nav-card"
        style={{ 
          padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem',
          borderTop: `2px solid ${colorVar}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'scale(2)' }}>
          <Icon size={120} color={colorVar} />
        </div>
        <div style={{ 
          width: '50px', height: '50px', borderRadius: '12px', 
          background: `color-mix(in srgb, ${colorVar} 15%, transparent)`,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <Icon size={24} color={colorVar} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{description}</p>
        </div>
      </div>
      <style>{`
        .nav-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px color-mix(in srgb, ${colorVar} 15%, transparent);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </Link>
  );

  return (
    <div className="container" style={{ padding: '3rem 0', maxWidth: '1200px' }}>
      
      {/* Hero Welcome Banner */}
      <div className="glass-panel" style={{ 
        padding: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(31,33,40,0.8) 0%, rgba(11,12,16,0.9) 100%)'
      }}>
        <div style={{ position: 'absolute', right: '0', top: '0', width: '30%', height: '100%', background: 'radial-gradient(circle at right, rgba(102, 252, 241, 0.1) 0%, transparent 70%)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 800 }}>
              Welcome back, <span style={{ color: 'var(--primary-color)' }}>{profile?.name}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Access your digital assets and system configuration.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Security Clearance</p>
            <div style={{ 
              display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '30px', 
              background: role === 'SUPER_ADMIN' ? 'rgba(255, 75, 75, 0.15)' : role === 'ADMIN' ? 'rgba(255, 204, 0, 0.15)' : 'rgba(102, 252, 241, 0.15)',
              border: `1px solid ${role === 'SUPER_ADMIN' ? 'var(--error-color)' : role === 'ADMIN' ? '#ffcc00' : 'var(--primary-color)'}`,
              color: role === 'SUPER_ADMIN' ? 'var(--error-color)' : role === 'ADMIN' ? '#ffcc00' : 'var(--primary-color)',
              fontWeight: 700, letterSpacing: '1px'
            }}>
              LEVEL: {role}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Universal User Functions */}
        <section>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-color)' }}></span>
            User Terminal
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <NavCard href="/profile" icon={UserCircle} title="Identity Profile" description="Update your personal details, email, and security settings." colorVar="var(--primary-color)" />
            <NavCard href="/orders" icon={Package} title="Order History" description="Track your shipments and download digital invoices." colorVar="var(--primary-color)" />
            <NavCard href="/refunds" icon={RefreshCw} title="Refund Logs" description="Monitor the status of your returned modules." colorVar="var(--primary-color)" />
            <NavCard href="/wishlist" icon={Heart} title="Saved Modules" description="View items you have bookmarked for future acquisition." colorVar="var(--primary-color)" />
          </div>
        </section>

        {/* Admin Functions */}
        {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
          <section>
            <h2 style={{ fontSize: '1.3rem', color: '#ffcc00', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffcc00', boxShadow: '0 0 10px #ffcc00' }}></span>
              Admin Control Center
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <NavCard href="/admin/users" icon={Users} title="User Database" description="Manage user identities and platform access." colorVar="#ffcc00" />
              <NavCard href="/admin/orders" icon={Database} title="Global Order Matrix" description="Monitor network-wide transactions and update shipping statuses." colorVar="#ffcc00" />
              <NavCard href="/admin/refunds" icon={ArrowRightLeft} title="Refund Processing" description="Approve or reject incoming refund requests." colorVar="#ffcc00" />
            </div>
          </section>
        )}

        {/* Super Admin Functions */}
        {role === 'SUPER_ADMIN' && (
          <section>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--error-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error-color)', boxShadow: '0 0 10px var(--error-color)' }}></span>
              System Override (Super Admin)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <NavCard href="/super-admin/inventory" icon={Layers} title="Inventory Architect" description="Create, edit, and delete products and categorizations." colorVar="var(--error-color)" />
              <NavCard href="/super-admin/admins" icon={ShieldAlert} title="Access Delegation" description="Promote users to Admins or demote existing staff." colorVar="var(--error-color)" />
              <NavCard href="/super-admin/coupons" icon={Tag} title="Promotional Codes" description="Generate encrypted discount tokens for marketing." colorVar="var(--error-color)" />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
