'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Language {
  id: string;
  name: string;
  key: string;
  flag: string;
  native: string;
  cat: string;
  speakers: string;
  region: string;
  difficulty: string;
  script: string;
  price: number;
  isActive: boolean;
}

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', key: '', flag: '🌐', native: '', cat: '', speakers: '', region: '', difficulty: '', script: '', price: 0, isActive: true 
  });
  const [saving, setSaving] = useState(false);

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/languages`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.json();
      setLanguages(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleOpenAdd = () => {
    setEditingLang(null);
    setFormData({ name: '', key: '', flag: '🌐', native: '', cat: '', speakers: '', region: '', difficulty: '', script: '', price: 0, isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (lang: Language) => {
    setEditingLang(lang);
    setFormData({ 
      name: lang.name, key: lang.key, flag: lang.flag, 
      native: lang.native || '', cat: lang.cat || '', speakers: lang.speakers || '', 
      region: lang.region || '', difficulty: lang.difficulty || '', script: lang.script || '', price: lang.price || 0,
      isActive: lang.isActive 
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingLang 
        ? `${API_URL}/api/v1/languages/${editingLang.id}`
        : `${API_URL}/api/v1/languages`;
      const method = editingLang ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');

      setShowModal(false);
      fetchLanguages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/languages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      fetchLanguages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <TopNav title="🌐 Manage Languages" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>All Languages ({languages.length})</h2>
            <button className="btn-b" onClick={handleOpenAdd}>+ Add Language</button>
          </div>
          
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading from API...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((lang) => (
                    <tr key={lang.id}>
                      <td style={{ fontSize: '20px' }}>{lang.flag}</td>
                      <td style={{ fontWeight: '700', color: 'var(--td)' }}>{lang.name}</td>
                      <td style={{ color: 'var(--tm)', fontFamily: 'monospace' }}>{lang.key}</td>
                      <td>
                        <span className="price-badge" style={{ 
                          background: lang.isActive ? '#dcfce7' : '#f3f4f6', 
                          color: lang.isActive ? '#166534' : '#4b5563', 
                        }}>
                          {lang.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEdit(lang)} style={{ background: 'none', border: 'none', color: 'var(--bb)', cursor: 'pointer', fontWeight: '700', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(lang.id, lang.name)} style={{ background: 'none', border: 'none', color: 'var(--rd)', cursor: 'pointer', fontWeight: '700' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--bd)' }}>
              {editingLang ? 'Edit Language' : 'Add New Language'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Language Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Unique Key (slug)</label>
                <input 
                  type="text" 
                  required
                  disabled={Boolean(editingLang)}
                  value={formData.key} 
                  onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Flag Emoji</label>
                <input 
                  type="text" 
                  required
                  value={formData.flag} 
                  onChange={e => setFormData({ ...formData, flag: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Native Name</label>
                  <input type="text" value={formData.native} onChange={e => setFormData({ ...formData, native: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Category</label>
                  <select value={formData.cat} onChange={e => setFormData({ ...formData, cat: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} required>
                    <option value="" disabled>Select Category</option>
                    <option value="European">European</option>
                    <option value="Asian">Asian</option>
                    <option value="Middle East">Middle East</option>
                    <option value="African">African</option>
                    <option value="Indian">Indian</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Speakers</label>
                  <input type="text" value={formData.speakers} onChange={e => setFormData({ ...formData, speakers: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} placeholder="135M" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Region</label>
                  <input type="text" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Difficulty</label>
                  <input type="text" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Script</label>
                  <input type="text" value={formData.script} onChange={e => setFormData({ ...formData, script: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Price / Page</label>
                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }} />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox"
                  id="isActive" 
                  checked={formData.isActive} 
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '600' }}>Active</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 16px', background: 'var(--bd)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
