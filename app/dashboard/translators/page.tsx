'use client';

import React, { useEffect, useState, useMemo } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';


const SPECIALIZATIONS = ['Legal', 'Medical', 'Technical', 'Academic', 'Business', 'Immigration'];

interface Translator {
  id: string;
  name: string;
  lang: string;
  city: string;
  spec: string;
  exp: string;
  rate: string;
  cert: string;
  isActive: boolean;
}

const defaultForm = {
  name: '', lang: '', city: '', spec: 'Legal',
  exp: '', rate: '₹899/pg', cert: '', isActive: true
};

export default function TranslatorsAdminPage() {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTranslator, setEditingTranslator] = useState<Translator | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('All');
  const [filterSpec, setFilterSpec] = useState('All');

  const fetchTranslators = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/translators/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setTranslators(data.data);
      else setError(data.message || 'Failed to fetch translators');
    } catch {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTranslators(); }, []);

  const allLangs = useMemo(() => ['All', ...[...new Set(translators.map(t => t.lang))].sort()], [translators]);

  const handleOpenAdd = () => {
    setEditingTranslator(null);
    setFormData({ ...defaultForm });
    setShowModal(true);
  };

  const handleOpenEdit = (t: Translator) => {
    setEditingTranslator(t);
    setFormData({ name: t.name, lang: t.lang, city: t.city, spec: t.spec || 'Legal', exp: t.exp || '', rate: t.rate || '₹899/pg', cert: t.cert || '', isActive: t.isActive });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingTranslator
        ? `${API_URL}/api/v1/translators/${editingTranslator.id}`
        : `${API_URL}/api/v1/translators`;
      const method = editingTranslator ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');
      setShowModal(false);
      fetchTranslators();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete translator "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/translators/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      fetchTranslators();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = translators.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.lang.toLowerCase().includes(q) || t.city.toLowerCase().includes(q);
    const matchLang = filterLang === 'All' || t.lang === filterLang;
    const matchSpec = filterSpec === 'All' || t.spec === filterSpec;
    return matchSearch && matchLang && matchSpec;
  });

  const inp = { width: '100%', padding: '8px 10px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '13px', fontFamily: 'Nunito,sans-serif' };
  const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: 'var(--mu)', marginBottom: '4px' };

  const specColor: Record<string, string> = {
    Legal: '#7c3aed', Medical: '#dc2626', Technical: '#2563eb',
    Academic: '#d97706', Business: '#059669', Immigration: '#0891b2'
  };

  return (
    <div>
      <TopNav title="Translator Management" />
      <div style={{ padding: '24px', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--td)', margin: 0 }}>Translators Panel</h2>
            <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '2px 0 0' }}>{translators.length} translators total · {filtered.length} shown</p>
          </div>
          <button onClick={handleOpenAdd} style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
            + Add Translator
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            placeholder="🔍 Search name, language, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inp, width: '260px', flex: '0 0 auto' }}
          />
          <select value={filterLang} onChange={e => setFilterLang(e.target.value)} style={{ ...inp, width: 'auto' }}>
            {allLangs.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} style={{ ...inp, width: 'auto' }}>
            {['All', ...SPECIALIZATIONS].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--mu)' }}>Loading translators...</div>}
        {error && <div style={{ color: 'red', padding: '12px', background: '#fff0f0', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1a3a6b', color: '#fff' }}>
                  {['Translator', 'Language', 'City', 'Specialization', 'Experience', 'Rate', 'Certification', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.7px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--g1)', borderBottom: '1px solid var(--br)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--td)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a3a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                          {t.name.charAt(0)}
                        </div>
                        {t.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{t.lang}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--mu)' }}>{t.city}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: `${specColor[t.spec] || '#6b7280'}18`,
                        color: specColor[t.spec] || '#6b7280',
                        padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '11px'
                      }}>
                        {t.spec || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--mu)' }}>{t.exp || '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>{t.rate || '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--mu)', fontSize: '12px' }}>{t.cert || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: t.isActive ? 'rgba(22,163,74,.12)' : 'rgba(239,68,68,.12)',
                        color: t.isActive ? '#16a34a' : '#dc2626',
                        padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '11px'
                      }}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleOpenEdit(t)} style={{ background: 'none', border: 'none', color: '#1e7fc5', fontWeight: 700, cursor: 'pointer', marginRight: '10px', fontSize: '13px' }}>Edit</button>
                      <button onClick={() => handleDelete(t.id, t.name)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--mu)' }}>No translators found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--td)' }}>{editingTranslator ? 'Edit Translator' : 'Add New Translator'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--mu)' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={lbl}>Full Name *</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Priya Sharma" style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Language *</label>
                  <input required value={formData.lang} onChange={e => setFormData({ ...formData, lang: e.target.value })} placeholder="e.g. German" style={inp} />
                </div>
                <div>
                  <label style={lbl}>City *</label>
                  <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="e.g. New Delhi" style={inp} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Specialization</label>
                  <select value={formData.spec} onChange={e => setFormData({ ...formData, spec: e.target.value })} style={inp}>
                    {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Experience</label>
                  <input value={formData.exp} onChange={e => setFormData({ ...formData, exp: e.target.value })} placeholder="e.g. 8 years" style={inp} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Rate per Page</label>
                  <input value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} placeholder="e.g. ₹899/pg" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Certification</label>
                  <input value={formData.cert} onChange={e => setFormData({ ...formData, cert: e.target.value })} placeholder="e.g. MA Translation" style={inp} />
                </div>
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="tActiveChk" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                <label htmlFor="tActiveChk" style={{ fontSize: '13px', fontWeight: 700 }}>Active (visible on frontend)</label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid var(--br)', background: '#f9fafb', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 20px', borderRadius: '8px', background: 'var(--bd)', color: '#fff', border: 'none', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: saving ? .7 : 1 }}>
                  {saving ? 'Saving...' : editingTranslator ? 'Update Translator' : 'Add Translator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
