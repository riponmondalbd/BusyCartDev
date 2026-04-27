'use client';

import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(102,252,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            color: 'var(--primary-color)', border: '1px solid var(--primary-color)'
          }}>
            <Shield size={30} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Privacy Protocol</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last Updated: April 2026. Version 2.0.4</p>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <Lock size={20} /> 01. Data Encapsulation
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            At BusyCart, your data is treated as a high-security asset. We utilize military-grade encryption for all neural transfers and personal identification data. We do not sell your biometric or behavioral data to third-party conglomerates.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <Eye size={20} /> 02. Optical Monitoring
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            We collect standard telemetry to improve your marketplace experience. This includes session duration, module preference, and hardware compatibility checks. All telemetry is anonymized unless required for active transaction verification.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <FileText size={20} /> 03. Cookies & Neural Cache
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Our system utilizes small data fragments (Cookies) to maintain your login session and wishlist state across the network. By initializing the BusyCart terminal, you consent to our use of these fragments for basic functionality.
          </p>
        </section>

        <div style={{ 
          marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
        }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Questions regarding the data protocol?</p>
          <Link href="/help" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Contact Data Officer</Link>
        </div>
      </div>
    </div>
  );
}
