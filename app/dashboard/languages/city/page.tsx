'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { adminPath } from '../../../../lib/basePath';
import { useSearchParams, useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { API_URL, siteLink } from '../../../../lib/env';

interface CityItem { key: string; name: string; hasOverride: boolean; overrideSlug?: string; overrideMetaTitle?: string; }
interface CustomBox { id: string; icon?: string; badge?: string; title: string; subtitle?: string; link?: string; }
interface CustomChecklistGroup { id: string; icon?: string; title: string; items: string[]; }
interface CustomHighlightBanner { icon?: string; title?: string; text?: string; link?: string; }
interface CustomSection {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  boxes?: CustomBox[];
  checklistGroups?: CustomChecklistGroup[];
  highlightBanner?: CustomHighlightBanner;
  ctaText?: string;
  ctaBtnText?: string;
  ctaBtnLink?: string;
  insertedAfter?: string;
  showBoxes?: boolean;
  showChecklists?: boolean;
  showBanner?: boolean;
  showCta?: boolean;
}
interface OD {
  slug: string; metaTitle?: string; metaDesc?: string; metaKeywords?: string; ogImage?: string;
  heroBadge?: string; heroTitle?: string; heroSub?: string; heroBgImage?: string; heroFlag?: string; heroIso?: string;
  heroBtn1Text?: string; heroBtn1Link?: string; heroBtn2Text?: string; heroBtn2Phone?: string;
  heroBtn3Text?: string; heroBtn3WA?: string; heroBadgesList?: string;
  title?: string; p1?: string; p2?: string; aboutTitle?: string; agencyTitle?: string; agencyOfficeTitle?: string; officeAddressText?: string;
  processTag?: string; processTitle?: string;
  step1Title?: string; step1Desc?: string; step2Title?: string; step2Desc?: string;
  step3Title?: string; step3Desc?: string; step4Title?: string; step4Desc?: string; step5Title?: string; step5Desc?: string;
  docsTitle?: string; docsSubtitle?: string;
  tier1Name?: string; tier1Price?: string; tier1Unit?: string; tier1Delivery?: string;
  tier2Name?: string; tier2Badge?: string; tier2Price?: string; tier2Unit?: string; tier2Delivery?: string;
  tier3Name?: string; tier3Price?: string; tier3Unit?: string; tier3Delivery?: string;
  currencySymbol?: string; pricingTitle?: string; pricingAddons?: string;
  whyChooseTitle?: string; certSampleTitle?: string; certSampleSubtitle?: string;
  interpTitle?: string; servicesTitle?: string; industriesTitle?: string;
  reviewsTitle?: string; faqsTitle?: string; ctaTitle?: string; ctaSubtitle?: string;
  sidebarPhone1?: string; sidebarPhone2?: string;
  sidebarBtn1Text?: string; sidebarBtn1Link?: string;
  sidebarBtn2Text?: string; sidebarBtn2WA?: string; sidebarCtaTitle?: string;
  sidebarCitiesTitle?: string; sidebarLangsTitle?: string; sidebarOtherSvcsTitle?: string;
  trustCard1?: string; trustCard2?: string; trustCard3?: string; trustCard4?: string; trustCard5?: string; trustCard6?: string;
  contentOverrides?: Record<string, any>;
  faqs?: Array<{q: string; a: string}>;
  reviews?: Array<{stars: string; text: string; name: string; role: string; avatar: string}>;
  isActive?: boolean;
}
const emptyOD = (): OD => ({ slug: '', isActive: true });

const DEFAULT_LANG_CITY_SECTIONS = [
  { id: 'intro', label: 'Overview & Introduction' },
  { id: 'legal', label: 'Legal Translation' },
  { id: 'official', label: 'Official Translation' },
  { id: 'certified', label: 'Certified Packages' },
  { id: 'agency', label: 'Agency Details & Trust' },
  { id: 'process', label: '5-Step Translation Process' },
  { id: 'industries', label: 'Industry-Specific Solutions' },
  { id: 'docs', label: 'Document Categories' },
  { id: 'interp', label: 'Interpretation Services' },
  { id: 'services', label: 'Translation Service Types' },
  { id: 'pricing', label: 'Pricing Packages' },
  { id: 'samples', label: 'Certificate Samples' },
  { id: 'why', label: 'Why Choose Language Guru' },
  { id: 'reviews', label: 'Client Reviews' },
  { id: 'faqs', label: 'Frequently Asked Questions' },
  { id: 'cities', label: 'Available Across Cities' },
  { id: 'languages', label: 'Other Languages' },
];

const TABS = [
  { id: 'hero', label: '🎯 1. Hero & Badges' },
  { id: 'process', label: '⚙️ 2. Process Steps' },
  { id: 'content', label: '📖 3. Content & Copy' },
  { id: 'paragraphs', label: '📝 4. Paragraphs' },
  { id: 'pricing', label: '💰 5. Pricing & Certs' },
  { id: 'why_faqs', label: '🏅 6. Why Us & FAQs' },
  { id: 'docs_svcs', label: '📄 7. Docs & Services' },
  { id: 'seo_sidebar', label: '🔍 8. SEO & Sidebar' },
  { id: 'layout_order', label: '📑 9. Section Order' },
];

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const langKey = sp.get('language') || '';
  const cityKey = sp.get('city') || '';

  const [cities, setCities] = useState<CityItem[]>([]);
  const [langName, setLangName] = useState('');
  const [langFlag, setLangFlag] = useState('🌐');
  const [activeTab, setActiveTab] = useState('hero');
  const [form, setForm] = useState<OD>(emptyOD());
  const [introParagraphs, setIntroParagraphs] = useState<string[]>(['', '']);
  const [legalParagraphs, setLegalParagraphs] = useState<string[]>(['', '']);
  const [officialParagraphs, setOfficialParagraphs] = useState<string[]>(['', '']);
  const [certifiedParagraphs, setCertifiedParagraphs] = useState<string[]>(['', '']);
  const [agencyParagraphs, setAgencyParagraphs] = useState<string[]>(['']);
  const [interpParagraphs, setInterpParagraphs] = useState<string[]>(['']);
  const [docCats, setDocCats] = useState<any[]>([]);
  const [priceTiers, setPriceTiers] = useState<any[]>([]);
  const [whyList, setWhyList] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<Array<{q: string; a: string}>>([]);
  const [trustCards, setTrustCards] = useState<{[k: string]: string}>({ trustCard1: '', trustCard2: '', trustCard3: '', trustCard4: '', trustCard5: '', trustCard6: '' });
  const [citySearch, setCitySearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [exists, setExists] = useState(false);

  const tok = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || '') : '';
  const hdr = { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` };

  useEffect(() => {
    if (!langKey) return;
    fetch(`${API_URL}/api/v1/languages/${langKey}/cities`, { headers: hdr, credentials: 'include' })
      .then(r => r.json()).then(d => { if (d.success) setCities(d.data); }).catch(() => {});
    fetch(`${API_URL}/api/v1/languages`, { credentials: 'include' })
      .then(r => r.json()).then(d => {
        if (d.success) { const l = d.data?.find((x: any) => x.key === langKey); if (l) { setLangName(l.name); setLangFlag(l.flag || '🌐'); } }
      }).catch(() => {});
  }, [langKey]);

  useEffect(() => {
    if (!langKey || !cityKey) { setLoading(false); return; }
    setLoading(true); setError(null);
    fetch(`${API_URL}/api/v1/languages/${langKey}/cities/${cityKey}`, { headers: hdr, credentials: 'include' })
      .then(r => r.json()).then(json => {
        if (json.success) {
          setExists(json.exists || false);
          const d: OD = json.data || emptyOD();
          const co = d.contentOverrides || {};
          setForm(d);
          setIntroParagraphs(Array.isArray(co.introParagraphs) && co.introParagraphs.length ? co.introParagraphs : ['', '']);
          setLegalParagraphs(Array.isArray(co.legalParagraphs) && co.legalParagraphs.length ? co.legalParagraphs : ['', '']);
          setOfficialParagraphs(Array.isArray(co.officialParagraphs) && co.officialParagraphs.length ? co.officialParagraphs : ['', '']);
          setCertifiedParagraphs(Array.isArray(co.certifiedParagraphs) && co.certifiedParagraphs.length ? co.certifiedParagraphs : ['', '']);
          setAgencyParagraphs(Array.isArray(co.agencyParagraphs) && co.agencyParagraphs.length ? co.agencyParagraphs : ['']);
          setInterpParagraphs(Array.isArray(co.interpParagraphs) && co.interpParagraphs.length ? co.interpParagraphs : ['']);
          setDocCats(Array.isArray(co.docCategories) ? co.docCategories : []);
          setPriceTiers(Array.isArray(co.pricingTiers) ? co.pricingTiers : []);
          setWhyList(Array.isArray(co.whyChooseList) ? co.whyChooseList : []);
          setCerts(Array.isArray(co.sampleCertsList) ? co.sampleCertsList : []);
          setReviews(Array.isArray(d.reviews) ? d.reviews : []);
          setFaqs(Array.isArray(d.faqs) ? d.faqs : []);
          setTrustCards({ trustCard1: d.trustCard1||co.trustCard1||'', trustCard2: d.trustCard2||co.trustCard2||'', trustCard3: d.trustCard3||co.trustCard3||'', trustCard4: d.trustCard4||co.trustCard4||'', trustCard5: d.trustCard5||co.trustCard5||'', trustCard6: d.trustCard6||co.trustCard6||'' });
        }
      }).catch(() => setError('Failed to load city data.')).finally(() => setLoading(false));
  }, [langKey, cityKey]);

  const set = (k: keyof OD, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const curCity = cities.find(c => c.key === cityKey);
  const defaultSlug = `${langKey}-translation-services-in-${cityKey}`;
  const liveSlug = form.slug || defaultSlug;

  const getOrder = () => {
    const dids = DEFAULT_LANG_CITY_SECTIONS.map(s => s.id);
    const cids = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => cs.id);
    const saved: string[] = form.contentOverrides?.sectionOrder || [];
    const out: string[] = [];
    saved.forEach(id => { if (dids.includes(id) || cids.includes(id)) out.push(id); });
    dids.forEach(id => { if (!out.includes(id)) out.push(id); });
    cids.forEach(id => { if (!out.includes(id)) out.push(id); });
    return out;
  };
  const moveSection = (id: string, dir: 'up'|'down') => {
    const o = getOrder(); const i = o.indexOf(id); if (i === -1) return;
    const ti = dir === 'up' ? i - 1 : i + 1;
    if (ti < 0 || ti >= o.length) return;
    const n = [...o]; const [m] = n.splice(i, 1); n.splice(ti, 0, m);
    set('contentOverrides', { ...(form.contentOverrides||{}), sectionOrder: n });
  };
  const toggleHidden = (id: string) => {
    const h: string[] = form.contentOverrides?.hiddenSections || [];
    set('contentOverrides', { ...(form.contentOverrides||{}), hiddenSections: h.includes(id) ? h.filter(x => x !== id) : [...h, id] });
  };
  const addCustomSection = (afterId?: string) => {
    const cn = curCity?.name || 'City';
    const nid = 'custom_' + Date.now();
    const ns: CustomSection = { id: nid, title: 'New Section for ' + langName + ' in ' + cn, subtitle: 'Section subtitle', paragraphs: ['Paragraph content for ' + cn + '.'], ctaText: 'Need translation in ' + cn + '?', ctaBtnText: '📋 Get Quote', ctaBtnLink: '/quote', insertedAfter: afterId };
    const cs = [...((form.contentOverrides?.customSections as CustomSection[])||[]), ns];
    const o = [...getOrder()];
    if (afterId && o.includes(afterId)) { o.splice(o.indexOf(afterId) + 1, 0, nid); } else { o.push(nid); }
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: cs, sectionOrder: o });
  };
  const removeCustomSection = (id: string) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).filter(cs => cs.id !== id), sectionOrder: getOrder().filter(x => x !== id) });
  };
  const updateCS = (id: string, field: keyof CustomSection, val: any) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => cs.id === id ? { ...cs, [field]: val } : cs) });
  };
  const addCSPara = (id: string) => {
    const cn = curCity?.name || 'City';
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => cs.id === id ? { ...cs, paragraphs: [...(cs.paragraphs||[]), 'New paragraph in ' + cn + '.'] } : cs) });
  };
  const removeCSPara = (id: string, pi: number) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => { if (cs.id !== id) return cs; const p = [...(cs.paragraphs||[])]; p.splice(pi,1); return {...cs, paragraphs: p}; }) });
  };
  const updateCSPara = (id: string, pi: number, val: string) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => { if (cs.id !== id) return cs; const p = [...(cs.paragraphs||[])]; p[pi]=val; return {...cs, paragraphs: p}; }) });
  };
  const addCSBox = (id: string) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => cs.id === id ? { ...cs, boxes: [...(cs.boxes||[]), { id: 'box_' + Date.now(), icon: '📋', badge: '', title: 'New Service', subtitle: '₹200/page', link: '/quote' }] } : cs) });
  };
  const updateCSBox = (csId: string, boxId: string, field: keyof CustomBox, val: string) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => cs.id === csId ? { ...cs, boxes: (cs.boxes||[]).map(b => b.id === boxId ? { ...b, [field]: val } : b) } : cs) });
  };
  const removeCSBox = (csId: string, boxId: string) => {
    set('contentOverrides', { ...(form.contentOverrides||{}), customSections: ((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => cs.id === csId ? { ...cs, boxes: (cs.boxes||[]).filter(b => b.id !== boxId) } : cs) });
  };
  const addCSChecklistGroup = (secId: string) => {
    const newGroup: CustomChecklistGroup = {
      id: 'group_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      icon: '⚖️',
      title: 'Specialized Category',
      items: [
        'Standard document certification',
        'Sworn & accredited translations',
        'Government & embassy compliance',
        'Fast express turnaround'
      ]
    };
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs =>
        cs.id === secId ? { ...cs, checklistGroups: [...(cs.checklistGroups || []), newGroup] } : cs
      )
    });
  };
  const updateCSChecklistGroup = (secId: string, groupId: string, field: keyof CustomChecklistGroup, val: any) => {
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs =>
        cs.id === secId ? {
          ...cs,
          checklistGroups: (cs.checklistGroups || []).map(g => g.id === groupId ? { ...g, [field]: val } : g)
        } : cs
      )
    });
  };
  const removeCSChecklistGroup = (secId: string, groupId: string) => {
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs =>
        cs.id === secId ? {
          ...cs,
          checklistGroups: (cs.checklistGroups || []).filter(g => g.id !== groupId)
        } : cs
      )
    });
  };
  const updateCSBanner = (secId: string, field: keyof CustomHighlightBanner, val: string) => {
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs =>
        cs.id === secId ? {
          ...cs,
          highlightBanner: { ...(cs.highlightBanner || {}), [field]: val }
        } : cs
      )
    });
  };


  const SH = (sId: string, title: string, opts?: { onAddParagraph?: () => void; canDelete?: boolean; onDelete?: () => void; }) => {
    const o = getOrder(); const idx = o.indexOf(sId);
    const isHidden = (form.contentOverrides?.hiddenSections||[]).includes(sId);
    return (
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'8px', borderBottom:'1.5px solid #f1f5f9', paddingBottom:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <h4 style={{ fontSize:'15px', fontWeight:'800', color:'var(--bd)', margin:0 }}>{title}</h4>
          {isHidden && <span style={{ fontSize:'10px', background:'#fef3c7', color:'#b45309', padding:'2px 7px', borderRadius:'4px', fontWeight:'700' }}>HIDDEN</span>}
        </div>
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
          {opts?.onAddParagraph && <button type="button" onClick={opts.onAddParagraph} style={{ fontSize:'11px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', padding:'4px 9px', cursor:'pointer', fontWeight:'700' }}>+ Para</button>}
          <button type="button" onClick={() => moveSection(sId,'up')} disabled={idx===0} style={{ fontSize:'11px', background:idx===0?'#f3f4f6':'#f0fdf4', color:idx===0?'#9ca3af':'#16a34a', border:'1px solid', borderColor:idx===0?'#e5e7eb':'#bbf7d0', borderRadius:'5px', padding:'4px 9px', cursor:idx===0?'not-allowed':'pointer', fontWeight:'700' }}>⬆️</button>
          <button type="button" onClick={() => moveSection(sId,'down')} disabled={idx===o.length-1} style={{ fontSize:'11px', background:idx===o.length-1?'#f3f4f6':'#f0fdf4', color:idx===o.length-1?'#9ca3af':'#16a34a', border:'1px solid', borderColor:idx===o.length-1?'#e5e7eb':'#bbf7d0', borderRadius:'5px', padding:'4px 9px', cursor:idx===o.length-1?'not-allowed':'pointer', fontWeight:'700' }}>⬇️</button>
          <button type="button" onClick={() => toggleHidden(sId)} style={{ fontSize:'11px', background:isHidden?'#dcfce7':'#fef3c7', color:isHidden?'#16a34a':'#b45309', border:'1px solid', borderColor:isHidden?'#bbf7d0':'#fde68a', borderRadius:'5px', padding:'4px 9px', cursor:'pointer', fontWeight:'700' }}>{isHidden?'👁️ Show':'🙈 Hide'}</button>
          {opts?.canDelete && <button type="button" onClick={opts.onDelete} style={{ fontSize:'11px', background:'#fee2e2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'5px', padding:'4px 9px', cursor:'pointer', fontWeight:'700' }}>✕ Del</button>}
          <button type="button" onClick={() => addCustomSection(sId)} style={{ fontSize:'11px', background:'#f3e8ff', color:'#7c3aed', border:'1px solid #c4b5fd', borderRadius:'5px', padding:'4px 9px', cursor:'pointer', fontWeight:'700' }}>+ After</button>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!langKey || !cityKey) { setError('Please select a language and city.'); return; }
    setSaving(true); setError(null); setSuccess(null);
    const payload = {
      ...form,
      contentOverrides: {
        ...(form.contentOverrides||{}),
        introParagraphs, legalParagraphs, officialParagraphs, certifiedParagraphs, agencyParagraphs, interpParagraphs,
        docCategories: docCats, pricingTiers: priceTiers, whyChooseList: whyList, sampleCertsList: certs,
        ...trustCards,
        pricingTitle: form.pricingTitle, whyChooseTitle: form.whyChooseTitle,
        reviewsTitle: form.reviewsTitle, faqsTitle: form.faqsTitle, aboutTitle: form.aboutTitle,
        agencyTitle: form.agencyTitle, docsTitle: form.docsTitle, docsSubtitle: form.docsSubtitle,
        certSampleTitle: form.certSampleTitle, certSampleSubtitle: form.certSampleSubtitle,
        interpTitle: form.interpTitle, servicesTitle: form.servicesTitle, industriesTitle: form.industriesTitle,
      },
      reviews, faqs, ...trustCards,
    };
    try {
      const res = await fetch(`${API_URL}/api/v1/languages/${langKey}/cities/${cityKey}`, { method:'PUT', credentials:'include', headers: hdr, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        setSuccess('✅ Saved!'); setExists(true);
        setCities(prev => prev.map(c => c.key === cityKey ? { ...c, hasOverride: true, overrideSlug: payload.slug || defaultSlug } : c));
        setTimeout(() => setSuccess(null), 4000);
      } else { setError(json.message || 'Failed to save.'); }
    } catch (err: any) { setError(err.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!exists || !confirm('Delete override? Page will use auto-generated defaults.')) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/languages/${langKey}/cities/${cityKey}`, { method:'DELETE', credentials:'include', headers: hdr });
      const json = await res.json();
      if (json.success) { setSuccess('Override deleted.'); setExists(false); setForm(emptyOD()); setCities(prev => prev.map(c => c.key === cityKey ? { ...c, hasOverride: false } : c)); router.push('/dashboard/languages/city?language=' + langKey); }
      else { setError(json.message||'Delete failed.'); }
    } catch (err: any) { setError(err.message||'Delete failed.'); }
  };

  const L = (t: string) => <label style={{ display:'block', fontSize:'12px', fontWeight:'700', marginBottom:'5px', color:'#374151' }}>{t}</label>;
  const I = (k: keyof OD, ph?: string, rows?: number) => {
    const v = String(form[k]||'');
    const s = { width:'100%', padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', boxSizing:'border-box' as const, fontFamily:'inherit' };
    return rows && rows > 1 ? <textarea value={v} rows={rows} placeholder={ph} onChange={e => set(k, e.target.value)} style={{ ...s, resize:'vertical' as const }} /> : <input type="text" value={v} placeholder={ph} onChange={e => set(k, e.target.value)} style={s} />;
  };
  const GC = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' } as const;

  const filteredCities = cities.filter(c => !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.key.includes(citySearch.toLowerCase()));

  const renderPGs = (label: string, paras: string[], setParas: React.Dispatch<React.SetStateAction<string[]>>, sid: string) => (
    <div style={{ marginBottom:'18px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'14px' }}>
      {SH(sid, label, { onAddParagraph: () => setParas(p => [...p, '']) })}
      {paras.map((para, i) => (
        <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'7px' }}>
          <textarea value={para} rows={3} onChange={e => { const np = [...paras]; np[i] = e.target.value; setParas(np); }} style={{ flex:1, padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', fontFamily:'inherit', resize:'vertical' }} placeholder={'Paragraph ' + (i+1) + ' for ' + langName + ' translation in ' + (curCity?.name||'city')} />
          {paras.length > 1 && <button type="button" onClick={() => setParas(p => p.filter((_,j) => j!==i))} style={{ padding:'6px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'700', marginTop:'2px' }}>✕</button>}
        </div>
      ))}
    </div>
  );

  const renderCSEditor = (cs: CustomSection) => (
    <div key={cs.id} style={{ marginBottom:'18px', background:'#faf5ff', border:'2px solid #e9d5ff', borderRadius:'10px', padding:'16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px', borderBottom:'1.5px solid #e9d5ff', paddingBottom:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'18px' }}>✨</span>
          <h4 style={{ margin:0, fontSize:'14px', fontWeight:'800', color:'#6d28d9' }}>Custom: {cs.title || 'Untitled'}</h4>
          <span style={{ fontSize:'10px', background:'#ede9fe', color:'#6d28d9', padding:'2px 7px', borderRadius:'4px', fontWeight:'700' }}>CUSTOM SECTION</span>
        </div>
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
          <button type="button" onClick={() => moveSection(cs.id,'up')} style={{ background:'#fff', border:'1px solid #cbd5e1', padding:'3px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>⬆️ Up</button>
          <button type="button" onClick={() => moveSection(cs.id,'down')} style={{ background:'#fff', border:'1px solid #cbd5e1', padding:'3px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>⬇️ Down</button>
          <button type="button" onClick={() => addCSPara(cs.id)} style={{ background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', padding:'3px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>+ Para</button>
          <button type="button" onClick={() => addCSBox(cs.id)} style={{ background:'#dcfce7', color:'#166534', border:'1px solid #86efac', padding:'3px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>+ Box</button>
          <button type="button" onClick={() => addCSChecklistGroup(cs.id)} style={{ background:'#fef3c7', color:'#92400e', border:'1px solid #fde68a', padding:'3px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>+ Checklist</button>
          <button type="button" onClick={() => removeCustomSection(cs.id)} style={{ background:'#fee2e2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'5px', padding:'3px 8px', cursor:'pointer', fontWeight:'700', fontSize:'11px' }}>✕ Delete</button>
        </div>
      </div>

      <div style={{ ...GC, marginBottom:'10px' }}>
        <div>
          <label style={{ fontSize:'12px', fontWeight:'700', display:'block', marginBottom:'4px', color:'#374151' }}>Section Heading / Title *</label>
          <input value={cs.title} onChange={e => updateCS(cs.id,'title',e.target.value)} placeholder={`e.g. Specialized Dialect in ${(curCity?.name || 'City')}`} style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', boxSizing:'border-box', background:'#fff' }} />
        </div>
        <div>
          <label style={{ fontSize:'12px', fontWeight:'700', display:'block', marginBottom:'4px', color:'#374151' }}>Section Subtitle (Optional)</label>
          <input value={cs.subtitle||''} onChange={e => updateCS(cs.id,'subtitle',e.target.value)} placeholder="e.g. Certified and sworn linguists" style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', boxSizing:'border-box', background:'#fff' }} />
        </div>
      </div>

      <div style={{ marginBottom:'12px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', margin:0 }}>Paragraphs</label>
          <button type="button" onClick={() => addCSPara(cs.id)} style={{ fontSize:'11px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'4px', padding:'2px 7px', cursor:'pointer', fontWeight:'700' }}>+ Add Paragraph</button>
        </div>
        {(cs.paragraphs||[]).map((p, i) => (
          <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'6px' }}>
            <textarea value={p} rows={2} onChange={e => updateCSPara(cs.id,i,e.target.value)} style={{ flex:1, padding:'8px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', fontFamily:'inherit', resize:'vertical', background:'#fff' }} />
            {(cs.paragraphs||[]).length > 1 && <button type="button" onClick={() => removeCSPara(cs.id,i)} style={{ padding:'5px 9px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'700' }}>✕</button>}
          </div>
        ))}
      </div>

      {/* Interactive Cards / Boxes Grid */}
      <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📦 Interactive Cards / Boxes Grid</span>
            <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
              {(cs.boxes || []).length} Cards
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showBoxes !== false ? '#166534' : '#64748b', background: cs.showBoxes !== false ? '#dcfce7' : '#f1f5f9', padding: '2px 7px', borderRadius: '5px', border: cs.showBoxes !== false ? '1px solid #86efac' : '1px solid #cbd5e1' }}>
              <input
                type="checkbox"
                checked={cs.showBoxes !== false}
                onChange={e => updateCS(cs.id, 'showBoxes' as any, e.target.checked)}
                style={{ cursor: 'pointer', margin: 0 }}
              />
              <span>{cs.showBoxes !== false ? '✓ Show in Frontend' : '✕ Hidden in Frontend'}</span>
            </label>
            <button type="button" onClick={() => addCSBox(cs.id)} style={{ fontSize: '11px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontWeight: '700' }}>+ Add Box</button>
          </div>
        </div>

        {(cs.boxes || []).length === 0 ? (
          <div style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '11px', background: '#f8fafc', borderRadius: '5px', border: '1px dashed #cbd5e1' }}>
            No cards added yet. Click "+ Add Box" to create clickable destination cards.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
            {(cs.boxes || []).map((box, bIdx) => (
              <div key={box.id || bIdx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#1e40af' }}>Card #{bIdx + 1}</span>
                  <button type="button" onClick={() => removeCSBox(cs.id, box.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '1px 5px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
                  <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Icon</label>
                    <input value={box.icon || ''} onChange={e => updateCSBox(cs.id, box.id, 'icon', e.target.value)} placeholder="📋" style={{ width: '100%', padding: '3px 5px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Badge</label>
                    <input value={box.badge || ''} onChange={e => updateCSBox(cs.id, box.id, 'badge', e.target.value)} placeholder="DE" style={{ width: '100%', padding: '3px 5px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }} /></div>
                </div>
                <div style={{ marginBottom: '4px' }}><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Title</label>
                  <input value={box.title || ''} onChange={e => updateCSBox(cs.id, box.id, 'title', e.target.value)} placeholder="Card Title" style={{ width: '100%', padding: '3px 5px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', fontWeight: '700', boxSizing: 'border-box' }} /></div>
                <div style={{ marginBottom: '4px' }}><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Subtitle / Price</label>
                  <input value={box.subtitle || ''} onChange={e => updateCSBox(cs.id, box.id, 'subtitle', e.target.value)} placeholder="₹200/page" style={{ width: '100%', padding: '3px 5px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Link</label>
                  <input value={box.link || ''} onChange={e => updateCSBox(cs.id, box.id, 'link', e.target.value)} placeholder="/quote" style={{ width: '100%', padding: '3px 5px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#1d4ed8', boxSizing: 'border-box' }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Checklist / Document Groups Grid */}
      <div style={{ background: '#fff', border: '1.5px solid #fed7aa', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📋 Category Checklist / Document Groups Grid</span>
            <span style={{ fontSize: '10px', background: '#ffedd5', color: '#c2410c', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
              {(cs.checklistGroups || []).length} Groups
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showChecklists !== false ? '#c2410c' : '#64748b', background: cs.showChecklists !== false ? '#ffedd5' : '#f1f5f9', padding: '2px 7px', borderRadius: '5px', border: cs.showChecklists !== false ? '1px solid #fed7aa' : '1px solid #cbd5e1' }}>
              <input
                type="checkbox"
                checked={cs.showChecklists !== false}
                onChange={e => updateCS(cs.id, 'showChecklists' as any, e.target.checked)}
                style={{ cursor: 'pointer', margin: 0 }}
              />
              <span>{cs.showChecklists !== false ? '✓ Show in Frontend' : '✕ Hidden in Frontend'}</span>
            </label>
            <button type="button" onClick={() => addCSChecklistGroup(cs.id)} style={{ fontSize: '11px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontWeight: '700' }}>+ Add Checklist</button>
          </div>
        </div>

        {(cs.checklistGroups || []).length === 0 ? (
          <div style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '11px', background: '#f8fafc', borderRadius: '5px', border: '1px dashed #cbd5e1' }}>
            No checklist groups added yet. Click "+ Add Checklist" to display checkmarked items.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
            {(cs.checklistGroups || []).map((grp, gIdx) => {
              const rawItems = Array.isArray(grp.items) ? grp.items.join('\n') : (typeof grp.items === 'string' ? grp.items : '');
              const lineCount = rawItems.split('\n').filter((x: string) => x.trim().length > 0).length;
              return (
                <div key={grp.id || gIdx} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#92400e' }}>Group #{gIdx + 1}</span>
                    <button type="button" onClick={() => removeCSChecklistGroup(cs.id, grp.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '1px 5px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px', marginBottom: '4px' }}>
                    <div><label style={{ fontSize: '9.5px', display: 'block', color: '#92400e' }}>Icon</label>
                      <input value={grp.icon || '✓'} onChange={e => updateCSChecklistGroup(cs.id, grp.id, 'icon', e.target.value)} style={{ width: '100%', padding: '3px 4px', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '12px', textAlign: 'center', background: '#fff', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ fontSize: '9.5px', display: 'block', color: '#92400e' }}>Title</label>
                      <input value={grp.title || ''} onChange={e => updateCSChecklistGroup(cs.id, grp.id, 'title', e.target.value)} placeholder="Group Heading" style={{ width: '100%', padding: '3px 6px', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#fff', boxSizing: 'border-box' }} /></div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <label style={{ fontSize: '9.5px', color: '#92400e', margin: 0 }}>Items (1 per line)</label>
                      <span style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: '700' }}>✓ {lineCount}</span>
                    </div>
                    <textarea rows={4} value={rawItems} onChange={e => updateCSChecklistGroup(cs.id, grp.id, 'items', e.target.value.split('\n'))} style={{ width: '100%', padding: '4px 6px', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', resize: 'vertical', background: '#fff', boxSizing: 'border-box' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Highlight Note / Attestation Chain Banner */}
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1a3a6b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔗 Optional Highlight Note / Process Chain Banner</span>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showBanner !== false ? '#1e40af' : '#64748b', background: cs.showBanner !== false ? '#dbeafe' : '#f1f5f9', padding: '2px 7px', borderRadius: '5px', border: cs.showBanner !== false ? '1px solid #bfdbfe' : '1px solid #cbd5e1' }}>
            <input
              type="checkbox"
              checked={cs.showBanner !== false}
              onChange={e => updateCSBanner(cs.id, 'showBanner' as any, e.target.checked ? 'true' : 'false')}
              style={{ cursor: 'pointer', margin: 0 }}
            />
            <span>{cs.showBanner !== false ? '✓ Show Banner in Frontend' : '✕ Hidden'}</span>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
          <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Icon</label>
            <input value={cs.highlightBanner?.icon || '🔗'} onChange={e => updateCSBanner(cs.id, 'icon', e.target.value)} style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }} /></div>
          <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Banner Title</label>
            <input value={cs.highlightBanner?.title || ''} onChange={e => updateCSBanner(cs.id, 'title', e.target.value)} placeholder="Banner Title" style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', fontWeight: '700', boxSizing: 'border-box' }} /></div>
          <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Redirect Link</label>
            <input value={cs.highlightBanner?.link || ''} onChange={e => updateCSBanner(cs.id, 'link', e.target.value)} placeholder="/quote" style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', boxSizing: 'border-box' }} /></div>
        </div>
        <div>
          <label style={{ fontSize: '9.5px', display: 'block', color: '#64748b', marginBottom: '2px' }}>Banner Text / Sequence</label>
          <textarea rows={2} value={cs.highlightBanner?.text || ''} onChange={e => updateCSBanner(cs.id, 'text', e.target.value)} placeholder="e.g. Translation → Notarization → MEA Apostille → Embassy Attestation" style={{ width: '100%', padding: '5px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* CTA Banner Settings */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#1a3a6b' }}>
            🔘 Optional Action Bar (Sub-CTA)
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showCta !== false ? '#9333ea' : '#64748b', background: cs.showCta !== false ? '#f3e8ff' : '#f1f5f9', padding: '2px 7px', borderRadius: '5px', border: cs.showCta !== false ? '1px solid #d8b4fe' : '1px solid #cbd5e1' }}>
            <input
              type="checkbox"
              checked={cs.showCta !== false}
              onChange={e => updateCS(cs.id, 'showCta' as any, e.target.checked)}
              style={{ cursor: 'pointer', margin: 0 }}
            />
            <span>{cs.showCta !== false ? '✓ Show CTA in Frontend' : '✕ Hidden'}</span>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
          <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Prompt Text</label>
            <input value={cs.ctaText || ''} onChange={e => updateCS(cs.id, 'ctaText', e.target.value)} placeholder="Need translation?" style={{ width: '100%', padding: '5px 7px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11.5px', boxSizing: 'border-box' }} /></div>
          <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Button Label</label>
            <input value={cs.ctaBtnText || ''} onChange={e => updateCS(cs.id, 'ctaBtnText', e.target.value)} placeholder="Get Quote" style={{ width: '100%', padding: '5px 7px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11.5px', boxSizing: 'border-box' }} /></div>
          <div><label style={{ fontSize: '9.5px', display: 'block', color: '#64748b' }}>Button Link</label>
            <input value={cs.ctaBtnLink || ''} onChange={e => updateCS(cs.id, 'ctaBtnLink', e.target.value)} placeholder="/quote" style={{ width: '100%', padding: '5px 7px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11.5px', boxSizing: 'border-box' }} /></div>
        </div>
      </div>
    </div>
  );

  if (!langKey) return (
    <div style={{ padding:'60px', textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'12px' }}>🌐</div>
      <h2 style={{ color:'#374151', marginBottom:'10px' }}>No Language Selected</h2>
      <p style={{ color:'#6b7280', marginBottom:'20px' }}>Go to Languages and click <strong>📍 City Pages</strong> on any language row.</p>
      <a href={adminPath('dashboard/languages')} style={{ padding:'10px 20px', background:'#7c3aed', color:'#fff', borderRadius:'8px', textDecoration:'none', fontWeight:'700' }}>← Back to Languages</a>
    </div>
  );

  return (
    <div className="lang-city-container">
      <style>{`
        .lang-city-container {
          display: flex;
          height: calc(100vh - 56px);
          overflow: hidden;
        }
        .lang-city-sidebar {
          width: 255px;
          flex-shrink: 0;
          border-right: 1px solid #e5e7eb;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lang-city-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lang-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .lang-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }
        .lang-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 1024px) {
          .lang-city-container {
            flex-direction: column !important;
            height: auto !important;
            min-height: calc(100vh - 56px) !important;
            overflow: visible !important;
          }
          .lang-city-sidebar {
            width: 100% !important;
            max-height: 240px !important;
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .lang-city-main {
            overflow: visible !important;
          }
        }
        @media (max-width: 768px) {
          .lang-grid-2, .lang-grid-3, .lang-grid-4 {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>
      <div className="lang-city-sidebar">
        <div style={{ padding:'14px 12px', borderBottom:'1px solid #e5e7eb', flexShrink:0 }}>
          <div style={{ fontSize:'14px', fontWeight:'800', color:'#1e3a5f', marginBottom:'2px' }}>{langFlag} {langName}</div>
          <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'8px' }}>Select a city to edit its page</div>
          <input type="text" placeholder="🔍 Search cities..." value={citySearch} onChange={e => setCitySearch(e.target.value)} style={{ width:'100%', padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'12px', boxSizing:'border-box' }} />
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'6px' }}>
          {filteredCities.map(city => (
            <div key={city.key} onClick={() => router.push('/dashboard/languages/city?language=' + langKey + '&city=' + city.key)}
              style={{ padding:'8px 10px', borderRadius:'7px', cursor:'pointer', marginBottom:'2px', background:city.key===cityKey?'#ede9fe':'transparent', border:city.key===cityKey?'1.5px solid #a78bfa':'1px solid transparent' }}>
              <div style={{ fontSize:'13px', fontWeight:city.key===cityKey?'800':'600', color:city.key===cityKey?'#5b21b6':'#374151' }}>{city.name}</div>
              <div style={{ fontSize:'10px', color:city.hasOverride?'#059669':'#9ca3af', fontWeight:'600' }}>{city.hasOverride?'✅ Custom override':'⚡ Auto defaults'}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 12px', borderTop:'1px solid #e5e7eb', flexShrink:0 }}>
          <a href={adminPath('dashboard/languages')} style={{ fontSize:'12px', color:'#7c3aed', fontWeight:'700', textDecoration:'none' }}>← Back to Languages</a>
        </div>
      </div>

      <div className="lang-city-main">
        {!cityKey ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', color:'#6b7280' }}>
            <div style={{ fontSize:'48px' }}>🏙️</div>
            <div style={{ fontSize:'18px', fontWeight:'700', color:'#374151' }}>Select a city to edit its {langName} translation page</div>
            <div style={{ fontSize:'14px' }}>Each city gets its own URL, SEO metadata, and full section-by-section CMS editing</div>
          </div>
        ) : (
          <>
            <div style={{ padding:'12px 20px', borderBottom:'1px solid #e5e7eb', background:'#fff', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'16px', fontWeight:'800', color:'#1e3a5f' }}>{langFlag} {langName} in {curCity?.name} — City CMS</h2>
                <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px' }}>
                  Live URL: <a href={siteLink('/languages/' + liveSlug)} target="_blank" rel="noopener noreferrer" style={{ color:'#7c3aed', fontWeight:'700', fontFamily:'monospace' }}>/languages/{liveSlug}</a>
                  {!exists && <span style={{ marginLeft:'8px', fontSize:'10px', background:'#fef3c7', color:'#b45309', padding:'2px 6px', borderRadius:'4px', fontWeight:'700' }}>NOT SAVED — auto defaults</span>}
                  {exists && <span style={{ marginLeft:'8px', fontSize:'10px', background:'#dcfce7', color:'#166534', padding:'2px 6px', borderRadius:'4px', fontWeight:'700' }}>✅ Custom override active</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                {error && <span style={{ fontSize:'12px', color:'#dc2626', background:'#fee2e2', padding:'5px 10px', borderRadius:'5px' }}>{error}</span>}
                {success && <span style={{ fontSize:'12px', color:'#166534', background:'#dcfce7', padding:'5px 10px', borderRadius:'5px' }}>{success}</span>}
                {exists && <button type="button" onClick={handleDelete} style={{ padding:'7px 14px', background:'#fee2e2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'6px', fontWeight:'700', fontSize:'12px', cursor:'pointer' }}>🗑️ Delete</button>}
                <button type="button" onClick={handleSave} disabled={saving||loading} style={{ padding:'8px 20px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'800', fontSize:'13px', cursor:'pointer' }}>{saving?'Saving...':'💾 Save City Page'}</button>
              </div>
            </div>

            <div style={{ display:'flex', borderBottom:'1px solid #e5e7eb', padding:'0 12px', background:'#fff', overflowX:'auto', flexShrink:0, gap:'1px' }}>
              {TABS.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  style={{ padding:'10px 12px', border:'none', borderBottom:activeTab===tab.id?'2.5px solid #7c3aed':'2.5px solid transparent', background:'none', color:activeTab===tab.id?'#7c3aed':'#6b7280', fontWeight:activeTab===tab.id?'800':'600', fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
              {loading && <div style={{ textAlign:'center', padding:'40px', color:'#6b7280' }}>Loading city data...</div>}

              {!loading && activeTab === 'hero' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('hero','🎯 Hero Section')}
                    <div style={{ ...GC, marginBottom: '14px' }}>
                      <div>{L('Hero Badge')}{I('heroBadge','#1 Albanian Translation in Mumbai')}</div>
                      <div>{L('Hero Flag / Language Label')}{I('heroFlag','🇦🇱 Albanian Translation Services · Mumbai')}</div>
                      <div>{L('Hero ISO Badge')}{I('heroIso','ISO 17100:2015 & ISO 9001:2015 Certified')}</div>
                    </div>

                    {/* HERO BACKGROUND IMAGE SECTION WITH GUIDELINES & LIVE PREVIEW */}
                    <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e3a5f', marginBottom: '2px' }}>
                            🖼️ Hero Background Image
                          </label>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            Upload a high-resolution banner image or paste an image URL.
                          </span>
                        </div>
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', color: '#1d4ed8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>📐 Size Ratio:</span>
                          <span>16:9 or 21:9 · 1920×600 px (Max 2MB, JPG/PNG/WebP)</span>
                        </div>
                      </div>

                      {/* Image Ratio Guidelines Box */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11.5px', color: '#475569' }}>
                        <div>🎯 <strong>Aspect Ratio:</strong> 16:9 or 21:9 (Wide Landscape)</div>
                        <div>📏 <strong>Recommended Size:</strong> 1920 × 600 px (Min 1280×500)</div>
                        <div>📁 <strong>Formats:</strong> JPG, WebP, PNG (Max 2MB)</div>
                        <div>👁️ <strong>Design Note:</strong> Center-right focal area; dark overlay applied automatically</div>
                      </div>

                      {/* Input & Upload Controls */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                        <input
                          type="text"
                          value={form.heroBgImage || ''}
                          onChange={e => set('heroBgImage', e.target.value)}
                          placeholder="e.g. /uploads/... or https://images.unsplash.com/..."
                          style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}
                        />
                        <label style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: uploadingHeroBg ? 'not-allowed' : 'pointer', fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: uploadingHeroBg ? 0.7 : 1 }}>
                          <span>{uploadingHeroBg ? '⏳ Uploading...' : '📁 Upload Background Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingHeroBg}
                            onChange={async e => {
                              if (!e.target.files?.length) return;
                              setUploadingHeroBg(true);
                              const fd = new FormData(); fd.append('file', e.target.files[0]);
                              try {
                                const r = await fetch(`${API_URL}/api/v1/upload`, {
                                  method: 'POST',
                                  credentials: 'include',
                                  headers: tok ? { Authorization: `Bearer ${tok}` } : {},
                                  body: fd,
                                });
                                const j = await r.json();
                                if (j.success && j.url) set('heroBgImage', j.url);
                                else alert(j.message || 'Upload failed');
                              } catch (err: any) {
                                alert(err.message || 'Upload error');
                              } finally {
                                setUploadingHeroBg(false);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {form.heroBgImage && (
                          <button
                            type="button"
                            onClick={() => set('heroBgImage', '')}
                            style={{ padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            ✕ Remove Image
                          </button>
                        )}
                      </div>

                      {/* Live Image Preview */}
                      {form.heroBgImage ? (() => {
                        const bgImg = form.heroBgImage.trim();
                        const fullUrl = bgImg.startsWith('http') ? bgImg : `${API_URL}${bgImg.startsWith('/') ? '' : '/'}${bgImg}`;
                        return (
                          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '2px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                            <div
                              style={{
                                height: '160px',
                                background: `linear-gradient(135deg, rgba(15,23,42,0.70), rgba(30,58,107,0.65)), url('${fullUrl}') center/cover no-repeat`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                padding: '20px 24px',
                                color: '#ffffff',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                                {form.heroFlag || `${langName} Translation Services · ${curCity?.name || 'City'}`}
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.2, maxWidth: '80%' }}>
                                {(form.heroTitle || `${langName} Translation Services in ${curCity?.name || 'City'}`).replace(/\n/g, ' ')}
                              </div>
                              <div style={{ fontSize: '11.5px', opacity: 0.9, marginTop: '4px', maxWidth: '75%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {form.heroSub || 'Certified, notarized and embassy-approved translation services delivered across India.'}
                              </div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '8px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>✅</span>
                                <span>Live Hero Background Preview (matches frontend dark gradient overlay)</span>
                              </span>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <a
                                  href={fullUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}
                                >
                                  🔗 Open Full Image ↗
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '8px', border: '1.5px dashed #cbd5e1', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}>
                          📷 <strong>No background image set</strong> — using default navy gradient theme.
                          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                            Recommended: Upload a wide 16:9 banner (1920×600 px) for a branded local city hero section.
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop:'12px' }}>{L('Hero Title (supports HTML)')}{I('heroTitle','Albanian Translation\nServices in Mumbai',2)}</div>
                    <div style={{ marginTop:'10px' }}>{L('Hero Subtitle')}{I('heroSub','Professional ISO-certified Albanian translation...',3)}</div>
                    <div style={{ marginTop:'10px' }}>{L('Trust Badges (pipe separated)')}{I('heroBadgesList','✅ Embassy Accepted | ⚡ 24-Hr Express | 🔏 Notarized')}</div>
                    <div style={{ ...GC, marginTop:'12px' }}>
                      <div>{L('Btn 1 Text')}{I('heroBtn1Text','📋 Get Free Quote')}</div>
                      <div>{L('Btn 1 Link')}{I('heroBtn1Link','/quote')}</div>
                      <div>{L('Btn 2 Text')}{I('heroBtn2Text','📞 Call Expert')}</div>
                      <div>{L('Btn 2 Phone')}{I('heroBtn2Phone','+91-9312690490')}</div>
                      <div>{L('Btn 3 Text')}{I('heroBtn3Text','💬 WhatsApp')}</div>
                      <div>{L('Btn 3 WA Number')}{I('heroBtn3WA','919312690490')}</div>
                    </div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    <h4 style={{ margin:'0 0 12px', fontSize:'14px', fontWeight:'800', color:'#1e3a5f' }}>🔗 URL Slug</h4>
                    {L('Custom Slug (empty = auto: ' + defaultSlug + ')')}
                    <input type="text" value={form.slug||''} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder={defaultSlug} style={{ width:'100%', padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', fontFamily:'monospace', boxSizing:'border-box' }} />
                    <p style={{ fontSize:'11px', color:'#6b7280', margin:'4px 0 0' }}>Auto slug: <code>{defaultSlug}</code></p>
                  </div>
                </div>
              )}

              {!loading && activeTab === 'process' && (
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                  {SH('process','⚙️ 5-Step Translation Process')}
                  <div style={GC}><div>{L('Process Tag')}{I('processTag','HOW IT WORKS')}</div><div>{L('Process Title')}{I('processTitle','5-Step Albanian Translation Process in Mumbai')}</div></div>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ marginTop:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px' }}>
                      <div style={{ fontWeight:'700', fontSize:'13px', color:'#1e3a5f', marginBottom:'8px' }}>Step {n}</div>
                      <div style={GC}>
                        <div>{L('Title')}{I(('step'+n+'Title') as keyof OD, 'Step title')}</div>
                        <div>{L('Description')}{I(('step'+n+'Desc') as keyof OD, 'Step description', 2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && activeTab === 'content' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('intro','📖 Main Content & Copy')}
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      <div>{L('Page Title (h1)')}{I('title','Albanian Translation Services in Mumbai')}</div>
                      <div>{L('About/Overview Section Title')}{I('aboutTitle','Albanian Translation Services in Mumbai – Language Guru')}</div>
                      <div>{L('Intro Paragraph 1')}{I('p1','',3)}</div>
                      <div>{L('Intro Paragraph 2')}{I('p2','',3)}</div>
                      <div>{L('Agency Section Title')}{I('agencyTitle','Albanian Translation Agency in Mumbai')}</div>
                      <div>{L('Agency Office Title')}{I('agencyOfficeTitle','📍 Albanian Translation Agency – Mumbai Office')}</div>
                      <div>{L('Office Address')}{I('officeAddressText','617, West End Mall, Janakpuri, New Delhi – 110058 | Serving Mumbai')}</div>
                    </div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    <h4 style={{ margin:'0 0 14px', fontSize:'14px', fontWeight:'800', color:'#1e3a5f' }}>🎫 Trust Cards (6)</h4>
                    {[1,2,3,4,5,6].map(n => (
                      <div key={n} style={{ marginBottom:'8px' }}>
                        {L('Trust Card ' + n)}
                        <input value={trustCards['trustCard'+n]||''} onChange={e => setTrustCards(p => ({ ...p, ['trustCard'+n]: e.target.value }))} placeholder={'Trust point ' + n} style={{ width:'100%', padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'13px', boxSizing:'border-box' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && activeTab === 'paragraphs' && (
                <div>
                  {renderPGs('📖 Intro Paragraphs', introParagraphs, setIntroParagraphs, 'intro')}
                  {renderPGs('⚖️ Legal Translation Paragraphs', legalParagraphs, setLegalParagraphs, 'legal')}
                  {renderPGs('🏛️ Official Translation Paragraphs', officialParagraphs, setOfficialParagraphs, 'official')}
                  {renderPGs('📜 Certified Translation Paragraphs', certifiedParagraphs, setCertifiedParagraphs, 'certified')}
                  {renderPGs('🏢 Agency Details Paragraphs', agencyParagraphs, setAgencyParagraphs, 'agency')}
                  {renderPGs('🎙️ Interpretation Paragraphs', interpParagraphs, setInterpParagraphs, 'interp')}
                </div>
              )}

              {!loading && activeTab === 'pricing' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('pricing','💰 Pricing')}
                    <div style={GC}><div>{L('Pricing Section Title')}{I('pricingTitle','Albanian Translation Pricing in Mumbai')}</div><div>{L('Currency Symbol')}{I('currencySymbol','₹')}</div></div>
                    {[1,2,3].map(n => (
                      <div key={n} style={{ marginTop:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px' }}>
                        <div style={{ fontWeight:'700', fontSize:'13px', color:'#1e3a5f', marginBottom:'8px' }}>Tier {n}{n===2?' (Most Popular)':n===3?' (Express)':''}</div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                          <div>{L('Name')}{I(('tier'+n+'Name') as keyof OD)}</div>
                          <div>{L('Price')}{I(('tier'+n+'Price') as keyof OD)}</div>
                          <div>{L('Unit')}{I(('tier'+n+'Unit') as keyof OD)}</div>
                          <div>{L('Delivery')}{I(('tier'+n+'Delivery') as keyof OD)}</div>
                          {n===2 && <div style={{ gridColumn:'1/-1' }}>{L('Badge')}{I('tier2Badge','MOST POPULAR')}</div>}
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop:'12px' }}>{L('Pricing Addons / Notes')}{I('pricingAddons','➕ Add-ons: Notarization ₹200/page · MEA Apostille ₹1,400/page',2)}</div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('samples','📑 Certificate Samples')}
                    <div style={GC}><div>{L('Cert Sample Title')}{I('certSampleTitle')}</div><div>{L('Cert Sample Subtitle')}{I('certSampleSubtitle')}</div></div>
                    <div style={{ marginTop:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                        <label style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Samples ({certs.length})</label>
                        <button type="button" onClick={() => setCerts(p => [...p, { doc:'Document', lang:'English → Albanian', flag:'🇦🇱', acc:'Embassy Accepted', time:'24 Hrs', icon:'📜' }])} style={{ fontSize:'12px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontWeight:'700' }}>+ Add</button>
                      </div>
                      {certs.map((cert, i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr) auto', gap:'5px', marginBottom:'7px', background:'#f8fafc', padding:'8px', borderRadius:'6px' }}>
                          {['icon','doc','lang','flag','acc','time'].map(f => (
                            <div key={f}><label style={{ fontSize:'9px', fontWeight:'700', display:'block', color:'#6b7280' }}>{f}</label>
                              <input value={cert[f]||''} onChange={e => { const nc=[...certs]; nc[i]={...nc[i],[f]:e.target.value}; setCerts(nc); }} style={{ width:'100%', padding:'4px 6px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'11px', boxSizing:'border-box' }} /></div>
                          ))}
                          <button type="button" onClick={() => setCerts(p => p.filter((_,j) => j!==i))} style={{ padding:'4px 7px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'700', alignSelf:'flex-end' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!loading && activeTab === 'why_faqs' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('why','🏅 Why Choose Us')}
                    <div style={{ marginBottom:'12px' }}>{L('Why Choose Title')}{I('whyChooseTitle')}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <label style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Why Choose Items ({whyList.length})</label>
                      <button type="button" onClick={() => setWhyList(p => [...p, { icon:'🏛️', title:'New Point', desc:'Description.' }])} style={{ fontSize:'12px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontWeight:'700' }}>+ Add</button>
                    </div>
                    {whyList.map((item, i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'50px 1fr 2fr auto', gap:'8px', marginBottom:'8px', background:'#f8fafc', padding:'10px', borderRadius:'7px', alignItems:'center' }}>
                        <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>ICON</label><input value={item.icon||''} onChange={e => { const nl=[...whyList]; nl[i]={...nl[i],icon:e.target.value}; setWhyList(nl); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'16px', textAlign:'center', boxSizing:'border-box' }} /></div>
                        <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>TITLE</label><input value={item.title||''} onChange={e => { const nl=[...whyList]; nl[i]={...nl[i],title:e.target.value}; setWhyList(nl); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'12px', boxSizing:'border-box' }} /></div>
                        <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>DESC</label><input value={item.desc||''} onChange={e => { const nl=[...whyList]; nl[i]={...nl[i],desc:e.target.value}; setWhyList(nl); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'12px', boxSizing:'border-box' }} /></div>
                        <button type="button" onClick={() => setWhyList(p => p.filter((_,j) => j!==i))} style={{ padding:'5px 9px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'700' }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('reviews','⭐ Reviews')}
                    <div style={{ marginBottom:'12px' }}>{L('Reviews Title')}{I('reviewsTitle')}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <label style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Reviews ({reviews.length})</label>
                      <button type="button" onClick={() => setReviews(p => [...p, { stars:'⭐⭐⭐⭐⭐', text:'Great service!', name:'Client Name', role:'Role · City', avatar:'CN' }])} style={{ fontSize:'12px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontWeight:'700' }}>+ Add</button>
                    </div>
                    {reviews.map((rev, i) => (
                      <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px', marginBottom:'8px' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'110px 1fr', gap:'8px', marginBottom:'8px' }}>
                          <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>STARS</label><input value={rev.stars||''} onChange={e => { const nr=[...reviews]; nr[i]={...nr[i],stars:e.target.value}; setReviews(nr); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'13px', boxSizing:'border-box' }} /></div>
                          <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>REVIEW TEXT</label><textarea value={rev.text||''} rows={2} onChange={e => { const nr=[...reviews]; nr[i]={...nr[i],text:e.target.value}; setReviews(nr); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'12px', fontFamily:'inherit', boxSizing:'border-box', resize:'vertical' }} /></div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 70px', gap:'8px', alignItems:'flex-end' }}>
                          <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>NAME</label><input value={rev.name||''} onChange={e => { const nr=[...reviews]; nr[i]={...nr[i],name:e.target.value}; setReviews(nr); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'12px', boxSizing:'border-box' }} /></div>
                          <div><label style={{ fontSize:'10px', color:'#6b7280', display:'block', marginBottom:'2px' }}>ROLE</label><input value={rev.role||''} onChange={e => { const nr=[...reviews]; nr[i]={...nr[i],role:e.target.value}; setReviews(nr); }} style={{ width:'100%', padding:'5px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'12px', boxSizing:'border-box' }} /></div>
                          <button type="button" onClick={() => setReviews(p => p.filter((_,j) => j!==i))} style={{ padding:'6px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'700', fontSize:'11px' }}>✕ Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('faqs','❓ FAQs')}
                    <div style={{ marginBottom:'12px' }}>{L('FAQs Title')}{I('faqsTitle')}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <label style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>FAQs ({faqs.length})</label>
                      <button type="button" onClick={() => setFaqs(p => [...p, { q:'Question?', a:'Answer.' }])} style={{ fontSize:'12px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontWeight:'700' }}>+ Add FAQ</button>
                    </div>
                    {faqs.map((faq, i) => (
                      <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'7px', padding:'10px', marginBottom:'7px' }}>
                        <div style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
                          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'5px' }}>
                            <input value={faq.q} placeholder="Question" onChange={e => { const nf=[...faqs]; nf[i]={...nf[i],q:e.target.value}; setFaqs(nf); }} style={{ width:'100%', padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:'5px', fontSize:'13px', fontWeight:'600', boxSizing:'border-box' }} />
                            <textarea value={faq.a} rows={2} placeholder="Answer" onChange={e => { const nf=[...faqs]; nf[i]={...nf[i],a:e.target.value}; setFaqs(nf); }} style={{ width:'100%', padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:'5px', fontSize:'12px', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }} />
                          </div>
                          <button type="button" onClick={() => setFaqs(p => p.filter((_,j) => j!==i))} style={{ padding:'6px 9px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'700', marginTop:'2px' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && activeTab === 'docs_svcs' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('docs','📄 Document Categories')}
                    <div style={GC}><div>{L('Docs Title')}{I('docsTitle')}</div><div>{L('Docs Subtitle')}{I('docsSubtitle')}</div></div>
                    <div style={{ marginTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <label style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Doc Categories ({docCats.length})</label>
                      <button type="button" onClick={() => setDocCats(p => [...p, { id:'cat-'+Date.now(), name:'New Category', icon:'📄', color:'#dbeafe', panelTitle:'Category Title', panelSub:'Subtitle', docs:'Doc1, Doc2', ctaText:'Get Quote', ctaBtn:'📋 Get Quote' }])} style={{ fontSize:'12px', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontWeight:'700' }}>+ Add</button>
                    </div>
                    {docCats.map((cat, i) => (
                      <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px', marginBottom:'8px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                          <span style={{ fontWeight:'700', fontSize:'13px', color:'#1e3a5f' }}>{cat.icon} {cat.name}</span>
                          <button type="button" onClick={() => setDocCats(p => p.filter((_,j) => j!==i))} style={{ padding:'3px 8px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'700', fontSize:'11px' }}>✕</button>
                        </div>
                        <div style={{ ...GC }}>
                          {['name','icon','color','panelTitle','panelSub','docs','ctaText','ctaBtn'].map(f => (
                            <div key={f}><label style={{ fontSize:'10px', fontWeight:'700', display:'block', marginBottom:'2px', color:'#6b7280', textTransform:'uppercase' }}>{f}</label>
                              <input value={cat[f]||''} onChange={e => { const nc=[...docCats]; nc[i]={...nc[i],[f]:e.target.value}; setDocCats(nc); }} style={{ width:'100%', padding:'5px 7px', border:'1px solid #e5e7eb', borderRadius:'4px', fontSize:'12px', boxSizing:'border-box' }} /></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    {SH('interp','🎙️ Services & Sections Headings')}
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      <div>{L('Interpretation Services Title')}{I('interpTitle')}</div>
                      <div>{L('Translation Services Title')}{I('servicesTitle')}</div>
                      <div>{L('Industries Section Title')}{I('industriesTitle')}</div>
                    </div>
                  </div>
                </div>
              )}

              {!loading && activeTab === 'seo_sidebar' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    <h4 style={{ margin:'0 0 14px', fontSize:'14px', fontWeight:'800', color:'#1e3a5f' }}>🔍 SEO Meta Tags</h4>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      <div>{L('Meta Title')}{I('metaTitle','Albanian Translation Services in Mumbai | ISO Certified | Language Guru')}</div>
                      <div>{L('Meta Description')}{I('metaDesc','',3)}</div>
                      <div>{L('Meta Keywords')}{I('metaKeywords','albanian translation mumbai, certified albanian translation mumbai')}</div>
                      <div>{L('OG Image URL')}{I('ogImage','https://...')}</div>
                    </div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    <h4 style={{ margin:'0 0 14px', fontSize:'14px', fontWeight:'800', color:'#1e3a5f' }}>📋 CTA Section</h4>
                    <div style={GC}><div>{L('CTA Title')}{I('ctaTitle','Need Albanian Translation in Mumbai?')}</div><div>{L('CTA Subtitle')}{I('ctaSubtitle','Instant quote in 30 minutes.')}</div></div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    <h4 style={{ margin:'0 0 14px', fontSize:'14px', fontWeight:'800', color:'#1e3a5f' }}>🗂️ Sidebar</h4>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                      <div>{L('Sidebar CTA Title')}{I('sidebarCtaTitle')}</div>
                      <div>{L('Sidebar Phone 1')}{I('sidebarPhone1')}</div>
                      <div>{L('Sidebar Phone 2')}{I('sidebarPhone2')}</div>
                      <div>{L('Sidebar Btn 1 Text')}{I('sidebarBtn1Text')}</div>
                      <div>{L('Sidebar Btn 1 Link')}{I('sidebarBtn1Link')}</div>
                      <div>{L('Sidebar Btn 2 Text')}{I('sidebarBtn2Text')}</div>
                      <div>{L('Sidebar Btn 2 WA')}{I('sidebarBtn2WA')}</div>
                      <div>{L('Sidebar Cities Title')}{I('sidebarCitiesTitle')}</div>
                      <div>{L('Sidebar Languages Title')}{I('sidebarLangsTitle')}</div>
                      <div>{L('Sidebar Other Services Title')}{I('sidebarOtherSvcsTitle')}</div>
                    </div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px' }}>
                    <h4 style={{ margin:'0 0 12px', fontSize:'14px', fontWeight:'800', color:'#1e3a5f' }}>⚡ Page Status</h4>
                    <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
                      <input type="checkbox" checked={form.isActive!==false} onChange={e => set('isActive',e.target.checked)} style={{ width:'16px', height:'16px' }} />
                      <span style={{ fontSize:'14px', fontWeight:'700', color:'#374151' }}>Page Active (show in sitemap and allow user access)</span>
                    </label>
                  </div>
                </div>
              )}

              {!loading && activeTab === 'layout_order' && (
                <div>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'18px', marginBottom:'16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                      <h4 style={{ margin:0, fontSize:'15px', fontWeight:'800', color:'#1e3a5f' }}>📑 Section Order & Page Layout</h4>
                      <button type="button" onClick={() => addCustomSection()} style={{ padding:'8px 16px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'700', fontSize:'13px' }}>+ Add Custom Section</button>
                    </div>
                    <p style={{ fontSize:'12px', color:'#6b7280', margin:'0 0 14px' }}>Reorder sections with ⬆️/⬇️. Toggle visibility. Click + to insert a custom section after any row.</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      {getOrder().map((secId, idx) => {
                        const ds = DEFAULT_LANG_CITY_SECTIONS.find(s => s.id === secId);
                        const cs = ((form.contentOverrides?.customSections as CustomSection[])||[]).find(c => c.id === secId);
                        const label = ds?.label || cs?.title || secId;
                        const isHidden = (form.contentOverrides?.hiddenSections||[]).includes(secId);
                        const isCustom = !!cs;
                        const total = getOrder().length;
                        return (
                          <div key={secId} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', background:isHidden?'#f9fafb':'#f0fdf4', border:'1px solid', borderColor:isHidden?'#e5e7eb':'#bbf7d0', borderRadius:'7px', opacity:isHidden?0.7:1 }}>
                            <span style={{ fontSize:'11px', color:'#9ca3af', fontWeight:'700', minWidth:'22px' }}>{idx+1}</span>
                            {isCustom && <span style={{ fontSize:'9px', background:'#f3e8ff', color:'#7c3aed', padding:'2px 5px', borderRadius:'3px', fontWeight:'700' }}>CUSTOM</span>}
                            <span style={{ flex:1, fontSize:'13px', fontWeight:'700', color:isHidden?'#9ca3af':'#1e3a5f', textDecoration:isHidden?'line-through':'none' }}>{label}</span>
                            {isHidden && <span style={{ fontSize:'9px', background:'#fef3c7', color:'#b45309', padding:'2px 5px', borderRadius:'3px', fontWeight:'700' }}>HIDDEN</span>}
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button type="button" onClick={() => moveSection(secId,'up')} disabled={idx===0} style={{ padding:'4px 9px', background:idx===0?'#f3f4f6':'#dcfce7', color:idx===0?'#9ca3af':'#16a34a', border:'1px solid', borderColor:idx===0?'#e5e7eb':'#bbf7d0', borderRadius:'4px', cursor:idx===0?'not-allowed':'pointer', fontWeight:'700', fontSize:'11px' }}>⬆️</button>
                              <button type="button" onClick={() => moveSection(secId,'down')} disabled={idx===total-1} style={{ padding:'4px 9px', background:idx===total-1?'#f3f4f6':'#dcfce7', color:idx===total-1?'#9ca3af':'#16a34a', border:'1px solid', borderColor:idx===total-1?'#e5e7eb':'#bbf7d0', borderRadius:'4px', cursor:idx===total-1?'not-allowed':'pointer', fontWeight:'700', fontSize:'11px' }}>⬇️</button>
                              <button type="button" onClick={() => toggleHidden(secId)} style={{ padding:'4px 9px', background:isHidden?'#dcfce7':'#fef3c7', color:isHidden?'#16a34a':'#b45309', border:'1px solid', borderColor:isHidden?'#bbf7d0':'#fde68a', borderRadius:'4px', cursor:'pointer', fontWeight:'700', fontSize:'11px' }}>{isHidden?'👁️':'🙈'}</button>
                              <button type="button" onClick={() => addCustomSection(secId)} style={{ padding:'4px 9px', background:'#f3e8ff', color:'#7c3aed', border:'1px solid #c4b5fd', borderRadius:'4px', cursor:'pointer', fontWeight:'700', fontSize:'11px' }}>+</button>
                              {isCustom && <button type="button" onClick={() => removeCustomSection(secId)} style={{ padding:'4px 9px', background:'#fee2e2', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:'4px', cursor:'pointer', fontWeight:'700', fontSize:'11px' }}>✕</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {((form.contentOverrides?.customSections as CustomSection[])||[]).map(cs => renderCSEditor(cs))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LanguageCityPage() {
  return (
    <>
      <TopNav title="Language City Pages" />
      <Suspense fallback={<div style={{ padding:'40px', textAlign:'center', color:'#6b7280', fontSize:'14px' }}>⏳ Loading Language City CMS...</div>}>
        <Inner />
      </Suspense>
    </>
  );
}
