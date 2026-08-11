'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type SettingsData = {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  defaultTurnaround: string;
  pricePerPage: number;
  gstNumber: string;
  panNumber: string;
  metaTitle: string;
  metaDesc: string;
  heroHeading: string;
  heroSubtitle: string;
  whatsappNumber: string;
  maintenanceMode: boolean;
};

type AdminProfile = {
  id: string;
  username: string;
  name: string | null;
  role: string;
  createdAt: string;
};

const defaultSettings: SettingsData = {
  companyName: 'Language Guru',
  tagline: "India's #1 Certified Translation Agency",
  phone: '+91-9312690490',
  email: 'info@languageguruindia.com',
  address: '617, West End Mall, Janakpuri, New Delhi – 110058',
  website: 'https://www.languageguruindia.com',
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  youtube: '',
  defaultTurnaround: '24 Hrs',
  pricePerPage: 850,
  gstNumber: '',
  panNumber: '',
  metaTitle: 'Language Guru – Certified Translation Services India',
  metaDesc: 'Professional certified translation services in Delhi. 100+ languages. ISO quality.',
  heroHeading: 'Certified Translation Services in Delhi',
  heroSubtitle: 'ISO 9001:2015 Certified · 25+ Years Experience · 100+ Languages',
  whatsappNumber: '+919312690490',
  maintenanceMode: false,
};

