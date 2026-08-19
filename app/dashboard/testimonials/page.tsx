'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    role: '',
    text: '',
    rating: 5,
    sortOrder: 0,
    isActive: true
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/testimonials/all`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = editingId 
        ? `${apiUrl}/api/v1/testimonials/${editingId}`
        : `${apiUrl}/api/v1/testimonials`;
        
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchTestimonials();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving testimonial');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/testimonials/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', city: '', role: '', text: '', rating: 5, sortOrder: 0, isActive: true });
    setShowModal(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setFormData({
      name: t.name || '',
      city: t.city || '',
      role: t.role || '',
      text: t.text || '',
      rating: t.rating || 5,
      sortOrder: t.sortOrder || 0,
      isActive: t.isActive
    });
    setShowModal(true);
  };

  return (
    <>
      <TopNav title="⭐ Manage Testimonials" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>Client Reviews ({testimonials.length})</h2>
              <p style={{ color: 'var(--mu)', fontSize: '13px', marginTop: '2px' }}>Manage client feedback shown on homepage and marketing sections</p>
            </div>
            <button className="btn-b" onClick={openAddModal}>+ Add Testimonial</button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading testimonials...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role / Designation</th>
                    <th>City</th>
                    <th>Rating</th>
                    <th>Review Text</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No testimonials found.</td></tr>
                  ) : (
                    testimonials.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '700', color: 'var(--td)' }}>{t.name}</td>
                        <td style={{ color: 'var(--tm)' }}>{t.role || '—'}</td>
                        <td style={{ color: 'var(--mu)' }}>{t.city || '—'}</td>
                        <td>{'⭐'.repeat(t.rating || 5)}</td>
                        <td style={{ color: 'var(--mu)', fontSize: '12px', maxWidth: '300px' }}>{t.text}</td>
                        <td>
                          <span className="price-badge" style={{ 
                            background: t.isActive ? '#dcfce7' : '#f3f4f6', 
                            color: t.isActive ? '#166534' : '#6b7280' 
                          }}>
                            {t.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => openEditModal(t)} style={{ color: 'var(--bb)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>Edit</button>
                          <button onClick={() => handleDelete(t.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--bd)', margin: 0 }}>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Client Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. Dr. Rajesh Sharma" />
                </div>
                <div style={{ width: '140px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="New Delhi" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Role / Designation</label>
                <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. Medical Researcher" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Review Text *</label>
                <textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Write feedback here..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bd)', cursor: 'pointer' }}>Active (visible on website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-b">{editingId ? 'Save Changes' : 'Add Testimonial'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
