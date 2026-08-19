'use client';
import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

const GALLERY = [
  /* Birth / Personal Documents */
  {doc:'Birth Certificate',    lang:'English → German',  flag:'🇩🇪', langKey:'german',     time:'24 Hrs', icon:'📜', seal:'🇩🇪', acc:'German Embassy',       cat:'Birth Certificate'},
  {doc:'Birth Certificate',    lang:'English → French',  flag:'🇫🇷', langKey:'french',     time:'24 Hrs', icon:'📜', seal:'🇫🇷', acc:'French Consulate',      cat:'Birth Certificate'},
  {doc:'Birth Certificate',    lang:'Hindi → Arabic',    flag:'🇸🇦', langKey:'arabic',     time:'48 Hrs', icon:'📜', seal:'🇸🇦', acc:'Saudi Consulate',        cat:'Birth Certificate'},
  /* Marriage Certificate */
  {doc:'Marriage Certificate', lang:'English → Spanish', flag:'🇪🇸', langKey:'spanish',    time:'24 Hrs', icon:'💒', seal:'🇪🇸', acc:'Spanish Embassy',        cat:'Marriage Certificate'},
  {doc:'Marriage Certificate', lang:'Hindi → German',    flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'💒', seal:'🇩🇪', acc:'German Embassy',         cat:'Marriage Certificate'},
  {doc:'Marriage Certificate', lang:'English → Japanese',flag:'🇯🇵', langKey:'japanese',   time:'48 Hrs', icon:'💒', seal:'🇯🇵', acc:'Japanese Embassy',       cat:'Marriage Certificate'},
  /* Degree / Academic */
  {doc:'Degree Certificate',   lang:'English → Spanish', flag:'🇪🇸', langKey:'spanish',    time:'48 Hrs', icon:'🎓', seal:'🇪🇸', acc:'Spanish Embassy',        cat:'Degree Certificate'},
  {doc:'Academic Transcript',  lang:'English → French',  flag:'🇫🇷', langKey:'french',     time:'48 Hrs', icon:'📋', seal:'🇫🇷', acc:'French University',       cat:'Degree Certificate'},
  {doc:'Degree Certificate',   lang:'English → Chinese', flag:'🇨🇳', langKey:'chinese',    time:'72 Hrs', icon:'🎓', seal:'🇨🇳', acc:'Chinese Consulate',       cat:'Degree Certificate'},
  {doc:'Mark Sheet',           lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'48 Hrs', icon:'📄', seal:'🇸🇦', acc:'Saudi Ministry',          cat:'Degree Certificate'},
  /* Legal */
  {doc:'Legal Agreement',      lang:'Hindi → English',   flag:'🇮🇳', langKey:'hindi',      time:'24 Hrs', icon:'⚖️', seal:'🇮🇳', acc:'Delhi High Court',        cat:'Legal'},
  {doc:'Power of Attorney',    lang:'English → German',  flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'⚖️', seal:'🇩🇪', acc:'German Embassy',          cat:'Legal'},
  {doc:'Affidavit',            lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'24 Hrs', icon:'📝', seal:'🇸🇦', acc:'Saudi Consulate',         cat:'Legal'},
  {doc:'Court Order',          lang:'Hindi → English',   flag:'🇮🇳', langKey:'hindi',      time:'48 Hrs', icon:'⚖️', seal:'⚖️',  acc:'District Court',          cat:'Legal'},
  /* Medical */
  {doc:'Medical Report',       lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'48 Hrs', icon:'🏥', seal:'🇸🇦', acc:'Saudi Consulate',         cat:'Medical'},
  {doc:'Discharge Summary',    lang:'English → German',  flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'🏥', seal:'🇩🇪', acc:'German Hospital',         cat:'Medical'},
  {doc:'Medical Certificate',  lang:'English → French',  flag:'🇫🇷', langKey:'french',     time:'24 Hrs', icon:'🏥', seal:'🇫🇷', acc:'French Consulate',        cat:'Medical'},
  /* Business */
  {doc:'Company Registration', lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'72 Hrs', icon:'🏥', seal:'🇸🇦', acc:'Ministry of Commerce',    cat:'Business'},
  {doc:'Bank Statement',       lang:'English → Chinese', flag:'🇨🇳', langKey:'chinese',    time:'24 Hrs', icon:'🏥', seal:'🇨🇳', acc:'Chinese Consulate',       cat:'Business'},
  {doc:'Business Contract',    lang:'English → Japanese',flag:'🇯🇵', langKey:'japanese',   time:'72 Hrs', icon:'💼', seal:'🇯🇵', acc:'Japanese Embassy',        cat:'Business'},
  /* Visa / Immigration */
  {doc:'Visa Documents',       lang:'English → Japanese',flag:'🇯🇵', langKey:'japanese',   time:'24 Hrs', icon:'🛂', seal:'🇯🇵', acc:'Japanese Embassy',        cat:'Visa'},
  {doc:'Police Clearance',     lang:'Hindi → German',    flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'👮', seal:'🇩🇪', acc:'German Embassy',          cat:'Visa'},
  {doc:'Police Clearance',     lang:'English → Korean',  flag:'🇰🇷', langKey:'korean',     time:'48 Hrs', icon:'👮', seal:'🇰🇷', acc:'Korean Embassy',          cat:'Visa'},
  {doc:'Divorce Decree',       lang:'Hindi → English',   flag:'🇮🇳', langKey:'hindi',      time:'24 Hrs', icon:'📄', seal:'⚖️',  acc:'Family Court',            cat:'Visa'},
  /* Technical */
  {doc:'Technical Manual',     lang:'English → Korean',  flag:'🇰🇷', langKey:'korean',     time:'96 Hrs', icon:'⚙️', seal:'🇰🇷', acc:'Korean Business',         cat:'Business'},
  {doc:'Patent Document',      lang:'English → Chinese', flag:'🇨🇳', langKey:'chinese',    time:'96 Hrs', icon:'📜', seal:'🇨🇳', acc:'CNIPA',                   cat:'Business'},
];

