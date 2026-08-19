'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

type TabId = 'hero_channels' | 'hours' | 'certs_form' | 'seo';

const ICON_OPTIONS = ['📞', '✉️', '📍', '💬', '⏱️', '🆘', '🏆', '🏅', '⭐', '🏛️', '💼', '🚀', '🔒', '🌐', '📑', '✅', '🚗', '⚡'];

export default function ContactManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('hero_channels');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    heroTitle: '📞 Contact Us',
    heroSubtitle: 'Reach out via call, WhatsApp, email or visit our office. Response in 30 minutes.',
    heroCallBtnText: '📞 Call Now',
    heroWaBtnText: '💬 WhatsApp',
    card1Icon: '📞',
    card1Title: 'Call / WhatsApp',
    card1Phone: '+91-9312690490',
    card1Timing: 'Mon–Sat: 9 AM – 7 PM • Sun: 10 AM – 4 PM',
    card1BtnText: '💬 WhatsApp Now',
    card2Icon: '✉️',
    card2Title: 'Email Us',
    card2Email: 'info@languageguruindia.com',
    card2Timing: 'Response within 1 hour during working hours',
    card2BtnText: '✉️ Send Email',
    card3Icon: '📍',
    card3Title: 'Visit Our Office',
    card3Address: '617, West End Mall, Janakpuri, New Delhi – 110058',
    card3BtnText: '📍 Get Directions',
    mapUrl: '',
    formTitle: 'Send Us a Message',
    formBtnText: '📬 Send Message',
    formNote1: '*Indicative rates only; final charges may vary by language pair, document type, complexity & number of pages.',
    formNote2: '🔒 Secure & confidential · Response in 30 minutes',
    hoursTitle: '⏱️ Working Hours',
    hoursMonFri: '9:00 AM — 7:00 PM',
    hoursSat: '10:00 AM — 6:00 PM',
    hoursSun: '10:00 AM — 4:00 PM',
    urgentText: '🆘 Urgent: WhatsApp 24/7 at +91-9312690490',
    certsTitle: '🏆 Certifications',
    certBadges: [
      '🏅 ISO 9001:2015',
      '🏅 ISO 17100:2015',
      '🏆 MSME Registered',
      '🏛️ Govt. Authorized',
      '🏛️ MEA Empanelled',
      '⭐ 4.9/5 Rating'
    ],
    metaTitle: 'Contact Us — Language Guru',
    metaDesc: 'Contact Language Guru: 617 West End Mall, Janakpuri, New Delhi. Phone, email and WhatsApp.'
  });

  const fetchContact = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/contact`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          ...data.data,
          certBadges: data.data.certBadges?.length ? data.data.certBadges : prev.certBadges
        }));
      }
    } catch (err) {
      console.error('Error fetching contact page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const payload = {
        ...formData,
        certsList: formData.certBadges
      };

      const res = await fetch(`${apiUrl}/api/v1/contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg('Contact page updated successfully! Changes are live.');
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      } else {
        alert(data.message || 'Failed to save contact page');
      }
    } catch (err) {
      console.error('Error saving contact page:', err);
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const updateBadge = (index: number, val: string) => {
    setFormData(prev => {
      const updated = [...prev.certBadges];
      updated[index] = val;
      return { ...prev, certBadges: updated };
    });
  };

  const TABS = [
    { id: 'hero_channels' as TabId, icon: '🏷️', label: 'Hero & Direct Channels' },
    { id: 'hours' as TabId, icon: '⏱️', label: 'Working Hours & Emergency' },
    { id: 'certs_form' as TabId, icon: '🏆', label: 'Certifications & Form Info' },
    { id: 'seo' as TabId, icon: '🔍', label: 'SEO & Meta' },
  ];

  return (
    <>
      <TopNav title="📞 Contact Us Page Management" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                Contact Page Content Manager
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
                Manage all banners, direct contact cards, working hours, trust badges, and SEO for <code>/contact</code>.
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
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading Contact page data...</div>
          ) : (
            <form onSubmit={handleSave}>
              
              {/* ─── TAB 1: HERO & DIRECT CHANNELS ─── */}
              {activeTab === 'hero_channels' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Hero Header Box */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>🏷️ Page Hero Banner</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Header Call Button Text</label>
                        <input
                          style={inputStyle}
                          value={formData.heroCallBtnText}
                          onChange={e => setFormData({ ...formData, heroCallBtnText: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Header WhatsApp Button Text</label>
                        <input
                          style={inputStyle}
                          value={formData.heroWaBtnText}
                          onChange={e => setFormData({ ...formData, heroWaBtnText: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3 Contact Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                    
                    {/* Card 1: Call / WhatsApp */}
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--bd)' }}>Channel 1: Call / WhatsApp</h4>
                        <select
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '16px' }}
                          value={formData.card1Icon}
                          onChange={e => setFormData({ ...formData, card1Icon: e.target.value })}
                        >
                          {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Card Title</label>
                        <input
                          style={inputStyle}
                          value={formData.card1Title}
                          onChange={e => setFormData({ ...formData, card1Title: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Phone / WhatsApp Number</label>
                        <input
                          style={inputStyle}
                          value={formData.card1Phone}
                          onChange={e => setFormData({ ...formData, card1Phone: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Timing Subtext</label>
                        <input
                          style={inputStyle}
                          value={formData.card1Timing}
                          onChange={e => setFormData({ ...formData, card1Timing: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Button Label</label>
                        <input
                          style={inputStyle}
                          value={formData.card1BtnText}
                          onChange={e => setFormData({ ...formData, card1BtnText: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Card 2: Email Us */}
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--bd)' }}>Channel 2: Email Us</h4>
                        <select
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '16px' }}
                          value={formData.card2Icon}
                          onChange={e => setFormData({ ...formData, card2Icon: e.target.value })}
                        >
                          {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Card Title</label>
                        <input
                          style={inputStyle}
                          value={formData.card2Title}
                          onChange={e => setFormData({ ...formData, card2Title: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Official Email Address</label>
                        <input
                          style={inputStyle}
                          value={formData.card2Email}
                          onChange={e => setFormData({ ...formData, card2Email: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Timing Subtext</label>
                        <input
                          style={inputStyle}
                          value={formData.card2Timing}
                          onChange={e => setFormData({ ...formData, card2Timing: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Button Label</label>
                        <input
                          style={inputStyle}
                          value={formData.card2BtnText}
                          onChange={e => setFormData({ ...formData, card2BtnText: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Card 3: Visit Our Office */}
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--bd)' }}>Channel 3: Office Address</h4>
                        <select
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '16px' }}
                          value={formData.card3Icon}
                          onChange={e => setFormData({ ...formData, card3Icon: e.target.value })}
                        >
                          {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Card Title</label>
                        <input
                          style={inputStyle}
                          value={formData.card3Title}
                          onChange={e => setFormData({ ...formData, card3Title: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Office Physical Address</label>
                        <textarea
                          rows={2}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          value={formData.card3Address}
                          onChange={e => setFormData({ ...formData, card3Address: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Button Label</label>
                        <input
                          style={inputStyle}
                          value={formData.card3BtnText}
                          onChange={e => setFormData({ ...formData, card3BtnText: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Google Maps Link (Optional)</label>
                        <input
                          style={inputStyle}
                          placeholder="https://maps.google.com/..."
                          value={formData.mapUrl}
                          onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                        />
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ─── TAB 2: WORKING HOURS & EMERGENCY ─── */}
              {activeTab === 'hours' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>⏱️ Operating &amp; Working Hours</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Box Title</label>
                      <input
                        style={inputStyle}
                        value={formData.hoursTitle}
                        onChange={e => setFormData({ ...formData, hoursTitle: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={labelStyle}>Monday — Friday</label>
                        <input
                          style={inputStyle}
                          value={formData.hoursMonFri}
                          onChange={e => setFormData({ ...formData, hoursMonFri: e.target.value })}
                          placeholder="9:00 AM — 7:00 PM"
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Saturday</label>
                        <input
                          style={inputStyle}
                          value={formData.hoursSat}
                          onChange={e => setFormData({ ...formData, hoursSat: e.target.value })}
                          placeholder="10:00 AM — 6:00 PM"
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Sunday</label>
                        <input
                          style={inputStyle}
                          value={formData.hoursSun}
                          onChange={e => setFormData({ ...formData, hoursSun: e.target.value })}
                          placeholder="10:00 AM — 4:00 PM"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Urgent / 24/7 Emergency Notice Banner</label>
                      <input
                        style={inputStyle}
                        value={formData.urgentText}
                        onChange={e => setFormData({ ...formData, urgentText: e.target.value })}
                        placeholder="🆘 Urgent: WhatsApp 24/7 at +91-9312690490"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: CERTIFICATIONS & FORM TEXT ─── */}
              {activeTab === 'certs_form' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Trust Badges Box */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>🏆 Trust Badges &amp; Accreditations (6 Badges)</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Box Title</label>
                      <input
                        style={inputStyle}
                        value={formData.certsTitle}
                        onChange={e => setFormData({ ...formData, certsTitle: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                      {formData.certBadges.map((badge, idx) => (
                        <div key={idx}>
                          <label style={labelStyle}>Badge {idx + 1}</label>
                          <input
                            style={inputStyle}
                            value={badge}
                            onChange={e => updateBadge(idx, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Headings & Notes Box */}
                  <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>📬 Form Text &amp; Guarantee Notices</h3>
                    <p style={{ fontSize: '13px', color: 'var(--mu)', marginTop: '-8px', marginBottom: '16px' }}>
                      The interactive input fields (Name, Phone, Email, City, Service, Message) connect directly to your CRM Lead Pipeline. You can customize the form title, button text, and disclaimers below:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>Form Heading</label>
                        <input
                          style={inputStyle}
                          value={formData.formTitle}
                          onChange={e => setFormData({ ...formData, formTitle: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Submit Button Text</label>
                        <input
                          style={inputStyle}
                          value={formData.formBtnText}
                          onChange={e => setFormData({ ...formData, formBtnText: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Indicative Rate Disclaimer Note</label>
                      <input
                        style={inputStyle}
                        value={formData.formNote1}
                        onChange={e => setFormData({ ...formData, formNote1: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Security &amp; Response Guarantee Note</label>
                      <input
                        style={inputStyle}
                        value={formData.formNote2}
                        onChange={e => setFormData({ ...formData, formNote2: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* ─── TAB 4: SEO & META INFORMATION ─── */}
              {activeTab === 'seo' && (
                <div style={cardStyle}>
                  <h3 style={sectionTitleStyle}>🔍 Contact Page SEO &amp; Meta Information</h3>
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
                  {saving ? '⏳ Saving Changes...' : '💾 Save Contact Page'}
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
