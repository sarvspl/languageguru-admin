'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface City {
  id: string;
  name: string;
  key: string;
  ic: string;
  state: string;
  isMetro: boolean;
  isActive: boolean;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ name: '', key: '', ic: '', state: '', isMetro: true, isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/cities`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCities(data.data);
      else setError(data.message || 'Failed to fetch cities');
    } catch (err) {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleOpenAdd = () => {
    setEditingCity(null);
    setFormData({ name: '', key: '', ic: '', state: '', isMetro: true, isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
    setFormData({ name: city.name, key: city.key, ic: city.ic || '', state: city.state || '', isMetro: city.isMetro, isActive: city.isActive });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCity 
        ? `${API_URL}/api/v1/cities/${editingCity.id}`
        : `${API_URL}/api/v1/cities`;
      const method = editingCity ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');

      setShowModal(false);
      fetchCities();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/cities/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      fetchCities();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <TopNav title="🏙️ Manage Cities" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>Supported Cities ({cities.length})</h2>
            <button className="btn-b" onClick={handleOpenAdd}>+ Add City</button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading from API...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>City Name</th>
                    <th>Key</th>
                    <th>State</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city) => (
                    <tr key={city.id}>
                      <td style={{ fontWeight: '700', color: 'var(--td)' }}>{city.ic || '🏙️'} {city.name}</td>
                      <td style={{ color: 'var(--tm)', fontFamily: 'monospace' }}>{city.key}</td>
                      <td style={{ color: 'var(--mu)' }}>{city.state || 'N/A'}</td>
                      <td>
                        <span className="price-badge" style={{ 
                          background: city.isMetro ? '#e0e7ff' : '#f3f4f6', 
                          color: city.isMetro ? '#3730a3' : '#4b5563', 
                        }}>
                          {city.isMetro ? 'Metro' : 'Standard'}
                        </span>
                      </td>
                      <td>
                        <span className="price-badge" style={{ 
                          background: city.isActive ? '#dcfce7' : '#f3f4f6', 
                          color: city.isActive ? '#166534' : '#4b5563', 
                        }}>
                          {city.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEdit(city)} style={{ background: 'none', border: 'none', color: 'var(--bb)', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(city.id, city.name)} style={{ background: 'none', border: 'none', color: 'var(--rd)', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {cities.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No cities found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--bd)' }}>
              {editingCity ? 'Edit City' : 'Add New City'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>City Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Unique Key (slug)</label>
                  <input 
                    type="text" 
                    required
                    disabled={Boolean(editingCity)}
                    value={formData.key} 
                    onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })} 
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px', background: editingCity ? '#f9fafb' : undefined }}
                  />
                </div>
                <div style={{ width: '80px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Icon 🏙️</label>
                  <select
                    value={formData.ic}
                    onChange={e => setFormData({ ...formData, ic: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px', textAlign: 'center', fontSize: '20px', appearance: 'none', cursor: 'pointer', background: 'transparent' }}
                  >
                    <option value="">🏙️</option>
                    <option value="🏙️">🏙️ Cityscape</option>
                    <option value="🏢">🏢 Office</option>
                    <option value="🏭">🏭 Factory</option>
                    <option value="🏰">🏰 Castle/Fort</option>
                    <option value="🗼">🗼 Tower</option>
                    <option value="🗽">🗽 Statue</option>
                    <option value="🕌">🕌 Mosque</option>
                    <option value="🛕">🛕 Temple</option>
                    <option value="⛩️">⛩️ Shrine</option>
                    <option value="🌉">🌉 Bridge</option>
                    <option value="🌄">🌄 Sunrise</option>
                    <option value="🌴">🌴 Palm Tree</option>
                    <option value="🌲">🌲 Evergreen</option>
                    <option value="🏖️">🏖️ Beach</option>
                    <option value="📍">📍 Pin</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>State</label>
                <input 
                  type="text" 
                  value={formData.state} 
                  onChange={e => setFormData({ ...formData, state: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox"
                  id="isMetro" 
                  checked={formData.isMetro} 
                  onChange={e => setFormData({ ...formData, isMetro: e.target.checked })} 
                />
                <label htmlFor="isMetro" style={{ fontSize: '14px', fontWeight: '600' }}>Metro City</label>
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
