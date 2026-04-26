'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { UserCircle, Mail, Shield, Calendar, Edit3, Save, X, Camera, Lock, Key } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi('/user/profile');
        setProfile(data);
        setFormData({ name: data.name, email: data.email });
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
      setProfile({ ...profile, ...data.user });
      setEditing(false);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append('image', file);

    try {
      await fetchApi('/user/profile/photo', {
        method: 'PUT',
        body,
      });
      // Refresh profile to get new image URL
      const data = await fetchApi('/user/profile');
      setProfile(data);
    } catch (err: any) {
      alert(err.message || 'Photo upload failed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setPassLoading(true);
    try {
      await fetchApi('/user/password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        }),
      });
      alert('Password updated successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.message || 'Password update failed');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Identity Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal credentials and system access level.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Main Info */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                background: profile?.imageUrl ? `url(${profile.imageUrl}) center/cover` : 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '2.5rem', fontWeight: 800, color: '#0b0c10',
                boxShadow: 'var(--glow)', cursor: 'pointer', position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!profile?.imageUrl && profile?.name?.charAt(0).toUpperCase()}
              <div style={{ 
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                opacity: 0, transition: 'opacity 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                <Camera size={24} color="#fff" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
            </div>
            
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
                    />
                    <button onClick={handleUpdate} className="btn-primary" style={{ padding: '0.75rem' }}><Save size={20} /></button>
                    <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }}><X size={24} /></button>
                  </div>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ fontSize: '1rem', padding: '0.5rem 1rem', maxWidth: '300px' }}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 700 }}>{profile?.name}</h2>
                    <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Edit3 size={20} /></button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                    <Mail size={18} /> {profile?.email}
                  </p>
                </div>
              )}
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
                <Calendar size={20} /> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Lock size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security Update</h3>
          </div>
          
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Current Password</label>
              <input 
                type="password" 
                className="input-field" 
                required
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>New Password</label>
              <input 
                type="password" 
                className="input-field" 
                required
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Confirm New Password</label>
              <input 
                type="password" 
                className="input-field" 
                required
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={passLoading}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {passLoading ? 'Updating...' : <><Key size={18} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
