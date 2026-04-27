'use client';

import { Scale, FileCheck, AlertTriangle, Cpu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(102,252,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            color: 'var(--primary-color)', border: '1px solid var(--primary-color)'
          }}>
            <Scale size={30} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Operating Framework & Usage Agreement</p>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <FileCheck size={20} /> 01. Usage Authorization
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            By accessing the BusyCart terminal, you affirm that you are a biological or high-level synthetic entity authorized to engage in digital commerce within your sector. Unauthorized access to administrative modules is strictly prohibited.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <Cpu size={20} /> 02. Hardware Liability
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            BusyCart provides premium hardware and modules "as-is". While we guarantee core functionality at the point of transfer, we are not liable for malfunctions caused by improper neural integration, overclocking beyond safe limits, or exposure to high-level EMP fields.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <AlertTriangle size={20} /> 03. Termination of Access
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            BusyCart reserves the right to terminate any neural link (user account) if fraudulent activity or module tampering is detected. Terminated users will lose access to their order history and digital warranty certificates.
          </p>
        </section>

        <div style={{ 
          marginTop: '4rem', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', 
          textAlign: 'center'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Return to Main Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
