'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

type TabId = 'hero_story' | 'stats' | 'features' | 'certs' | 'cta_seo';

const ICON_OPTIONS = [
  '🏛️', '🌍', '✅', '⚡', '🔒', '🚗', '📋', '🌐', '🏅', '⭐', '🏆', '🎯', '💼', '🤝', '🚀', '💡', '🛡️', '📜', '🏥', '⚖️'
];

export default function AboutManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('hero_story');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    heroTitle: 'About Language Guru',
    heroSubtitle: "India's most trusted ISO-certified translation agency since 2005",
    storyTag: 'Our Story',
    storyHeading: 'Language Guru – A Subsidiary of Language Guru',
    storyParagraph1: 'LANGUAGE GURU, a Subsidiary of Language Guru, is a one-stop language translation and interpretation service provider. Founded in 2005, based in New Delhi, we provide dedicated Document Translation Services, Interpretation and Recruitment Services for all Languages across the Globe.',
    storyParagraph2: 'Headquartered at 617, West End Mall, Janakpuri, New Delhi – 110058. ISO-9001:2015 and ISO 17100:2015 certified. MSME registered and government-authorized.',
    storyBtn1Text: '📋 Get Free Quote',
    storyBtn1Link: '/quote',
    storyBtn2Text: '📞 Contact Us',
    storyBtn2Link: '/contact',
    stat1Num: '2005',
    stat1Label: 'Founded',
    stat2Num: '120+',
    stat2Label: 'Languages',
    stat3Num: '50K+',
    stat3Label: 'Documents',
    stat4Num: '150+',
    stat4Label: 'Cities',
    stat5Num: '10K+',
    stat5Label: 'Clients',
    stat6Num: '4.9★',
    stat6Label: 'Rating',
    whyChooseList: [
      { ic: '🏛️', t: 'Government Authorized', d: 'MSME registered, ISO-9001:2015 and ISO 17100:2015. Accepted by MEA, all courts, and all embassies across India.' },
      { ic: '🌍', t: '120+ Languages', d: 'Native speakers for every language — European, Asian, Middle Eastern, Indian regional.' },
      { ic: '✅', t: 'Embassy Accepted', d: 'All certified translations accepted by all 60+ embassies in India. 100% acceptance rate.' },
      { ic: '⚡', t: '24-Hour Express', d: 'Urgent translation in 24 hours for all common language pairs. Weekend service available.' },
      { ic: '🔒', t: '100% Confidential', d: 'NDA-backed confidentiality. Secure document handling. GDPR-compliant practices.' },
      { ic: '🚗', t: 'Easy Document Submission', d: 'Office submission in Delhi or scanned copies via email / WhatsApp. Pan-India courier available for all cities.' }
    ],
    certSectionTitle: 'Certifications & Accreditations',
    certList: [
      { ic: '📋', t: 'ISO 9001:2015', s: 'Quality Management' },
      { ic: '🌐', t: 'ISO 17100:2015', s: 'Translation Services' },
      { ic: '🏛️', t: 'MSME Registered', s: 'Govt. of India' },
      { ic: '🏅', t: 'MEA Empanelled', s: 'Ministry External Affairs' }
    ],
    ctaHeading: 'Ready to Get Started?',
    ctaSubtitle: 'Get a free quote in 30 minutes. ISO-certified translations accepted by all embassies.',
    ctaBtn1Text: '📋 Get Quote',
    ctaBtn1Link: '/quote',
    ctaBtn2Text: '📞 Call Now',
    metaTitle: "About Language Guru — India's Trusted ISO-Certified Translation Agency",
    metaDesc: 'Learn about Language Guru India — founded in 2005, ISO 9001:2015 & ISO 17100:2015 certified, MSME registered, serving 120+ languages across 150+ cities.'
  });

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/about`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          ...data.data,
          whyChooseList: data.data.whyChooseList?.length ? data.data.whyChooseList : prev.whyChooseList,
          certList: data.data.certList?.length ? data.data.certList : prev.certList,
        }));
      }
    } catch (err) {
      console.error('Error fetching about page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const payload = {
        ...formData,
        whyChooseItems: formData.whyChooseList,
        certItems: formData.certList
      };

      const res = await fetch(`${apiUrl}/api/v1/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg('About page updated successfully! Changes are live.');
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      } else {
        alert(data.message || 'Failed to save about page');
      }
    } catch (err) {
      console.error('Error saving about page:', err);
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const updateWhyChooseItem = (index: number, field: 'ic' | 't' | 'd', val: string) => {
    setFormData(prev => {
      const updated = [...prev.whyChooseList];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, whyChooseList: updated };
    });
  };

  const updateCertItem = (index: number, field: 'ic' | 't' | 's', val: string) => {
    setFormData(prev => {
      const updated = [...prev.certList];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, certList: updated };
    });
  };

  const TABS = [
    { id: 'hero_story' as TabId, icon: '🏷️', label: 'Hero & Story' },
    { id: 'stats' as TabId, icon: '📊', label: 'Stats Counter' },
    { id: 'features' as TabId, icon: '🎯', label: 'Why Choose Us' },
    { id: 'certs' as TabId, icon: '🏅', label: 'Certifications' },
    { id: 'cta_seo' as TabId, icon: '📣', label: 'CTA & SEO' },
  ];

  return (
    <>
      <TopNav title="ℹ️ About Us Page Management" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                About Page Content Manager
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
                Control all headlines, story paragraphs, stats counters, features, and certifications for <code>/about</code>.
              </p>
            </div>
            {saveSuccessMsg && (
              <span style={{ fontSize: '13px', color: '#166534', background: '#dcfce7', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold' }}>
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>

          {/* TAB BAR */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--br)', marginBottom: '24px', flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '10px 18px',
                  fontWeight: 'bold',
                  fontSize: '14px',
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
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading About page data...</div>
          ) : (
            <form onSubmit={handleSave}>
              
              {/* ─── TAB 1: HERO & STORY ─── */}
              {activeTab === 'hero_story' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Hero Header Box */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>🏷️ Page Hero Header</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

                  {/* Our Story Box */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>📖 Our Story Section</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>Section Tag</label>
                        <input
                          style={inputStyle}
                          value={formData.storyTag}
                          onChange={e => setFormData({ ...formData, storyTag: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Story Main Title</label>
                        <input
                          style={inputStyle}
                          value={formData.storyHeading}
                          onChange={e => setFormData({ ...formData, storyHeading: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Story Paragraph 1 (Introduction & Services)</label>
                      <textarea
                        rows={4}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        value={formData.storyParagraph1}
                        onChange={e => setFormData({ ...formData, storyParagraph1: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Story Paragraph 2 (Headquarters & Accreditations)</label>
                      <textarea
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        value={formData.storyParagraph2}
                        onChange={e => setFormData({ ...formData, storyParagraph2: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Primary Button Text</label>
                        <input
                          style={inputStyle}
                          value={formData.storyBtn1Text}
                          onChange={e => setFormData({ ...formData, storyBtn1Text: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Primary Button Link</label>
                        <input
                          style={inputStyle}
                          value={formData.storyBtn1Link}
                          onChange={e => setFormData({ ...formData, storyBtn1Link: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Secondary Button Text</label>
                        <input
                          style={inputStyle}
                          value={formData.storyBtn2Text}
                          onChange={e => setFormData({ ...formData, storyBtn2Text: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Secondary Button Link</label>
                        <input
                          style={inputStyle}
                          value={formData.storyBtn2Link}
                          onChange={e => setFormData({ ...formData, storyBtn2Link: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ─── TAB 2: STATS COUNTER ─── */}
              {activeTab === 'stats' && (
                <div style={cardStyle}>
                  <h3 style={sectionTitleStyle}>📊 About Page Metrics (6 Stat Counters)</h3>
                  <p style={{ fontSize: '13px', color: 'var(--mu)', marginTop: '-8px', marginBottom: '20px' }}>
                    These stats highlight your company milestone numbers on the About page.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                    {[
                      { numKey: 'stat1Num', lblKey: 'stat1Label', placeholderNum: '2005', placeholderLbl: 'Founded' },
                      { numKey: 'stat2Num', lblKey: 'stat2Label', placeholderNum: '120+', placeholderLbl: 'Languages' },
                      { numKey: 'stat3Num', lblKey: 'stat3Label', placeholderNum: '50K+', placeholderLbl: 'Documents' },
                      { numKey: 'stat4Num', lblKey: 'stat4Label', placeholderNum: '150+', placeholderLbl: 'Cities' },
                      { numKey: 'stat5Num', lblKey: 'stat5Label', placeholderNum: '10K+', placeholderLbl: 'Clients' },
                      { numKey: 'stat6Num', lblKey: 'stat6Label', placeholderNum: '4.9★', placeholderLbl: 'Rating' },
                    ].map((st, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--br)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)', marginBottom: '8px', textTransform: 'uppercase' }}>
                          Stat Card {idx + 1}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={labelStyle}>Metric Value</label>
                          <input
                            style={inputStyle}
                            value={(formData as any)[st.numKey]}
                            onChange={e => setFormData({ ...formData, [st.numKey]: e.target.value })}
                            placeholder={st.placeholderNum}
                            required
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Metric Label</label>
                          <input
                            style={inputStyle}
                            value={(formData as any)[st.lblKey]}
                            onChange={e => setFormData({ ...formData, [st.lblKey]: e.target.value })}
                            placeholder={st.placeholderLbl}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 3: WHY CHOOSE FEATURES ─── */}
              {activeTab === 'features' && (
                <div style={cardStyle}>
                  <h3 style={sectionTitleStyle}>🎯 Why Choose Us Cards on About Page (6 Cards)</h3>
                  <p style={{ fontSize: '13px', color: 'var(--mu)', marginTop: '-8px', marginBottom: '20px' }}>
                    Edit the value propositions displayed in the 3-column grid on the About page.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                    {formData.whyChooseList.map((item, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid var(--br)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--bd)', textTransform: 'uppercase' }}>Card {idx + 1}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--mu)' }}>Icon:</label>
                            <select
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '16px' }}
                              value={item.ic}
                              onChange={e => updateWhyChooseItem(idx, 'ic', e.target.value)}
                            >
                              {ICON_OPTIONS.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelStyle}>Feature Title</label>
                          <input
                            style={inputStyle}
                            value={item.t}
                            onChange={e => updateWhyChooseItem(idx, 't', e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Feature Description</label>
                          <textarea
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            value={item.d}
                            onChange={e => updateWhyChooseItem(idx, 'd', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 4: CERTIFICATIONS & ACCREDITATIONS ─── */}
              {activeTab === 'certs' && (
                <div style={cardStyle}>
                  <h3 style={sectionTitleStyle}>🏅 Certifications &amp; Accreditations</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Section Heading</label>
                    <input
                      style={inputStyle}
                      value={formData.certSectionTitle}
                      onChange={e => setFormData({ ...formData, certSectionTitle: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {formData.certList.map((cert, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--br)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--bd)', textTransform: 'uppercase' }}>Accreditation {idx + 1}</span>
                          <select
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '16px' }}
                            value={cert.ic}
                            onChange={e => updateCertItem(idx, 'ic', e.target.value)}
                          >
                            {ICON_OPTIONS.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={labelStyle}>Title (e.g. ISO 9001:2015)</label>
                          <input
                            style={inputStyle}
                            value={cert.t}
                            onChange={e => updateCertItem(idx, 't', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Subtitle / Organization (e.g. Quality Management)</label>
                          <input
                            style={inputStyle}
                            value={cert.s}
                            onChange={e => updateCertItem(idx, 's', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 5: CTA BANNER & SEO ─── */}
              {activeTab === 'cta_seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Bottom CTA Card */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>📣 Bottom Call-To-Action Banner</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>CTA Heading</label>
                        <input
                          style={inputStyle}
                          value={formData.ctaHeading}
                          onChange={e => setFormData({ ...formData, ctaHeading: e.target.value })}
                          required
                        />
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Button 1 Text</label>
                        <input
                          style={inputStyle}
                          value={formData.ctaBtn1Text}
                          onChange={e => setFormData({ ...formData, ctaBtn1Text: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Button 1 Link</label>
                        <input
                          style={inputStyle}
                          value={formData.ctaBtn1Link}
                          onChange={e => setFormData({ ...formData, ctaBtn1Link: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Button 2 Text</label>
                        <input
                          style={inputStyle}
                          value={formData.ctaBtn2Text}
                          onChange={e => setFormData({ ...formData, ctaBtn2Text: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO & Meta Config Card */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>🔍 SEO &amp; Meta Information</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Meta Title (Browser Tab &amp; Google)</label>
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

              {/* SAVE BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--br)' }}>
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
                  {saving ? '⏳ Saving Changes...' : '💾 Save About Page'}
                </button>
              </div>

            </form>
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
