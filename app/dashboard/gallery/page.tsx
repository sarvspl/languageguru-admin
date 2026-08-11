'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DOC_CATEGORIES = [
  'Birth Certificate', 'Marriage Certificate', 'Degree Certificate',
  'Legal', 'Medical', 'Business', 'Visa', 'General'
];

const DOC_ICONS: Record<string, string> = {
  'Birth Certificate': '📜',
  'Marriage Certificate': '💒',
  'Degree Certificate': '🎓',
  'Legal': '⚖️',
  'Medical': '🏥',
  'Business': '🏢',
  'Visa': '✈️',
  'General': '📄',
};

interface GalleryItem {
  id: string;
  doc: string;
  lang: string;
  flag: string;
  langKey: string;
  time: string;
  icon: string;
  seal: string;
  acc: string;
  cat: string;
  isActive: boolean;
}

const defaultForm = {
  doc: '', lang: '', flag: '🏳️', langKey: '',
  time: '24 Hrs', icon: '📄', seal: '🏳️',
  acc: '', cat: 'General', isActive: true
};

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/gallery/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setItems(data.data);
      else setError(data.message || 'Failed to fetch gallery');
    } catch {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ ...defaultForm });
    setShowModal(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      doc: item.doc, lang: item.lang, flag: item.flag, langKey: item.langKey || '',
      time: item.time || '24 Hrs', icon: item.icon || '📄', seal: item.seal || item.flag,
      acc: item.acc || '', cat: item.cat || 'General', isActive: item.isActive
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingItem
        ? `${API_URL}/api/v1/gallery/${editingItem.id}`
        : `${API_URL}/api/v1/gallery`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, doc: string) => {
    if (!confirm(`Delete gallery item "${doc}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/gallery/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = items.filter(g => {
    const matchCat = filterCat === 'All' || g.cat === filterCat;
    const matchSearch = !search || g.doc.toLowerCase().includes(search.toLowerCase()) || g.lang.toLowerCase().includes(search.toLowerCase()) || g.acc?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const inp = { width: '100%', padding: '8px 10px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '13px', fontFamily: 'Nunito,sans-serif' };
  const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: 'var(--mu)', marginBottom: '4px' };

  return (
    <div className="adm-main">
      <TopNav title="Gallery Management" />
      <div style={{ padding: '24px', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--td)', margin: 0 }}>Sample Certificate Gallery</h2>
            <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '2px 0 0' }}>{items.length} items total · {filtered.length} shown</p>
          </div>
          <button onClick={handleOpenAdd} style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
            + Add Gallery Item
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            placeholder="🔍 Search doc, language, authority..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inp, width: '260px', flex: '0 0 auto' }}
          />
          {['All', ...DOC_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--br)',
                background: filterCat === cat ? 'var(--bd)' : 'transparent',
                color: filterCat === cat ? '#fff' : 'var(--td)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--mu)' }}>Loading gallery...</div>}
        {error && <div style={{ color: 'red', padding: '12px', background: '#fff0f0', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1a3a6b', color: '#fff' }}>
                  {['Icon', 'Document', 'Language Pair', 'Accepted By', 'Delivery', 'Category', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.7px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--g1)', borderBottom: '1px solid var(--br)' }}>
                    <td style={{ padding: '10px 12px', fontSize: '20px' }}>{item.icon || DOC_ICONS[item.cat] || '📄'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--td)' }}>{item.doc}</td>
                    <td style={{ padding: '10px 12px' }}>{item.flag} {item.lang}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--mu)' }}>{item.acc || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: 'rgba(22,163,74,.1)', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '11px' }}>
                        {item.time || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: 'rgba(30,127,197,.1)', color: '#1e7fc5', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '11px' }}>
                        {item.cat}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: item.isActive ? 'rgba(22,163,74,.12)' : 'rgba(239,68,68,.12)',
                        color: item.isActive ? '#16a34a' : '#dc2626',
                        padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '11px'
                      }}>
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleOpenEdit(item)} style={{ background: 'none', border: 'none', color: '#1e7fc5', fontWeight: 700, cursor: 'pointer', marginRight: '10px', fontSize: '13px' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id, item.doc)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--mu)' }}>No gallery items found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--td)' }}>{editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--mu)' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {/* Row 1: Doc + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Document Type *</label>
                  <input required value={formData.doc} onChange={e => setFormData({ ...formData, doc: e.target.value })} placeholder="e.g. Birth Certificate" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Category *</label>
                  <select required value={formData.cat} onChange={e => setFormData({ ...formData, cat: e.target.value, icon: DOC_ICONS[e.target.value] || '📄' })} style={inp}>
                    {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Language Pair + Flag */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Language Pair *</label>
                  <input required value={formData.lang} onChange={e => setFormData({ ...formData, lang: e.target.value })} placeholder="e.g. English → German" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Flag</label>
                  <input value={formData.flag} onChange={e => setFormData({ ...formData, flag: e.target.value })} placeholder="🇩🇪" style={{ ...inp, textAlign: 'center', fontSize: '20px' }} />
                </div>
              </div>

              {/* Row 3: Accepted By + Delivery Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Accepted By (Authority)</label>
                  <input value={formData.acc} onChange={e => setFormData({ ...formData, acc: e.target.value })} placeholder="e.g. German Embassy" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Delivery Time</label>
                  <select value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={inp}>
                    {['24 Hrs', '48 Hrs', '72 Hrs', '96 Hrs', 'Same Day', '3-5 Days'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Language Key + Icon + Seal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Language Key (slug)</label>
                  <input value={formData.langKey} onChange={e => setFormData({ ...formData, langKey: e.target.value.toLowerCase() })} placeholder="e.g. german" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Icon</label>
                  <input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} style={{ ...inp, textAlign: 'center', fontSize: '20px' }} />
                </div>
                <div>
                  <label style={lbl}>Seal</label>
                  <input value={formData.seal} onChange={e => setFormData({ ...formData, seal: e.target.value })} style={{ ...inp, textAlign: 'center', fontSize: '20px' }} />
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="gActiveChk" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                <label htmlFor="gActiveChk" style={{ fontSize: '13px', fontWeight: 700 }}>Active (visible on frontend)</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid var(--br)', background: '#f9fafb', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 20px', borderRadius: '8px', background: 'var(--bd)', color: '#fff', border: 'none', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: saving ? .7 : 1 }}>
                  {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
