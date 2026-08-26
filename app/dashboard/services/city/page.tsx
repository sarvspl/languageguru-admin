'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { API_URL, siteLink, SITE_URL } from '../../../../lib/env';

interface CityItem {
  key: string;
  name: string;
  hasOverride: boolean;
  overrideSlug?: string;
  overrideMetaTitle?: string;
  overrideUpdatedAt?: string;
}


interface CustomBox {
  id: string;
  icon?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  link?: string;
}

interface CustomChecklistGroup {
  id: string;
  icon?: string;
  title: string;
  items: string[];
}

interface CustomHighlightBanner {
  icon?: string;
  title?: string;
  text?: string;
  link?: string;
}

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
  slug: string;
  metaTitle?: string; metaDesc?: string; metaKeywords?: string; ogImage?: string;
  heroBadge?: string; heroTitle?: string; heroSub?: string; heroBgImage?: string; heroIso?: string;
  heroBtn1Text?: string; heroBtn1Link?: string; heroBtn2Text?: string; heroBtn2Phone?: string;
  heroBtn3Text?: string; heroBtn3WA?: string; heroBadgesList?: string;
  title?: string; label?: string; p1?: string; p2?: string;
  aboutTitle?: string; agencyTitle?: string; agencyOfficeTitle?: string; officeAddressText?: string;
  processTag?: string; processTitle?: string;
  step1Title?: string; step1Desc?: string; step2Title?: string; step2Desc?: string;
  step3Title?: string; step3Desc?: string; step4Title?: string; step4Desc?: string;
  step5Title?: string; step5Desc?: string;
  diffTitle?: string; diffCol0Header?: string; diffCol1Header?: string; diffCol2Header?: string;
  docsTitle?: string; docsSubtitle?: string;
  tier1Name?: string; tier1Price?: string; tier1Unit?: string; tier1Delivery?: string;
  tier2Name?: string; tier2Badge?: string; tier2Price?: string; tier2Unit?: string; tier2Delivery?: string;
  tier3Name?: string; tier3Price?: string; tier3Unit?: string; tier3Delivery?: string;
  currencySymbol?: string; pricingTitle?: string; pricingAddons?: string; includesTitle?: string;
  whyChooseTitle?: string; otherSvcsTitle?: string; otherSvcsSubtitle?: string;
  certSampleTitle?: string; certSampleSubtitle?: string;
  reviewsTitle?: string; faqsTitle?: string;
  allLanguagesTitle?: string; certificationsTitle?: string; ctaTitle?: string; ctaSubtitle?: string;
  sidebarPhone1?: string; sidebarPhone2?: string; sidebarBtn1Text?: string; sidebarBtn1Link?: string;
  sidebarBtn2Text?: string; sidebarBtn2WA?: string; sidebarCtaTitle?: string;
  sidebarCitiesTitle?: string; sidebarLangsTitle?: string; sidebarOtherSvcsTitle?: string;
  trustCard1?: string; trustCard2?: string; trustCard3?: string;
  trustCard4?: string; trustCard5?: string; trustCard6?: string;
  contentOverrides?: Record<string, any>;
  faqs?: Array<{q: string; a: string}>;
  reviews?: Array<{stars: string; text: string; name: string; role: string; avatar: string}>;
  isActive?: boolean;
}

const emptyOD = (): OD => ({ slug: '', isActive: true });


const DEFAULT_SVC_CITY_SECTIONS = [
  { id: 'about', label: '📖 Overview & Agency Overview', tab: 'about_agency' },
  { id: 'process', label: '⚡ 5-Step Translation Process', tab: 'process' },
  { id: 'agency', label: '🏢 Agency Trust Badges & Office', tab: 'about_agency' },
  { id: 'other_services', label: '🌐 Other 15 Services Grid', tab: 'why_sidebar' },
  { id: 'diff', label: '⚖️ Comparison Table', tab: 'comparison_docs' },
  { id: 'docs', label: '📄 Documents We Handle', tab: 'comparison_docs' },
  { id: 'certs', label: '📑 Certificate Samples', tab: 'pricing_samples' },
  { id: 'languages', label: '🌐 All Languages Available', tab: 'hero' },
  { id: 'other_cities', label: '🗺️ Available Across India', tab: 'why_sidebar' },
  { id: 'pricing', label: '💰 3-Tier Pricing Packages', tab: 'pricing_samples' },
  { id: 'why', label: '🏆 Why Choose Language Guru', tab: 'why_sidebar' },
  { id: 'reviews', label: '⭐ Client Reviews & Ratings', tab: 'reviews_faqs' },
  { id: 'faqs', label: '❓ Frequently Asked Questions', tab: 'reviews_faqs' },
];

