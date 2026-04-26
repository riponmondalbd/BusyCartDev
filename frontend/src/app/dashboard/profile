'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi('/user/profile');
        setProfile(data);
        setName(data.name);
      } catch (err: any) {
        setError('Failed to load profile. Please login.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const data = await fetchApi('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      setProfile({ ...profile!, name: data.name || name });
      setEditMode(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--primary-color)' }}>Loading your digital identity...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--error-color)' }}>{error}</div>;
  }

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Profile Terminal</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your BusyCart identity</p>
          </div>
          <button onClick={handleLogout} className="btn-primary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>
            System Logout
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '2rem', fontWeight: 'bold', color: 'var(--bg-color)',
              boxShadow: 'var(--glow)'
            }}>
              {profile?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{profile?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{profile?.email}</p>
              <span style={{ 
                background: 'rgba(102, 252, 241, 0.1)', color: 'var(--primary-color)', 
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
              }}>
                {profile?.role}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Personal Information</h3>
              <button onClick={() => setEditMode(!editMode)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                {editMode ? 'Cancel' : 'Edit Info'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={updateLoading}>
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Full Name</p>
                  <p style={{ fontSize: '1.1rem' }}>{profile?.name}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Email Address</p>
                  <p style={{ fontSize: '1.1rem' }}>{profile?.email}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Dashboards & Logs</h3>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button onClick={() => router.push('/orders')} className="btn-primary" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
                Order History Logs
              </button>
              <button onClick={() => router.push('/refunds')} className="btn-primary" style={{ padding: '1rem', flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                Refund Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