export default function HomeSectionsManagement() {
  const [sections, setSections] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [whyChoose, setWhyChoose] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showWhyChooseModal, setShowWhyChooseModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'static' | 'services' | 'whyChoose' | 'branding'>('hero');

  const [formData, setFormData] = useState({
    sectionId: '', tag: '', title: '', content: '', imageUrl: '', layout: 'image-right', buttonText: '', buttonLink: '', stat1Value: '', stat1Label: '', stat2Value: '', stat2Label: '', isActive: true, sortOrder: 0
  });

  const [serviceFormData, setServiceFormData] = useState({
    id: '', name: '', tag: '', title: '', p1: '', p2: '',
    featuresText: '',
    ctaLabel: '',
    ctaKey: '',
    certLang: '',
    certDoc: '',
    certFlag: '',
    certAcc: '',
    certTime: '',
    certIcon: ''
  });

  const [whyChooseFormData, setWhyChooseFormData] = useState({
    title: '', desc: '', icon: '🎯', sortOrder: 0, isActive: true
  });

  const [whyChooseHeader, setWhyChooseHeader] = useState({
    whyChooseTag: 'Why Choose Us',
    whyChooseTitle: 'Why Choose Language Guru for <em>Certified Translation</em>',
    whyChooseSubtitle: 'ISO-9001:2015 and ISO 17100:2015 certified · MSME registered · MEA-empanelled · 10,000+ clients · Embassy-accepted translations guaranteed.'
  });
  
  const [heroSettings, setHeroSettings] = useState({
    heroBgImage: '',
    heroHeading: 'Certified Translation Services in Delhi',
    heroSubtitle: 'ISO 9001:2015 Certified · 25+ Years Experience · 100+ Languages',
    heroTopBadge: '⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency',
    heroTopLine: 'INDIA\'S #1 CERTIFIED TRANSLATION AGENCY',
    heroTrustBadge1: '🛡️ ISO-9001:2015 and ISO 17100:2015',
    heroTrustBadge2: '📑 MSME Registered',
    heroTrustBadge3: '🏛️ MEA Empanelled',
    heroTrustBadge4: '⭐ 4.9 Rating',
    stat1Value: '100+', stat1Label: 'Languages',
    stat2Value: '10,000+', stat2Label: 'Happy Clients',
    stat3Value: '20+', stat3Label: 'Years Experience',
    stat4Value: '150+', stat4Label: 'Indian Cities',
  });

  const [savingHeader, setSavingHeader] = useState(false);
  const [headerSavedMsg, setHeaderSavedMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const [secRes, svcRes, wcRes, setRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/home-sections`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/services/all`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/why-choose/all`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/settings`, { credentials: 'include' })
      ]);
      const [secData, svcData, wcData, setData] = await Promise.all([secRes.json(), svcRes.json(), wcRes.json(), setRes.json()]);
      if (secData.success) setSections(secData.data);
      if (svcData.success) setServices(svcData.data);
      if (wcData.success) setWhyChoose(wcData.data);
      if (setData.success && setData.settings) {
        setWhyChooseHeader({
          whyChooseTag: setData.settings.whyChooseTag || 'Why Choose Us',
          whyChooseTitle: setData.settings.whyChooseTitle || 'Why Choose Language Guru for <em>Certified Translation</em>',
          whyChooseSubtitle: setData.settings.whyChooseSubtitle || 'ISO-9001:2015 and ISO 17100:2015 certified · MSME registered · MEA-empanelled · 10,000+ clients · Embassy-accepted translations guaranteed.'
        });
        setHeroSettings({
          heroBgImage: setData.settings.heroBgImage || '',
          heroHeading: setData.settings.heroHeading || 'Certified Translation Services in Delhi',
          heroSubtitle: setData.settings.heroSubtitle || 'ISO 9001:2015 Certified · 25+ Years Experience · 100+ Languages',
          heroTopBadge: setData.settings.heroTopBadge || '⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency',
          heroTopLine: setData.settings.heroTopLine || 'INDIA\'S #1 CERTIFIED TRANSLATION AGENCY',
          heroTrustBadge1: setData.settings.heroTrustBadge1 || '🛡️ ISO-9001:2015 and ISO 17100:2015',
          heroTrustBadge2: setData.settings.heroTrustBadge2 || '📑 MSME Registered',
          heroTrustBadge3: setData.settings.heroTrustBadge3 || '🏛️ MEA Empanelled',
          heroTrustBadge4: setData.settings.heroTrustBadge4 || '⭐ 4.9 Rating',
          stat1Value: setData.settings.stat1Value || '100+', stat1Label: setData.settings.stat1Label || 'Languages',
          stat2Value: setData.settings.stat2Value || '10,000+', stat2Label: setData.settings.stat2Label || 'Happy Clients',
          stat3Value: setData.settings.stat3Value || '20+', stat3Label: setData.settings.stat3Label || 'Years Experience',
          stat4Value: setData.settings.stat4Value || '150+', stat4Label: setData.settings.stat4Label || 'Indian Cities',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = editingId ? `${apiUrl}/api/v1/home-sections/${editingId}` : `${apiUrl}/api/v1/home-sections`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/home-sections/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAll();
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('image', file);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/upload`, {
        method: 'POST', credentials: 'include', body: fd
      });
      const data = await res.json();
      if(data.success) {
        setFormData(p => ({ ...p, imageUrl: data.url }));
      }
    } catch(e) {
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ sectionId: '', tag: '', title: '', content: '', imageUrl: '', layout: 'image-right', buttonText: '', buttonLink: '', stat1Value: '', stat1Label: '', stat2Value: '', stat2Label: '', isActive: true, sortOrder: sections.length });
    setShowModal(true);
  };

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setFormData({
      sectionId: s.sectionId || '', tag: s.tag || '', title: s.title || '', content: s.content || '',
      imageUrl: s.imageUrl || '', layout: s.layout || 'image-right', buttonText: s.buttonText || '',
      buttonLink: s.buttonLink || '', stat1Value: s.stat1Value || '', stat1Label: s.stat1Label || '',
      stat2Value: s.stat2Value || '', stat2Label: s.stat2Label || '', isActive: s.isActive, sortOrder: s.sortOrder || 0
    });
    setShowModal(true);
  };

  const getFallbackCert = (key: string) => {
    if (key === 'academic') return GALLERY[6]; // Degree
    if (key === 'legal') return GALLERY[10]; // Legal Agreement
    if (key === 'medical') return GALLERY[14]; // Medical Report
    if (key === 'business') return GALLERY[19]; // Business Contract
    if (key === 'immigration' || key === 'visa') return GALLERY[20]; // Visa Documents
    return GALLERY[0]; // Birth Certificate
  };

  const openServiceEditModal = (svc: any) => {
    const key = svc.ctaKey || svc.key;
    const fb = getFallbackCert(key) || GALLERY[0];

    setServiceFormData({
      id: svc.id, name: svc.name, tag: svc.tag || '', title: svc.title || '', p1: svc.p1 || '', p2: svc.p2 || '',
      featuresText: (svc.features || []).join('\n'), ctaLabel: svc.ctaLabel || '', ctaKey: svc.ctaKey || '',
      certLang: svc.certLang || fb.lang, 
      certDoc: svc.certDoc || fb.doc, 
      certFlag: svc.certFlag || fb.flag,
      certAcc: svc.certAcc || fb.acc, 
      certTime: svc.certTime || fb.time, 
      certIcon: svc.certIcon || fb.icon
    });
    setShowServiceModal(true);
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    if (isNaN(idx)) return;
    const g = GALLERY[idx];
    if (g) {
      setServiceFormData(prev => ({
        ...prev,
        certLang: g.lang,
        certDoc: g.doc,
        certFlag: g.flag,
        certAcc: g.acc,
        certTime: g.time,
        certIcon: g.icon
      }));
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...serviceFormData,
        features: serviceFormData.featuresText.split('\n').map(s => s.trim()).filter(Boolean)
      };
      delete (payload as any).featuresText;
      delete (payload as any).id;
      delete (payload as any).name;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/services/${serviceFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowServiceModal(false);
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving service details');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddWhyChooseModal = () => {
    setEditingId(null);
    setWhyChooseFormData({ title: '', desc: '', icon: '🎯', sortOrder: whyChoose.length, isActive: true });
    setShowWhyChooseModal(true);
  };

  const openEditWhyChooseModal = (wc: any) => {
    setEditingId(wc.id);
    setWhyChooseFormData({ title: wc.title, desc: wc.desc, icon: wc.icon, sortOrder: wc.sortOrder, isActive: wc.isActive });
    setShowWhyChooseModal(true);
  };

  const handleDeleteWhyChoose = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/why-choose/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAll();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveWhyChoose = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = editingId ? `${apiUrl}/api/v1/why-choose/${editingId}` : `${apiUrl}/api/v1/why-choose`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(whyChooseFormData)
      });
      if (res.ok) {
        setShowWhyChooseModal(false);
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving feature');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveWhyChooseHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeader(true);
    setHeaderSavedMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(whyChooseHeader)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHeaderSavedMsg('Section header updated successfully!');
        setTimeout(() => setHeaderSavedMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to update section header');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving header');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeader(true);
    setHeaderSavedMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(heroSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHeaderSavedMsg('Hero Settings updated successfully!');
        setTimeout(() => setHeaderSavedMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to update hero settings');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving hero settings');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('image', file);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/upload`, {
        method: 'POST', credentials: 'include', body: fd
      });
      const data = await res.json();
      if(data.success) {
        setHeroSettings(p => ({ ...p, heroBgImage: data.url }));
      }
    } catch(e) {
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <TopNav title="🏠 Home Page Sections" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>Home Page Content</h2>
            {activeTab === 'static' && <button onClick={openAddModal} className="btn-add">➕ Add Section</button>}
            {activeTab === 'whyChoose' && <button onClick={openAddWhyChooseModal} className="btn-add">➕ Add Feature</button>}
          </div>

          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--br)', marginBottom: '20px' }}>
            <button 
              onClick={() => setActiveTab('hero')} 
              style={{ background: 'none', border: 'none', padding: '8px 16px', fontWeight: 'bold', borderBottom: activeTab === 'hero' ? '2px solid var(--bd)' : 'none', color: activeTab === 'hero' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer' }}>
              Hero & Main Settings
            </button>
            <button 
              onClick={() => setActiveTab('static')} 
              style={{ background: 'none', border: 'none', padding: '8px 16px', fontWeight: 'bold', borderBottom: activeTab === 'static' ? '2px solid var(--bd)' : 'none', color: activeTab === 'static' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer' }}>
              Main Sections
            </button>
            <button 
              onClick={() => setActiveTab('services')} 
              style={{ background: 'none', border: 'none', padding: '8px 16px', fontWeight: 'bold', borderBottom: activeTab === 'services' ? '2px solid var(--bd)' : 'none', color: activeTab === 'services' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer' }}>
              Official Translation Services
            </button>
            <button 
              
              onClick={() => setActiveTab('whyChoose')} 
              style={{ background: 'none', border: 'none', padding: '8px 16px', fontWeight: 'bold', borderBottom: activeTab === 'whyChoose' ? '2px solid var(--bd)' : 'none', color: activeTab === 'whyChoose' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer' }}>
              Why Choose Us
            </button>
            <button 
              onClick={() => setActiveTab('branding')} 
              style={{ background: 'none', border: 'none', padding: '8px 16px', fontWeight: 'bold', borderBottom: activeTab === 'branding' ? '2px solid var(--bd)' : 'none', color: activeTab === 'branding' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer' }}>
              Branding & UI
            </button>

          </div>

          {loading ? (
            <p>Loading content...</p>
          ) : activeTab === 'hero' ? (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--br)' }}>
              <form onSubmit={handleSaveHeroSettings}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Hero Background Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {heroSettings.heroBgImage ? (
                      <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--br)', position: 'relative' }}>
                        <img src={heroSettings.heroBgImage.startsWith('http') ? heroSettings.heroBgImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${heroSettings.heroBgImage}`} alt="Hero Bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '120px', height: '80px', borderRadius: '8px', background: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        No Image
                      </div>
                    )}
                    <div>
                      <input type="file" id="heroBgUpload" accept="image/*" style={{ display: 'none' }} onChange={handleHeroImageUpload} disabled={uploadingImage} />
                      <label htmlFor="heroBgUpload" style={{ background: 'var(--bd)', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
                        {uploadingImage ? 'Uploading...' : 'Upload New Image'}
                      </label>
                      {heroSettings.heroBgImage && (
                        <button type="button" onClick={() => setHeroSettings(p => ({ ...p, heroBgImage: '' }))} style={{ display: 'block', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer' }}>
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '12px', color: '#0369a1', lineHeight: '1.6' }}>
                    📐 <strong>Recommended Aspect Ratio:</strong> <strong>16:9</strong> (e.g. <strong>1920 × 1080 px</strong> or <strong>2560 × 1440 px</strong>). Widescreen landscape images work best for full-width coverage across all desktop and mobile displays. Supported formats: JPG, PNG, WebP (Max 5MB).
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Hero Top Badge</label>
                    <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroTopBadge} onChange={e => setHeroSettings({...heroSettings, heroTopBadge: e.target.value})} placeholder="⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Hero Top Line (Small uppercase text)</label>
                    <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroTopLine} onChange={e => setHeroSettings({...heroSettings, heroTopLine: e.target.value})} placeholder="INDIA'S #1 CERTIFIED TRANSLATION AGENCY" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Hero Main Heading</label>
                    <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroHeading} onChange={e => setHeroSettings({...heroSettings, heroHeading: e.target.value})} placeholder="Certified Translation Services in Delhi" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Hero Subtitle</label>
                    <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroSubtitle} onChange={e => setHeroSettings({...heroSettings, heroSubtitle: e.target.value})} placeholder="ISO 9001:2015 Certified · 25+ Years Experience" />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', color: 'var(--bd)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--br)' }}>Hero Bottom Trust Badges</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Trust Badge 1</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroTrustBadge1} onChange={e => setHeroSettings({...heroSettings, heroTrustBadge1: e.target.value})} placeholder="🛡️ ISO-9001:2015 and ISO 17100:2015" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Trust Badge 2</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroTrustBadge2} onChange={e => setHeroSettings({...heroSettings, heroTrustBadge2: e.target.value})} placeholder="📑 MSME Registered" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Trust Badge 3</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroTrustBadge3} onChange={e => setHeroSettings({...heroSettings, heroTrustBadge3: e.target.value})} placeholder="🏛️ MEA Empanelled" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Trust Badge 4</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.heroTrustBadge4} onChange={e => setHeroSettings({...heroSettings, heroTrustBadge4: e.target.value})} placeholder="⭐ 4.9 Rating" />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', color: 'var(--bd)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--br)' }}>Global Stats (Below Hero)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 1 Value</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat1Value} onChange={e => setHeroSettings({...heroSettings, stat1Value: e.target.value})} placeholder="100+" />
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginTop: '8px', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 1 Label</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat1Label} onChange={e => setHeroSettings({...heroSettings, stat1Label: e.target.value})} placeholder="Languages" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 2 Value</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat2Value} onChange={e => setHeroSettings({...heroSettings, stat2Value: e.target.value})} placeholder="10,000+" />
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginTop: '8px', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 2 Label</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat2Label} onChange={e => setHeroSettings({...heroSettings, stat2Label: e.target.value})} placeholder="Happy Clients" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 3 Value</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat3Value} onChange={e => setHeroSettings({...heroSettings, stat3Value: e.target.value})} placeholder="20+" />
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginTop: '8px', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 3 Label</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat3Label} onChange={e => setHeroSettings({...heroSettings, stat3Label: e.target.value})} placeholder="Years Experience" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 4 Value</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat4Value} onChange={e => setHeroSettings({...heroSettings, stat4Value: e.target.value})} placeholder="150+" />
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mu)', marginTop: '8px', marginBottom: '8px', textTransform: 'uppercase' }}>Stat 4 Label</label>
                      <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '14px' }} value={heroSettings.stat4Label} onChange={e => setHeroSettings({...heroSettings, stat4Label: e.target.value})} placeholder="Indian Cities" />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--br)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
                  {headerSavedMsg && <span style={{ color: '#16a34a', fontSize: '14px', fontWeight: 'bold' }}>{headerSavedMsg}</span>}
                  <button type="submit" disabled={savingHeader} style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: savingHeader ? 0.7 : 1 }}>
                    {savingHeader ? 'Saving...' : 'Save Hero Settings'}
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'static' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: 'var(--mu)', borderBottom: '2px solid var(--br)' }}>
                  <th style={{ padding: '12px' }}>Order</th>
                  <th style={{ padding: '12px' }}>Section ID</th>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Layout</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--br)' }}>
                    <td style={{ padding: '12px' }}>{s.sortOrder}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.sectionId}</td>
                    <td style={{ padding: '12px' }}>{s.title}</td>
                    <td style={{ padding: '12px' }}>{s.layout}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: s.isActive ? '#dcfce7' : '#fee2e2', color: s.isActive ? '#166534' : '#991b1b' }}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(s)} style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', marginRight: '8px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'services' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: 'var(--mu)', borderBottom: '2px solid var(--br)' }}>
                  <th style={{ padding: '12px' }}>Service Name</th>
                  <th style={{ padding: '12px' }}>Home Panel Title</th>
                  <th style={{ padding: '12px' }}>Tag</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--br)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.icon} {s.name}</td>
                    <td style={{ padding: '12px' }} dangerouslySetInnerHTML={{ __html: s.title || '<em>Not set</em>' }}></td>
                    <td style={{ padding: '12px' }}>{s.tag || '—'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => openServiceEditModal(s)} style={{ background: '#10b981', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Edit Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'whyChoose' ? (
            <div>
              {/* Section Header Editor */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>✨ Section Header &amp; Subtitle</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--mu)' }}>Customize the tag badge, title heading, and description shown above the features.</p>
                  </div>
                  {headerSavedMsg && (
                    <span style={{ fontSize: '12px', color: '#166534', background: '#dcfce7', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ✓ {headerSavedMsg}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveWhyChooseHeader}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={labelStyle}>Tag / Badge</label>
                      <input 
                        style={inputStyle} 
                        value={whyChooseHeader.whyChooseTag} 
                        onChange={e => setWhyChooseHeader({ ...whyChooseHeader, whyChooseTag: e.target.value })} 
                        placeholder="Why Choose Us" 
                        required 
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Heading (use &lt;em&gt;...&lt;/em&gt; for highlighted text)</label>
                      <input 
                        style={inputStyle} 
                        value={whyChooseHeader.whyChooseTitle} 
                        onChange={e => setWhyChooseHeader({ ...whyChooseHeader, whyChooseTitle: e.target.value })} 
                        placeholder="Why Choose Language Guru for <em>Certified Translation</em>" 
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Subtitle / Trust Description</label>
                    <textarea 
                      rows={2} 
                      style={{ ...inputStyle, resize: 'vertical' }} 
                      value={whyChooseHeader.whyChooseSubtitle} 
                      onChange={e => setWhyChooseHeader({ ...whyChooseHeader, whyChooseSubtitle: e.target.value })} 
                      placeholder="ISO-9001:2015 and ISO 17100:2015 certified · MSME registered · MEA-empanelled · 10,000+ clients · Embassy-accepted translations guaranteed." 
                      required 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit" 
                      disabled={savingHeader} 
                      style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: savingHeader ? 'wait' : 'pointer' }}
                    >
                      {savingHeader ? 'Saving Header...' : '💾 Save Section Header'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Features List Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>📋 Feature Cards ({whyChoose.length})</h3>
                <button onClick={openAddWhyChooseModal} className="btn-add" style={{ padding: '6px 14px', fontSize: '13px' }}>➕ Add Feature</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: 'var(--mu)', borderBottom: '2px solid var(--br)' }}>
                    <th style={{ padding: '12px' }}>Order</th>
                    <th style={{ padding: '12px' }}>Icon</th>
                    <th style={{ padding: '12px' }}>Title</th>
                    <th style={{ padding: '12px' }}>Description</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {whyChoose && whyChoose.length > 0 ? (
                    whyChoose.map(w => (
                      <tr key={w.id} style={{ borderBottom: '1px solid var(--br)' }}>
                        <td style={{ padding: '12px' }}>{w.sortOrder}</td>
                        <td style={{ padding: '12px', fontSize: '24px' }}>{w.icon}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{w.title}</td>
                        <td style={{ padding: '12px', maxWidth: '300px', fontSize: '13px', color: '#4b5563' }}>
                          {(w.desc || '').length > 70 ? (w.desc || '').substring(0, 70) + '...' : w.desc}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: w.isActive ? '#dcfce7' : '#fee2e2', color: w.isActive ? '#166534' : '#991b1b' }}>
                            {w.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openEditWhyChooseModal(w)} style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', marginRight: '8px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteWhyChoose(w.id)} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No features found. Click "Add Feature" above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'branding' ? (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--br)' }}>
              <h3>Branding &amp; UI Settings</h3>
              <p>These settings are used to configure the core UI theme and text shown across the site.</p>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Global Badges (shown on Home / Services headers)</label>
                <textarea 
                  style={{ width: '100%', height: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  defaultValue={"🛡️ ISO-9001:2015 and ISO 17100:2015\n📑 MSME Registered\n🏛️ MEA Empanelled\n⭐ 4.9 Rating"}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Global Trust Tagline</label>
                <textarea 
                  style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  defaultValue={"ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency\nIndia's #1 Certified Translation Agency"}
                />
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Primary Theme Color</label>
                <input type="color" defaultValue="#0f172a" style={{ padding: '2px', height: '40px', width: '100px' }} />
              </div>

              <button style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--bd)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Branding Settings</button>
            </div>
          ) : null}
        </div>
      </div>

      {showModal && (
        // ... previous static modal ...
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          {/* ... keeping existing static modal content ... */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: "'Lora', serif", color: 'var(--bd)' }}>{editingId ? 'Edit Section' : 'Add Section'}</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Section ID (unique, e.g. "about", "legal")</label>
                <input required style={inputStyle} value={formData.sectionId} onChange={e => setFormData({ ...formData, sectionId: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Sort Order</label>
                <input type="number" required style={inputStyle} value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label style={labelStyle}>Tag (e.g. "About Us")</label>
                <input style={inputStyle} value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Title (use &lt;em&gt;...&lt;/em&gt; to highlight words in orange)</label>
                <input required style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Content (Normal text with line breaks, or HTML)</label>
                <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Layout</label>
                <select style={inputStyle} value={formData.layout} onChange={e => setFormData({ ...formData, layout: e.target.value })}>
                  <option value="image-right">Image Right, Text Left</option>
                  <option value="image-left">Image Left, Text Right</option>
                  <option value="text-only">Text Only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Image URL (Rec. size: 800x600 px)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input style={inputStyle} value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="URL or upload ->" />
                  <label style={{ background: 'var(--bd)', color: '#fff', padding: '8px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                    {uploadingImage ? '...' : 'Upload'}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                {formData.imageUrl && <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${formData.imageUrl}`} alt="preview" style={{ marginTop: '8px', maxHeight: '80px', borderRadius: '4px' }} />}
              </div>
              <div>
                <label style={labelStyle}>Button Text (optional)</label>
                <input style={inputStyle} value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Button Link (optional)</label>
                <input style={inputStyle} value={formData.buttonLink} onChange={e => setFormData({ ...formData, buttonLink: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Stat 1 Value (e.g. "10K+")</label>
                <input style={inputStyle} value={formData.stat1Value || ''} onChange={e => setFormData({ ...formData, stat1Value: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Stat 1 Label (e.g. "Documents Delivered")</label>
                <input style={inputStyle} value={formData.stat1Label || ''} onChange={e => setFormData({ ...formData, stat1Label: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Stat 2 Value (e.g. "50+")</label>
                <input style={inputStyle} value={formData.stat2Value || ''} onChange={e => setFormData({ ...formData, stat2Value: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Stat 2 Label (e.g. "Expert Translators")</label>
                <input style={inputStyle} value={formData.stat2Label || ''} onChange={e => setFormData({ ...formData, stat2Label: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                <label htmlFor="isActive" style={{ fontWeight: 'bold' }}>Is Active</label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: "'Lora', serif", color: 'var(--bd)' }}>Edit Home Panel Details for {serviceFormData.name}</h2>
            <form onSubmit={handleSaveService}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Tag (e.g. Certified Services)</label>
                  <input style={inputStyle} value={serviceFormData.tag} onChange={e => setServiceFormData({ ...serviceFormData, tag: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Full Title (allows HTML like &lt;em&gt;)</label>
                  <input style={inputStyle} value={serviceFormData.title} onChange={e => setServiceFormData({ ...serviceFormData, title: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Paragraph 1 (Expand Panel Detail)</label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={serviceFormData.p1} onChange={e => setServiceFormData({ ...serviceFormData, p1: e.target.value })} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Paragraph 2 (Expand Panel Detail - Optional)</label>
                <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={serviceFormData.p2} onChange={e => setServiceFormData({ ...serviceFormData, p2: e.target.value })} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Features Checkmarks (One per line)</label>
                <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={serviceFormData.featuresText} onChange={e => setServiceFormData({ ...serviceFormData, featuresText: e.target.value })} placeholder="✓ Feature 1&#10;✓ Feature 2" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Call to Action Label</label>
                  <input style={inputStyle} value={serviceFormData.ctaLabel} onChange={e => setServiceFormData({ ...serviceFormData, ctaLabel: e.target.value })} placeholder="Get Quote →" />
                </div>
                <div>
                  <label style={labelStyle}>Call to Action Target Key</label>
                  <input style={inputStyle} value={serviceFormData.ctaKey} onChange={e => setServiceFormData({ ...serviceFormData, ctaKey: e.target.value })} placeholder="certified" />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)', marginBottom: '12px' }}>Certificate Card Preview Details</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Prefill from Gallery Template</label>
                  <select style={inputStyle} onChange={handleGallerySelect} defaultValue="">
                    <option value="" disabled>-- Select a Template --</option>
                    {GALLERY.map((g, idx) => (
                      <option key={idx} value={idx}>{g.doc} ({g.lang})</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Certificate Title (e.g. Birth Certificate)</label>
                    <input style={inputStyle} value={serviceFormData.certDoc} onChange={e => setServiceFormData({ ...serviceFormData, certDoc: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Language Pair (e.g. English → German)</label>
                    <input style={inputStyle} value={serviceFormData.certLang} onChange={e => setServiceFormData({ ...serviceFormData, certLang: e.target.value })} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Flag Emoji (e.g. 🇩🇪)</label>
                    <input style={inputStyle} value={serviceFormData.certFlag} onChange={e => setServiceFormData({ ...serviceFormData, certFlag: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Accepted By (e.g. German Embassy)</label>
                    <input style={inputStyle} value={serviceFormData.certAcc} onChange={e => setServiceFormData({ ...serviceFormData, certAcc: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Time (e.g. 24 Hrs)</label>
                    <input style={inputStyle} value={serviceFormData.certTime} onChange={e => setServiceFormData({ ...serviceFormData, certTime: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Icon Emoji (e.g. 📜)</label>
                    <input style={inputStyle} value={serviceFormData.certIcon} onChange={e => setServiceFormData({ ...serviceFormData, certIcon: e.target.value })} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowServiceModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWhyChooseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: "'Lora', serif", color: 'var(--bd)' }}>{editingId ? 'Edit Feature' : 'Add Feature'}</h2>
            <form onSubmit={handleSaveWhyChoose} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Sort Order</label>
                <input type="number" required style={inputStyle} value={whyChooseFormData.sortOrder} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, sortOrder: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label style={labelStyle}>Icon</label>
                <select style={inputStyle} value={whyChooseFormData.icon} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, icon: e.target.value })}>
                  <option value="🎯">🎯 Accuracy & Expertise</option>
                  <option value="🔒">🔒 Confidential & Secure</option>
                  <option value="🏛️">🏛️ Globally Recognized</option>
                  <option value="⚡">⚡ Fast Turnaround</option>
                  <option value="💰">💰 Transparent Pricing</option>
                  <option value="🌐">🌐 120+ Languages</option>
                  <option value="⭐">⭐ Quality Assured</option>
                  <option value="🏆">🏆 Top Rated</option>
                  <option value="💬">💬 24/7 Support</option>
                  <option value="🛡️">🛡️ Guaranteed Acceptance</option>
                  <option value="📜">📜 Certified Documents</option>
                  <option value="🤝">🤝 Trusted Partner</option>
                  <option value="✅">✅ verified</option>
                  <option value="🚀">🚀 Express Service</option>
                  <option value="👨‍⚖️">👨‍⚖️ Legal Expertise</option>
                  <option value="🏥">🏥 Medical Accuracy</option>
                  <option value="💻">💻 Technical Precision</option>
                  <option value="🎓">🎓 Academic Standards</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Title</label>
                <input required style={inputStyle} value={whyChooseFormData.title} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, title: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea required rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={whyChooseFormData.desc} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, desc: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="wcIsActive" checked={whyChooseFormData.isActive} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, isActive: e.target.checked })} />
                <label htmlFor="wcIsActive" style={{ fontWeight: 'bold' }}>Is Active</label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowWhyChooseModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Feature</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .btn-add { background: var(--bd); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; }
        .btn-add:hover { opacity: 0.9; }
      `}</style>
    </>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' };
