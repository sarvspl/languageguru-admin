'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Service {
  id: string;
  name: string;
  key: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', key: '', icon: '🛠️', description: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/services`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setServices(data.data);
      else setError(data.message || 'Failed to fetch services');
    } catch (err) {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({ name: '', key: '', icon: '🛠️', description: '', isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setFormData({ name: svc.name, key: svc.key, icon: svc.icon || '🛠️', description: svc.description || '', isActive: svc.isActive });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingService 
        ? `${API_URL}/api/v1/services/${editingService.id}`
        : `${API_URL}/api/v1/services`;
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');

      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/services/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <TopNav title="🛠️ Manage Services" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>All Services ({services.length})</h2>
            <button className="btn-b" onClick={handleOpenAdd}>+ Add Service</button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading from API...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Service Name</th>
                    <th>Key</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td style={{ fontSize: '20px' }}>{service.icon || '🛠️'}</td>
                      <td style={{ fontWeight: '700', color: 'var(--td)' }}>{service.name}</td>
                      <td style={{ color: 'var(--tm)', fontFamily: 'monospace' }}>{service.key}</td>
                      <td style={{ color: 'var(--mu)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.description || '—'}</td>
                      <td>
                        <span className="price-badge" style={{ 
                          background: service.isActive ? '#dcfce7' : '#f3f4f6', 
                          color: service.isActive ? '#166534' : '#4b5563', 
                        }}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEdit(service)} style={{ background: 'none', border: 'none', color: 'var(--bb)', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(service.id, service.name)} style={{ background: 'none', border: 'none', color: 'var(--rd)', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No services found.</td>
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
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Service Name</label>
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
                  disabled={Boolean(editingService)}
                  value={formData.key} 
                  onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Icon Emoji</label>
                <input 
                  type="text" 
                  required
                  value={formData.icon} 
                  onChange={e => setFormData({ ...formData, icon: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px', fontFamily: 'inherit' }}
                />
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
