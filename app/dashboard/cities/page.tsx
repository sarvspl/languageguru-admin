'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';
import CityOverridesEditor from './CityOverridesEditor';
import CityRowsEditor, { type Row } from './CityRowsEditor';


interface City {
  id: string;
  name: string;
  key: string;
  /** Admin-editable URL slug. `key` above stays fixed as the identifier. */
  slug?: string;
  ic: string;
  state: string;
  isMetro: boolean;
  isActive: boolean;
  /** Per-city SEO. Falls back to the shared city page template when empty. */
  metaTitle?: string | null;
  metaDesc?: string | null;
  /** Overrides for individual keys of the shared city page template. */
  contentOverrides?: Record<string, string> | null;
  /** This city's own FAQ pairs; when set they replace the shared list. */
  faqs?: Row[] | null;
  /** This city's own reviews; when set they replace the shared ones. */
  reviews?: Row[] | null;
}

type Tab = 'details' | 'seo' | 'content' | 'faqs' | 'reviews';

const TABS: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'seo', label: 'SEO' },
  { id: 'content', label: 'Page content' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'reviews', label: 'Reviews' },
];

const asRows = (v: unknown): Row[] =>
  Array.isArray(v) ? (v as Row[]).map((r) => ({ ...(r as Row) })) : [];

