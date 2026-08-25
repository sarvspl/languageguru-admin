'use client';

import React, { useState, useEffect } from 'react';
import { adminPath } from '../../../lib/basePath';
import TopNav from '@/components/TopNav';
import { API_URL, siteLink } from '../../../lib/env';

export default function PagesManagement() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    metaTitle: '',
    metaDesc: '',
    isActive: true
  });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/pages/admin/all`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
      const url = editingId 
        ? `${apiUrl}/api/v1/pages/${editingId}`
        : `${apiUrl}/api/v1/pages`;
        
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchPages();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/v1/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ slug: '', title: '', content: '', metaTitle: '', metaDesc: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setFormData({
      slug: p.slug || '',
      title: p.title || '',
      content: p.content || '',
      metaTitle: p.metaTitle || '',
      metaDesc: p.metaDesc || '',
      isActive: p.isActive
    });
    setShowModal(true);
  };

  const openEditBySlug = (slugToEdit: string) => {
    const found = pages.find(p => p.slug === slugToEdit);
    if (found) {
      openEditModal(found);
    } else {
      setEditingId(null);
      setFormData({
        slug: slugToEdit,
        title: slugToEdit === 'privacy' ? 'Privacy Policy' : (slugToEdit === 'terms' ? 'Terms of Service' : slugToEdit),
        content: '',
        metaTitle: '',
        metaDesc: '',
        isActive: true
      });
      setShowModal(true);
    }
  };

  return (
    <>
      <TopNav title="📃 Manage CMS & Legal Pages" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                CMS &amp; Legal Content Manager ({pages.length})
              </h2>
              <p style={{ color: 'var(--mu)', fontSize: '13px', margin: '4px 0 0 0' }}>
                Fully customize each and every line, clause, clause headings, and SEO meta tags for <strong>Privacy Policy (/privacy)</strong>, <strong>Terms of Service (/terms)</strong>, and custom pages.
              </p>
            </div>
            <button className="btn-b" onClick={openAddModal}>+ Add New Page</button>
          </div>

          {/* QUICK LEGAL PAGE ACTION CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            
            {/* Privacy Policy Card */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>🔒</span>
                  <strong style={{ color: '#1e40af', fontSize: '15px' }}>Privacy Policy (/privacy)</strong>
                </div>
                <p style={{ fontSize: '12.5px', color: '#3b82f6', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Edit confidentiality, NDA, data security, ISO 17100:2015 privacy standards, and client rights clauses.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => openEditBySlug('privacy')}
                  style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✏️ Edit Privacy Policy
                </button>
                <a
                  href={siteLink('privacy')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#fff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  👁️ View Live
                </a>
              </div>
            </div>

            {/* Terms of Service Card */}
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>📜</span>
                  <strong style={{ color: '#92400e', fontSize: '15px' }}>Terms of Service (/terms)</strong>
                </div>
                <p style={{ fontSize: '12.5px', color: '#b45309', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Edit service guarantees, payment terms, GST, revision policies, liability limits, and dispute jurisdiction.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => openEditBySlug('terms')}
                  style={{ background: '#b45309', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✏️ Edit Terms of Service
                </button>
                <a
                  href={siteLink('terms')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#fff', color: '#b45309', border: '1px solid #fde68a', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  👁️ View Live
                </a>
              </div>
            </div>

            {/* Other Page Editors */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--br)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>🌐</span>
                  <strong style={{ color: 'var(--bd)', fontSize: '15px' }}>About, Contact &amp; Clients Page Editors</strong>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--mu)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Dedicated visual section builders with multi-tab layout for Hero, Stats, Industry cards &amp; Client logos.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href={adminPath('dashboard/about')} style={{ background: 'var(--bd)', color: '#fff', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                  ℹ️ About Manager
                </a>
                <a href={adminPath('dashboard/contact')} style={{ background: '#16a34a', color: '#fff', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                  📞 Contact Manager
                </a>
                <a href={adminPath('dashboard/clients')} style={{ background: '#2563eb', color: '#fff', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                  👥 Clients Manager
                </a>
              </div>
            </div>

          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading CMS pages...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>URL Slug</th>
                    <th>Page Title</th>
                    <th>Meta Title (SEO)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No CMS pages found.</td></tr>
                  ) : (
                    pages.map(p => (
                      <tr key={p.id}>
                        <td style={{ color: '#2563eb', fontWeight: 600, fontFamily: 'monospace' }}>/{p.slug}</td>
                        <td style={{ fontWeight: '700', color: 'var(--td)' }}>{p.title}</td>
                        <td style={{ color: 'var(--mu)', fontSize: '12px', maxWidth: '280px' }}>{p.metaTitle || '—'}</td>
                        <td>
                          <span className="price-badge" style={{ 
                            background: p.isActive ? '#dcfce7' : '#f3f4f6', 
                            color: p.isActive ? '#166534' : '#6b7280' 
                          }}>
                            {p.isActive ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <a
                            href={siteLink(p.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, marginRight: '12px' }}
                          >
                            👁️ View
                          </a>
                          <button onClick={() => openEditModal(p)} style={{ color: 'var(--bb)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>
                            ✏️ Edit Full Text
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            🗑️ Delete
                          </button>
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

      {/* FULL-PAGE RICH MODAL EDITOR */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '14px', width: '100%', maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--br)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--br)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--bd)', margin: 0, fontFamily: "'Lora', serif" }}>
                  {editingId ? `✏️ Edit Page: /${formData.slug}` : '➕ Add New CMS Page'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
                  Edit all paragraphs, clauses, headings, and SEO metadata. Changes are saved directly to the database.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Page Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} placeholder="e.g. Privacy Policy" />
                </div>
                <div>
                  <label style={labelStyle}>URL Slug * (e.g. privacy, terms)</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().trim()})} style={inputStyle} placeholder="e.g. privacy" />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={labelStyle}>Page Full Content (Plain Text or HTML) *</label>
                  <span style={{ fontSize: '12px', color: 'var(--mu)' }}>Lines: {formData.content.split('\n').length} | Words: {formData.content.split(/\s+/).filter(Boolean).length}</span>
                </div>
                <textarea
                  required
                  rows={15}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  style={{
                    ...inputStyle,
                    fontFamily: 'Consolas, Menlo, Monaco, "Courier New", monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    background: '#fafafa',
                    color: '#1e293b'
                  }}
                  placeholder="Enter full legal text, clauses, terms, or policy lines here..."
                />
                <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
                  💡 <em>Tip: You can use plain text paragraphs with line breaks, numbered points (1., 2., 3.), bullet symbols (•), or standard HTML tags (&lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;).</em>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Meta Title (Google &amp; Browser Tab)</label>
                  <input type="text" value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} style={inputStyle} placeholder="e.g. Privacy Policy | Language Guru" />
                </div>
                <div>
                  <label style={labelStyle}>Meta Description (Google Snippet)</label>
                  <input type="text" value={formData.metaDesc} onChange={e => setFormData({...formData, metaDesc: e.target.value})} style={inputStyle} placeholder="e.g. Read Language Guru privacy & data protection policy..." />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bd)', cursor: 'pointer' }}>
                  Published (publicly visible on website at /{formData.slug || 'slug'})
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--br)' }}>
                {editingId && (
                  <a
                    href={siteLink(formData.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                  >
                    🔗 Preview live URL: {siteLink(formData.slug)}
                  </a>
                )}
                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 24px', background: 'var(--bd)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                    {editingId ? '💾 Save & Update Page' : '🚀 Publish Page'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#4b5563',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};
