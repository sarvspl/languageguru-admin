'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';

export default function FaqsManagement() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    sortOrder: 0,
    isActive: true
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/faqs/all`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
      const url = editingId 
        ? `${apiUrl}/api/v1/faqs/${editingId}`
        : `${apiUrl}/api/v1/faqs`;
        
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchFaqs();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/v1/faqs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchFaqs();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ question: '', answer: '', category: 'General', sortOrder: 0, isActive: true });
    setShowModal(true);
  };

  const openEditModal = (f: any) => {
    setEditingId(f.id);
    setFormData({
      question: f.question || '',
      answer: f.answer || '',
      category: f.category || 'General',
      sortOrder: f.sortOrder || 0,
      isActive: f.isActive
    });
    setShowModal(true);
  };

  return (
    <>
      <TopNav title="❓ Manage FAQs" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>Frequently Asked Questions ({faqs.length})</h2>
              <p style={{ color: 'var(--mu)', fontSize: '13px', marginTop: '2px' }}>Manage FAQ content shown on help section</p>
            </div>
            <button className="btn-b" onClick={openAddModal}>+ Add FAQ</button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading FAQs...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No FAQs found.</td></tr>
                  ) : (
                    faqs.map(f => (
                      <tr key={f.id}>
                        <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{f.category}</span></td>
                        <td style={{ fontWeight: '700', color: 'var(--td)', maxWidth: '240px' }}>{f.question}</td>
                        <td style={{ color: 'var(--mu)', fontSize: '12px', maxWidth: '360px' }}>{f.answer}</td>
                        <td>
                          <span className="price-badge" style={{ 
                            background: f.isActive ? '#dcfce7' : '#f3f4f6', 
                            color: f.isActive ? '#166534' : '#6b7280' 
                          }}>
                            {f.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => openEditModal(f)} style={{ color: 'var(--bb)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>Edit</button>
                          <button onClick={() => handleDelete(f.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--bd)', margin: 0 }}>{editingId ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. General, Delivery, Pricing" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Question *</label>
                <input type="text" required value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. What is Certified Translation?" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Answer *</label>
                <textarea required rows={4} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Provide detailed explanation..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bd)', cursor: 'pointer' }}>Active (visible on website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-b">{editingId ? 'Save Changes' : 'Add FAQ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