export default function CitiesPage() {
  // Inline slug editing. `key` stays fixed as the identifier the site and the
  // legacy script resolve against; only the public URL changes.
  const [slugEdit, setSlugEdit] = useState<{ id: string; value: string } | null>(null);
  const [slugMsg, setSlugMsg] = useState<{ id: string; kind: 'ok' | 'err'; text: string } | null>(null);
  const [slugSaving, setSlugSaving] = useState(false);

  const saveSlug = async (city: any, nextSlug: string) => {
    const current = city.slug || city.key;
    if (nextSlug.trim() === current) { setSlugEdit(null); return; }
    setSlugSaving(true);
    setSlugMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/cities/${city.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug: nextSlug.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSlugMsg({ id: city.id, kind: 'ok', text: `URL is now /cities/${data.data.slug}` });
        setSlugEdit(null);
        await fetchCities();
      } else {
        setSlugMsg({ id: city.id, kind: 'err', text: data.message || 'Could not save the slug.' });
      }
    } catch {
      setSlugMsg({ id: city.id, kind: 'err', text: 'Could not reach the API.' });
    } finally {
      setSlugSaving(false);
    }
  };

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({
    name: '', key: '', ic: '', state: '', isMetro: true, isActive: true,
    metaTitle: '', metaDesc: '',
    contentOverrides: {} as Record<string, string>,
    faqs: [] as Row[],
    reviews: [] as Row[],
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('details');

  // The shared city page template, so the overrides tab can show what each key
  // currently says and store only the keys this city actually changes.
  const [template, setTemplate] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/site-pages?key=cities`);
        const json = await res.json();
        const settings = json?.data?.[0]?.section?.['detail-template']?.settings;
        if (settings && typeof settings === 'object') {
          const flat: Record<string, string> = {};
          Object.entries(settings as Record<string, unknown>).forEach(([k, v]) => {
            if (typeof v === 'string') flat[k] = v;
          });
          setTemplate(flat);
        }
      } catch {
        /* the overrides tab explains itself when the template is unavailable */
      }
    })();
  }, []);

  const fetchCities = async () => {
    try {
      // /cities is the public endpoint and returns published cities only, so
      // deactivating one used to remove it from this screen for good. /all is
      // the admin view.
      const res = await fetch(`${API_URL}/api/v1/cities/all`, { credentials: 'include' });
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
    setTab('details');
    setFormData({
      name: '', key: '', ic: '', state: '', isMetro: true, isActive: true,
      metaTitle: '', metaDesc: '', contentOverrides: {}, faqs: [], reviews: [],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
    setTab('details');
    setFormData({
      name: city.name,
      key: city.key,
      ic: city.ic || '',
      state: city.state || '',
      isMetro: city.isMetro,
      isActive: city.isActive,
      metaTitle: city.metaTitle || '',
      metaDesc: city.metaDesc || '',
      contentOverrides:
        city.contentOverrides && typeof city.contentOverrides === 'object'
          ? { ...(city.contentOverrides as Record<string, string>) }
          : {},
      faqs: asRows(city.faqs),
      reviews: asRows(city.reviews),
    });
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
        // Empty overrides and blank rows are dropped rather than stored, so a
        // city carries only its real exceptions and keeps inheriting the rest.
        body: JSON.stringify({
          ...formData,
          contentOverrides: Object.fromEntries(
            Object.entries(formData.contentOverrides).filter(([, v]) => String(v ?? '').trim() !== '')
          ),
          faqs: formData.faqs.filter((f) => String(f.q ?? '').trim() && String(f.a ?? '').trim()),
          reviews: formData.reviews.filter((r) => String(r.text ?? '').trim()),
        })
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
                    <th>Slug URL</th>
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
                      <td style={{ fontFamily: 'monospace', fontSize: '13px', minWidth: '240px' }}>
                        {slugEdit?.id === city.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--mu)' }}>/cities/</span>
                            <input
                              autoFocus
                              value={slugEdit.value}
                              onChange={(e) => setSlugEdit({ id: city.id, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveSlug(city, slugEdit.value);
                                if (e.key === 'Escape') { setSlugEdit(null); setSlugMsg(null); }
                              }}
                              style={{ width: '130px', padding: '4px 7px', borderRadius: '5px', border: '1px solid var(--bb)', fontFamily: 'monospace', fontSize: '13px' }}
                            />
                            <button
                              onClick={() => saveSlug(city, slugEdit.value)}
                              disabled={slugSaving}
                              title="Save slug"
                              style={{ border: 'none', background: 'var(--bd)', color: '#fff', borderRadius: '5px', padding: '4px 9px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              {slugSaving ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setSlugEdit(null); setSlugMsg(null); }}
                              title="Cancel"
                              style={{ border: '1px solid var(--br)', background: '#fff', color: 'var(--mu)', borderRadius: '5px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSlugEdit({ id: city.id, value: city.slug || city.key }); setSlugMsg(null); }}
                            title="Click to change this page's URL"
                            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--bb)', fontFamily: 'monospace', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            /cities/{city.slug || city.key}
                            <span style={{ fontSize: '11px', opacity: 0.55 }}>✏️</span>
                          </button>
                        )}
                        {slugMsg?.id === city.id && (
                          <div style={{ fontFamily: 'inherit', fontSize: '11.5px', marginTop: '5px', lineHeight: 1.45, color: slugMsg.kind === 'ok' ? '#166534' : '#b91c1c' }}>
                            {slugMsg.text}
                          </div>
                        )}
                        {city.slug && city.slug !== city.key && (
                          <div style={{ fontFamily: 'inherit', fontSize: '10.5px', color: 'var(--mu)', marginTop: '3px' }}>
                            id: <code>{city.key}</code> (fixed)
                          </div>
                        )}
                      </td>
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
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '860px', maxWidth: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--bd)' }}>
              {editingCity ? `Edit ${editingCity.name}` : 'Add New City'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--mu)', marginBottom: '14px' }}>
              Wording shared by every city page lives under Site Pages → Cities. The tabs here are
              for what makes this one city different.
            </p>

            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--br)', marginBottom: '16px', flexWrap: 'wrap' }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === t.id ? '2px solid var(--bd)' : '2px solid transparent',
                    color: tab === t.id ? 'var(--bd)' : 'var(--mu)',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                  {t.id === 'content' && Object.keys(formData.contentOverrides).length > 0 && ` (${Object.keys(formData.contentOverrides).length})`}
                  {t.id === 'faqs' && formData.faqs.length > 0 && ` (${formData.faqs.length})`}
                  {t.id === 'reviews' && formData.reviews.length > 0 && ` (${formData.reviews.length})`}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ display: tab === 'details' ? 'block' : 'none' }}>
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

              </div>{/* end details tab */}

              <div style={{ display: tab === 'seo' ? 'block' : 'none' }}>
                <p style={{ fontSize: '12.5px', color: 'var(--mu)', lineHeight: 1.7, marginBottom: '12px' }}>
                  Leave these empty and the page falls back to the shared template&apos;s page title
                  and subtitle, with {'{city}'} filled in.
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>SEO title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    placeholder={`Translation Services in ${formData.name || '…'} | Language Guru`}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>SEO description</label>
                  <textarea
                    rows={4}
                    value={formData.metaDesc}
                    placeholder="Shown in search results. Around 150–160 characters works best."
                    onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--br)', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--mu)', marginTop: '4px' }}>
                    {formData.metaDesc.length} characters
                  </div>
                </div>
              </div>

              <div style={{ display: tab === 'content' ? 'block' : 'none' }}>
                <CityOverridesEditor
                  template={template}
                  value={formData.contentOverrides}
                  cityName={formData.name}
                  onChange={(next) => setFormData({ ...formData, contentOverrides: next })}
                />
              </div>

              <div style={{ display: tab === 'faqs' ? 'block' : 'none' }}>
                <CityRowsEditor
                  rows={formData.faqs}
                  noun="Question"
                  help="Add questions here only if this city needs its own set — they replace the shared city FAQs entirely. {city} and {lang} are replaced when the page renders."
                  fields={[
                    { name: 'q', label: 'Question', span: 12 },
                    { name: 'a', label: 'Answer', multiline: true, span: 12 },
                  ]}
                  onChange={(next) => setFormData({ ...formData, faqs: next })}
                />
              </div>

              <div style={{ display: tab === 'reviews' ? 'block' : 'none' }}>
                <CityRowsEditor
                  rows={formData.reviews}
                  noun="Review"
                  help="Real client reviews for this city. When empty the page shows the site-wide testimonials instead; when set, these replace them."
                  fields={[
                    { name: 'name', label: 'Client name', span: 6 },
                    { name: 'role', label: 'Role / context', placeholder: 'Business, Mumbai', span: 6 },
                    { name: 'text', label: 'Review', multiline: true, span: 12 },
                  ]}
                  onChange={(next) => setFormData({ ...formData, reviews: next })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--br)' }}>
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
