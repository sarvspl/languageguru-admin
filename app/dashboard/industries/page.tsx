'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

export default function IndustriesManagement() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    icon: '🏭',
    name: '',
    desc: '',
    svc: '',
    isActive: true
  });

  const fetchIndustries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/industries/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setIndustries(data.data);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = editingId 
        ? `${apiUrl}/api/v1/industries/${editingId}`
        : `${apiUrl}/api/v1/industries`;
        
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchIndustries();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving industry');
      }
    } catch (error) {
      console.error('Error saving industry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this industry?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/industries/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchIndustries();
      }
    } catch (error) {
      console.error('Error deleting industry:', error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ icon: '🏭', name: '', desc: '', svc: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (ind: any) => {
    setEditingId(ind.id);
    setFormData({
      icon: ind.icon,
      name: ind.name,
      desc: ind.desc,
      svc: ind.svc,
      isActive: ind.isActive
    });
    setShowModal(true);
  };

  return (
    <>
      <TopNav title="🏭 Manage Industries" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>Supported Industries ({industries.length})</h2>
              <p style={{ color: 'var(--mu)', fontSize: '13px', marginTop: '2px' }}>Manage industries served & service mappings</p>
            </div>
            <button className="btn-b" onClick={openAddModal}>+ Add Industry</button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading industries...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Industry Name</th>
                    <th>Description</th>
                    <th>Service Key</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {industries.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No industries found.</td></tr>
                  ) : (
                    industries.map(ind => (
                      <tr key={ind.id}>
                        <td style={{ fontSize: '22px' }}>{ind.icon}</td>
                        <td style={{ fontWeight: '700', color: 'var(--td)' }}>{ind.name}</td>
                        <td style={{ color: 'var(--mu)', fontSize: '12px', maxWidth: '280px' }}>{ind.desc}</td>
                        <td style={{ color: 'var(--tm)', fontFamily: 'monospace' }}>{ind.svc}</td>
                        <td>
                          <span className="price-badge" style={{ 
                            background: ind.isActive ? '#dcfce7' : '#f3f4f6', 
                            color: ind.isActive ? '#166534' : '#6b7280' 
                          }}>
                            {ind.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => openEditModal(ind)} style={{ color: 'var(--bb)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>Edit</button>
                          <button onClick={() => handleDelete(ind.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--bd)', margin: 0 }}>{editingId ? 'Edit Industry' : 'Add New Industry'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Industry Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. Legal & Court" />
                </div>
                <div style={{ width: '80px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Icon</label>
                  <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', textAlign: 'center' }} placeholder="⚖️" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Description</label>
                <input type="text" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. Contracts · Patents · Court Orders" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Service Key (URL Slug) *</label>
                <input type="text" required value={formData.svc} onChange={e => setFormData({...formData, svc: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. legal" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bd)', cursor: 'pointer' }}>Active (visible on frontend)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-b">{editingId ? 'Save Changes' : 'Add Industry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