const TABS = [
  { id: 'hero', label: '🎯 1. Hero & Badges' },
  { id: 'process', label: '⚙️ 2. 5-Step Process' },
  { id: 'about_agency', label: '📖 3. Overview & Agency' },
  { id: 'comparison_docs', label: '📊 4. Comparison & Docs' },
  { id: 'pricing_samples', label: '💰 5. Pricing & Samples' },
  { id: 'why_sidebar', label: '🏅 6. Why Us & Other Services' },
  { id: 'reviews_faqs', label: '⭐ 7. Reviews & FAQs' },
  { id: 'cta_seo', label: '🔍 8. CTA & SEO' },
  { id: 'layout_order', label: '📑 9. Section Order & Layout' },
];

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const svcKey = sp.get('service') || '';
  const cityKey = sp.get('city') || '';

  const [cities, setCities] = useState<CityItem[]>([]);
  const [svcName, setSvcName] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  const [form, setForm] = useState<OD>(emptyOD());
  const [aboutPs, setAboutPs] = useState<string[]>(['', '']);
  const [agencyPs, setAgencyPs] = useState<string[]>(['']);
  const [diffRows, setDiffRows] = useState<Array<{feat: string; std: string; our: string}>>([]);
  const [docCats, setDocCats] = useState<any[]>([]);
  const [priceTiers, setPriceTiers] = useState<any[]>([]);
  const [whyList, setWhyList] = useState<any[]>([]);
  const [otherServices, setOtherServices] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<Array<{q: string; a: string}>>([]);
  const [trustCards, setTrustCards] = useState<{ [key: string]: string }>({
    trustCard1: '',
    trustCard2: '',
    trustCard3: '',
    trustCard4: '',
    trustCard5: '',
    trustCard6: '',
  });
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
    if (!svcKey) return;
    fetch(`${API_URL}/api/v1/services/${svcKey}/cities`, { headers: hdr, credentials: 'include' })
      .then(r => r.json()).then(d => { if (d.success) setCities(d.data); }).catch(() => {});
    fetch(`${API_URL}/api/v1/services`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (d.success) { const s = d.data?.find((x: any) => x.key === svcKey); if (s) setSvcName(s.name); } }).catch(() => {});
  }, [svcKey]);

  useEffect(() => {
    if (!svcKey || !cityKey) { setLoading(false); return; }
    setLoading(true); setError(null);
    fetch(`${API_URL}/api/v1/services/${svcKey}/cities/${cityKey}`, { headers: hdr, credentials: 'include' })
      .then(r => r.json()).then(json => {
        if (json.success) {
          setExists(json.exists || false);
          const d: OD = json.data || emptyOD();
          const co = d.contentOverrides || {};
          setForm(d);
          setAboutPs(Array.isArray(co.aboutParagraphs) && co.aboutParagraphs.length ? co.aboutParagraphs : ['', '']);
          setAgencyPs(Array.isArray(co.agencyParagraphs) && co.agencyParagraphs.length ? co.agencyParagraphs : ['']);
          setDiffRows(Array.isArray(co.diffRows) ? co.diffRows : []);
          setDocCats(Array.isArray(co.docCategories) ? co.docCategories : []);
          setPriceTiers(Array.isArray(co.pricingTiers) ? co.pricingTiers : []);
          setWhyList(Array.isArray(co.whyChooseList) ? co.whyChooseList : []);
          setOtherServices(Array.isArray(co.otherServicesList) ? co.otherServicesList : []);
          setCerts(Array.isArray(co.sampleCertsList) ? co.sampleCertsList : []);
          setReviews(Array.isArray(d.reviews) ? d.reviews : []);
          setFaqs(Array.isArray(d.faqs) ? d.faqs : []);
          setTrustCards({
            trustCard1: d.trustCard1 || co.trustCard1 || '',
            trustCard2: d.trustCard2 || co.trustCard2 || '',
            trustCard3: d.trustCard3 || co.trustCard3 || '',
            trustCard4: d.trustCard4 || co.trustCard4 || '',
            trustCard5: d.trustCard5 || co.trustCard5 || '',
            trustCard6: d.trustCard6 || co.trustCard6 || '',
          });
        }
      }).catch(() => setError('Failed to load city data.')).finally(() => setLoading(false));
  }, [svcKey, cityKey]);

  const set = (k: keyof OD, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const curCity = cities.find(c => c.key === cityKey);
  const defaultCitySlug = `${svcKey}-translation-services-in-${cityKey}`;
  const liveSlug = form.slug || defaultCitySlug;

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingHeroBg(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: tok ? { Authorization: `Bearer ${tok}` } : {},
        body: data
      });
      const json = await res.json();
      if (json.success && json.url) {
        set('heroBgImage', json.url);
      } else {
        alert(json.message || 'Image upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading hero image');
    } finally {
      setUploadingHeroBg(false);
    }
  };

  
  /* ── Section Ordering & Custom Sections Handlers ── */
  const getEffectiveSectionOrder = () => {
    const defaultIds = DEFAULT_SVC_CITY_SECTIONS.map(s => s.id);
    const customIds = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => cs.id);
    const savedOrder: string[] = form.contentOverrides?.sectionOrder || [];

    const combined: string[] = [];
    savedOrder.forEach(id => {
      if (defaultIds.includes(id) || customIds.includes(id)) {
        combined.push(id);
      }
    });
    defaultIds.forEach(id => {
      if (!combined.includes(id)) combined.push(id);
    });
    customIds.forEach(id => {
      if (!combined.includes(id)) combined.push(id);
    });
    return combined;
  };

  const moveSection = (secId: string, dir: 'up' | 'down') => {
    const currentOrder = getEffectiveSectionOrder();
    const idx = currentOrder.indexOf(secId);
    if (idx === -1) return;
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(idx, 1);
    nextOrder.splice(targetIdx, 0, moved);
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      sectionOrder: nextOrder
    });
  };

  const toggleSectionVisibility = (secId: string) => {
    const hidden: string[] = form.contentOverrides?.hiddenSections || [];
    const nextHidden = hidden.includes(secId)
      ? hidden.filter(id => id !== secId)
      : [...hidden, secId];
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      hiddenSections: nextHidden
    });
  };

    const addCustomSection = (afterSectionId?: string) => {
    const cityName = curCity?.name || 'City';
    const newId = 'custom_' + Date.now();
    const newSec: CustomSection = {
      id: newId,
      title: 'New Section for ' + svcName + ' in ' + cityName,
      subtitle: 'Section subtitle description',
      paragraphs: ['Paragraph 1 content details for this new custom section in ' + cityName + '.'],
      ctaText: 'Need translation assistance in ' + cityName + '?',
      ctaBtnText: '📋 Get Instant Quote',
      ctaBtnLink: '/quote',
      insertedAfter: afterSectionId
    };
    const currentCustoms = [...((form.contentOverrides?.customSections as CustomSection[]) || []), newSec];

    const currentOrder = getEffectiveSectionOrder();
    const nextOrder = [...currentOrder];
    if (afterSectionId && nextOrder.includes(afterSectionId)) {
      const idx = nextOrder.indexOf(afterSectionId);
      nextOrder.splice(idx + 1, 0, newId);
    } else {
      nextOrder.push(newId);
    }

    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms,
      sectionOrder: nextOrder
    });
  };

  const removeCustomSection = (secId: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).filter(cs => cs.id !== secId);
    const currentOrder = getEffectiveSectionOrder().filter(id => id !== secId);
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms,
      sectionOrder: currentOrder
    });
  };

  const updateCustomSection = (secId: string, field: keyof CustomSection, val: any) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        return { ...cs, [field]: val };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const addCustomSectionParagraph = (secId: string) => {
    const cityName = curCity?.name || 'City';
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        return { ...cs, paragraphs: [...(cs.paragraphs || []), 'New paragraph content in ' + cityName + '.'] };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const removeCustomSectionParagraph = (secId: string, pIdx: number) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const nextPs = [...(cs.paragraphs || [])];
        nextPs.splice(pIdx, 1);
        return { ...cs, paragraphs: nextPs };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const updateCustomSectionParagraph = (secId: string, pIdx: number, val: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const nextPs = [...(cs.paragraphs || [])];
        nextPs[pIdx] = val;
        return { ...cs, paragraphs: nextPs };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const addCustomSectionBox = (secId: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const boxes = cs.boxes || [];
        const newBox: CustomBox = {
          id: 'box_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          icon: '📋',
          badge: '',
          title: 'Notarization',
          subtitle: '₹200/page · 1-2 days',
          link: '/services/notarization'
        };
        return { ...cs, boxes: [...boxes, newBox] };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const updateCustomSectionBox = (secId: string, boxId: string, field: keyof CustomBox, val: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const boxes = (cs.boxes || []).map(b => b.id === boxId ? { ...b, [field]: val } : b);
        return { ...cs, boxes };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const removeCustomSectionBox = (secId: string, boxId: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const boxes = (cs.boxes || []).filter(b => b.id !== boxId);
        return { ...cs, boxes };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const updateCustomSectionBanner = (secId: string, field: keyof CustomHighlightBanner, val: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const hb = { ...(cs.highlightBanner || {}), [field]: val };
        return { ...cs, highlightBanner: hb };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  /* ── Custom Section Checklist Group Handlers ── */
  const addCustomSectionChecklistGroup = (secId: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const groups = cs.checklistGroups || [];
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
        return { ...cs, checklistGroups: [...groups, newGroup] };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const updateCustomSectionChecklistGroup = (secId: string, groupId: string, field: keyof CustomChecklistGroup, val: any) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const groups = (cs.checklistGroups || []).map(g => g.id === groupId ? { ...g, [field]: val } : g);
        return { ...cs, checklistGroups: groups };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };

  const removeCustomSectionChecklistGroup = (secId: string, groupId: string) => {
    const currentCustoms = ((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const groups = (cs.checklistGroups || []).filter(g => g.id !== groupId);
        return { ...cs, checklistGroups: groups };
      }
      return cs;
    });
    set('contentOverrides', {
      ...(form.contentOverrides || {}),
      customSections: currentCustoms
    });
  };


    const renderSectionHeader = (
    sectionId: string,
    title: string,
    options?: {
      onAddParagraph?: () => void;
      canDelete?: boolean;
      onDelete?: () => void;
    }
  ) => {
    const currentOrder = getEffectiveSectionOrder();
    const idx = currentOrder.indexOf(sectionId);
    const isHidden = (form.contentOverrides?.hiddenSections || []).includes(sectionId);
    const isFirst = idx === 0;
    const isLast = idx === currentOrder.length - 1;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--bd)', margin: 0, fontFamily: "'Nunito', sans-serif" }}>{title}</h4>
          <span style={{
            fontSize: '11px',
            background: isHidden ? '#fee2e2' : '#eff6ff',
            color: isHidden ? '#991b1b' : '#1e40af',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '700',
            border: '1px solid ' + (isHidden ? '#fca5a5' : '#bfdbfe')
          }}>
            {isHidden ? '🚫 Hidden on Live Page' : ('Position #' + (idx + 1) + ' of ' + currentOrder.length)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => moveSection(sectionId, 'up')}
            disabled={isFirst}
            title="Move Section Earlier on Page"
            style={{
              background: isFirst ? '#f8fafc' : '#fff',
              color: isFirst ? '#94a3b8' : '#1e293b',
              border: '1px solid #cbd5e1',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            ⬆️ Up
          </button>
          <button
            type="button"
            onClick={() => moveSection(sectionId, 'down')}
            disabled={isLast}
            title="Move Section Later on Page"
            style={{
              background: isLast ? '#f8fafc' : '#fff',
              color: isLast ? '#94a3b8' : '#1e293b',
              border: '1px solid #cbd5e1',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: isLast ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            ⬇️ Down
          </button>
          <button
            type="button"
            onClick={() => toggleSectionVisibility(sectionId)}
            title={isHidden ? 'Unhide / Display on Page' : 'Hide this section on frontend'}
            style={{
              background: isHidden ? '#f0fdf4' : '#fff',
              color: isHidden ? '#166534' : '#475569',
              border: '1px solid ' + (isHidden ? '#86efac' : '#cbd5e1'),
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {isHidden ? '👁️ Show' : '👁️ Hide'}
          </button>
          <button
            type="button"
            onClick={() => addCustomSection(sectionId)}
            title="Insert a brand new custom section immediately after this section"
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ➕ Insert Custom Section
          </button>
          {options?.onAddParagraph && (
            <button
              type="button"
              onClick={options.onAddParagraph}
              style={{
                background: 'var(--bp)',
                color: 'var(--bd)',
                border: '1px solid var(--bb)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              + Add Paragraph
            </button>
          )}
          {options?.canDelete && options?.onDelete && (
            <button
              type="button"
              onClick={options.onDelete}
              title="Delete this section"
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCustomSectionEditorCard = (cs: CustomSection) => (
    <div key={cs.id} style={{ ...cS, border: '2px solid #93c5fd', background: '#f0f7ff', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #bfdbfe', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e40af', margin: 0, fontFamily: "'Nunito', sans-serif" }}>Custom Section: {cs.title || 'Untitled'}</h4>
          <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', border: '1px solid #bfdbfe' }}>
            CUSTOM SECTION
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => moveSection(cs.id, 'up')}
            style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
          >
            ⬆️ Up
          </button>
          <button
            type="button"
            onClick={() => moveSection(cs.id, 'down')}
            style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
          >
            ⬇️ Down
          </button>
          <button
            type="button"
            onClick={() => addCustomSectionParagraph(cs.id)}
            style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
          >
            + Add Paragraph
          </button>
          <button
            type="button"
            onClick={() => addCustomSectionBox(cs.id)}
            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
          >
            + Add Box / Card
          </button>
          <button
            type="button"
            onClick={() => addCustomSectionChecklistGroup(cs.id)}
            style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
          >
            + Add Category Checklist
          </button>
          <button
            type="button"
            onClick={() => removeCustomSection(cs.id)}
            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
          >
            🗑️ Delete Section
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={lS}>Section Heading / Title</label>
          <input
            style={{ ...iS, background: '#fff' }}
            value={cs.title}
            onChange={e => updateCustomSection(cs.id, 'title', e.target.value)}
            placeholder={`e.g. Specialized Notary & Attestation Services in ${(curCity?.name || cityKey)}`}
          />
        </div>
        <div>
          <label style={lS}>Section Subtitle (Optional)</label>
          <input
            style={{ ...iS, background: '#fff' }}
            value={cs.subtitle || ''}
            onChange={e => updateCustomSection(cs.id, 'subtitle', e.target.value)}
            placeholder="e.g. Fast-track government and embassy attestation"
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={lS}>Paragraphs</label>
          <button
            type="button"
            onClick={() => addCustomSectionParagraph(cs.id)}
            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700', cursor: 'pointer' }}
          >
            + Add Paragraph
          </button>
        </div>
        {(cs.paragraphs || []).map((p, pIdx) => (
          <div key={pIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginTop: '8px', minWidth: '40px' }}>
              P{pIdx + 1}:
            </span>
            <textarea
              rows={3}
              style={{ ...iS, resize: 'vertical', background: '#fff' }}
              value={p}
              onChange={e => updateCustomSectionParagraph(cs.id, pIdx, e.target.value)}
              placeholder="Write paragraph content here..."
            />
            {cs.paragraphs.length > 1 && (
              <button
                type="button"
                onClick={() => removeCustomSectionParagraph(cs.id, pIdx)}
                title="Delete paragraph"
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginTop: '4px' }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Cards / Service Boxes Grid */}
      <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📦 Interactive Cards / Boxes Grid</span>
              <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                {(cs.boxes || []).length} Cards
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Clicking a card on the frontend redirects to the specified page URL.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showBoxes !== false ? '#166534' : '#64748b', background: cs.showBoxes !== false ? '#dcfce7' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: cs.showBoxes !== false ? '1px solid #86efac' : '1px solid #cbd5e1' }}>
              <input
                type="checkbox"
                checked={cs.showBoxes !== false}
                onChange={e => updateCustomSection(cs.id, 'showBoxes' as any, e.target.checked)}
                style={{ cursor: 'pointer', margin: 0 }}
              />
              <span>{cs.showBoxes !== false ? '✓ Show in Frontend' : '✕ Hidden in Frontend'}</span>
            </label>
            <button
              type="button"
              onClick={() => addCustomSectionBox(cs.id)}
              style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
            >
              + Add Box / Card
            </button>
          </div>
        </div>

        {(cs.boxes || []).length === 0 ? (
          <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '11.5px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
            No boxes added yet. Click "+ Add Box / Card" to display clickable cards with destination links.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {(cs.boxes || []).map((box, bIdx) => (
              <div key={box.id || bIdx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af' }}>Card #{bIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomSectionBox(cs.id, box.id)}
                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    ✕ Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  <div>
                    <label style={{ ...lS, fontSize: '10px' }}>Icon / Emoji</label>
                    <input
                      style={{ ...iS, padding: '5px 8px', fontSize: '12px' }}
                      value={box.icon || ''}
                      onChange={e => updateCustomSectionBox(cs.id, box.id, 'icon', e.target.value)}
                      placeholder="e.g. 📋, 🏛️, 🌍"
                    />
                  </div>
                  <div>
                    <label style={{ ...lS, fontSize: '10px' }}>Badge (e.g. DE, CA)</label>
                    <input
                      style={{ ...iS, padding: '5px 8px', fontSize: '12px' }}
                      value={box.badge || ''}
                      onChange={e => updateCustomSectionBox(cs.id, box.id, 'badge', e.target.value)}
                      placeholder="e.g. DE, CA, AU"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <label style={{ ...lS, fontSize: '10px' }}>Card Title</label>
                  <input
                    style={{ ...iS, padding: '5px 8px', fontSize: '12px', fontWeight: '700' }}
                    value={box.title}
                    onChange={e => updateCustomSectionBox(cs.id, box.id, 'title', e.target.value)}
                    placeholder="e.g. Notarization or Germany PR"
                  />
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <label style={{ ...lS, fontSize: '10px' }}>Subtitle / Price / Details</label>
                  <input
                    style={{ ...iS, padding: '5px 8px', fontSize: '11.5px' }}
                    value={box.subtitle || ''}
                    onChange={e => updateCustomSectionBox(cs.id, box.id, 'subtitle', e.target.value)}
                    placeholder="e.g. ₹200/page · 1-2 days"
                  />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: '10px' }}>🔗 Redirect URL / Page Link</label>
                  <input
                    style={{ ...iS, padding: '5px 8px', fontSize: '11.5px', fontFamily: 'monospace', color: '#1d4ed8' }}
                    value={box.link || ''}
                    onChange={e => updateCustomSectionBox(cs.id, box.id, 'link', e.target.value)}
                    placeholder="e.g. /services/notarization or /quote"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Checklist / Document Groups Grid */}
      <div style={{ background: '#fff', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📋 Category Checklist / Document Groups Grid</span>
              <span style={{ fontSize: '10.5px', background: '#ffedd5', color: '#c2410c', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                {(cs.checklistGroups || []).length} Groups
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Renders multi-column categorized cards with checkmarked (✓) bullet items (e.g. Court & Litigation, Corporate Contracts, Real Estate, IP).
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showChecklists !== false ? '#c2410c' : '#64748b', background: cs.showChecklists !== false ? '#ffedd5' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: cs.showChecklists !== false ? '1px solid #fed7aa' : '1px solid #cbd5e1' }}>
              <input
                type="checkbox"
                checked={cs.showChecklists !== false}
                onChange={e => updateCustomSection(cs.id, 'showChecklists' as any, e.target.checked)}
                style={{ cursor: 'pointer', margin: 0 }}
              />
              <span>{cs.showChecklists !== false ? '✓ Show in Frontend' : '✕ Hidden in Frontend'}</span>
            </label>
            <button
              type="button"
              onClick={() => addCustomSectionChecklistGroup(cs.id)}
              style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
            >
              + Add Checklist Group
            </button>
          </div>
        </div>

        {(cs.checklistGroups || []).length === 0 ? (
          <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '11.5px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
            No checklist groups added yet. Click "+ Add Checklist Group" to display categorized checkmarked items.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {(cs.checklistGroups || []).map((grp, gIdx) => {
              const rawItems = Array.isArray(grp.items) ? grp.items.join('\n') : (typeof grp.items === 'string' ? grp.items : '');
              const lineCount = rawItems.split('\n').filter((x: string) => x.trim().length > 0).length;
              return (
                <div key={grp.id || gIdx} style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e' }}>Group #{gIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomSectionChecklistGroup(cs.id, grp.id)}
                      style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', cursor: 'pointer' }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '6px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ ...lS, fontSize: '10px' }}>Icon</label>
                      <input
                        style={{ ...iS, padding: '5px 8px', fontSize: '14px', textAlign: 'center', background: '#fff' }}
                        value={grp.icon || '✓'}
                        onChange={e => updateCustomSectionChecklistGroup(cs.id, grp.id, 'icon', e.target.value)}
                        placeholder="⚖️"
                      />
                    </div>
                    <div>
                      <label style={{ ...lS, fontSize: '10px' }}>Group Heading / Title</label>
                      <input
                        style={{ ...iS, padding: '5px 8px', fontSize: '12px', fontWeight: '700', background: '#fff' }}
                        value={grp.title}
                        onChange={e => updateCustomSectionChecklistGroup(cs.id, grp.id, 'title', e.target.value)}
                        placeholder="e.g. Court & Litigation"
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ ...lS, fontSize: '10px', margin: 0 }}>Checklist Items (1 per line)</label>
                      <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: '700' }}>✓ {lineCount} items</span>
                    </div>
                    <textarea
                      rows={5}
                      style={{ ...iS, padding: '6px 8px', fontSize: '11.5px', resize: 'vertical', background: '#fff', fontFamily: 'monospace' }}
                      value={rawItems}
                      onChange={e => {
                        const arr = e.target.value.split('\n');
                        updateCustomSectionChecklistGroup(cs.id, grp.id, 'items', arr);
                      }}
                      placeholder={"Court orders, judgments, decrees\nArbitration awards & notices\nLegal notices & summons\nFIR translations & police reports"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Highlight Note / Attestation Chain Banner */}
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1a3a6b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔗 Optional Highlight Note / Process Chain Banner</span>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showBanner !== false ? '#1e40af' : '#64748b', background: cs.showBanner !== false ? '#dbeafe' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: cs.showBanner !== false ? '1px solid #bfdbfe' : '1px solid #cbd5e1' }}>
            <input
              type="checkbox"
              checked={cs.showBanner !== false}
              onChange={e => updateCustomSectionBanner(cs.id, 'showBanner' as any, e.target.checked ? 'true' : 'false')}
              style={{ cursor: 'pointer', margin: 0 }}
            />
            <span>{cs.showBanner !== false ? '✓ Show Banner in Frontend' : '✕ Hidden'}</span>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <label style={{ ...lS, fontSize: '10px' }}>Icon</label>
            <input
              style={{ ...iS, padding: '5px 8px', fontSize: '12px' }}
              value={cs.highlightBanner?.icon || '🔗'}
              onChange={e => updateCustomSectionBanner(cs.id, 'icon', e.target.value)}
              placeholder="🔗"
            />
          </div>
          <div>
            <label style={{ ...lS, fontSize: '10px' }}>Banner Title</label>
            <input
              style={{ ...iS, padding: '5px 8px', fontSize: '12px', fontWeight: '700' }}
              value={cs.highlightBanner?.title || ''}
              onChange={e => updateCustomSectionBanner(cs.id, 'title', e.target.value)}
              placeholder={`e.g. End-to-End Attestation Chain in ${(curCity?.name || cityKey)}`}
            />
          </div>
          <div>
            <label style={{ ...lS, fontSize: '10px' }}>Redirect Link (Optional)</label>
            <input
              style={{ ...iS, padding: '5px 8px', fontSize: '12px', fontFamily: 'monospace' }}
              value={cs.highlightBanner?.link || ''}
              onChange={e => updateCustomSectionBanner(cs.id, 'link', e.target.value)}
              placeholder="e.g. /quote"
            />
          </div>
        </div>
        <div>
          <label style={{ ...lS, fontSize: '10px' }}>Banner Text / Process Chain Sequence</label>
          <textarea
            rows={2}
            style={{ ...iS, padding: '6px 8px', fontSize: '12px', resize: 'vertical' }}
            value={cs.highlightBanner?.text || ''}
            onChange={e => updateCustomSectionBanner(cs.id, 'text', e.target.value)}
            placeholder="e.g. Translation → Notarization → HRD / Home Dept → MEA Apostille → Embassy Attestation → MOFA (Gulf)"
          />
        </div>
      </div>

      {/* CTA Banner Settings */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#1a3a6b' }}>
            🔘 Optional Action Bar (Sub-CTA)
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cs.showCta !== false ? '#9333ea' : '#64748b', background: cs.showCta !== false ? '#f3e8ff' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: cs.showCta !== false ? '1px solid #d8b4fe' : '1px solid #cbd5e1' }}>
            <input
              type="checkbox"
              checked={cs.showCta !== false}
              onChange={e => updateCustomSection(cs.id, 'showCta' as any, e.target.checked)}
              style={{ cursor: 'pointer', margin: 0 }}
            />
            <span>{cs.showCta !== false ? '✓ Show CTA in Frontend' : '✕ Hidden'}</span>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ ...lS, fontSize: '10.5px' }}>CTA Prompt Text</label>
            <input
              style={iS}
              value={cs.ctaText || ''}
              onChange={e => updateCustomSection(cs.id, 'ctaText', e.target.value)}
              placeholder="e.g. Need this service immediately?"
            />
          </div>
          <div>
            <label style={{ ...lS, fontSize: '10.5px' }}>Button Label</label>
            <input
              style={iS}
              value={cs.ctaBtnText || ''}
              onChange={e => updateCustomSection(cs.id, 'ctaBtnText', e.target.value)}
              placeholder="e.g. Get Instant Quote"
            />
          </div>
          <div>
            <label style={{ ...lS, fontSize: '10.5px' }}>Button Link</label>
            <input
              style={iS}
              value={cs.ctaBtnLink || ''}
              onChange={e => updateCustomSection(cs.id, 'ctaBtnLink', e.target.value)}
              placeholder="e.g. /quote"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderInlineCustomSections = (afterSecId: string) => {
    const customs = ((form.contentOverrides?.customSections as CustomSection[]) || []);
    const order = getEffectiveSectionOrder();
    const targetCustoms = customs.filter(cs => {
      if (cs.insertedAfter === afterSecId) return true;
      const csIdx = order.indexOf(cs.id);
      const afterIdx = order.indexOf(afterSecId);
      return csIdx === afterIdx + 1 && !cs.insertedAfter;
    });

    if (targetCustoms.length === 0) return null;
    return (
      <div style={{ marginTop: '8px', marginBottom: '16px' }}>
        {targetCustoms.map(cs => renderCustomSectionEditorCard(cs))}
      </div>
    );
  };

  const handleSave = async () => {
    if (!cityKey) { setError('Select a city first.'); return; }
    setSaving(true); setError(null); setSuccess(null);
    const payload = {
      ...form,
      ...trustCards,
      slug: form.slug || defaultCitySlug,
      contentOverrides: {
        ...(form.contentOverrides || {}),
        aboutParagraphs: aboutPs.filter(p => p.trim()),
        agencyParagraphs: agencyPs.filter(p => p.trim()),
        diffRows,
        docCategories: docCats,
        pricingTiers: priceTiers,
        whyChooseList: whyList,
        otherServicesList: otherServices,
        sampleCertsList: certs,
        ...trustCards,
        diffTitle: form.diffTitle,
        docsTitle: form.docsTitle,
        docsSubtitle: form.docsSubtitle,
        otherSvcsTitle: form.otherSvcsTitle,
        otherSvcsSubtitle: form.otherSvcsSubtitle,
        certSampleTitle: form.certSampleTitle,
        certSampleSubtitle: form.certSampleSubtitle,
        pricingTitle: form.pricingTitle,
        whyChooseTitle: form.whyChooseTitle,
        aboutTitle: form.aboutTitle,
        agencyTitle: form.agencyTitle,
      },
      reviews,
      faqs,
      isActive: form.isActive !== false
    };

    try {
      const res = await fetch(`${API_URL}/api/v1/services/${svcKey}/cities/${cityKey}`, {
        method: 'PUT',
        headers: hdr,
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Saved successfully! Live at /services/${payload.slug}`);
        setExists(true);
        setCities(prev => prev.map(c => c.key === cityKey ? { ...c, hasOverride: true, overrideSlug: payload.slug } : c));
      } else {
        setError(json.message || 'Failed to save city page.');
      }
    } catch {
      setError('Server connection error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset this city to the base service template? Custom overrides will be deleted.')) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/services/${svcKey}/cities/${cityKey}`, {
        method: 'DELETE',
        headers: hdr,
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Reset to base template.');
        setExists(false);
        setCities(prev => prev.map(c => c.key === cityKey ? { ...c, hasOverride: false, overrideSlug: undefined } : c));
        // Reload default stub
        const r = await fetch(`${API_URL}/api/v1/services/${svcKey}/cities/${cityKey}`, { headers: hdr, credentials: 'include' });
        const d = await r.json();
        if (d.success) {
          setForm(d.data || emptyOD());
          const co = d.data?.contentOverrides || {};
          setAboutPs(co.aboutParagraphs || ['', '']);
          setAgencyPs(co.agencyParagraphs || ['']);
          setDiffRows(co.diffRows || []);
          setDocCats(co.docCategories || []);
          setPriceTiers(co.pricingTiers || []);
          setWhyList(co.whyChooseList || []);
          setOtherServices(co.otherServicesList || []);
          setCerts(co.sampleCertsList || []);
          setReviews(d.data?.reviews || []);
          setFaqs(d.data?.faqs || []);
          setTrustCards({
            trustCard1: d.data?.trustCard1 || co.trustCard1 || '',
            trustCard2: d.data?.trustCard2 || co.trustCard2 || '',
            trustCard3: d.data?.trustCard3 || co.trustCard3 || '',
            trustCard4: d.data?.trustCard4 || co.trustCard4 || '',
            trustCard5: d.data?.trustCard5 || co.trustCard5 || '',
            trustCard6: d.data?.trustCard6 || co.trustCard6 || '',
          });
        }
      }
    } catch {
      setError('Failed to reset.');
    }
  };

  const filtCities = cities.filter(c => !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.key.includes(citySearch.toLowerCase()));

  const iS: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' };
  const lS: React.CSSProperties = { display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' };
  const cS: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '16px' };
  const hS: React.CSSProperties = { fontSize: '14px', fontWeight: '800', color: '#1a3a6b', marginBottom: '16px' };
  const aBtnS: React.CSSProperties = { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
  const dBtnS: React.CSSProperties = { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'inherit' }}>
      <style>{`
        .city-cms-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 20px;
          align-items: flex-start;
        }
        .city-cms-sidebar {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          position: sticky;
          top: 20px;
        }
        .city-cms-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        .city-cms-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .city-cms-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .city-cms-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .city-cms-save-bar {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          position: sticky;
          bottom: 20px;
          z-index: 40;
        }
        @media (max-width: 1024px) {
          .city-cms-layout {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .city-cms-sidebar {
            position: static !important;
          }
          .city-cms-sidebar-list {
            max-height: 220px !important;
          }
          .city-cms-grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .city-cms-grid-3, .city-cms-grid-2, .city-cms-grid-4 {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .city-cms-tabs {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 8px !important;
          }
          .city-cms-tabs button {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .city-cms-save-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 12px 14px !important;
          }
          .city-cms-save-bar > div:last-child {
            display: flex !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .city-cms-save-bar button {
            flex: 1 !important;
            padding: 10px 14px !important;
          }
        }
      `}</style>
      <TopNav title="City Service Customizer" />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Header Breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
            <span style={{ cursor: 'pointer', color: '#1d4ed8' }} onClick={() => router.push('/dashboard/services')}>← Services</span>
            {svcKey && <span> / {svcName || svcKey}</span>}
            {cityKey && <span> / 📍 {curCity?.name || cityKey}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a3a6b', margin: 0 }}>📍 City Pages: {svcName || svcKey}</h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Customize content, hero, pricing, FAQs, and SEO for each city independently.</p>
            </div>
            {cityKey && (
              <a href={siteLink('/services/' + liveSlug)} target="_blank" rel="noopener noreferrer"
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔗 Open Live Page</span>
              </a>
            )}
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}><span>⚠️ {error}</span><button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#991b1b' }}>✕</button></div>}
        {success && <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}><span>✅ {success}</span><button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#166534' }}>✕</button></div>}

        <div className="city-cms-layout">

          {/* Left: City Selector */}
          <div className="city-cms-sidebar">
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1a3a6b', marginBottom: '8px' }}>📍 Select City</div>
              <input type="text" placeholder="Search cities..." value={citySearch} onChange={e=>setCitySearch(e.target.value)} style={{ ...iS, fontSize: '12px', padding: '7px 10px' }} />
            </div>
            <div className="city-cms-sidebar-list" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
              {filtCities.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading cities...</div>}
              {filtCities.map(city => (
                <button key={city.key}
                  onClick={() => router.push(`/dashboard/services/city?service=${svcKey}&city=${city.key}`)}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: city.key === cityKey ? '#eff6ff' : 'transparent', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: city.key === cityKey ? '800' : '600', color: city.key === cityKey ? '#1d4ed8' : '#1a3a6b' }}>{city.name}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{city.key}</div>
                  </div>
                  {city.hasOverride && <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>✓ Custom</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Editor */}
          <div>
            {!cityKey ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a3a6b', marginBottom: '8px' }}>Select a City</div>
                <div style={{ fontSize: '13px' }}>Choose any city from the left panel to customize its page content, SEO, and slug.</div>
              </div>
            ) : loading ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
            ) : (
              <>
                {/* Editor Header Bar */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1a3a6b' }}>{svcName} in {curCity?.name || cityKey}</h2>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                      URL: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#1a3a6b', fontWeight: '700' }}>/services/{liveSlug}</code>
                      <span style={{ marginLeft: '8px', background: exists ? '#dcfce7' : '#fef3c7', color: exists ? '#166534' : '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>{exists ? '✓ Live (Customized)' : 'Using Base Template'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {exists && <button onClick={handleReset} style={{ background: '#fff', color: '#991b1b', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>↩ Reset</button>}
                    <button onClick={handleSave} disabled={saving} style={{ background: '#1a3a6b', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Saving...' : '💾 Save City Page'}</button>
                  </div>
                </div>

                {/* Page Active Toggle */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" id="ia" checked={form.isActive !== false} onChange={e => set('isActive', e.target.checked)} />
                  <label htmlFor="ia" style={{ fontSize: '13px', fontWeight: '700', color: '#1a3a6b', cursor: 'pointer' }}>✅ Page Active (visible on frontend)</label>
                </div>

                {/* Tabs */}
                <div className="city-cms-tabs">
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1.5px solid', background: activeTab === tab.id ? '#1a3a6b' : '#fff', color: activeTab === tab.id ? '#fff' : '#1a3a6b', borderColor: activeTab === tab.id ? '#1a3a6b' : '#e2e8f0', cursor: 'pointer' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: HERO */}
                {activeTab === 'hero' && (
                  <>
                    <div style={cS}>
                      <h4 style={hS}>🎯 Hero Section</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Empty fields inherit from base service. Use <code>{'{city}'}</code> and <code>{'{service}'}</code> as placeholders.</p>
                      <div className="city-cms-grid-2">
                        <div><label style={lS}>Hero Badge Tag</label><input style={iS} value={form.heroBadge||''} onChange={e=>set('heroBadge',e.target.value)} placeholder={`#1 ${svcName} in ${curCity?.name||cityKey}`} /></div>
                        <div><label style={lS}>ISO Accreditation</label><input style={iS} value={form.heroIso||''} onChange={e=>set('heroIso',e.target.value)} placeholder="ISO 17100:2015 Certified" /></div>
                      </div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Hero Main Title (HTML allowed)</label><input style={iS} value={form.heroTitle||''} onChange={e=>set('heroTitle',e.target.value)} placeholder={`${svcName} in ${curCity?.name||'{city}'}`} /></div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Hero Subtitle</label><textarea rows={3} style={{ ...iS, resize: 'vertical' }} value={form.heroSub||''} onChange={e=>set('heroSub',e.target.value)} /></div>
                      <div className="city-cms-grid-3">
                        <div><label style={lS}>CTA Btn 1 Text</label><input style={iS} value={form.heroBtn1Text||''} onChange={e=>set('heroBtn1Text',e.target.value)} placeholder="Get Free Quote" /></div>
                        <div><label style={lS}>CTA Btn 1 Link</label><input style={iS} value={form.heroBtn1Link||''} onChange={e=>set('heroBtn1Link',e.target.value)} placeholder="/quote" /></div>
                        <div><label style={lS}>Phone Number</label><input style={iS} value={form.heroBtn2Phone||''} onChange={e=>set('heroBtn2Phone',e.target.value)} placeholder="+91-9312690490" /></div>
                      </div>
                      <div className="city-cms-grid-2">
                        <div><label style={lS}>Call Button Text</label><input style={iS} value={form.heroBtn2Text||''} onChange={e=>set('heroBtn2Text',e.target.value)} /></div>
                        <div><label style={lS}>WhatsApp Number</label><input style={iS} value={form.heroBtn3WA||''} onChange={e=>set('heroBtn3WA',e.target.value)} /></div>
                      </div>
                      <div>
                        <label style={lS}>Hero Feature Badges Bar (separated by |)</label>
                        <input style={iS} value={form.heroBadgesList||''} onChange={e=>set('heroBadgesList',e.target.value)} placeholder="✅ All Embassy Accepted | ⚡ 24-Hr Express | 🔏 Notarized & Apostilled" />
                      </div>
                    </div>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ ...hS, margin: 0 }}>🖼️ Hero Background Image</h4>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Upload a custom background image for this city page or provide an image URL.</p>
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

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                        <input style={{ ...iS, flex: 1, margin: 0, fontFamily: 'monospace' }} value={form.heroBgImage||''} onChange={e=>set('heroBgImage',e.target.value)} placeholder="https://... or /uploads/..." />
                        <label style={{ background: '#1a3a6b', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: uploadingHeroBg ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', opacity: uploadingHeroBg ? 0.7 : 1 }}>
                          <span>{uploadingHeroBg ? '⏳ Uploading...' : '📁 Upload Background Image'}</span>
                          <input type="file" accept="image/*" onChange={handleHeroBgUpload} style={{ display: 'none' }} disabled={uploadingHeroBg} />
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
                                {form.heroBadge || `${svcName} · ${curCity?.name || 'City'}`}
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.2, maxWidth: '80%' }}>
                                {(form.heroTitle || `${svcName} in ${curCity?.name || 'City'}`).replace(/\n/g, ' ')}
                              </div>
                              <div style={{ fontSize: '11.5px', opacity: 0.9, marginTop: '4px', maxWidth: '75%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {form.heroSub || 'Certified, notarized and embassy-approved services delivered across India.'}
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
                  </>
                )}

                {/* TAB 2: PROCESS */}
                {activeTab === 'process' && (
                  <div style={cS}>
                    {renderSectionHeader('process', '⚡ 5-Step Translation Process in ' + (curCity?.name || cityKey))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div><label style={lS}>Section Tag</label><input style={iS} value={form.processTag||''} onChange={e=>set('processTag',e.target.value)} placeholder="HOW IT WORKS" /></div>
                      <div><label style={lS}>Section Heading</label><input style={iS} value={form.processTitle||''} onChange={e=>set('processTitle',e.target.value)} placeholder={`Get ${svcName} in ${curCity?.name||'{city}'} — 5 Simple Steps`} /></div>
                    </div>
                    {([1,2,3,4,5] as const).map(n => (
                      <div key={n} style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: '800', color: '#1a3a6b', fontSize: '13px', marginBottom: '10px' }}>Step {n}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div><label style={lS}>Title</label><input style={iS} value={(form as any)[`step${n}Title`]||''} onChange={e=>set(`step${n}Title` as any,e.target.value)} /></div>
                          <div><label style={lS}>Description</label><input style={iS} value={(form as any)[`step${n}Desc`]||''} onChange={e=>set(`step${n}Desc` as any,e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: ABOUT & AGENCY */}
                {activeTab === 'about_agency' && (
                  <>
                    <div style={cS}>
                      {renderSectionHeader('about', '📖 Overview in ' + (curCity?.name || cityKey), { onAddParagraph: () => setAboutPs(p => [...p, '']) })}
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Section Heading</label><input style={iS} value={form.aboutTitle||''} onChange={e=>set('aboutTitle',e.target.value)} placeholder={`About ${svcName} in ${curCity?.name||'{city}'}`} /></div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <label style={lS}>About Paragraphs</label>
                          <button style={aBtnS} onClick={()=>setAboutPs(p=>[...p,''])}>+ Add</button>
                        </div>
                        {aboutPs.map((p,i) => (
                          <div key={i} style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                            <textarea rows={3} style={{ ...iS, resize: 'vertical', flex: 1 }} value={p} onChange={e=>{ const a=[...aboutPs]; a[i]=e.target.value; setAboutPs(a); }} placeholder={`Paragraph ${i+1} — use {city}, {service} placeholders`} />
                            {aboutPs.length>1 && <button style={dBtnS} onClick={()=>setAboutPs(prev=>prev.filter((_,j)=>j!==i))}>✕</button>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={cS}>
                      {renderSectionHeader('agency', '🏛️ Agency Section & Trust Badges', { onAddParagraph: () => setAgencyPs(p => [...p, '']) })}
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Agency Heading</label><input style={iS} value={form.agencyTitle||''} onChange={e=>set('agencyTitle',e.target.value)} placeholder={`${svcName} Agency in ${curCity?.name||'{city}'}`} /></div>
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <label style={lS}>Agency Paragraphs</label>
                          <button style={aBtnS} onClick={()=>setAgencyPs(p=>[...p,''])}>+ Add</button>
                        </div>
                        {agencyPs.map((p,i) => (
                          <div key={i} style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                            <textarea rows={2} style={{ ...iS, resize: 'vertical', flex: 1 }} value={p} onChange={e=>{ const a=[...agencyPs]; a[i]=e.target.value; setAgencyPs(a); }} />
                            {agencyPs.length>1 && <button style={dBtnS} onClick={()=>setAgencyPs(prev=>prev.filter((_,j)=>j!==i))}>✕</button>}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={lS}>Office Heading</label><input style={iS} value={form.agencyOfficeTitle||''} onChange={e=>set('agencyOfficeTitle',e.target.value)} placeholder={`📍 ${svcName} Agency – ${curCity?.name||'{city}'} Office`} /></div>
                        <div><label style={lS}>Address Text</label><input style={iS} value={form.officeAddressText||''} onChange={e=>set('officeAddressText',e.target.value)} placeholder="617, West End Mall, Janakpuri, New Delhi – 110058" /></div>
                      </div>
                    </div>
                    <div style={cS}>
                      <h4 style={hS}>⭐ 6 Trust Badges / Cards</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Format: <code>Icon | Title | Subtitle</code></p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {(['trustCard1','trustCard2','trustCard3','trustCard4','trustCard5','trustCard6'] as const).map((tc, idx) => (
                          <div key={tc}>
                            <label style={lS}>Trust Card {idx + 1}</label>
                            <input style={iS} value={trustCards[tc] || ''} onChange={e => setTrustCards(prev => ({ ...prev, [tc]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 4: DOCS */}
                {activeTab === 'comparison_docs' && (
                  <>
                    <div style={cS}>
                      {renderSectionHeader('diff', '⚖️ Comparison Table')}
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Comparison Table Title</label><input style={iS} value={form.diffTitle||''} onChange={e=>set('diffTitle',e.target.value)} placeholder={`Standard vs ${svcName} – What's the Difference?`} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        <div><label style={lS}>Col 1 (Feature)</label><input style={iS} value={form.diffCol0Header||''} onChange={e=>set('diffCol0Header',e.target.value)} placeholder="Feature" /></div>
                        <div><label style={lS}>Col 2 (Standard)</label><input style={iS} value={form.diffCol1Header||''} onChange={e=>set('diffCol1Header',e.target.value)} placeholder="Standard Translation" /></div>
                        <div><label style={lS}>Col 3 (Language Guru)</label><input style={iS} value={form.diffCol2Header||''} onChange={e=>set('diffCol2Header',e.target.value)} placeholder={`Language Guru (${curCity?.name||'{city}'})`} /></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label style={lS}>Rows</label>
                        <button style={aBtnS} onClick={()=>setDiffRows(r=>[...r,{feat:'',std:'✗ Not Included',our:'✓ Included'}])}>+ Add Row</button>
                      </div>
                      {diffRows.map((row,i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                          <input style={iS} value={row.feat} onChange={e=>{const r=[...diffRows];r[i]={...r[i],feat:e.target.value};setDiffRows(r);}} placeholder="Feature" />
                          <input style={iS} value={row.std} onChange={e=>{const r=[...diffRows];r[i]={...r[i],std:e.target.value};setDiffRows(r);}} placeholder="Standard Translation" />
                          <input style={iS} value={row.our} onChange={e=>{const r=[...diffRows];r[i]={...r[i],our:e.target.value};setDiffRows(r);}} placeholder="Language Guru" />
                          <button style={dBtnS} onClick={()=>setDiffRows(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          {renderSectionHeader('docs', '📄 Documents We Handle Categories & Lists')}
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Configure document categories, document types list, panel titles, and CTA actions.</p>
                        </div>
                        <button style={aBtnS} onClick={()=>setDocCats(d=>[...d,{id:`cat-${Date.now()}`,name:'New Category',icon:'📄',color:'#dbeafe',panelTitle:`Documents Translation in ${curCity?.name||cityKey}`,panelSub:`Certified documents with accuracy guarantee in ${curCity?.name||cityKey}`,docs:'Document 1, Document 2, Document 3',ctaText:`Need translation for these documents in ${curCity?.name||cityKey}?`,ctaBtn:'📋 Get Quote'}])}>+ Add Category</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={lS}>Section Title</label><input style={iS} value={form.docsTitle||''} onChange={e=>set('docsTitle',e.target.value)} placeholder={`${svcName} Documents We Handle in ${curCity?.name||'{city}'}`} /></div>
                        <div><label style={lS}>Section Subtitle</label><input style={iS} value={form.docsSubtitle||''} onChange={e=>set('docsSubtitle',e.target.value)} placeholder="We handle 100+ document types across all categories. Click a category to explore:" /></div>
                      </div>
                      {docCats.map((cat,i) => (
                        <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px', background: cat.color || '#dbeafe', borderRadius: '6px', padding: '2px 6px' }}>{cat.icon || '📄'}</span>
                              <strong style={{ color: '#1a3a6b', fontSize: '13.5px' }}>Category {i+1}: {cat.name || 'Untitled'}</strong>
                            </div>
                            <button style={dBtnS} onClick={()=>setDocCats(prev=>prev.filter((_,j)=>j!==i))}>✕ Remove Category</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><label style={lS}>Category Name</label><input style={iS} value={cat.name} onChange={e=>{const d=[...docCats];d[i]={...d[i],name:e.target.value};setDocCats(d);}} placeholder="e.g. Educational & Academic" /></div>
                            <div><label style={lS}>Icon</label><input style={iS} value={cat.icon} onChange={e=>{const d=[...docCats];d[i]={...d[i],icon:e.target.value};setDocCats(d);}} placeholder="e.g. 🎓" /></div>
                            <div><label style={lS}>Badge Color</label><input style={iS} value={cat.color} onChange={e=>{const d=[...docCats];d[i]={...d[i],color:e.target.value};setDocCats(d);}} placeholder="e.g. #fef3c7" /></div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><label style={lS}>Panel Heading</label><input style={iS} value={cat.panelTitle} onChange={e=>{const d=[...docCats];d[i]={...d[i],panelTitle:e.target.value};setDocCats(d);}} placeholder={`Academic Records Translation in ${curCity?.name||'{city}'}`} /></div>
                            <div><label style={lS}>Panel Subtitle</label><input style={iS} value={cat.panelSub||''} onChange={e=>{const d=[...docCats];d[i]={...d[i],panelSub:e.target.value};setDocCats(d);}} placeholder="Degrees, diplomas, transcripts & marksheets" /></div>
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={lS}>Handled Documents (comma-separated list)</label>
                            <textarea rows={2} style={{ ...iS, resize: 'vertical', fontFamily: 'inherit' }} value={cat.docs} onChange={e=>{const d=[...docCats];d[i]={...d[i],docs:e.target.value};setDocCats(d);}} placeholder="Degree Certificate, Diploma, Transcript, Marksheet, Syllabus..." />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                            <div><label style={lS}>Card CTA Text</label><input style={iS} value={cat.ctaText||''} onChange={e=>{const d=[...docCats];d[i]={...d[i],ctaText:e.target.value};setDocCats(d);}} placeholder={`Need academic document translation in ${curCity?.name||'{city}'}?`} /></div>
                            <div><label style={lS}>Card CTA Button</label><input style={iS} value={cat.ctaBtn||''} onChange={e=>{const d=[...docCats];d[i]={...d[i],ctaBtn:e.target.value};setDocCats(d);}} placeholder="🎓 Get Academic Quote" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* TAB 5: PRICING */}
                {activeTab === 'pricing_samples' && (
                  <>
                    <div style={cS}>
                      {renderSectionHeader('pricing', '💰 3-Tier Pricing Packages')}
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Pricing Section Title</label><input style={iS} value={form.pricingTitle||''} onChange={e=>set('pricingTitle',e.target.value)} placeholder={`${svcName} Pricing in ${curCity?.name||'{city}'}`} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={lS}>Currency Symbol</label><input style={iS} value={form.currencySymbol||''} onChange={e=>set('currencySymbol',e.target.value)} placeholder="₹" /></div>
                        <div><label style={lS}>Add-ons Bar Text</label><input style={iS} value={form.pricingAddons||''} onChange={e=>set('pricingAddons',e.target.value)} /></div>
                      </div>
                      {([1,2,3] as const).map(n => (
                        <div key={n} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                          <strong style={{ color: '#1a3a6b', display: 'block', marginBottom: '10px' }}>Package {n}</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                            <div><label style={lS}>Name</label><input style={iS} value={(form as any)[`tier${n}Name`]||''} onChange={e=>set(`tier${n}Name` as any,e.target.value)} /></div>
                            <div><label style={lS}>Price</label><input style={iS} value={(form as any)[`tier${n}Price`]||''} onChange={e=>set(`tier${n}Price` as any,e.target.value)} /></div>
                            <div><label style={lS}>Unit</label><input style={iS} value={(form as any)[`tier${n}Unit`]||''} onChange={e=>set(`tier${n}Unit` as any,e.target.value)} /></div>
                            <div><label style={lS}>Delivery</label><input style={iS} value={(form as any)[`tier${n}Delivery`]||''} onChange={e=>set(`tier${n}Delivery` as any,e.target.value)} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={{ ...hS, margin: 0 }}>📜 Certificate Samples</h4>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Regulate sample certificate cards, flag badges, embassy acceptance, and turnaround times.</p>
                        </div>
                        <button style={aBtnS} onClick={()=>setCerts(c=>[...c,{doc:'Degree Certificate',lang:'English → German',flag:'🇩🇪',acc:'German Embassy',time:'24 Hrs',icon:'🎓'}])}>+ Add Certificate Sample</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={lS}>Section Title</label><input style={iS} value={form.certSampleTitle||''} onChange={e=>set('certSampleTitle',e.target.value)} placeholder={`${svcName} Certificate Samples`} /></div>
                        <div><label style={lS}>Section Subtitle</label><input style={iS} value={form.certSampleSubtitle||''} onChange={e=>set('certSampleSubtitle',e.target.value)} placeholder={`View verified ISO-certified samples for ${svcName} in ${curCity?.name||'{city}'}:`} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
                        {certs.map((cert,i) => (
                          <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '18px' }}>{cert.icon || '📜'}</span>
                                  <strong style={{ fontSize: '13px', color: '#1a3a6b' }}>Sample #{i+1}: {cert.doc || 'Untitled'}</strong>
                                </div>
                                <button style={dBtnS} onClick={()=>setCerts(prev=>prev.filter((_,j)=>j!==i))}>✕ Remove</button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div><label style={lS}>Document Name</label><input style={iS} value={cert.doc} onChange={e=>{const s=[...certs];s[i]={...s[i],doc:e.target.value};setCerts(s);}} placeholder="e.g. Degree Certificate" /></div>
                                <div><label style={lS}>Icon</label><input style={iS} value={cert.icon} onChange={e=>{const s=[...certs];s[i]={...s[i],icon:e.target.value};setCerts(s);}} placeholder="e.g. 🎓" /></div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div><label style={lS}>Language Pair</label><input style={iS} value={cert.lang} onChange={e=>{const s=[...certs];s[i]={...s[i],lang:e.target.value};setCerts(s);}} placeholder="e.g. English → German" /></div>
                                <div><label style={lS}>Flag</label><input style={iS} value={cert.flag} onChange={e=>{const s=[...certs];s[i]={...s[i],flag:e.target.value};setCerts(s);}} placeholder="e.g. 🇩🇪" /></div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div><label style={lS}>Embassy / Acceptance</label><input style={iS} value={cert.acc} onChange={e=>{const s=[...certs];s[i]={...s[i],acc:e.target.value};setCerts(s);}} placeholder="e.g. German Embassy" /></div>
                                <div><label style={lS}>Turnaround Time</label><input style={iS} value={cert.time} onChange={e=>{const s=[...certs];s[i]={...s[i],time:e.target.value};setCerts(s);}} placeholder="e.g. 24 Hrs" /></div>
                              </div>
                            </div>
                            <div style={{ marginTop: '10px', padding: '8px 10px', background: '#eff6ff', borderRadius: '6px', fontSize: '11px', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>Preview: {cert.icon} <strong>{cert.doc}</strong> ({cert.flag} {cert.lang})</span>
                              <span style={{ fontWeight: 700 }}>{cert.acc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 6: WHY US & OTHER SERVICES */}
                {activeTab === 'why_sidebar' && (
                  <>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h4 style={{ ...hS, margin: 0 }}>🏅 Why Choose Us Cards</h4>
                        <button style={aBtnS} onClick={()=>setWhyList(w=>[...w,{icon:'✅',title:'Feature Title',desc:'Feature description'}])}>+ Add Card</button>
                      </div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Section Heading</label><input style={iS} value={form.whyChooseTitle||''} onChange={e=>set('whyChooseTitle',e.target.value)} placeholder={`Why Choose Language Guru for ${svcName} in ${curCity?.name||'{city}'}?`} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {whyList.map((wc,i) => (
                          <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '12px', color: '#1a3a6b' }}>Card {i+1}</strong>
                              <button style={dBtnS} onClick={()=>setWhyList(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ width: '60px' }}><label style={lS}>Icon</label><input style={iS} value={wc.icon} onChange={e=>{const w=[...whyList];w[i]={...w[i],icon:e.target.value};setWhyList(w);}} /></div>
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '8px' }}><label style={lS}>Title</label><input style={iS} value={wc.title} onChange={e=>{const w=[...whyList];w[i]={...w[i],title:e.target.value};setWhyList(w);}} /></div>
                                <div><label style={lS}>Description</label><input style={iS} value={wc.desc} onChange={e=>{const w=[...whyList];w[i]={...w[i],desc:e.target.value};setWhyList(w);}} /></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h4 style={{ ...hS, margin: 0 }}>🌐 Other Translation Service Types in {curCity?.name || cityKey}</h4>
                        <button style={aBtnS} onClick={() => setOtherServices(prev => [...prev, { icon: '🌐', name: `Translation Services in ${curCity?.name || cityKey}`, desc: 'Professional certified translation services', link: '/services' }])}>+ Add Service</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={lS}>Section Title</label><input style={iS} value={form.otherSvcsTitle || ''} onChange={e => set('otherSvcsTitle', e.target.value)} placeholder={`Other Translation Service Types in ${curCity?.name || '{city}'}`} /></div>
                        <div><label style={lS}>Section Subtitle</label><input style={iS} value={form.otherSvcsSubtitle || ''} onChange={e => set('otherSvcsSubtitle', e.target.value)} placeholder={`Language Guru provides all translation services in ${curCity?.name || '{city}'}:`} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {otherServices.map((os, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '12px', color: '#1a3a6b' }}>Service {idx + 1}</strong>
                              <button style={dBtnS} onClick={() => setOtherServices(prev => prev.filter((_, j) => j !== idx))}>✕</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px', marginBottom: '8px' }}>
                              <div><label style={lS}>Icon</label><input style={iS} value={os.icon || ''} onChange={e => { const a = [...otherServices]; a[idx] = { ...a[idx], icon: e.target.value }; setOtherServices(a); }} /></div>
                              <div><label style={lS}>Name</label><input style={iS} value={os.name || ''} onChange={e => { const a = [...otherServices]; a[idx] = { ...a[idx], name: e.target.value }; setOtherServices(a); }} /></div>
                            </div>
                            <div style={{ marginBottom: '8px' }}><label style={lS}>Description</label><input style={iS} value={os.desc || ''} onChange={e => { const a = [...otherServices]; a[idx] = { ...a[idx], desc: e.target.value }; setOtherServices(a); }} /></div>
                            <div><label style={lS}>Link</label><input style={iS} value={os.link || ''} onChange={e => { const a = [...otherServices]; a[idx] = { ...a[idx], link: e.target.value }; setOtherServices(a); }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cS}>
                      <h4 style={hS}>📞 Sidebar Full Customization</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div><label style={lS}>Phone 1</label><input style={iS} value={form.sidebarPhone1||''} onChange={e=>set('sidebarPhone1',e.target.value)} /></div>
                        <div><label style={lS}>Phone 2</label><input style={iS} value={form.sidebarPhone2||''} onChange={e=>set('sidebarPhone2',e.target.value)} /></div>
                        <div><label style={lS}>Sidebar CTA Heading</label><input style={iS} value={form.sidebarCtaTitle||''} onChange={e=>set('sidebarCtaTitle',e.target.value)} /></div>
                        <div><label style={lS}>WhatsApp Number</label><input style={iS} value={form.sidebarBtn2WA||''} onChange={e=>set('sidebarBtn2WA',e.target.value)} /></div>
                        <div><label style={lS}>Cities Widget Title</label><input style={iS} value={form.sidebarCitiesTitle||''} onChange={e=>set('sidebarCitiesTitle',e.target.value)} /></div>
                        <div><label style={lS}>Languages Widget Title</label><input style={iS} value={form.sidebarLangsTitle||''} onChange={e=>set('sidebarLangsTitle',e.target.value)} /></div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 7: REVIEWS & FAQs */}
                {activeTab === 'reviews_faqs' && (
                  <>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h4 style={{ ...hS, margin: 0 }}>⭐ Client Reviews</h4>
                        <button style={aBtnS} onClick={()=>setReviews(r=>[...r,{stars:'⭐⭐⭐⭐⭐',text:'Excellent translation service!',name:'Client Name',role:`Client · ${curCity?.name||cityKey}`,avatar:'CN'}])}>+ Add Review</button>
                      </div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Reviews Section Title</label><input style={iS} value={form.reviewsTitle||''} onChange={e=>set('reviewsTitle',e.target.value)} placeholder={`Client Reviews – ${svcName} ${curCity?.name||'{city}'}`} /></div>
                      {reviews.map((rev,i) => (
                        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '13px', color: '#1a3a6b' }}>Review {i+1}</strong>
                            <button style={dBtnS} onClick={()=>setReviews(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><label style={lS}>Stars</label><input style={iS} value={rev.stars} onChange={e=>{const r=[...reviews];r[i]={...r[i],stars:e.target.value};setReviews(r);}} /></div>
                            <div><label style={lS}>Name</label><input style={iS} value={rev.name} onChange={e=>{const r=[...reviews];r[i]={...r[i],name:e.target.value};setReviews(r);}} /></div>
                            <div><label style={lS}>Role / City</label><input style={iS} value={rev.role} onChange={e=>{const r=[...reviews];r[i]={...r[i],role:e.target.value};setReviews(r);}} /></div>
                            <div><label style={lS}>Avatar</label><input style={iS} value={rev.avatar} onChange={e=>{const r=[...reviews];r[i]={...r[i],avatar:e.target.value};setReviews(r);}} /></div>
                          </div>
                          <textarea rows={2} style={{ ...iS, resize: 'vertical' }} value={rev.text} onChange={e=>{const r=[...reviews];r[i]={...r[i],text:e.target.value};setReviews(r);}} placeholder="Review text..." />
                        </div>
                      ))}
                    </div>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h4 style={{ ...hS, margin: 0 }}>❓ FAQs</h4>
                        <button style={aBtnS} onClick={()=>setFaqs(f=>[...f,{q:'Question text',a:'Answer text'}])}>+ Add FAQ</button>
                      </div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>FAQs Section Title</label><input style={iS} value={form.faqsTitle||''} onChange={e=>set('faqsTitle',e.target.value)} placeholder={`FAQs – ${svcName} ${curCity?.name||'{city}'}`} /></div>
                      {faqs.map((faq,i) => (
                        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '13px', color: '#1a3a6b' }}>FAQ {i+1}</strong>
                            <button style={dBtnS} onClick={()=>setFaqs(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                          </div>
                          <div style={{ marginBottom: '10px' }}><label style={lS}>Question</label><input style={iS} value={faq.q} onChange={e=>{const f=[...faqs];f[i]={...f[i],q:e.target.value};setFaqs(f);}} /></div>
                          <div><label style={lS}>Answer</label><textarea rows={3} style={{ ...iS, resize: 'vertical' }} value={faq.a} onChange={e=>{const f=[...faqs];f[i]={...f[i],a:e.target.value};setFaqs(f);}} /></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* TAB 8: SEO */}
                {activeTab === 'cta_seo' && (
                  <>
                    <div style={cS}>
                      <h4 style={hS}>📣 CTA Section</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div><label style={lS}>CTA Heading</label><input style={iS} value={form.ctaTitle||''} onChange={e=>set('ctaTitle',e.target.value)} placeholder={`Need ${svcName} in ${curCity?.name||'{city}'}?`} /></div>
                        <div><label style={lS}>CTA Subtitle</label><input style={iS} value={form.ctaSubtitle||''} onChange={e=>set('ctaSubtitle',e.target.value)} placeholder="Instant quote in 30 minutes. 24-hour express delivery." /></div>
                      </div>
                    </div>
                    <div style={cS}>
                      <h4 style={hS}>🔍 SEO & URL Slug</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={lS}>URL Slug <span style={{ color: '#dc2626' }}>*</span></label>
                        <input style={{ ...iS, fontFamily: 'monospace', background: '#f8fafc', fontWeight: '700' }} value={form.slug || defaultCitySlug} onChange={e=>set('slug',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} />
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Live URL: <strong>{SITE_URL.replace(/^https?:\/\//, '')}/services/{form.slug || defaultCitySlug}</strong></div>
                      </div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Meta Title</label><input style={iS} value={form.metaTitle||''} onChange={e=>set('metaTitle',e.target.value)} placeholder={`${svcName} in ${curCity?.name||cityKey} | Language Guru`} /></div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Meta Description</label><textarea rows={3} style={{ ...iS, resize: 'vertical' }} value={form.metaDesc||''} onChange={e=>set('metaDesc',e.target.value)} /></div>
                      <div style={{ marginBottom: '14px' }}><label style={lS}>Meta Keywords</label><input style={iS} value={form.metaKeywords||''} onChange={e=>set('metaKeywords',e.target.value)} /></div>
                      <div><label style={lS}>OG Social Image URL</label><input style={iS} value={form.ogImage||''} onChange={e=>set('ogImage',e.target.value)} /></div>
                    </div>
                  </>
                )}

                {/* TAB 9: SECTION ORDER & LAYOUT */}
                {activeTab === 'layout_order' && (
                  <>
                    <div style={cS}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ ...hS, margin: 0 }}>📑 Section Order & Visibility</h4>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                            Drag or use ⬆️ / ⬇️ buttons to sequence sections on this service + city landing page. Use 👁️ to hide/show sections.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addCustomSection()}
                          style={{
                            background: '#1a3a6b',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          ➕ Add New Custom Section
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {getEffectiveSectionOrder().map((secId, idx) => {
                          const defSec = DEFAULT_SVC_CITY_SECTIONS.find(s => s.id === secId);
                          const customSec = ((form.contentOverrides?.customSections as CustomSection[]) || []).find(cs => cs.id === secId);
                          const isHidden = (form.contentOverrides?.hiddenSections || []).includes(secId);
                          const isFirst = idx === 0;
                          const isLast = idx === getEffectiveSectionOrder().length - 1;

                          return (
                            <div
                              key={secId}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: isHidden ? '#f8fafc' : '#fff',
                                border: '1px solid ' + (customSec ? '#93c5fd' : '#e2e8f0'),
                                borderRadius: '8px',
                                opacity: isHidden ? 0.6 : 1,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: customSec ? '#eff6ff' : '#f1f5f9',
                                  color: customSec ? '#1d4ed8' : '#475569',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: '800'
                                }}>
                                  #{idx + 1}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: isHidden ? '#94a3b8' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {customSec ? ('✨ ' + (customSec.title || 'Untitled Custom Section')) : (defSec?.label || secId)}
                                    {customSec && (
                                      <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                        CUSTOM
                                      </span>
                                    )}
                                    {isHidden && (
                                      <span style={{ fontSize: '10px', background: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                        HIDDEN
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                    {customSec ? (customSec.subtitle || 'Custom content block') : ('ID: ' + secId + (defSec?.tab ? ' • Configured in Tab: ' + defSec.tab : ''))}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => moveSection(secId, 'up')}
                                  disabled={isFirst}
                                  style={{
                                    background: isFirst ? '#f1f5f9' : '#fff',
                                    color: isFirst ? '#94a3b8' : '#1e293b',
                                    border: '1px solid #cbd5e1',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: isFirst ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  ⬆️ Up
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSection(secId, 'down')}
                                  disabled={isLast}
                                  style={{
                                    background: isLast ? '#f1f5f9' : '#fff',
                                    color: isLast ? '#94a3b8' : '#1e293b',
                                    border: '1px solid #cbd5e1',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: isLast ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  ⬇️ Down
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleSectionVisibility(secId)}
                                  style={{
                                    background: isHidden ? '#f0fdf4' : '#fff',
                                    color: isHidden ? '#166534' : '#475569',
                                    border: '1px solid ' + (isHidden ? '#86efac' : '#cbd5e1'),
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isHidden ? '👁️ Show' : '👁️ Hide'}
                                </button>
                                {customSec && (
                                  <button
                                    type="button"
                                    onClick={() => removeCustomSection(secId)}
                                    style={{
                                      background: '#fee2e2',
                                      color: '#991b1b',
                                      border: '1px solid #fca5a5',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Sections Full Editors */}
                    {((form.contentOverrides?.customSections as CustomSection[]) || []).map(cs => renderCustomSectionEditorCard(cs))}
                  </>
                )}

                {/* Sticky Save Bar */}
                <div className="city-cms-save-bar">
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Editing: <strong>{svcName}</strong> in <strong>{curCity?.name||cityKey}</strong></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {exists && <button onClick={handleReset} style={{ background: '#fff', color: '#991b1b', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>↩ Reset</button>}
                    <button onClick={handleSave} disabled={saving} style={{ background: '#1a3a6b', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Saving...' : '💾 Save City Page'}</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceCityPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading editor...</div>}>
      <Inner />
    </Suspense>
  );
}
