'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

type MainView = 'cms' | 'crm';
type CmsTab = 'hero_stats' | 'industries' | 'clients' | 'reviews' | 'cta_seo';

interface IndustryItem {
  icon: string;
  title: string;
  desc: string;
}

interface ClientBrandItem {
  icon: string;
  name: string;
  category: string;
}

interface ReviewItem {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceKey: string;
  status: string;
  createdAt: string;
}

interface AggregatedClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRequests: number;
  lastRequestDate: string;
  isCompletedClient: boolean;
}

const COMMON_ICONS = ['🏛️', '⚖️', '🏥', '🎓', '🏦', '💻', '💊', '✈️', '🏗️', '🛢️', '🚀', '🚗', '🏨', '⚡', '🌿', '🏭', '🏢', '⚙️', '⭐', '🏅', '💼', '🌐'];

export default function ClientsManagementPage() {
  const [mainView, setMainView] = useState<MainView>('cms');
  const [activeTab, setActiveTab] = useState<CmsTab>('hero_stats');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // CMS Form State
  const [formData, setFormData] = useState({
    heroTitle: 'Our Clients & Partners',
    heroSubtitle: '10,000+ satisfied clients across India — law firms, hospitals, embassies and Fortune 500 companies',
    stat1Val: '10,000+',
    stat1Label: 'Happy Clients',
    stat2Val: '500+',
    stat2Label: 'Corporate Clients',
    stat3Val: '190+',
    stat3Label: 'Countries Served',
    stat4Val: '4.9★',
    stat4Label: 'Average Rating',
    industriesTitle: 'Industries We Serve',
    industries: [] as IndustryItem[],
    clientsTitle: 'Our Valued Clients',
    clientBrands: [] as ClientBrandItem[],
    reviewsTitle: 'What Our Clients Say',
    reviews: [] as ReviewItem[],
    ctaTitle: 'Join 10,000+ Satisfied Clients',
    ctaSubtitle: 'ISO-certified translation. Embassy acceptance guaranteed. Quote in 30 minutes.',
    ctaBtnText: '📋 Get Free Quote',
    metaTitle: 'Our Clients & Partners — Language Guru',
    metaDesc: 'Language Guru is trusted by 10,000+ clients across India including ministries, high courts, AIIMS, IITs, and Fortune 500 companies.'
  });

  // CRM Leads State
  const [crmClients, setCrmClients] = useState<AggregatedClient[]>([]);
  const [crmLoading, setCrmLoading] = useState(false);

  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/clients-page`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        setFormData(prev => ({
          ...prev,
          ...json.data,
          industries: json.data.industries || prev.industries,
          clientBrands: json.data.clientBrands || prev.clientBrands,
          reviews: json.data.reviews || prev.reviews
        }));
      }
    } catch (err) {
      console.error('Error fetching clients page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrmData = async () => {
    setCrmLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/quotes`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const clientMap = new Map<string, AggregatedClient>();
        data.data.forEach((q: Quote) => {
          const identifier = q.email || q.phone;
          if (!identifier) return;
          if (!clientMap.has(identifier)) {
            clientMap.set(identifier, {
              id: identifier,
              name: q.name,
              email: q.email || '',
              phone: q.phone || '',
              totalRequests: 1,
              lastRequestDate: q.createdAt,
              isCompletedClient: q.status === 'COMPLETED'
            });
          } else {
            const existing = clientMap.get(identifier)!;
            existing.totalRequests += 1;
            if (new Date(q.createdAt) > new Date(existing.lastRequestDate)) {
              existing.lastRequestDate = q.createdAt;
              existing.name = q.name;
            }
            if (q.status === 'COMPLETED') existing.isCompletedClient = true;
          }
        });
        const list = Array.from(clientMap.values()).sort(
          (a, b) => new Date(b.lastRequestDate).getTime() - new Date(a.lastRequestDate).getTime()
        );
        setCrmClients(list);
      }
    } catch (err) {
      console.error('Error fetching CRM clients:', err);
    } finally {
      setCrmLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
    fetchCrmData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const payload = {
        ...formData,
        industriesList: formData.industries,
        clientsList: formData.clientBrands,
        reviewsList: formData.reviews
      };

      const res = await fetch(`${apiUrl}/api/v1/clients-page`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg('Clients page updated successfully! Changes are live.');
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      } else {
        alert(data.message || 'Failed to save clients page');
      }
    } catch (err) {
      console.error('Error saving clients page:', err);
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  // Handlers for Industries
  const addIndustry = () => {
    setFormData(prev => ({
      ...prev,
      industries: [...prev.industries, { icon: '💼', title: 'New Industry Sector', desc: 'Description of translation services for this sector' }]
    }));
  };

  const updateIndustry = (idx: number, field: keyof IndustryItem, val: string) => {
    setFormData(prev => {
      const list = [...prev.industries];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, industries: list };
    });
  };

  const removeIndustry = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.filter((_, i) => i !== idx)
    }));
  };

  // Handlers for Client Brands
  const addClientBrand = () => {
    setFormData(prev => ({
      ...prev,
      clientBrands: [...prev.clientBrands, { icon: '🏢', name: 'New Client / Organization', category: 'Corporate' }]
    }));
  };

  const updateClientBrand = (idx: number, field: keyof ClientBrandItem, val: string) => {
    setFormData(prev => {
      const list = [...prev.clientBrands];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, clientBrands: list };
    });
  };

  const removeClientBrand = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      clientBrands: prev.clientBrands.filter((_, i) => i !== idx)
    }));
  };

  // Handlers for Reviews
  const addReview = () => {
    setFormData(prev => ({
      ...prev,
      reviews: [
        ...prev.reviews,
        {
          quote: 'Language Guru handles all our document translations with certified precision and fast delivery.',
          author: 'New Client Name',
          role: 'Designation, Organization · City',
          rating: 5
        }
      ]
    }));
  };

  const updateReview = (idx: number, field: keyof ReviewItem, val: any) => {
    setFormData(prev => {
      const list = [...prev.reviews];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, reviews: list };
    });
  };

  const removeReview = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      reviews: prev.reviews.filter((_, i) => i !== idx)
    }));
  };

  const CMS_TABS = [
    { id: 'hero_stats' as CmsTab, icon: '🏷️', label: 'Hero & 4 Stats Counters' },
    { id: 'industries' as CmsTab, icon: '🏭', label: `Industries We Serve (${formData.industries.length})` },
    { id: 'clients' as CmsTab, icon: '🏛️', label: `Valued Clients & Logos (${formData.clientBrands.length})` },
    { id: 'reviews' as CmsTab, icon: '⭐', label: `Client Reviews (${formData.reviews.length})` },
    { id: 'cta_seo' as CmsTab, icon: '🚀', label: 'Bottom CTA & SEO' }
  ];

  return (
    <>
      <TopNav title="👥 Clients &amp; Partners Management" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          
          {/* TOP HEADER & VIEW TOGGLE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                {mainView === 'cms' ? 'Clients Page CMS Manager' : 'Client Inquiries & CRM Database'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
                {mainView === 'cms'
                  ? 'Dynamically edit the Hero banner, 4 stats counters, industry sectors, client logos/brands, reviews, and SEO for /clients.'
                  : 'Aggregated client database from inbound website quotes and service requests.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {saveSuccessMsg && (
                <span style={{ fontSize: '13px', color: '#166534', background: '#dcfce7', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold' }}>
                  ✓ {saveSuccessMsg}
                </span>
              )}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMainView('cms')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: mainView === 'cms' ? 'var(--bd)' : 'transparent',
                    color: mainView === 'cms' ? '#fff' : 'var(--mu)'
                  }}
                >
                  🏢 Clients Page Editor
                </button>
                <button
                  type="button"
                  onClick={() => setMainView('crm')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: mainView === 'crm' ? 'var(--bd)' : 'transparent',
                    color: mainView === 'crm' ? '#fff' : 'var(--mu)'
                  }}
                >
                  👥 Inbound Client Database ({crmClients.length})
                </button>
              </div>
            </div>
          </div>

          {/* ══════════ VIEW 1: CMS PAGE MANAGER ══════════ */}
          {mainView === 'cms' && (
            <>
              {/* SUB-TABS */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--br)', marginBottom: '24px', flexWrap: 'wrap' }}>
                {CMS_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      fontWeight: 'bold',
                      fontSize: '13.5px',
                      borderBottom: activeTab === tab.id ? '2px solid var(--bd)' : 'none',
                      color: activeTab === tab.id ? 'var(--bd)' : 'var(--mu)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading Clients page data...</div>
              ) : (
                <form onSubmit={handleSave}>
                  
                  {/* TAB 1: HERO & 4 STATS COUNTERS */}
                  {activeTab === 'hero_stats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Hero Section */}
                      <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>🏷️ Page Hero Header</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                          <div>
                            <label style={labelStyle}>Hero Main Heading</label>
                            <input
                              style={inputStyle}
                              value={formData.heroTitle}
                              onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Hero Subtitle</label>
                            <input
                              style={inputStyle}
                              value={formData.heroSubtitle}
                              onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4 Stats Counters */}
                      <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>📊 4 Key Metric Counters</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                          
                          {/* Stat 1 */}
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <label style={labelStyle}>Counter 1 Number</label>
                            <input
                              style={{ ...inputStyle, marginBottom: '10px', fontWeight: 'bold' }}
                              value={formData.stat1Val}
                              onChange={e => setFormData({ ...formData, stat1Val: e.target.value })}
                              placeholder="10,000+"
                              required
                            />
                            <label style={labelStyle}>Counter 1 Label</label>
                            <input
                              style={inputStyle}
                              value={formData.stat1Label}
                              onChange={e => setFormData({ ...formData, stat1Label: e.target.value })}
                              placeholder="Happy Clients"
                              required
                            />
                          </div>

                          {/* Stat 2 */}
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <label style={labelStyle}>Counter 2 Number</label>
                            <input
                              style={{ ...inputStyle, marginBottom: '10px', fontWeight: 'bold' }}
                              value={formData.stat2Val}
                              onChange={e => setFormData({ ...formData, stat2Val: e.target.value })}
                              placeholder="500+"
                              required
                            />
                            <label style={labelStyle}>Counter 2 Label</label>
                            <input
                              style={inputStyle}
                              value={formData.stat2Label}
                              onChange={e => setFormData({ ...formData, stat2Label: e.target.value })}
                              placeholder="Corporate Clients"
                              required
                            />
                          </div>

                          {/* Stat 3 */}
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <label style={labelStyle}>Counter 3 Number</label>
                            <input
                              style={{ ...inputStyle, marginBottom: '10px', fontWeight: 'bold' }}
                              value={formData.stat3Val}
                              onChange={e => setFormData({ ...formData, stat3Val: e.target.value })}
                              placeholder="190+"
                              required
                            />
                            <label style={labelStyle}>Counter 3 Label</label>
                            <input
                              style={inputStyle}
                              value={formData.stat3Label}
                              onChange={e => setFormData({ ...formData, stat3Label: e.target.value })}
                              placeholder="Countries Served"
                              required
                            />
                          </div>

                          {/* Stat 4 */}
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <label style={labelStyle}>Counter 4 Number</label>
                            <input
                              style={{ ...inputStyle, marginBottom: '10px', fontWeight: 'bold' }}
                              value={formData.stat4Val}
                              onChange={e => setFormData({ ...formData, stat4Val: e.target.value })}
                              placeholder="4.9★"
                              required
                            />
                            <label style={labelStyle}>Counter 4 Label</label>
                            <input
                              style={inputStyle}
                              value={formData.stat4Label}
                              onChange={e => setFormData({ ...formData, stat4Label: e.target.value })}
                              placeholder="Average Rating"
                              required
                            />
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: INDUSTRIES WE SERVE */}
                  {activeTab === 'industries' && (
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={sectionTitleStyle}>🏭 Industries We Serve Section</h3>
                          <div style={{ maxWidth: '400px', marginTop: '6px' }}>
                            <label style={labelStyle}>Section Heading</label>
                            <input
                              style={inputStyle}
                              value={formData.industriesTitle}
                              onChange={e => setFormData({ ...formData, industriesTitle: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addIndustry}
                          style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                        >
                          + Add Industry Card
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
                        {formData.industries.map((ind, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid var(--br)', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select
                                  value={ind.icon}
                                  onChange={e => updateIndustry(idx, 'icon', e.target.value)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '16px', cursor: 'pointer' }}
                                >
                                  {COMMON_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)' }}>Card #{idx + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeIndustry(idx)}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                title="Remove Industry"
                              >
                                ✕
                              </button>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Industry Name</label>
                              <input
                                style={inputStyle}
                                value={ind.title}
                                onChange={e => updateIndustry(idx, 'title', e.target.value)}
                                placeholder="e.g. Legal & Law Firms"
                                required
                              />
                            </div>

                            <div>
                              <label style={labelStyle}>Sector Description</label>
                              <input
                                style={inputStyle}
                                value={ind.desc}
                                onChange={e => updateIndustry(idx, 'desc', e.target.value)}
                                placeholder="e.g. High Courts, advocates, law firms"
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: VALUED CLIENTS & LOGOS */}
                  {activeTab === 'clients' && (
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={sectionTitleStyle}>🏛️ Our Valued Clients Grid</h3>
                          <div style={{ maxWidth: '400px', marginTop: '6px' }}>
                            <label style={labelStyle}>Section Heading</label>
                            <input
                              style={inputStyle}
                              value={formData.clientsTitle}
                              onChange={e => setFormData({ ...formData, clientsTitle: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addClientBrand}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                        >
                          + Add Client Brand
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginTop: '16px' }}>
                        {formData.clientBrands.map((cl, idx) => (
                          <div key={idx} style={{ background: '#fff', border: '1.5px solid var(--br)', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <select
                                value={cl.icon}
                                onChange={e => updateClientBrand(idx, 'icon', e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '18px', cursor: 'pointer' }}
                              >
                                {COMMON_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeClientBrand(idx)}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                title="Remove Client"
                              >
                                ✕
                              </button>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Company / Client Name</label>
                              <input
                                style={inputStyle}
                                value={cl.name}
                                onChange={e => updateClientBrand(idx, 'name', e.target.value)}
                                placeholder="e.g. Ministry of External Affairs"
                                required
                              />
                            </div>

                            <div>
                              <label style={labelStyle}>Category Tag</label>
                              <input
                                style={inputStyle}
                                value={cl.category}
                                onChange={e => updateClientBrand(idx, 'category', e.target.value)}
                                placeholder="e.g. Government, Healthcare, Banking"
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: REVIEWS */}
                  {activeTab === 'reviews' && (
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={sectionTitleStyle}>⭐ Featured Client Reviews ({formData.reviews.length})</h3>
                          <div style={{ maxWidth: '400px', marginTop: '6px' }}>
                            <label style={labelStyle}>Section Heading</label>
                            <input
                              style={inputStyle}
                              value={formData.reviewsTitle}
                              onChange={e => setFormData({ ...formData, reviewsTitle: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addReview}
                          style={{ background: '#eab308', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '13.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(234, 179, 8, 0.3)' }}
                        >
                          + Add Client Review
                        </button>
                      </div>

                      {formData.reviews.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', color: 'var(--mu)', border: '1px dashed var(--br)' }}>
                          No reviews added yet. Click <strong>"+ Add Client Review"</strong> above to add testimonials.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                          {formData.reviews.map((rev, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', border: '1px solid var(--br)', borderRadius: '10px', padding: '18px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--bd)' }}>Review #{idx + 1}</span>
                                  <select
                                    value={rev.rating || 5}
                                    onChange={e => updateReview(idx, 'rating', parseInt(e.target.value))}
                                    style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #eab308', background: '#fefce8', color: '#854d0e', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                                  >
                                    <option value={5}>★★★★★ (5 Stars)</option>
                                    <option value={4}>★★★★☆ (4 Stars)</option>
                                    <option value={3}>★★★☆☆ (3 Stars)</option>
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeReview(idx)}
                                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  title="Delete Review"
                                >
                                  ✕
                                </button>
                              </div>

                              <div style={{ marginBottom: '12px' }}>
                                <label style={labelStyle}>Testimonial Quote</label>
                                <textarea
                                  rows={3}
                                  style={{ ...inputStyle, resize: 'vertical' }}
                                  value={rev.quote}
                                  onChange={e => updateReview(idx, 'quote', e.target.value)}
                                  placeholder="Enter client testimonial quote..."
                                  required
                                />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                  <label style={labelStyle}>Author Name</label>
                                  <input
                                    style={inputStyle}
                                    value={rev.author}
                                    onChange={e => updateReview(idx, 'author', e.target.value)}
                                    placeholder="e.g. Anil Verma"
                                    required
                                  />
                                </div>
                                <div>
                                  <label style={labelStyle}>Role &amp; Company</label>
                                  <input
                                    style={inputStyle}
                                    value={rev.role}
                                    onChange={e => updateReview(idx, 'role', e.target.value)}
                                    placeholder="e.g. Partner, AV Law · Delhi"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: CTA & SEO */}
                  {activeTab === 'cta_seo' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* CTA Banner */}
                      <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>🚀 Bottom Call to Action Banner</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <label style={labelStyle}>CTA Heading</label>
                            <input
                              style={inputStyle}
                              value={formData.ctaTitle}
                              onChange={e => setFormData({ ...formData, ctaTitle: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Quote Button Text</label>
                            <input
                              style={inputStyle}
                              value={formData.ctaBtnText}
                              onChange={e => setFormData({ ...formData, ctaBtnText: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>CTA Subtitle</label>
                          <input
                            style={inputStyle}
                            value={formData.ctaSubtitle}
                            onChange={e => setFormData({ ...formData, ctaSubtitle: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* SEO Meta */}
                      <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>🔍 SEO &amp; Meta Information for /clients</h3>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={labelStyle}>Meta Title (Google &amp; Browser Tab)</label>
                          <input
                            style={inputStyle}
                            value={formData.metaTitle}
                            onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Meta Description (Google Snippet)</label>
                          <textarea
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            value={formData.metaDesc}
                            onChange={e => setFormData({ ...formData, metaDesc: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SAVE BUTTON BAR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--br)' }}>
                    <a
                      href="http://localhost:3000/clients"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                    >
                      🔗 Preview live page: localhost:3000/clients
                    </a>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        background: 'var(--bd)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: saving ? 'wait' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {saving ? '⏳ Saving Changes...' : '💾 Save Clients Page'}
                    </button>
                  </div>

                </form>
              )}
            </>
          )}

          {/* ══════════ VIEW 2: INBOUND CLIENT CRM DATABASE ══════════ */}
          {mainView === 'crm' && (
            <div>
              {crmLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Analyzing quote inquiries...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Contact Details</th>
                        <th>Status</th>
                        <th>Inquiry Count</th>
                        <th>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crmClients.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No client leads found yet.</td></tr>
                      ) : (
                        crmClients.map(c => (
                          <tr key={c.id}>
                            <td>
                              <div style={{ fontWeight: '700', color: 'var(--td)', fontSize: '15px' }}>{c.name}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '13px', color: 'var(--tm)' }}>✉️ {c.email || '—'}</div>
                              <div style={{ fontSize: '13px', color: 'var(--tm)', marginTop: '3px' }}>📞 {c.phone || '—'}</div>
                            </td>
                            <td>
                              <span className="price-badge" style={{ background: c.isCompletedClient ? '#dcfce7' : '#fef3c7', color: c.isCompletedClient ? '#166534' : '#92400e' }}>
                                {c.isCompletedClient ? '⭐ Active Client' : '🔍 Prospect'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: 'var(--bb)', fontSize: '15px' }}>{c.totalRequests}</span>
                            </td>
                            <td style={{ color: 'var(--mu)', fontSize: '13px' }}>
                              {new Date(c.lastRequestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  border: '1px solid var(--br)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: '16px',
  fontWeight: '700',
  color: 'var(--bd)',
  marginBottom: '16px'
};

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
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};
