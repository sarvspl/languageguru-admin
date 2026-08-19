'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        // Backend set the httpOnly cookie securely
        // Now redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
        setLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to server. Ensure backend is running.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--g1)' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shh)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌐</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--td)', fontFamily: "'Nunito', sans-serif" }}>Language Guru Admin</h1>
          <p style={{ fontSize: '13px', color: 'var(--mu)' }}>Secure CMS Login</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--tm)', marginBottom: '6px' }}>Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--br)', outline: 'none', fontSize: '14px' }} 
              placeholder="admin"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--tm)', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--br)', outline: 'none', fontSize: '14px' }} 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: 'var(--bd)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: '800', border: 'none', marginTop: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