type TabId = 'company' | 'social' | 'operations' | 'seo' | 'branding' | 'security' | 'system';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'company', icon: '🏢', label: 'Company Info' },
  { id: 'social', icon: '📱', label: 'Social Media' },
  { id: 'operations', icon: '⚙️', label: 'Operations' },
  { id: 'seo', icon: '🔍', label: 'SEO & Meta' },
  { id: 'branding', icon: '🎨', label: 'Branding & UI' },
  { id: 'security', icon: '🔐', label: 'Admin Security' },
  { id: 'system', icon: '🖥️', label: 'System' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company');
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/settings`, { credentials: 'include' }),
        fetch(`${API_URL}/api/v1/settings/admin-profile`, { credentials: 'include' }),
      ]);
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.success) setSettings(data.settings);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.success) setAdminProfile(data.admin);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Settings saved successfully!');
      } else {
        showToast(data.message || 'Failed to save.', 'error');
      }
    } catch {
      showToast('Network error saving settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/settings/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('🔐 Password changed! Please log in again.');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => { window.location.href = '/login'; }, 2500);
      } else {
        showToast(data.message || 'Failed to change password.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const inp = (label: string, field: keyof SettingsData, type = 'text', placeholder = '') => (
    <div key={field} style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={String(settings[field])}
        onChange={e => setSettings(prev => ({ ...prev, [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  const textarea = (label: string, field: keyof SettingsData, rows = 3) => (
    <div key={field} style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={String(settings[field])}
        onChange={e => setSettings(prev => ({ ...prev, [field]: e.target.value }))}
        rows={rows}
        style={{ ...inputStyle, resize: 'vertical', height: 'auto' }}
      />
    </div>
  );

  if (loading) {
    return (
      <>
        <TopNav title="⚙️ Settings" />
        <div className="adm-cnt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
            <p style={{ color: 'var(--mu)', fontWeight: '600' }}>Loading settings…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .settings-tab { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.65); transition: all 0.15s; white-space: nowrap; border: none; background: none; width: 100%; text-align: left; font-family: 'Nunito', sans-serif; }
        .settings-tab:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .settings-tab.active { background: rgba(255,255,255,0.15); color: #fff; border-left: 3px solid #f5a623; }
        .save-btn { background: var(--bd); color: #fff; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; font-family: 'Nunito', sans-serif; display: flex; align-items: center; gap: 8px; }
        .save-btn:hover { background: var(--bm); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,58,107,0.3); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .pw-input-wrap { position: relative; }
        .pw-input-wrap input { padding-right: 44px !important; }
        .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: var(--mu); }
        .pw-toggle:hover { color: var(--bd); }
        .toast { position: fixed; top: 80px; right: 24px; padding: 14px 22px; border-radius: 10px; font-weight: 700; font-size: 14px; z-index: 9999; animation: slideIn 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .section-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid var(--br); margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .section-title { font-size: 16px; font-weight: 800; color: var(--bd); margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
        .section-subtitle { font-size: 13px; color: var(--mu); margin-bottom: 24px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
        
        .tab-container { display: flex; flex-direction: column; gap: 4px; }
        
        @media (max-width: 900px) { 
          .grid-2 { grid-template-columns: 1fr; } 
          .settings-layout { flex-direction: column !important; gap: 16px !important; } 
          .settings-sidebar { width: 100% !important; position: static !important; } 
          .tab-container { flex-direction: row; overflow-x: auto; padding-bottom: 8px; }
          .settings-tab { width: auto; border-left: none; border-bottom: 3px solid transparent; border-radius: 8px 8px 0 0; }
          .settings-tab.active { border-left: none; border-bottom: 3px solid #f5a623; }
          /* Hide scrollbar for neatness */
          .tab-container::-webkit-scrollbar { display: none; }
          .tab-container { -ms-overflow-style: none; scrollbar-width: none; }
        }
        
        .maintenance-toggle { display: flex; align-items: center; gap: 16px; padding: 16px; background: #fef3c7; border: 1.5px solid #fbbf24; border-radius: 10px; }
        .toggle-switch { position: relative; width: 52px; height: 28px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #d1d5db; border-radius: 28px; transition: 0.3s; }
        .toggle-slider:before { position: absolute; content: ''; height: 20px; width: 20px; left: 4px; bottom: 4px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .toggle-switch input:checked + .toggle-slider { background: #ef4444; }
        .toggle-switch input:checked + .toggle-slider:before { transform: translateX(24px); }
      `}</style>

      {toast && (
        <div className="toast" style={{ background: toast.type === 'success' ? '#d1fae5' : '#fee2e2', color: toast.type === 'success' ? '#065f46' : '#b91c1c', border: `1.5px solid ${toast.type === 'success' ? '#6ee7b7' : '#fca5a5'}` }}>
          {toast.msg}
        </div>
      )}

      <TopNav title="⚙️ Settings & Configuration" />

      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div className="settings-layout" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* LEFT SIDEBAR */}
          <div className="settings-sidebar" style={{ width: '220px', flexShrink: 0, background: 'var(--bd)', borderRadius: '12px', padding: '8px', position: 'sticky', top: 0 }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Control Panel</div>
            </div>
            <div className="tab-container">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {/* ─── COMPANY INFO ───────────────────────────────── */}
            {activeTab === 'company' && (
              <>
                <div className="section-card">
                  <div className="section-title">🏢 Company Information</div>
                  <div className="section-subtitle">Core business details visible across the entire platform and invoices.</div>
                  <div className="grid-2">
                    {inp('Company Name', 'companyName', 'text', 'Language Guru')}
                    {inp('Phone Number', 'phone', 'text', '+91-9312690490')}
                    {inp('Official Email', 'email', 'email', 'info@languageguruindia.com')}
                    {inp('Website URL', 'website', 'text', 'https://www.languageguruindia.com')}
                  </div>
                  {inp('Tagline / Slogan', 'tagline', 'text', "India's #1 Certified Translation Agency")}
                  {textarea('Full Office Address', 'address', 2)}
                </div>

                <div className="section-card">
                  <div className="section-title">🧾 Tax & Legal Details</div>
                  <div className="section-subtitle">Used on professional invoices and compliance documents.</div>
                  <div className="grid-2">
                    {inp('GST Number', 'gstNumber', 'text', 'e.g. 07AAAAA0000A1Z5')}
                    {inp('PAN Number', 'panNumber', 'text', 'e.g. AAAAA0000A')}
                  </div>
                </div>
              </>
            )}

            {/* ─── SOCIAL MEDIA ───────────────────────────────── */}
            {activeTab === 'social' && (
              <div className="section-card">
                <div className="section-title">📱 Social Media Links</div>
                <div className="section-subtitle">These appear in the website footer and contact sections.</div>
                {inp('Facebook Page URL', 'facebook', 'url', 'https://facebook.com/languageguru')}
                {inp('Instagram Profile URL', 'instagram', 'url', 'https://instagram.com/languageguru')}
                {inp('Twitter / X Profile URL', 'twitter', 'url', 'https://twitter.com/languageguru')}
                {inp('LinkedIn Page URL', 'linkedin', 'url', 'https://linkedin.com/company/languageguru')}
                {inp('YouTube Channel URL', 'youtube', 'url', 'https://youtube.com/@languageguru')}
              </div>
            )}

            {/* ─── OPERATIONS ─────────────────────────────────── */}
            {activeTab === 'operations' && (
              <>
                <div className="section-card">
                  <div className="section-title">⚙️ Operational Defaults</div>
                  <div className="section-subtitle">Default values used across the quote system, orders, and pricing engine.</div>
                  <div className="grid-2">
                    {inp('Default Base Price (₹ per page)', 'pricePerPage', 'number', '850')}
                    {inp('Default Turnaround Time', 'defaultTurnaround', 'text', '24 Hrs')}
                  </div>
                  {inp('WhatsApp Business Number', 'whatsappNumber', 'text', '+919312690490')}
                </div>
                <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '10px', border: '1.5px solid #bbf7d0' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>💡 About the Price Per Page</div>
                  <p style={{ fontSize: '13px', color: '#15803d', lineHeight: '1.7', margin: 0 }}>
                    This is the <strong>global base rate</strong> used when calculating Estimated Order Value on the Orders dashboard and Invoices. Individual services may override this via the Services management page.
                  </p>
                </div>
              </>
            )}

            {/* ─── SEO ────────────────────────────────────────── */}
            {activeTab === 'seo' && (
              <div className="section-card">
                <div className="section-title">🔍 SEO & Meta Configuration</div>
                <div className="section-subtitle">Controls how your website appears in Google search results.</div>
                {inp('Meta Title (Browser Tab & Google Title)', 'metaTitle', 'text', 'Language Guru – Certified Translation Services India')}
                <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '-14px', marginBottom: '20px', fontWeight: '600' }}>
                  ✅ Recommended: 50–60 characters. Current: {settings.metaTitle.length} chars
                </div>
                {textarea('Meta Description (Google Snippet)', 'metaDesc', 3)}
                <div style={{ fontSize: '12px', color: settings.metaDesc.length > 160 ? '#dc2626' : '#16a34a', marginTop: '-14px', marginBottom: '0', fontWeight: '600' }}>
                  {settings.metaDesc.length > 160 ? '⚠️' : '✅'} Recommended: 120–160 characters. Current: {settings.metaDesc.length} chars
                </div>
              </div>
            )}

            {/* ─── BRANDING ───────────────────────────────────── */}
            {activeTab === 'branding' && (
              <div className="section-card">
                <div className="section-title">🎨 Branding & Homepage UI</div>
                <div className="section-subtitle">Directly controls the text content shown on your live website homepage.</div>
                {inp('Homepage Hero Heading (Main Headline)', 'heroHeading', 'text', 'Certified Translation Services in Delhi')}
                {inp('Homepage Hero Subtitle (Trust Badges)', 'heroSubtitle', 'text', 'ISO 9001:2015 Certified · 25+ Years Experience · 100+ Languages')}
                <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: '10px', border: '1.5px solid #bfdbfe' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--bd)', marginBottom: '8px' }}>🔗 Live Preview Note</div>
                  <p style={{ fontSize: '13px', color: 'var(--mu)', lineHeight: '1.7', margin: 0 }}>
                    After saving, the frontend site must read these values from the API to display them. Currently these control the admin panel display. To wire them to the live site, the frontend components can call <code style={{ background: '#e8f3fc', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>/api/v1/settings</code> on load.
                  </p>
                </div>
              </div>
            )}

            {/* ─── SECURITY ───────────────────────────────────── */}
            {activeTab === 'security' && (
              <>
                {/* Admin Profile Card */}
                {adminProfile && (
                  <div className="section-card" style={{ marginBottom: '24px' }}>
                    <div className="section-title">👤 Current Admin Account</div>
                    <div className="section-subtitle">Your active login credentials and account details.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {[
                        { label: 'Username', value: adminProfile.username, icon: '👤' },
                        { label: 'Display Name', value: adminProfile.name || 'Not set', icon: '📛' },
                        { label: 'Role', value: adminProfile.role, icon: '🛡️' },
                        { label: 'Account Created', value: new Date(adminProfile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: '📅' },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--br)' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{item.icon} {item.label}</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--bd)', fontFamily: 'Lora, serif' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Change Password */}
                <div className="section-card">
                  <div className="section-title">🔐 Change Admin Password</div>
                  <div className="section-subtitle">Secure password update. You will be redirected to login after changing.</div>
                  <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>Current Password</label>
                      <div className="pw-input-wrap">
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          required
                          value={pwForm.currentPassword}
                          onChange={e => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          style={inputStyle}
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                        />
                        <button type="button" className="pw-toggle" onClick={() => setShowCurrentPw(p => !p)}>
                          {showCurrentPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>New Password</label>
                      <div className="pw-input-wrap">
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          required
                          value={pwForm.newPassword}
                          onChange={e => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          style={inputStyle}
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                        />
                        <button type="button" className="pw-toggle" onClick={() => setShowNewPw(p => !p)}>
                          {showNewPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {pwForm.newPassword.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ height: '4px', flex: 1, borderRadius: '4px', background: pwForm.newPassword.length >= i * 2 ? (pwForm.newPassword.length >= 8 ? '#16a34a' : '#f59e0b') : '#e5e7eb', transition: 'background 0.3s' }} />
                          ))}
                          <span style={{ fontSize: '11px', fontWeight: '700', color: pwForm.newPassword.length >= 8 ? '#16a34a' : '#f59e0b', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                            {pwForm.newPassword.length < 6 ? 'Too Short' : pwForm.newPassword.length < 8 ? 'Moderate' : 'Strong'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={labelStyle}>Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        style={{ ...inputStyle, borderColor: pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? '#ef4444' : undefined }}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                      />
                      {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                        <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginTop: '6px' }}>⚠️ Passwords do not match</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirmPassword}
                      style={{ background: pwSaving ? '#9ca3af' : '#7c3aed', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontFamily: 'Nunito, sans-serif' }}
                    >
                      {pwSaving ? '⏳ Updating…' : '🔐 Update Password'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ─── SYSTEM ─────────────────────────────────────── */}
            {activeTab === 'system' && (
              <>
                <div className="section-card">
                  <div className="section-title">🖥️ System Configuration</div>
                  <div className="section-subtitle">Advanced settings. Handle with care.</div>

                  <div className="maintenance-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={e => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#92400e' }}>🚧 Maintenance Mode</div>
                      <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>
                        {settings.maintenanceMode
                          ? '⚠️ ACTIVE — Website visitors will see a maintenance page.'
                          : 'Currently OFF — Your website is live and accessible.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-title">📊 System Info</div>
                  <div className="section-subtitle">Current runtime environment and version details.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {[
                      { label: 'Backend', value: 'Node.js + Express', icon: '🟢' },
                      { label: 'Database', value: 'PostgreSQL + Prisma', icon: '🐘' },
                      { label: 'Admin Panel', value: 'Next.js 14', icon: '▲' },
                      { label: 'Frontend', value: 'Next.js 14', icon: '⚡' },
                      { label: 'Auth', value: 'JWT + HttpOnly Cookie', icon: '🔒' },
                      { label: 'API Version', value: 'v1', icon: '🔌' },
                    ].map(item => (
                      <div key={item.label} style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--br)' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{item.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)' }}>{item.icon} {item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SAVE BUTTON (not on security tab – it has its own form) */}
            {activeTab !== 'security' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="save-btn"
                >
                  {saving ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#4b5563',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'Nunito, sans-serif',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
  color: '#1f2937',
  background: '#fff',
};
