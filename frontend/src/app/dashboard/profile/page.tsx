'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { UserCircle, Mail, Shield, Calendar, Edit3, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi('/user/profile');
        setProfile(data);
        setFormData({ name: data.name });
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleUpdate = async () => {
    try {
      const data = await fetchApi('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setProfile(data);
      setEditing(false);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  if (loading) return null;

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Identity Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal credentials and system access level.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '2.5rem', fontWeight: 800, color: '#0b0c10',
            boxShadow: 'var(--glow)'
          }}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            {editing ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ name: e.target.value })}
                  style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
                />
                <button onClick={handleUpdate} className="btn-primary" style={{ padding: '0.75rem' }}><Save size={20} /></button>
                <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }}><X size={24} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{profile?.name}</h2>
                <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Edit3 size={20} /></button>
              </div>
            )}
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Mail size={16} /> {profile?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clearance Level</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} /> {profile?.role}
            </p>
          </div>
          <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Member Since</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} /> {new Date(profile?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
