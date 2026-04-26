'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import {
  UserCircle, Package, RefreshCw, Heart,
  Users, Database, ArrowRightLeft,
  Layers, ShieldAlert, Tag,
  LayoutDashboard, LogOut, ChevronRight, Menu, X
} from 'lucide-react';

const userLinks = [
  { href: '/profile',   label: 'Identity Profile', icon: UserCircle },
  { href: '/orders',    label: 'Order History',     icon: Package },
  { href: '/refunds',   label: 'Refund Logs',       icon: RefreshCw },
  { href: '/wishlist',  label: 'Saved Modules',     icon: Heart },
];

const adminLinks = [
  { href: '/admin/users',   label: 'User Database',     icon: Users },
  { href: '/admin/orders',  label: 'Order Matrix',       icon: Database },
  { href: '/admin/refunds', label: 'Refund Processing',  icon: ArrowRightLeft },
];

const superAdminLinks = [
  { href: '/super-admin/inventory', label: 'Inventory Architect', icon: Layers },
  { href: '/super-admin/admins',    label: 'Access Delegation',   icon: ShieldAlert },
  { href: '/super-admin/coupons',   label: 'Promo Codes',         icon: Tag },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: any;
  active: boolean;
  color?: string;
}

function NavItem({ href, label, icon: Icon, active, color = 'var(--primary-color)' }: NavItemProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.75rem 1rem', borderRadius: '10px',
        background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
        border: active ? `1px solid color-mix(in srgb, ${color} 30%, transparent)` : '1px solid transparent',
        color: active ? color : 'var(--text-secondary)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: active ? 600 : 400 }}>{label}</span>
        {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
      </div>
    </Link>
  );
}

function SectionLabel({ label, color = 'var(--text-secondary)' }: { label: string; color?: string }) {
  return (
    <p style={{
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '1.5px', color, padding: '0 1rem', marginBottom: '0.5rem', marginTop: '0.25rem',
      display: 'flex', alignItems: 'center', gap: '0.5rem'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }}></span>
      {label}
    </p>
  );
}

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi('/user/profile');
        setProfile(data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const role = profile?.role || 'USER';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const roleColor = isSuperAdmin ? 'var(--error-color)' : isAdmin ? '#ffcc00' : 'var(--primary-color)';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid rgba(102,252,241,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Authenticating...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const Sidebar = () => (
    <aside style={{
      width: '260px', flexShrink: 0,
      background: 'rgba(11, 12, 16, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRight: 'var(--glass-border)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'auto',
      padding: '1.5rem 0.75rem',
      gap: '0.25rem',
    }}>
      {/* User Badge */}
      <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: 'var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${roleColor}, var(--bg-color))`,
            border: `2px solid ${roleColor}`,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '1rem', fontWeight: 700, color: roleColor,
            boxShadow: `0 0 12px color-mix(in srgb, ${roleColor} 30%, transparent)`
          }}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name}</p>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
              color: roleColor, background: `color-mix(in srgb, ${roleColor} 15%, transparent)`,
              padding: '0.15rem 0.5rem', borderRadius: '20px'
            }}>{role}</span>
          </div>
        </div>
      </div>

      {/* Overview link */}
      <NavItem href="/dashboard" label="Dashboard Overview" icon={LayoutDashboard} active={pathname === '/dashboard'} color="var(--primary-color)" />

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0.5rem' }} />

      {/* User section */}
      <SectionLabel label="My Account" color="var(--primary-color)" />
      {userLinks.map(l => <NavItem key={l.href} {...l} active={pathname === l.href} color="var(--primary-color)" />)}

      {/* Admin section */}
      {isAdmin && (
        <>
          <div style={{ height: '1px', background: 'rgba(255,204,0,0.2)', margin: '1rem 0.5rem' }} />
          <SectionLabel label="Admin Controls" color="#ffcc00" />
          {adminLinks.map(l => <NavItem key={l.href} {...l} active={pathname === l.href} color="#ffcc00" />)}
        </>
      )}

      {/* Super Admin section */}
      {isSuperAdmin && (
        <>
          <div style={{ height: '1px', background: 'rgba(255,75,75,0.2)', margin: '1rem 0.5rem' }} />
          <SectionLabel label="System Override" color="var(--error-color)" />
          {superAdminLinks.map(l => <NavItem key={l.href} {...l} active={pathname === l.href} color="var(--error-color)" />)}
        </>
      )}

      {/* Logout */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
        <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1rem' }} />
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem', width: '100%',
          padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
          background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
          transition: 'all 0.2s', fontSize: '0.9rem'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,75,75,0.08)'; e.currentTarget.style.color = 'var(--error-color)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <span>System Logout</span>
        </button>
      </div>
    </aside>
  );

  // ── Dashboard Overview content (shown only at /dashboard) ──
  const OverviewContent = () => (
    <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
      {/* Welcome banner */}
      <div className="glass-panel" style={{
        padding: '2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(31,33,40,0.8) 0%, rgba(11,12,16,0.9) 100%)'
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '35%', height: '100%', background: `radial-gradient(circle at right, color-mix(in srgb, ${roleColor} 12%, transparent) 0%, transparent 70%)` }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Welcome back, <span style={{ color: roleColor }}>{profile?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Use the sidebar to navigate your control panel.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Orders', icon: Package, href: '/orders', color: 'var(--primary-color)' },
          { label: 'Wishlist', icon: Heart, href: '/wishlist', color: 'var(--primary-color)' },
          { label: 'Refunds', icon: RefreshCw, href: '/refunds', color: 'var(--primary-color)' },
          { label: 'Profile', icon: UserCircle, href: '/profile', color: 'var(--primary-color)' },
          ...(isAdmin ? [
            { label: 'Users', icon: Users, href: '/admin/users', color: '#ffcc00' },
            { label: 'All Orders', icon: Database, href: '/admin/orders', color: '#ffcc00' },
          ] : []),
          ...(isSuperAdmin ? [
            { label: 'Inventory', icon: Layers, href: '/super-admin/inventory', color: 'var(--error-color)' },
            { label: 'Coupons', icon: Tag, href: '/super-admin/coupons', color: 'var(--error-color)' },
          ] : []),
        ].map(({ label, icon: Icon, href, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `2px solid ${color}`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px color-mix(in srgb, ${color} 15%, transparent)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <Icon size={28} color={color} style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'flex' }} className="dashboard-sidebar">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 1, width: '260px' }}>
            <Sidebar />
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* Mobile menu button */}
      <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ position: 'fixed', bottom: '2rem', left: '1rem', zIndex: 100, background: 'var(--primary-color)', color: '#0b0c10', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'none', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--glow)' }}>
        <Menu size={22} />
      </button>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children ?? <OverviewContent />}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
