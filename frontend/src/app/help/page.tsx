'use client';

import {
  ChevronDown,
  Clock,
  CreditCard,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  RefreshCcw,
  Search,
  Shield,
  Truck
} from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "How do I initialize a module return?",
    a: "Return requests can be initiated within 48 hours of neural link delivery. Access your dashboard, select the transaction, and choose 'Request De-integration'."
  },
  {
    q: "Do you ship to orbital sectors?",
    a: "Yes, BusyCart provides worldwide and low-orbit delivery. Standard atmospheric transit takes 2-3 cycles, while orbital drops take 5 cycles."
  },
  {
    q: "Is biometric payment secure?",
    a: "Absolutely. Our checkout matrix uses multi-layered biometric verification and quantum-resistant blockchain records to ensure zero-risk transactions."
  },
  {
    q: "How can I track my hardware drop?",
    a: "Once your order is processed, a unique tracking signature is sent to your registered neural address. Use the 'Track Order' page to monitor live transit."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Support Terminal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Welcome to the BusyCart knowledge base. How can we assist your operation today?
        </p>
        
        <div style={{ maxWidth: '600px', margin: '2.5rem auto 0', position: 'relative' }}>
          <input type="text" placeholder="Search for documentation, troubleshooting, or protocols..." style={{ 
            width: '100%', padding: '1.25rem 1.5rem 1.25rem 3.5rem', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
            color: '#fff', fontSize: '1rem', outline: 'none'
          }} />
          <Search size={22} color="var(--text-secondary)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
        {[
          { icon: Truck, title: "Shipping Protocols", desc: "Live tracking and delivery estimates" },
          { icon: RefreshCcw, title: "Return/Refund", desc: "Hardware de-integration procedures" },
          { icon: CreditCard, title: "Payment Issues", desc: "Transaction verification and billing" },
          { icon: Shield, title: "Account Security", desc: "Neural link protection and recovery" }
        ].map((item, i) => (
          <div key={i} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: '0.3s' }}
               onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
               onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}><item.icon size={36} /></div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '4rem' }}>
        {/* FAQ Section */}
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <HelpCircle size={28} color="var(--primary-color)" /> Frequent Inquiries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ 
                    width: '100%', padding: '1.5rem 2rem', background: 'none', border: 'none', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    cursor: 'pointer', textAlign: 'left' 
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{faq.q}</span>
                  <ChevronDown size={20} style={{ transition: '0.3s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                <div style={{ 
                  maxHeight: openFaq === i ? '200px' : '0', 
                  transition: 'all 0.4s ease', 
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <p style={{ padding: '0 2rem 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Sidebar */}
        <div>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageSquare size={24} color="var(--primary-color)" /> Direct Link
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              Can't find the protocol you need? Connect directly with our support synthetics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</p>
                  <p style={{ fontWeight: 600 }}>support@busycart.tech</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Secure Line</p>
                  <p style={{ fontWeight: 600 }}>+880 1956 149980</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Operation Hours</p>
                  <p style={{ fontWeight: 600 }}>24/7 Neural Sync</p>
                </div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '3rem', padding: '1rem', fontWeight: 800 }}>
              OPEN LIVE TERMINAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
