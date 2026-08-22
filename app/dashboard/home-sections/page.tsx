'use client';
import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#334155',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  color: '#0f172a',
  background: '#ffffff',
  boxSizing: 'border-box',
};

const DEFAULT_HERO_BUTTONS = [
  { label: '📋 Get Quote →', href: '/quote', variant: 'primary' },
  { label: '📞 Call Now', href: '{{phone}}', variant: 'outline' },
  { label: '💬 WhatsApp', href: '{{whatsapp}}', variant: 'whatsapp' },
];

export default function HomeSectionsManagement() {
  const [sections, setSections] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [whyChoose, setWhyChoose] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showWhyChooseModal, setShowWhyChooseModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);

  const [activeTab, setActiveTab] = useState<'static' | 'services' | 'whyChoose' | 'testimonials' | 'faqs' | 'branding'>('static');

  // Check URL query param on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['static', 'services', 'whyChoose', 'testimonials', 'faqs', 'branding'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

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

  const [testimonialFormData, setTestimonialFormData] = useState({
    name: '', city: '', role: '', text: '', rating: 5, sortOrder: 0, isActive: true
  });

  const [faqFormData, setFaqFormData] = useState({
    question: '', answer: '', category: 'General', sortOrder: 0, isActive: true
  });

  const [whyChooseHeader, setWhyChooseHeader] = useState({
    whyChooseTag: 'Why Choose Us',
    whyChooseTitle: 'Why Choose Language Guru for <em>Certified Translation</em>',
    whyChooseSubtitle: 'ISO-9001:2015 and ISO 17100:2015 certified · MSME registered · MEA-empanelled · 10,000+ clients · Embassy-accepted translations guaranteed.'
  });

  const [heroButtons, setHeroButtons] = useState<Array<{ label: string; href: string; variant: string }>>(DEFAULT_HERO_BUTTONS);

  const [brandingData, setBrandingData] = useState({
    slug: '',
    metaTitle: 'Language Guru – Certified Translation Services India',
    metaDesc: 'Professional certified translation services in Delhi. 100+ languages. ISO quality.',
    metaKeywords: 'certified translation, translation agency Delhi, apostille services, document translation',
    heroBgImage: '',
    heroTopBadge: '⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency',
    heroTopLine: "INDIA'S MOST TRUSTED TRANSLATION AGENCY",
    heroHeading: 'Professional Translation Services in India',
    heroSubtitle: 'Certified & Court-Accepted translations in 120+ languages. 500+ expert translators. 20 years of excellence — embassy-accepted, government-authorized, ISO-9001:2015 and ISO 17100:2015 certified.',
    heroTrustBadge1: '🛡️ ISO-9001:2015 and ISO 17100:2015',
    heroTrustBadge2: '📑 MSME Registered',
    heroTrustBadge3: '🏛️ MEA Empanelled',
    heroTrustBadge4: '⭐ 4.9 Rating',
    stat1Value: '120+',
    stat1Label: 'Languages',
    stat2Value: '10,000+',
    stat2Label: 'Happy Clients',
    stat3Value: '20+',
    stat3Label: 'Years Experience',
    stat4Value: '150+',
    stat4Label: 'Indian Cities',
    pricePerPage: 850,
    defaultTurnaround: '24 Hrs',
    whatsappNumber: '+919312690490',
    phone: '+91-9312690490'
  });

  const [savingHeader, setSavingHeader] = useState(false);
  const [headerSavedMsg, setHeaderSavedMsg] = useState('');
  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingSavedMsg, setBrandingSavedMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const apiUrl = API_URL;
      const [secRes, svcRes, wcRes, tstRes, faqRes, setRes, pageRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/home-sections`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/services/all`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/why-choose/all`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/testimonials/all`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/faqs/all`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/settings`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/v1/site-pages/home`, { credentials: 'include' }).catch(() => null)
      ]);
      const [secData, svcData, wcData, tstData, faqData, setData] = await Promise.all([
        secRes.json(), svcRes.json(), wcRes.json(), tstRes.json(), faqRes.json(), setRes.json()
      ]);
      const pageData = pageRes ? await pageRes.json().catch(() => null) : null;
      const homePage = pageData?.success ? pageData.data : null;

      if (secData.success) setSections(secData.data);
      if (svcData.success) setServices(svcData.data);
      if (wcData.success) setWhyChoose(wcData.data);
      if (tstData.success) setTestimonials(tstData.data);
      if (faqData.success) setFaqs(faqData.data);

      if (homePage) {
        // Load hero buttons if present on the page's hero section
        const heroSec = (homePage.sections || []).find((s: any) => s.sectionKey === 'hero');
        if (heroSec && Array.isArray(heroSec.items) && heroSec.items.length > 0) {
          setHeroButtons(heroSec.items);
        }
      }

      if (setData.success && setData.settings) {
        const s = setData.settings;
        setWhyChooseHeader({
          whyChooseTag: s.whyChooseTag || 'Why Choose Us',
          whyChooseTitle: s.whyChooseTitle || 'Why Choose Language Guru for <em>Certified Translation</em>',
          whyChooseSubtitle: s.whyChooseSubtitle || 'ISO-9001:2015 and ISO 17100:2015 certified · MSME registered · MEA-empanelled · 10,000+ clients · Embassy-accepted translations guaranteed.'
        });

        setBrandingData({
          slug: homePage?.slug !== undefined ? homePage.slug : '',
          metaTitle: homePage?.metaTitle || s.metaTitle || 'Language Guru – Certified Translation Services India',
          metaDesc: homePage?.metaDesc || s.metaDesc || 'Professional certified translation services in Delhi. 100+ languages. ISO quality.',
          metaKeywords: homePage?.metaKeywords || 'certified translation, translation agency Delhi, apostille services, document translation',
          heroBgImage: homePage?.heroImage || s.heroBgImage || '',
          heroTopBadge: s.heroTopBadge || '⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency',
          heroTopLine: homePage?.heroTag || s.heroTopLine || "INDIA'S MOST TRUSTED TRANSLATION AGENCY",
          heroHeading: homePage?.heroTitle || s.heroHeading || 'Professional Translation Services in India',
          heroSubtitle: homePage?.heroSubtitle || s.heroSubtitle || 'Certified & Court-Accepted translations in 120+ languages. 500+ expert translators. 20 years of excellence — embassy-accepted, government-authorized, ISO-9001:2015 and ISO 17100:2015 certified.',
          heroTrustBadge1: s.heroTrustBadge1 || '🛡️ ISO-9001:2015 and ISO 17100:2015',
          heroTrustBadge2: s.heroTrustBadge2 || '📑 MSME Registered',
          heroTrustBadge3: s.heroTrustBadge3 || '🏛️ MEA Empanelled',
          heroTrustBadge4: s.heroTrustBadge4 || '⭐ 4.9 Rating',
          stat1Value: s.stat1Value || '120+',
          stat1Label: s.stat1Label || 'Languages',
          stat2Value: s.stat2Value || '10,000+',
          stat2Label: s.stat2Label || 'Happy Clients',
          stat3Value: s.stat3Value || '20+',
          stat3Label: s.stat3Label || 'Years Experience',
          stat4Value: s.stat4Value || '150+',
          stat4Label: s.stat4Label || 'Indian Cities',
          pricePerPage: Number(s.pricePerPage) || 850,
          defaultTurnaround: s.defaultTurnaround || '24 Hrs',
          whatsappNumber: s.whatsappNumber || '+919312690490',
          phone: s.phone || '+91-9312690490'
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Main Sections CRUD ──────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
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
      const apiUrl = API_URL;
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
      const apiUrl = API_URL;
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

  // ─── Service Details Modal ──────────────────────────────────────────────
  const getFallbackCert = (key: string) => {
    if (key === 'academic') return GALLERY[6];
    if (key === 'legal') return GALLERY[10];
    if (key === 'medical') return GALLERY[14];
    if (key === 'business') return GALLERY[19];
    if (key === 'immigration' || key === 'visa') return GALLERY[20];
    return GALLERY[0];
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
        certLang: g.lang, certDoc: g.doc, certFlag: g.flag,
        certAcc: g.acc, certTime: g.time, certIcon: g.icon
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

      const apiUrl = API_URL;
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

  // ─── Why Choose Us CRUD ──────────────────────────────────────────────────
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
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/v1/why-choose/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAll();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveWhyChoose = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
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
      const apiUrl = API_URL;
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

  // ─── Testimonials CRUD ───────────────────────────────────────────────────
  const openAddTestimonialModal = () => {
    setEditingId(null);
    setTestimonialFormData({ name: '', city: '', role: '', text: '', rating: 5, sortOrder: testimonials.length, isActive: true });
    setShowTestimonialModal(true);
  };

  const openEditTestimonialModal = (t: any) => {
    setEditingId(t.id);
    setTestimonialFormData({
      name: t.name || '', city: t.city || '', role: t.role || '',
      text: t.text || '', rating: t.rating || 5, sortOrder: t.sortOrder || 0, isActive: t.isActive
    });
    setShowTestimonialModal(true);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/v1/testimonials/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAll();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
      const url = editingId ? `${apiUrl}/api/v1/testimonials/${editingId}` : `${apiUrl}/api/v1/testimonials`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(testimonialFormData)
      });
      if (res.ok) {
        setShowTestimonialModal(false);
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving testimonial');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  // ─── FAQs CRUD ───────────────────────────────────────────────────────────
  const openAddFaqModal = () => {
    setEditingId(null);
    setFaqFormData({ question: '', answer: '', category: 'General', sortOrder: faqs.length, isActive: true });
    setShowFaqModal(true);
  };

  const openEditFaqModal = (f: any) => {
    setEditingId(f.id);
    setFaqFormData({
      question: f.question || '', answer: f.answer || '',
      category: f.category || 'General', sortOrder: f.sortOrder || 0, isActive: f.isActive
    });
    setShowFaqModal(true);
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/v1/faqs/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAll();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
      const url = editingId ? `${apiUrl}/api/v1/faqs/${editingId}` : `${apiUrl}/api/v1/faqs`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(faqFormData)
      });
      if (res.ok) {
        setShowFaqModal(false);
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  // ─── Hero Buttons Handlers ────────────────────────────────────────────────
  const handleButtonChange = (index: number, field: string, value: string) => {
    const next = [...heroButtons];
    next[index] = { ...next[index], [field]: value };
    setHeroButtons(next);
  };

  const handleAddButton = () => {
    setHeroButtons([...heroButtons, { label: 'New Button', href: '/quote', variant: 'primary' }]);
  };

  const handleDeleteButton = (index: number) => {
    setHeroButtons(heroButtons.filter((_, i) => i !== index));
  };

  // ─── Branding & Hero Background Image Handlers ────────────────────────────
  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingHeroBg(true);
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('image', file);
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/v1/upload`, {
        method: 'POST', credentials: 'include', body: fd
      });
      const data = await res.json();
      if (data.success && data.url) {
        setBrandingData(prev => ({ ...prev, heroBgImage: data.url }));
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err) {
      alert('Upload failed — check your connection.');
    } finally {
      setUploadingHeroBg(false);
      e.target.value = '';
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranding(true);
    setBrandingSavedMsg('');
    try {
      const apiUrl = API_URL;
      // 1. Update Settings singleton
      const res = await fetch(`${apiUrl}/api/v1/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(brandingData)
      });
      const data = await res.json();

      // 2. Also sync SitePage('home') slug, meta tags, hero copy & background
      await fetch(`${apiUrl}/api/v1/site-pages/home`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: (brandingData.slug || '').trim(),
          metaTitle: brandingData.metaTitle,
          metaDesc: brandingData.metaDesc,
          metaKeywords: brandingData.metaKeywords,
          heroImage: brandingData.heroBgImage,
          heroTag: brandingData.heroTopLine,
          heroTitle: brandingData.heroHeading,
          heroSubtitle: brandingData.heroSubtitle,
        })
      }).catch(() => null);

      // 3. Save Hero Buttons section items on home site-page
      await fetch(`${apiUrl}/api/v1/site-pages/home/sections/hero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kind: 'hero',
          items: heroButtons,
          isActive: true
        })
      }).catch(() => null);

      if (res.ok && data.success) {
        setBrandingSavedMsg('All branding, SEO metadata, hero buttons & stats updated successfully!');
        setTimeout(() => setBrandingSavedMsg(''), 4500);
      } else {
        alert(data.message || 'Failed to save branding settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving branding settings.');
    } finally {
      setSavingBranding(false);
    }
  };

  const getFullImgUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <>
      <TopNav title="🏠 Home Page Content &amp; Sections" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                Home Page Content &amp; Management
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Manage all homepage sections, hero branding, SEO metadata, why choose cards, testimonials, and FAQs.
              </p>
            </div>
            {activeTab === 'static' && <button onClick={openAddModal} className="btn-add">➕ Add Section</button>}
            {activeTab === 'whyChoose' && <button onClick={openAddWhyChooseModal} className="btn-add">➕ Add Feature</button>}
            {activeTab === 'testimonials' && <button onClick={openAddTestimonialModal} className="btn-add">➕ Add Testimonial</button>}
            {activeTab === 'faqs' && <button onClick={openAddFaqModal} className="btn-add">➕ Add FAQ</button>}
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--br)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              onClick={() => setActiveTab('static')} 
              style={{ background: 'none', border: 'none', padding: '8px 14px', fontWeight: 'bold', fontSize: '13.5px', borderBottom: activeTab === 'static' ? '2px solid var(--bd)' : 'none', color: activeTab === 'static' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🏠 Main Sections
            </button>
            <button 
              onClick={() => setActiveTab('services')} 
              style={{ background: 'none', border: 'none', padding: '8px 14px', fontWeight: 'bold', fontSize: '13.5px', borderBottom: activeTab === 'services' ? '2px solid var(--bd)' : 'none', color: activeTab === 'services' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ⚙️ Translation Services
            </button>
            <button 
              onClick={() => setActiveTab('whyChoose')} 
              style={{ background: 'none', border: 'none', padding: '8px 14px', fontWeight: 'bold', fontSize: '13.5px', borderBottom: activeTab === 'whyChoose' ? '2px solid var(--bd)' : 'none', color: activeTab === 'whyChoose' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🎯 Why Choose Us
            </button>
            <button 
              onClick={() => setActiveTab('testimonials')} 
              style={{ background: 'none', border: 'none', padding: '8px 14px', fontWeight: 'bold', fontSize: '13.5px', borderBottom: activeTab === 'testimonials' ? '2px solid var(--bd)' : 'none', color: activeTab === 'testimonials' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ⭐ Testimonials ({testimonials.length})
            </button>
            <button 
              onClick={() => setActiveTab('faqs')} 
              style={{ background: 'none', border: 'none', padding: '8px 14px', fontWeight: 'bold', fontSize: '13.5px', borderBottom: activeTab === 'faqs' ? '2px solid var(--bd)' : 'none', color: activeTab === 'faqs' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ❓ FAQs ({faqs.length})
            </button>
            <button 
              onClick={() => setActiveTab('branding')} 
              style={{ background: 'none', border: 'none', padding: '8px 14px', fontWeight: 'bold', fontSize: '13.5px', borderBottom: activeTab === 'branding' ? '2px solid var(--bd)' : 'none', color: activeTab === 'branding' ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🎨 Branding, Hero, SEO &amp; Buttons
            </button>
          </div>

          {loading ? (
            <p style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading content...</p>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <label style={labelStyle}>Section Tag Badge</label>
                      <input 
                        style={inputStyle} 
                        value={whyChooseHeader.whyChooseTag} 
                        onChange={e => setWhyChooseHeader({ ...whyChooseHeader, whyChooseTag: e.target.value })} 
                        placeholder="Why Choose Us" 
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Section Title Heading (allows HTML like &lt;em&gt;)</label>
                      <input 
                        style={inputStyle} 
                        value={whyChooseHeader.whyChooseTitle} 
                        onChange={e => setWhyChooseHeader({ ...whyChooseHeader, whyChooseTitle: e.target.value })} 
                        placeholder="Why Choose Language Guru for <em>Certified Translation</em>" 
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Section Subtitle / Description</label>
                    <textarea 
                      rows={2} 
                      style={{ ...inputStyle, resize: 'vertical' }} 
                      value={whyChooseHeader.whyChooseSubtitle} 
                      onChange={e => setWhyChooseHeader({ ...whyChooseHeader, whyChooseSubtitle: e.target.value })} 
                      placeholder="ISO-9001:2015 and ISO 17100:2015 certified · MSME registered..." 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={savingHeader}
                    style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: savingHeader ? 'wait' : 'pointer' }}>
                    {savingHeader ? 'Saving Header...' : '💾 Save Section Header'}
                  </button>
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
          ) : activeTab === 'testimonials' ? (
            /* ═══ TESTIMONIALS TAB ═══ */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--bd)' }}>⭐ Client Testimonials &amp; Reviews</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mu)' }}>
                    Add, edit, or toggle reviews displayed on the homepage testimonials carousel.
                  </p>
                </div>
                <button onClick={openAddTestimonialModal} className="btn-add" style={{ padding: '6px 14px', fontSize: '13px' }}>➕ Add Testimonial</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: 'var(--mu)', borderBottom: '2px solid var(--br)' }}>
                    <th style={{ padding: '12px' }}>Order</th>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Client Name</th>
                    <th style={{ padding: '12px' }}>Role / City</th>
                    <th style={{ padding: '12px' }}>Review Text</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials && testimonials.length > 0 ? (
                    testimonials.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--br)' }}>
                        <td style={{ padding: '12px' }}>{t.sortOrder}</td>
                        <td style={{ padding: '12px', color: '#eab308', fontSize: '14px', fontWeight: 'bold' }}>
                          {'★'.repeat(t.rating || 5)}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.name}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#475569' }}>
                          {[t.role, t.city].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td style={{ padding: '12px', maxWidth: '320px', fontSize: '13px', color: '#334155' }}>
                          {(t.text || '').length > 80 ? (t.text || '').substring(0, 80) + '...' : t.text}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: t.isActive ? '#dcfce7' : '#fee2e2', color: t.isActive ? '#166534' : '#991b1b' }}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openEditTestimonialModal(t)} style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', marginRight: '8px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteTestimonial(t.id)} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No testimonials found. Click "Add Testimonial" above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'faqs' ? (
            /* ═══ FAQS TAB ═══ */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--bd)' }}>❓ Frequently Asked Questions (FAQs)</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mu)' }}>
                    Add, edit, or manage the questions &amp; answers displayed on the homepage FAQ accordion.
                  </p>
                </div>
                <button onClick={openAddFaqModal} className="btn-add" style={{ padding: '6px 14px', fontSize: '13px' }}>➕ Add FAQ</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: 'var(--mu)', borderBottom: '2px solid var(--br)' }}>
                    <th style={{ padding: '12px' }}>Order</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Question</th>
                    <th style={{ padding: '12px' }}>Answer Snippet</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs && faqs.length > 0 ? (
                    faqs.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--br)' }}>
                        <td style={{ padding: '12px' }}>{f.sortOrder}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {f.category || 'General'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', maxWidth: '280px' }}>{f.question}</td>
                        <td style={{ padding: '12px', maxWidth: '350px', fontSize: '13px', color: '#475569' }}>
                          {(f.answer || '').length > 90 ? (f.answer || '').substring(0, 90) + '...' : f.answer}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: f.isActive ? '#dcfce7' : '#fee2e2', color: f.isActive ? '#166534' : '#991b1b' }}>
                            {f.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openEditFaqModal(f)} style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', marginRight: '8px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteFaq(f.id)} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No FAQs found. Click "Add FAQ" above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'branding' ? (
            /* ═══ BRANDING, HERO, SEO & BUTTONS TAB ═══ */
            <form onSubmit={handleSaveBranding}>
              {brandingSavedMsg && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✓</span> {brandingSavedMsg}
                </div>
              )}

              {/* CARD 1: URL Slug & SEO Metadata */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>
                      🔍 Home Page URL Slug &amp; SEO Metadata
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mu)' }}>
                      Customize the homepage search engine title, meta description, and keywords.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>URL Slug (Root Home is empty or &quot;/&quot;)</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.slug} 
                      onChange={e => setBrandingData({ ...brandingData, slug: e.target.value })} 
                      placeholder="/" 
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Leave blank or &quot;/&quot; for the main root website URL.
                    </span>
                  </div>
                  <div>
                    <label style={labelStyle}>SEO Meta Title (Shown in Browser Tab &amp; Google)</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.metaTitle} 
                      onChange={e => setBrandingData({ ...brandingData, metaTitle: e.target.value })} 
                      placeholder="Language Guru – Certified Translation Services India" 
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>SEO Meta Description (Shown in Search Engine Snippets)</label>
                  <textarea 
                    rows={2} 
                    style={{ ...inputStyle, resize: 'vertical' }} 
                    value={brandingData.metaDesc} 
                    onChange={e => setBrandingData({ ...brandingData, metaDesc: e.target.value })} 
                    placeholder="Professional certified translation services in Delhi. 100+ languages. ISO quality." 
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>SEO Meta Keywords (Optional, comma-separated)</label>
                  <input 
                    style={inputStyle} 
                    value={brandingData.metaKeywords} 
                    onChange={e => setBrandingData({ ...brandingData, metaKeywords: e.target.value })} 
                    placeholder="certified translation, translation agency Delhi, apostille services, document translation" 
                  />
                </div>
              </div>

              {/* CARD 2: Hero Background Image */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>
                      🖼️ Hero Background Image (Homepage Banner)
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mu)' }}>
                      Upload or enter the URL of the main background image displayed in the hero section on the homepage.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                  <div>
                    <label style={labelStyle}>Image URL or File Upload (Recommended size: 1920x1080 px)</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        style={inputStyle} 
                        value={brandingData.heroBgImage} 
                        onChange={e => setBrandingData({ ...brandingData, heroBgImage: e.target.value })} 
                        placeholder="https://... or /uploads/hero-bg.jpg" 
                      />
                      <label style={{ background: 'var(--bd)', color: '#fff', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {uploadingHeroBg ? '⏳ Uploading...' : '📁 Upload Image'}
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleHeroBgUpload} />
                      </label>
                      {brandingData.heroBgImage && (
                        <button 
                          type="button" 
                          onClick={() => setBrandingData({ ...brandingData, heroBgImage: '' })}
                          style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '9px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                          title="Remove image"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      💡 If set, this image will be used as the background behind the hero headline with a subtle dark gradient overlay for optimal readability.
                    </span>
                  </div>

                  {/* Preview Box */}
                  <div>
                    <label style={labelStyle}>Live Visual Preview</label>
                    <div style={{
                      width: '100%',
                      height: '130px',
                      borderRadius: '8px',
                      border: '2px dashed #cbd5e1',
                      background: brandingData.heroBgImage 
                        ? `linear-gradient(rgba(11, 35, 71, 0.45), rgba(11, 35, 71, 0.55)), url(${getFullImgUrl(brandingData.heroBgImage)}) center/cover no-repeat`
                        : '#0b2347',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '12px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', marginBottom: '4px' }}>
                        {brandingData.heroTopBadge ? '⭐ CERTIFIED AGENCY' : 'DEFAULT HERO'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {brandingData.heroHeading || 'Professional Translation Services'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: Hero Main Copy */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>
                  ✍️ Hero Main Copy &amp; Taglines
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--mu)' }}>
                  Configure the primary headlines and badges displayed above the fold.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Hero Top Badge (Pill Badge)</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.heroTopBadge} 
                      onChange={e => setBrandingData({ ...brandingData, heroTopBadge: e.target.value })} 
                      placeholder="⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Hero Eyebrow / Tagline</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.heroTopLine} 
                      onChange={e => setBrandingData({ ...brandingData, heroTopLine: e.target.value })} 
                      placeholder="INDIA'S MOST TRUSTED TRANSLATION AGENCY" 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Hero Main Heading (Allows HTML like &lt;em&gt; for highlighted text)</label>
                  <input 
                    style={inputStyle} 
                    value={brandingData.heroHeading} 
                    onChange={e => setBrandingData({ ...brandingData, heroHeading: e.target.value })} 
                    placeholder="Professional Translation Services in India" 
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Hero Subtitle / Description</label>
                  <textarea 
                    rows={3} 
                    style={{ ...inputStyle, resize: 'vertical' }} 
                    value={brandingData.heroSubtitle} 
                    onChange={e => setBrandingData({ ...brandingData, heroSubtitle: e.target.value })} 
                    placeholder="Certified & Court-Accepted translations in 120+ languages..." 
                  />
                </div>
              </div>

              {/* CARD 4: Hero Action Buttons */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>
                      🔘 Hero Action Call-to-Action Buttons ({heroButtons.length})
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mu)' }}>
                      Customize the buttons shown under the hero subtitle. Use <code>{"{{phone}}"}</code> or <code>{"{{whatsapp}}"}</code> to automatically link to site settings.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddButton}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                    ➕ Add Button
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {heroButtons.map((btn, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr auto', gap: '10px', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px', marginBottom: '4px' }}>Button Label</label>
                        <input 
                          style={inputStyle} 
                          value={btn.label} 
                          onChange={e => handleButtonChange(idx, 'label', e.target.value)} 
                          placeholder="e.g. 📋 Get Quote →"
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px', marginBottom: '4px' }}>Target Link / Token</label>
                        <input 
                          style={inputStyle} 
                          value={btn.href} 
                          onChange={e => handleButtonChange(idx, 'href', e.target.value)} 
                          placeholder="/quote or {{phone}} or {{whatsapp}}"
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '11px', marginBottom: '4px' }}>Style Variant</label>
                        <select 
                          style={inputStyle} 
                          value={btn.variant || 'primary'} 
                          onChange={e => handleButtonChange(idx, 'variant', e.target.value)}>
                          <option value="primary">🔴 Primary (Red)</option>
                          <option value="outline">⚪ Outline (White Border)</option>
                          <option value="whatsapp">🟢 WhatsApp (Green)</option>
                          <option value="secondary">🔵 Secondary (Blue)</option>
                        </select>
                      </div>
                      <div style={{ paddingTop: '18px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteButton(idx)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                          title="Delete button">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 5: Headline Statistics Bar (The 4 Stats) */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>
                  📊 Headline Statistics Bar (The 4 Key Numbers)
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--mu)' }}>
                  These numbers are highlighted in the dark blue stats ribbon immediately below the hero banner.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                  {/* Stat 1 */}
                  <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>STATISTIC 1</div>
                    <label style={labelStyle}>Number / Value</label>
                    <input 
                      style={{ ...inputStyle, marginBottom: '8px', fontWeight: 'bold' }} 
                      value={brandingData.stat1Value} 
                      onChange={e => setBrandingData({ ...brandingData, stat1Value: e.target.value })} 
                      placeholder="120+" 
                    />
                    <label style={labelStyle}>Label Description</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.stat1Label} 
                      onChange={e => setBrandingData({ ...brandingData, stat1Label: e.target.value })} 
                      placeholder="Languages" 
                    />
                  </div>

                  {/* Stat 2 */}
                  <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>STATISTIC 2</div>
                    <label style={labelStyle}>Number / Value</label>
                    <input 
                      style={{ ...inputStyle, marginBottom: '8px', fontWeight: 'bold' }} 
                      value={brandingData.stat2Value} 
                      onChange={e => setBrandingData({ ...brandingData, stat2Value: e.target.value })} 
                      placeholder="10,000+" 
                    />
                    <label style={labelStyle}>Label Description</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.stat2Label} 
                      onChange={e => setBrandingData({ ...brandingData, stat2Label: e.target.value })} 
                      placeholder="Happy Clients" 
                    />
                  </div>

                  {/* Stat 3 */}
                  <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>STATISTIC 3</div>
                    <label style={labelStyle}>Number / Value</label>
                    <input 
                      style={{ ...inputStyle, marginBottom: '8px', fontWeight: 'bold' }} 
                      value={brandingData.stat3Value} 
                      onChange={e => setBrandingData({ ...brandingData, stat3Value: e.target.value })} 
                      placeholder="20+" 
                    />
                    <label style={labelStyle}>Label Description</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.stat3Label} 
                      onChange={e => setBrandingData({ ...brandingData, stat3Label: e.target.value })} 
                      placeholder="Years Experience" 
                    />
                  </div>

                  {/* Stat 4 */}
                  <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>STATISTIC 4</div>
                    <label style={labelStyle}>Number / Value</label>
                    <input 
                      style={{ ...inputStyle, marginBottom: '8px', fontWeight: 'bold' }} 
                      value={brandingData.stat4Value} 
                      onChange={e => setBrandingData({ ...brandingData, stat4Value: e.target.value })} 
                      placeholder="150+" 
                    />
                    <label style={labelStyle}>Label Description</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.stat4Label} 
                      onChange={e => setBrandingData({ ...brandingData, stat4Label: e.target.value })} 
                      placeholder="Indian Cities" 
                    />
                  </div>
                </div>
              </div>

              {/* CARD 6: Trust Badges & Contact Info */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 'bold', color: 'var(--bd)' }}>
                  🛡️ Hero Trust Badges &amp; Instant Contact Details
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--mu)' }}>
                  Displayed below hero CTA buttons and in the quick calculator.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Trust Badge 1</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.heroTrustBadge1} 
                      onChange={e => setBrandingData({ ...brandingData, heroTrustBadge1: e.target.value })} 
                      placeholder="🛡️ ISO-9001:2015..." 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Trust Badge 2</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.heroTrustBadge2} 
                      onChange={e => setBrandingData({ ...brandingData, heroTrustBadge2: e.target.value })} 
                      placeholder="📑 MSME Registered" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Trust Badge 3</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.heroTrustBadge3} 
                      onChange={e => setBrandingData({ ...brandingData, heroTrustBadge3: e.target.value })} 
                      placeholder="🏛️ MEA Empanelled" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Trust Badge 4</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.heroTrustBadge4} 
                      onChange={e => setBrandingData({ ...brandingData, heroTrustBadge4: e.target.value })} 
                      placeholder="⭐ 4.9 Rating" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Base Price Per Page (₹)</label>
                    <input 
                      type="number"
                      style={inputStyle} 
                      value={brandingData.pricePerPage} 
                      onChange={e => setBrandingData({ ...brandingData, pricePerPage: parseFloat(e.target.value) || 0 })} 
                      placeholder="850" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Default Turnaround</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.defaultTurnaround} 
                      onChange={e => setBrandingData({ ...brandingData, defaultTurnaround: e.target.value })} 
                      placeholder="24 Hrs" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>WhatsApp Number</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.whatsappNumber} 
                      onChange={e => setBrandingData({ ...brandingData, whatsappNumber: e.target.value })} 
                      placeholder="+919312690490" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Support Phone Number</label>
                    <input 
                      style={inputStyle} 
                      value={brandingData.phone} 
                      onChange={e => setBrandingData({ ...brandingData, phone: e.target.value })} 
                      placeholder="+91-9312690490" 
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  type="submit" 
                  disabled={savingBranding}
                  style={{
                    background: 'var(--bd)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: savingBranding ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(11,35,71,0.2)'
                  }}
                >
                  {savingBranding ? '⏳ Saving Settings...' : '💾 Save Branding, SEO &amp; Buttons'}
                </button>
                {brandingSavedMsg && (
                  <span style={{ color: '#166534', fontWeight: 'bold', fontSize: '13px' }}>
                    ✓ {brandingSavedMsg}
                  </span>
                )}
              </div>
            </form>
          ) : null}
        </div>
      </div>

      {/* ═══ MODAL: MAIN SECTIONS ═══ */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
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
                {formData.imageUrl && <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${API_URL}${formData.imageUrl}`} alt="preview" style={{ marginTop: '8px', maxHeight: '80px', borderRadius: '4px' }} />}
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

      {/* ═══ MODAL: SERVICES DETAILS ═══ */}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowServiceModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Service Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: WHY CHOOSE US ═══ */}
      {showWhyChooseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: "'Lora', serif", color: 'var(--bd)' }}>{editingId ? 'Edit Feature' : 'Add Feature'}</h2>
            <form onSubmit={handleSaveWhyChoose}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Icon (Emoji)</label>
                  <input style={{ ...inputStyle, textAlign: 'center', fontSize: '20px' }} value={whyChooseFormData.icon} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, icon: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Feature Title</label>
                  <input style={inputStyle} value={whyChooseFormData.title} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, title: e.target.value })} required placeholder="e.g. 100% Embassy Acceptance" />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description</label>
                <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={whyChooseFormData.desc} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, desc: e.target.value })} required placeholder="Explain why clients should choose Language Guru..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" style={inputStyle} value={whyChooseFormData.sortOrder} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, sortOrder: parseInt(e.target.value)||0 })} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px', gap: '8px' }}>
                  <input type="checkbox" id="wcIsActive" checked={whyChooseFormData.isActive} onChange={e => setWhyChooseFormData({ ...whyChooseFormData, isActive: e.target.checked })} />
                  <label htmlFor="wcIsActive" style={{ fontWeight: 'bold', fontSize: '13px' }}>Is Active</label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowWhyChooseModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Feature</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: TESTIMONIAL ═══ */}
      {showTestimonialModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: "'Lora', serif", color: 'var(--bd)' }}>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <form onSubmit={handleSaveTestimonial}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Client Name *</label>
                  <input required style={inputStyle} value={testimonialFormData.name} onChange={e => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={testimonialFormData.city} onChange={e => setTestimonialFormData({ ...testimonialFormData, city: e.target.value })} placeholder="e.g. New Delhi" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Role / Company (Optional)</label>
                  <input style={inputStyle} value={testimonialFormData.role} onChange={e => setTestimonialFormData({ ...testimonialFormData, role: e.target.value })} placeholder="e.g. Advocate / Student" />
                </div>
                <div>
                  <label style={labelStyle}>Star Rating (1 to 5)</label>
                  <select style={inputStyle} value={testimonialFormData.rating} onChange={e => setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) || 5 })}>
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Review Text *</label>
                <textarea required rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={testimonialFormData.text} onChange={e => setTestimonialFormData({ ...testimonialFormData, text: e.target.value })} placeholder="Enter the client review or quote..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" style={inputStyle} value={testimonialFormData.sortOrder} onChange={e => setTestimonialFormData({ ...testimonialFormData, sortOrder: parseInt(e.target.value) || 0 })} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px', gap: '8px' }}>
                  <input type="checkbox" id="tstIsActive" checked={testimonialFormData.isActive} onChange={e => setTestimonialFormData({ ...testimonialFormData, isActive: e.target.checked })} />
                  <label htmlFor="tstIsActive" style={{ fontWeight: 'bold', fontSize: '13px' }}>Is Active (Visible on Home)</label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowTestimonialModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Testimonial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: FAQ ═══ */}
      {showFaqModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: "'Lora', serif", color: 'var(--bd)' }}>{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
            <form onSubmit={handleSaveFaq}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Question Category</label>
                <input style={inputStyle} value={faqFormData.category} onChange={e => setFaqFormData({ ...faqFormData, category: e.target.value })} placeholder="e.g. General, Certified, Acceptance, Delivery" required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Question *</label>
                <input required style={inputStyle} value={faqFormData.question} onChange={e => setFaqFormData({ ...faqFormData, question: e.target.value })} placeholder="e.g. Are your certified translations accepted by embassies?" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Answer *</label>
                <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={faqFormData.answer} onChange={e => setFaqFormData({ ...faqFormData, answer: e.target.value })} placeholder="Provide the detailed answer here..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" style={inputStyle} value={faqFormData.sortOrder} onChange={e => setFaqFormData({ ...faqFormData, sortOrder: parseInt(e.target.value) || 0 })} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px', gap: '8px' }}>
                  <input type="checkbox" id="faqIsActive" checked={faqFormData.isActive} onChange={e => setFaqFormData({ ...faqFormData, isActive: e.target.checked })} />
                  <label htmlFor="faqIsActive" style={{ fontWeight: 'bold', fontSize: '13px' }}>Is Active (Visible on Home)</label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowFaqModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
