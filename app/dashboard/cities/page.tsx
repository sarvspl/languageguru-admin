'use client';

import React, { useEffect, useState, useRef } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';

/** Mirrors the backend slugify in config/slug.js */
const slugify = (raw: string) =>
  String(raw ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const ICON_OPTIONS = [
  '🏛️','🏙️','🏢','📍','🕌','🏰','🌴','🌊','🌄','✈️','🚆','🚊','🌆','🗺️','🌐','📜','⚖️','🎓','🏥','💼','🔬','⚙️','🛡️','🏅','⭐','💎','🏷️','📌','🔑','📝','🤝','🇮🇳'
];

interface FAQ {
  q: string;
  a: string;
}

interface ReviewItem {
  stars: string;
  text: string;
  name: string;
  role: string;
  avatar: string;
}

interface WhyChooseItem {
  icon: string;
  title: string;
  desc: string;
}

interface ProcessStepItem {
  step: number;
  title: string;
  desc: string;
  color?: string;
}

interface LocalServiceItem {
  icon: string;
  name: string;
  desc: string;
  link: string;
}

interface DocCategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  panelTitle?: string;
  panelSub?: string;
  docs: string;
  ctaText?: string;
  ctaBtn?: string;
}


interface CustomBox {
  id: string;
  icon?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  link?: string;
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
  highlightBanner?: CustomHighlightBanner;
  ctaText?: string;
  ctaBtnText?: string;
  ctaBtnLink?: string;
  insertedAfter?: string;
}

interface City {
  id: string;
  name: string;
  key: string;
  slug?: string;
  ic: string;
  state: string;
  isMetro: boolean;
  isActive: boolean;
  metaTitle?: string | null;
  metaDesc?: string | null;
  contentOverrides?: Record<string, any> | null;
  faqs?: FAQ[] | null;
  reviews?: ReviewItem[] | null;
}

type TabId = 'identity_hero' | 'about_process' | 'services_docs' | 'pricing_why' | 'reviews_faqs' | 'sidebar_seo' | 'layout_order';


const DEFAULT_CITY_SECTIONS = [
  { id: 'about', label: '📖 About & Agency Overview', tab: 'about_process' as TabId },
  { id: 'process', label: '⚡ 5-Step Translation Process', tab: 'about_process' as TabId },
  { id: 'services', label: '🌐 Local Services Grid', tab: 'services_docs' as TabId },
  { id: 'docs', label: '📄 Documents We Handle', tab: 'services_docs' as TabId },
  { id: 'pricing', label: '💰 Transparent Pricing Packages', tab: 'pricing_why' as TabId },
  { id: 'why', label: '🏅 Why Choose Language Guru', tab: 'pricing_why' as TabId },
  { id: 'languages', label: '🌐 120+ Languages Available', tab: 'services_docs' as TabId },
  { id: 'other_cities', label: '🗺️ Other Major Cities', tab: 'services_docs' as TabId },
  { id: 'reviews', label: '⭐ Client Reviews & Ratings', tab: 'reviews_faqs' as TabId },
  { id: 'faqs', label: '❓ Frequently Asked Questions', tab: 'reviews_faqs' as TabId },
];

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterMetro, setFilterMetro] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('identity_hero');
  const [saving, setSaving] = useState(false);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic paragraph counts
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>([]);

  // Inline slug editing
  const [slugEdit, setSlugEdit] = useState<{ id: string; value: string } | null>(null);
  const [slugMsg, setSlugMsg] = useState<{ id: string; kind: 'ok' | 'err'; text: string } | null>(null);
  const [slugSaving, setSlugSaving] = useState(false);

  // Delete Confirm Modal State
  const [deleteConfirmCity, setDeleteConfirmCity] = useState<City | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getFullImgUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const clean = url.startsWith('/') ? url : '/' + url;
    return API_URL + clean;
  };

  const fetchCities = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL + '/api/v1/cities/all', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setCities(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch cities');
      }
    } catch (err) {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const saveSlug = async (city: any, nextSlug: string) => {
    const current = city.slug || city.key;
    if (nextSlug.trim() === current) { setSlugEdit(null); return; }
    setSlugSaving(true);
    setSlugMsg(null);
    try {
      const res = await fetch(API_URL + '/api/v1/cities/' + city.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug: nextSlug.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSlugMsg({ id: city.id, kind: 'ok', text: 'URL is now /cities/' + data.data.slug });
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

  const getCityDefaults = (cityName: string, stateName: string = 'India', isMetroVal: boolean = true) => {
    const CN = cityName || 'Delhi';
    const ST = stateName || 'Delhi NCR';

    const defaultProcessSteps: ProcessStepItem[] = [
      { step: 1, title: 'Submit Documents Online', desc: 'Upload scanned copies or clear photos via our form, email or WhatsApp. No original documents required initially.', color: '#dbeafe' },
      { step: 2, title: 'Instant Quote & Word Count', desc: 'Get an exact quote based on per-page / per-word rates with delivery timeline for ' + CN + ' within 15 minutes.', color: '#fef3c7' },
      { step: 3, title: 'Translation by Native Linguist', desc: 'Certified native translator translates with subject-matter expertise in your specific industry or legal requirement in ' + CN + '.', color: '#dcfce7' },
      { step: 4, title: 'Quality Check & ISO Certification', desc: 'Two-stage proofreading by a senior editor. ISO-9001:2015 stamp, Certificate of Accuracy and official letterhead applied.', color: '#fce7f3' },
      { step: 5, title: 'Express Delivery in ' + CN, desc: 'Digital certified soft copy emailed / WhatsApped. Hard copies with notary / apostille dispatched by courier to your doorstep.', color: '#ede9fe' }
    ];

    const defaultServicesList: LocalServiceItem[] = [
      { icon: '🎓', name: 'Academic Translation in ' + CN, desc: 'Degrees, transcripts, mark sheets, educational certificates in ' + CN, link: '/services/academic' },
      { icon: '🌐', name: 'Apostille & Attestation in ' + CN, desc: 'MEA apostille + embassy, HRD & notary attestation in ' + CN, link: '/services/apostille' },
      { icon: '💼', name: 'Business Translation in ' + CN, desc: 'Corporate docs, annual reports, business contracts in ' + CN, link: '/services/business' },
      { icon: '🏅', name: 'Certified Translation in ' + CN, desc: 'Embassy & court accepted certified translations in ' + CN, link: '/services/certified' },
      { icon: '📋', name: 'Document Translation in ' + CN, desc: 'Birth, marriage, degree, medical & all personal docs in ' + CN, link: '/services/document' },
      { icon: '📊', name: 'Financial Translation in ' + CN, desc: 'Bank statements, financial reports, balance sheets in ' + CN, link: '/services/financial' },
      { icon: '✈️', name: 'Immigration Translation in ' + CN, desc: 'Visa applications, immigration documents, PCC in ' + CN, link: '/services/immigration' },
      { icon: '🎙️', name: 'Interpretation in ' + CN, desc: 'Simultaneous, consecutive, conference interpretation in ' + CN, link: '/services/interpretation' },
      { icon: '⚖️', name: 'Legal Translation in ' + CN, desc: 'Court orders, contracts, agreements, affidavits in ' + CN, link: '/services/legal' },
      { icon: '🏥', name: 'Medical Translation in ' + CN, desc: 'Medical reports, clinical docs, pharma documents in ' + CN, link: '/services/medical' },
      { icon: '🔏', name: 'Notarized Translation in ' + CN, desc: 'Notary-sealed certified translations in ' + CN, link: '/services/notarization' },
      { icon: '⚙️', name: 'Technical Translation in ' + CN, desc: 'Manuals, engineering docs, technical specs in ' + CN, link: '/services/technical' }
    ];

    const defaultDocCategories: DocCategoryItem[] = [
      {
        id: 'academic',
        name: 'Academic',
        icon: '🎓',
        color: '#dcfce7',
        panelTitle: 'Academic Documents in ' + CN,
        panelSub: 'Available in 120+ languages with international certification & embassy acceptance in ' + CN,
        docs: 'Degree Certificate, Mark Sheets / Transcripts, Migration Certificate, School Leaving Cert, DDV (Germany), Research Papers, Scholarship Docs, Medium of Instruction Cert',
        ctaText: 'Need translation for any of these Academic documents in ' + CN + '?',
        ctaBtn: '📋 Get Quote for Academic'
      },
      {
        id: 'immigration',
        name: 'Immigration & Visa',
        icon: '🛂',
        color: '#dbeafe',
        panelTitle: 'Immigration & Visa in ' + CN,
        panelSub: 'Available in 120+ languages with embassy acceptance & MEA apostille in ' + CN,
        docs: 'Birth Certificate, Marriage Certificate, Death Certificate, Police Clearance (PCC), Domicile Certificate, Sponsor Letter, Passport Pages, Travel History',
        ctaText: 'Need translation for any of these Immigration & Visa documents in ' + CN + '?',
        ctaBtn: '📋 Get Quote for Immigration & Visa'
      },
      {
        id: 'legal',
        name: 'Legal Documents',
        icon: '⚖️',
        color: '#fef3c7',
        panelTitle: 'Legal Documents in ' + CN,
        panelSub: 'Certified & notarized for high courts, district courts and international arbitration',
        docs: 'Court Orders / Judgments, Power of Attorney, Partnership Deed, Property Papers, Affidavits, Legal Notices, MOA / AOA, Contracts & Agreements',
        ctaText: 'Need translation for any of these Legal documents in ' + CN + '?',
        ctaBtn: '📋 Get Quote for Legal Documents'
      },
      {
        id: 'medical',
        name: 'Medical',
        icon: '🏥',
        color: '#fce7f3',
        panelTitle: 'Medical Documents in ' + CN,
        panelSub: 'Domain-expert medical translators for hospitals, clinics and visa health checks in ' + CN,
        docs: 'Medical Reports, Hospital Records, Prescriptions, Lab Reports, Clinical Trial Docs, Pharma Documents, Disability Certificates',
        ctaText: 'Need translation for any of these Medical documents in ' + CN + '?',
        ctaBtn: '📋 Get Quote for Medical'
      },
      {
        id: 'financial',
        name: 'Financial & Business',
        icon: '💼',
        color: '#fff7ed',
        panelTitle: 'Financial & Business in ' + CN,
        panelSub: 'Accurate financial translation for audit, tax filing, banks and visa embassies in ' + CN,
        docs: 'Bank Statements, Income Tax Returns, Balance Sheets, Annual Reports, Company Registration, Business Contracts, Investment Docs',
        ctaText: 'Need translation for any of these Financial & Business documents in ' + CN + '?',
        ctaBtn: '📋 Get Quote for Financial'
      },
      {
        id: 'technical',
        name: 'Technical',
        icon: '🔬',
        color: '#f0fdf4',
        panelTitle: 'Technical Documents in ' + CN,
        panelSub: 'Engineering and technical specification translations with strict quality checks in ' + CN,
        docs: 'Machinery Manuals, Engineering Specs, Safety Data Sheets, Installation Guides, Patents & Trademarks, Software Docs, Compliance Certs',
        ctaText: 'Need translation for any of these Technical documents in ' + CN + '?',
        ctaBtn: '📋 Get Quote for Technical'
      }
    ];

    const defaultWhyChooseList: WhyChooseItem[] = [
      { icon: '🏅', title: 'ISO-9001:2015 & ISO 17100:2015 Certified', desc: 'International quality benchmark with 100% precision guarantee.' },
      { icon: '🏛️', title: 'Authorized for ' + CN + ' & Global Authorities', desc: 'MSME registered. Accepted by MEA, embassies, High Courts and overseas universities.' },
      { icon: '🌍', title: '120+ Language Pairs Handled', desc: 'Native translators covering Asian, European, Middle-Eastern and Indian languages in ' + CN + '.' },
      { icon: '⚡', title: '24-Hour Express Turnaround', desc: 'Rapid certified delivery across ' + CN + ' and nationwide with digital soft copy + physical delivery.' },
      { icon: '🔒', title: 'Strict NDA & Data Confidentiality', desc: 'End-to-end encrypted file handling and strict non-disclosure security for all clients.' },
      { icon: '💰', title: 'Transparent Per-Page & Per-Word Pricing', desc: 'Affordable base rates starting from ₹850/page with zero hidden fees or surprise charges.' }
    ];

    const defaultReviews: ReviewItem[] = [
      {
        stars: '★★★★★',
        text: '"Language Guru delivered our certified document translation in ' + CN + ' in under 24 hours. The embassy accepted it immediately. Outstanding service!"',
        name: 'Siddharth Rao',
        role: 'Corporate Executive · ' + CN,
        avatar: 'SR'
      },
      {
        stars: '★★★★★',
        text: '"Excellent legal translation service in ' + CN + '. Precision and attention to legal terms were exceptional. Highly recommended for all corporate contracts."',
        name: 'Meenakshi Iyer',
        role: 'Senior Legal Counsel · ' + CN,
        avatar: 'MI'
      },
      {
        stars: '★★★★★',
        text: '"Handled my German academic degree and transcript translation for visa submission in ' + CN + '. Flawless accuracy and very quick response on WhatsApp."',
        name: 'Arjun Patel',
        role: 'Student Visa Applicant · ' + CN,
        avatar: 'AP'
      }
    ];

    const defaultFaqs: FAQ[] = [
      { q: 'Are certified translations accepted by embassies and visa offices in ' + CN + '?', a: 'Yes, 100%. Our certified translations are printed on official company letterhead with translator certification, ISO stamp, registration seal and Certificate of Accuracy. They are accepted by all foreign embassies, VFS global centers, MEA, high courts and overseas immigration authorities.' },
      { q: 'How fast can I get certified translation in ' + CN + '?', a: 'Standard turnaround is 24 to 48 hours for standard certificates. For urgent submissions in ' + CN + ', we provide same-day 24-hr express service.' },
      { q: 'Do I need to submit physical original documents in ' + CN + '?', a: 'No. You can simply upload clear scans or high-resolution photos via our online form, email or WhatsApp. We deliver digital certified PDFs instantly, and courier stamped hard copies to your address in ' + CN + '.' },
      { q: 'How much does translation service cost in ' + CN + '?', a: 'Pricing starts from ₹850 per page for standard certified certificates. Technical, legal and rare language pairs are quoted transparently based on exact word count.' },
      { q: 'Do you provide notary and MEA apostille attestation in ' + CN + '?', a: 'Yes. We provide complete end-to-end notarization, SDM/Home Department attestation, MEA apostille and embassy legalization services in ' + CN + '.' }
    ];

    return {
      // 1. Identity & Hero
      heroBgImage: '',
      heroBadge: '🏆 #1 Certified Translation Agency in ' + CN,
      heroTitle: 'Certified Translation Services in <em>' + CN + '</em>',
      heroSub: 'Official, ISO-9001:2015 & ISO 17100:2015 certified translation services in ' + CN + ' for 120+ languages. Accepted by all embassies, MEA, High Courts, visa centers and government authorities.',
      heroCtaBtn1Text: '⚡ Get Free Quote',
      heroCtaBtn1Link: '/quote',
      heroCtaBtn2Text: '📞 Call Now',
      heroCtaBtn3Text: '💬 WhatsApp Us',
      phone1: '+91-9312690490',
      phone2: '+91-9810693777',
      whatsapp: '+91-9312690490',
      heroTrustBadges: '<div class="htrust"><span class="htrust-icon">✅</span> Embassy Accepted</div>\n<div class="htrust"><span class="htrust-icon">⚡</span> 24-Hr Express in ' + CN + '</div>\n<div class="htrust"><span class="htrust-icon">🔏</span> Notarized & Apostilled</div>\n<div class="htrust"><span class="htrust-icon">🏆</span> ISO 9001 & ISO 17100</div>\n<div class="htrust"><span class="htrust-icon">⭐</span> 4.9/5 · 10,000+ Reviews</div>',

      // 2. About & Process
      aboutTitle: 'Leading Certified Translation Agency in ' + CN,
      aboutParagraphs: [
        'Language Guru is India\'s most trusted certified translation company, delivering high-accuracy translation and localization services in ' + CN + ' and across ' + ST + ' since 2005. Holding ISO-9001:2015 and ISO 17100:2015 international certifications, MSME registration and government authorization, our translations are unconditionally accepted by embassies, consulates, courts, universities and government bodies worldwide.',
        'Our multidisciplinary team in ' + CN + ' comprises 500+ native linguists, sworn translators, legal advocates and domain subject-matter experts. Every document undergoes our stringent 3-tier Quality Control protocol — initial native translation, independent technical review, and final linguistic proofreading before certification.',
        'Whether you require certified translation for visa and immigration, high-volume corporate contracts, medical dossiers, academic credentials or technical documentation, Language Guru provides rapid 24-hour express delivery across ' + CN + ' with digital and physical door delivery.'
      ],
      aboutP1: 'Language Guru is India\'s most trusted certified translation company, delivering high-accuracy translation and localization services in ' + CN + ' and across ' + ST + ' since 2005. Holding ISO-9001:2015 and ISO 17100:2015 international certifications, MSME registration and government authorization, our translations are unconditionally accepted by embassies, consulates, courts, universities and government bodies worldwide.',
      aboutP2: 'Our multidisciplinary team in ' + CN + ' comprises 500+ native linguists, sworn translators, legal advocates and domain subject-matter experts. Every document undergoes our stringent 3-tier Quality Control protocol — initial native translation, independent technical review, and final linguistic proofreading before certification.',
      aboutP3: 'Whether you require certified translation for visa and immigration, high-volume corporate contracts, medical dossiers, academic credentials or technical documentation, Language Guru provides rapid 24-hour express delivery across ' + CN + ' with digital and physical door delivery.',
      agencyOfficeTitle: '📍 Language Guru – ' + CN + ' Client Service Center',
      officeAddressText: 'Serving ' + CN + ', ' + ST + ' and nationwide. Online submission with doorstep physical delivery. Direct Helpline: +91-9312690490 · Email: info@languageguru.in',
      processTag: 'HOW IT WORKS',
      processTitle: 'Simple 5-Step Certified Translation Process in ' + CN,
      processSteps: defaultProcessSteps,

      // 3. Services & Documents
      servicesTitle: 'Our Translation Services in ' + CN,
      servicesSubtitle: 'Comprehensive language solutions for individuals, corporates and institutions in ' + CN + ':',
      servicesList: defaultServicesList,
      docsTitle: 'Documents We Translate in ' + CN,
      docsSubtitle: 'We handle 100+ document types across all major categories with certified accuracy in ' + CN + ':',
      docCategories: defaultDocCategories,

      // 4. Pricing & Why Choose
      pricingTitle: 'Transparent Translation Pricing in ' + CN,
      tier1Name: 'Economy',
      tier1Price: '₹600',
      tier1Time: '3-4 Days',
      tier1Desc: 'Standard turnaround for non-urgent personal documents and general text.',
      tier1Feats: '✓ Certified Translation\n✓ ISO-9001:2015 Stamp\n✓ Digital PDF Copy\n✓ 100% Accuracy Guarantee',
      tier2Name: 'Standard',
      tier2Price: '₹850',
      tier2Time: '24-48 Hours',
      tier2Desc: 'Most popular choice for visa, embassy, academic and official submissions.',
      tier2Feats: '✓ Certified on Letterhead\n✓ Certificate of Accuracy\n✓ Embassy & Court Accepted\n✓ Hard Copy Courier Available\n✓ Priority Translator Assignment',
      tier3Name: 'Express 24H',
      tier3Price: '₹1,250',
      tier3Time: 'Same Day / 24H',
      tier3Desc: 'Urgent express delivery with dedicated linguist and rapid QC verification.',
      tier3Feats: '✓ Same-Day / 24-Hr Turnaround\n✓ Notary Attestation Available\n✓ Dedicated Senior Project Manager\n✓ Immediate Digital Delivery\n✓ Express Doorstep Courier',
      whyChooseTag: 'WHY LANGUAGE GURU',
      whyChooseTitle: 'Why Choose Language Guru in ' + CN + '?',
      whyChooseSubtitle: 'Setting the gold standard for accuracy, compliance and turnaround time in ' + CN + ':',
      whyChooseList: defaultWhyChooseList,

      // 5. Reviews & FAQs
      reviewsTitle: 'Client Testimonials from ' + CN,
      reviewsSubtitle: 'What professionals, students and corporate clients in ' + CN + ' say about Language Guru:',
      reviews: defaultReviews,
      faqsTitle: 'Frequently Asked Questions – ' + CN,
      faqsSubtitle: 'Clear answers about translation timelines, pricing and embassy acceptance in ' + CN + ':',
      faqs: defaultFaqs,

      // 6. Sidebar & SEO
      sidebarPhone1: '+91-9312690490',
      sidebarPhone2: '+91-9810693777',
      sidebarEmail: 'info@languageguru.in',
      sidebarHours: 'Mon – Sat: 9:00 AM – 8:00 PM',
      sidebarAddress: 'Serving ' + CN + ', ' + ST + ' & All India',
      ctaTitle: 'Need Certified Translation in ' + CN + '?',
      ctaSubtitle: 'Get an instant quote within 15 minutes. 100% embassy accepted certified translations delivered in 24 hours.',
      ctaBtnPrimary: '⚡ Get Instant Quote Now',
      ctaBtnSecondary: '💬 WhatsApp Us: +91-9312690490',
      metaTitle: 'Certified Translation Services in ' + CN + ' | ISO Certified Agency',
      metaDesc: 'Professional certified translation services in ' + CN + '. ISO-9001:2015 certified, accepted by embassies, MEA, courts & universities. 120+ languages with 24-hr express delivery.',
      metaKeywords: 'translation services in ' + CN + ', certified translation ' + CN + ', embassy approved translation ' + CN + ', document translation ' + CN + ', legal translation ' + CN
    };
  };

  const [formData, setFormData] = useState<City>({
    id: '',
    name: '',
    key: '',
    slug: '',
    ic: '🏙️',
    state: '',
    isMetro: true,
    isActive: true,
    metaTitle: '',
    metaDesc: '',
    contentOverrides: {}
  });

  const handleOpenAdd = () => {
    setEditingCity(null);
        const defaults = getCityDefaults('New City', 'State', true);
    setAboutParagraphs(defaults.aboutParagraphs || [defaults.aboutP1, defaults.aboutP2, defaults.aboutP3].filter(Boolean));
    setActiveTab('identity_hero');
    setShowModal(true);
  };

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
        const defaults = getCityDefaults(city.name, city.state || '', city.isMetro);
    const mergedCO = { ...defaults, ...(city.contentOverrides || {}) };

    let abPs: string[] = [];
    if (Array.isArray(mergedCO.aboutParagraphs) && mergedCO.aboutParagraphs.length > 0) {
      abPs = [...mergedCO.aboutParagraphs];
    } else {
      if (mergedCO.aboutP1) abPs.push(mergedCO.aboutP1);
      if (mergedCO.aboutP2) abPs.push(mergedCO.aboutP2);
      if (mergedCO.aboutP3) abPs.push(mergedCO.aboutP3);
      if (abPs.length === 0) abPs = [defaults.aboutP1, defaults.aboutP2, defaults.aboutP3].filter(Boolean);
    }
    setAboutParagraphs(abPs);

    setFormData({
      id: city.id,
      name: city.name,
      key: city.key,
      slug: city.slug || city.key,
      ic: city.ic || '🏙️',
      state: city.state || '',
      isMetro: city.isMetro !== undefined ? city.isMetro : true,
      isActive: city.isActive !== undefined ? city.isActive : true,
      metaTitle: city.metaTitle || defaults.metaTitle,
      metaDesc: city.metaDesc || defaults.metaDesc,
      contentOverrides: mergedCO,
      faqs: (city.faqs && city.faqs.length > 0) ? city.faqs : defaults.faqs,
      reviews: (city.reviews && city.reviews.length > 0) ? city.reviews : defaults.reviews
    });
    setActiveTab('identity_hero');
    setShowModal(true);
  };

  const handleCOChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      contentOverrides: {
        ...(prev.contentOverrides || {}),
        [key]: value
      }
    }));
  };

  /* ── Hero Image Upload Handler ── */
  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingHeroBg(true);
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch(API_URL + '/api/v1/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (data.success && data.url) {
        handleCOChange('heroBgImage', data.url);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert('Cannot connect to upload server');
    } finally {
      setUploadingHeroBg(false);
    }
  };

  /* ── Process Steps Handlers ── */
  const addProcessStep = () => {
    const list = [...(formData.contentOverrides?.processSteps || [])];
    list.push({ step: list.length + 1, title: 'New Step', desc: 'Step description details', color: '#dbeafe' });
    handleCOChange('processSteps', list);
  };

  const removeProcessStep = (idx: number) => {
    const list = [...(formData.contentOverrides?.processSteps || [])];
    list.splice(idx, 1);
    handleCOChange('processSteps', list);
  };

  const handleProcessStepChange = (idx: number, field: string, val: any) => {
    const list = [...(formData.contentOverrides?.processSteps || [])];
    list[idx] = { ...list[idx], [field]: val };
    handleCOChange('processSteps', list);
  };

  
  /* ── Section Ordering & Custom Sections Handlers ── */
  const getEffectiveSectionOrder = () => {
    const defaultIds = DEFAULT_CITY_SECTIONS.map(s => s.id);
    const customIds = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => cs.id);
    const savedOrder: string[] = formData.contentOverrides?.sectionOrder || [];

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
    handleCOChange('sectionOrder', nextOrder);
  };

  const toggleSectionVisibility = (secId: string) => {
    const hidden: string[] = formData.contentOverrides?.hiddenSections || [];
    const nextHidden = hidden.includes(secId)
      ? hidden.filter(id => id !== secId)
      : [...hidden, secId];
    handleCOChange('hiddenSections', nextHidden);
  };

    const addCustomSection = (afterSectionId?: string) => {
    const newId = 'custom_' + Date.now();
    const newSec: CustomSection = {
      id: newId,
      title: 'New Section in ' + formData.name,
      subtitle: 'Section subtitle description',
      paragraphs: ['Paragraph 1 content details for this new custom section in ' + formData.name + '.'],
      ctaText: 'Need translation assistance in ' + formData.name + '?',
      ctaBtnText: '📋 Get Instant Quote',
      ctaBtnLink: '/quote',
      insertedAfter: afterSectionId
    };
    const currentCustoms = [...((formData.contentOverrides?.customSections as CustomSection[]) || []), newSec];

    const currentOrder = getEffectiveSectionOrder();
    const nextOrder = [...currentOrder];
    if (afterSectionId && nextOrder.includes(afterSectionId)) {
      const idx = nextOrder.indexOf(afterSectionId);
      nextOrder.splice(idx + 1, 0, newId);
    } else {
      nextOrder.push(newId);
    }

    setFormData(prev => ({
      ...prev,
      contentOverrides: {
        ...(prev.contentOverrides || {}),
        customSections: currentCustoms,
        sectionOrder: nextOrder
      }
    }));
  };

  const removeCustomSection = (secId: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).filter(cs => cs.id !== secId);
    const currentOrder = getEffectiveSectionOrder().filter(id => id !== secId);
    setFormData(prev => ({
      ...prev,
      contentOverrides: {
        ...(prev.contentOverrides || {}),
        customSections: currentCustoms,
        sectionOrder: currentOrder
      }
    }));
  };

  const updateCustomSection = (secId: string, field: keyof CustomSection, val: any) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        return { ...cs, [field]: val };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const addCustomSectionParagraph = (secId: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        return { ...cs, paragraphs: [...(cs.paragraphs || []), 'New paragraph content in ' + formData.name + '.'] };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const removeCustomSectionParagraph = (secId: string, pIdx: number) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const nextPs = [...(cs.paragraphs || [])];
        nextPs.splice(pIdx, 1);
        return { ...cs, paragraphs: nextPs };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const updateCustomSectionParagraph = (secId: string, pIdx: number, val: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const nextPs = [...(cs.paragraphs || [])];
        nextPs[pIdx] = val;
        return { ...cs, paragraphs: nextPs };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const addCustomSectionBox = (secId: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
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
    handleCOChange('customSections', currentCustoms);
  };

  const updateCustomSectionBox = (secId: string, boxId: string, field: keyof CustomBox, val: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const boxes = (cs.boxes || []).map(b => b.id === boxId ? { ...b, [field]: val } : b);
        return { ...cs, boxes };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const removeCustomSectionBox = (secId: string, boxId: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const boxes = (cs.boxes || []).filter(b => b.id !== boxId);
        return { ...cs, boxes };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const updateCustomSectionBanner = (secId: string, field: keyof CustomHighlightBanner, val: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const hb = { ...(cs.highlightBanner || {}), [field]: val };
        return { ...cs, highlightBanner: hb };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  /* ── Local Services Handlers ── */
  const addLocalService = () => {
    const list = [...(formData.contentOverrides?.servicesList || [])];
    list.push({ icon: '🌐', name: 'New Service in ' + formData.name, desc: 'Service description', link: '/services' });
    handleCOChange('servicesList', list);
  };

  const removeLocalService = (idx: number) => {
    const list = [...(formData.contentOverrides?.servicesList || [])];
    list.splice(idx, 1);
    handleCOChange('servicesList', list);
  };

  const handleLocalServiceChange = (idx: number, field: string, val: any) => {
    const list = [...(formData.contentOverrides?.servicesList || [])];
    list[idx] = { ...list[idx], [field]: val };
    handleCOChange('servicesList', list);
  };

  /* ── Document Categories Handlers ── */
  const addDocCategory = () => {
    const list = [...(formData.contentOverrides?.docCategories || [])];
    list.push({
      id: 'cat-' + Date.now(),
      name: 'New Category',
      icon: '📄',
      color: '#dbeafe',
      panelTitle: 'Documents for ' + formData.name,
      panelSub: 'Certified in 120+ languages',
      docs: 'Document 1, Document 2, Document 3',
      ctaText: 'Need translation for these documents?',
      ctaBtn: '📋 Get Quote'
    });
    handleCOChange('docCategories', list);
  };

  const removeDocCategory = (idx: number) => {
    const list = [...(formData.contentOverrides?.docCategories || [])];
    list.splice(idx, 1);
    handleCOChange('docCategories', list);
  };

  const handleDocCategoryChange = (idx: number, field: string, val: any) => {
    const list = [...(formData.contentOverrides?.docCategories || [])];
    list[idx] = { ...list[idx], [field]: val };
    handleCOChange('docCategories', list);
  };

  /* ── Why Choose Us Handlers ── */
  const addWhyChooseItem = () => {
    const list = [...(formData.contentOverrides?.whyChooseList || [])];
    list.push({ icon: '🏅', title: 'Why Choose Feature', desc: 'Feature description details' });
    handleCOChange('whyChooseList', list);
  };

  const removeWhyChooseItem = (idx: number) => {
    const list = [...(formData.contentOverrides?.whyChooseList || [])];
    list.splice(idx, 1);
    handleCOChange('whyChooseList', list);
  };

  const handleWhyChooseChange = (idx: number, field: string, val: any) => {
    const list = [...(formData.contentOverrides?.whyChooseList || [])];
    list[idx] = { ...list[idx], [field]: val };
    handleCOChange('whyChooseList', list);
  };

  /* ── Reviews Handlers ── */
  const addReview = () => {
    const list = [...(formData.reviews || formData.contentOverrides?.reviews || [])];
    list.push({ stars: '★★★★★', text: '"Great service and fast delivery in ' + formData.name + '."', name: 'Client Name', role: 'Executive · ' + formData.name, avatar: 'CN' });
    setFormData(prev => ({ ...prev, reviews: list }));
    handleCOChange('reviews', list);
  };

  const removeReview = (idx: number) => {
    const list = [...(formData.reviews || formData.contentOverrides?.reviews || [])];
    list.splice(idx, 1);
    setFormData(prev => ({ ...prev, reviews: list }));
    handleCOChange('reviews', list);
  };

  const handleReviewChange = (idx: number, field: string, val: any) => {
    const list = [...(formData.reviews || formData.contentOverrides?.reviews || [])];
    list[idx] = { ...list[idx], [field]: val };
    setFormData(prev => ({ ...prev, reviews: list }));
    handleCOChange('reviews', list);
  };

  /* ── FAQs Handlers ── */
  const addFAQ = () => {
    const list = [...(formData.faqs || formData.contentOverrides?.faqs || [])];
    list.push({ q: 'Question about translation in ' + formData.name + '?', a: 'Answer explaining the details.' });
    setFormData(prev => ({ ...prev, faqs: list }));
    handleCOChange('faqs', list);
  };

  const removeFAQ = (idx: number) => {
    const list = [...(formData.faqs || formData.contentOverrides?.faqs || [])];
    list.splice(idx, 1);
    setFormData(prev => ({ ...prev, faqs: list }));
    handleCOChange('faqs', list);
  };

  const handleFAQChange = (idx: number, field: string, val: any) => {
    const list = [...(formData.faqs || formData.contentOverrides?.faqs || [])];
    list[idx] = { ...list[idx], [field]: val };
    setFormData(prev => ({ ...prev, faqs: list }));
    handleCOChange('faqs', list);
  };

  /* ── Save Form Handler ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
            const payload: any = {
        name: formData.name,
        key: formData.key,
        slug: formData.slug || formData.key,
        ic: formData.ic,
        state: formData.state,
        isMetro: formData.isMetro,
        isActive: formData.isActive,
        metaTitle: formData.contentOverrides?.metaTitle || formData.metaTitle,
        metaDesc: formData.contentOverrides?.metaDesc || formData.metaDesc,
        contentOverrides: {
          ...(formData.contentOverrides || {}),
          aboutParagraphs: aboutParagraphs.filter(p => p.trim() !== ''),
          aboutP1: aboutParagraphs[0] || '',
          aboutP2: aboutParagraphs[1] || '',
          aboutP3: aboutParagraphs[2] || ''
        },
        faqs: formData.faqs || formData.contentOverrides?.faqs,
        reviews: formData.reviews || formData.contentOverrides?.reviews
      };

      let res;
      if (editingCity && editingCity.id) {
        res = await fetch(API_URL + '/api/v1/cities/' + editingCity.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(API_URL + '/api/v1/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(editingCity ? '✓ ' + formData.name + ' updated successfully!' : '✓ ' + formData.name + ' created successfully!');
        setShowModal(false);
        await fetchCities();
      } else {
        setError(data.message || 'Failed to save city');
      }
    } catch (err) {
      setError('Cannot connect to server to save city');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete City Handler ── */
  const handleDeleteCity = async () => {
    if (!deleteConfirmCity) return;
    setDeleting(true);
    try {
      const res = await fetch(API_URL + '/api/v1/cities/' + deleteConfirmCity.id, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('✓ ' + deleteConfirmCity.name + ' deleted successfully!');
        setDeleteConfirmCity(null);
        await fetchCities();
      } else {
        setError(data.message || 'Failed to delete city');
      }
    } catch (err) {
      setError('Cannot connect to server to delete city');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Filter & Search ── */
  const statesList = Array.from(new Set(cities.map(c => c.state).filter(Boolean))).sort();
  const filteredCities = cities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.state && c.state.toLowerCase().includes(search.toLowerCase())) || c.key.toLowerCase().includes(search.toLowerCase());
    const matchesState = filterState === 'All' || c.state === filterState;
    const matchesMetro = filterMetro === 'All' || (filterMetro === 'Metro' ? c.isMetro : !c.isMetro);
    return matchesSearch && matchesState && matchesMetro;
  });

  const TABS = [
    { id: 'identity_hero' as TabId, icon: '🏙️', label: '1. Identity & Hero' },
    { id: 'about_process' as TabId, icon: '📖', label: '2. About & Process' },
    { id: 'services_docs' as TabId, icon: '📄', label: '3. Services & Docs' },
    { id: 'pricing_why' as TabId, icon: '💰', label: '4. Pricing & Why Us' },
    { id: 'reviews_faqs' as TabId, icon: '⭐', label: '5. Reviews & FAQs' },
    { id: 'sidebar_seo' as TabId, icon: '🔍', label: '6. Sidebar & SEO' },
    { id: 'layout_order' as TabId, icon: '📑', label: '7. Section Order & Layout' }
  ];

  
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
    const isHidden = (formData.contentOverrides?.hiddenSections || []).includes(sectionId);
    const isFirst = idx === 0;
    const isLast = idx === currentOrder.length - 1;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ ...sectionTitleStyle, margin: 0 }}>{title}</h4>
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
    <div key={cs.id} style={{ ...cardStyle, border: '2px solid #93c5fd', background: '#f0f7ff', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #bfdbfe', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <h4 style={{ ...sectionTitleStyle, margin: 0, color: '#1e40af' }}>Custom Section: {cs.title || 'Untitled'}</h4>
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
            onClick={() => removeCustomSection(cs.id)}
            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
          >
            🗑️ Delete Section
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle}>Section Heading / Title</label>
          <input
            style={{ ...inputStyle, background: '#fff' }}
            value={cs.title}
            onChange={e => updateCustomSection(cs.id, 'title', e.target.value)}
            placeholder="e.g. Specialized Notary & Attestation Services in Kolkata"
          />
        </div>
        <div>
          <label style={labelStyle}>Section Subtitle (Optional)</label>
          <input
            style={{ ...inputStyle, background: '#fff' }}
            value={cs.subtitle || ''}
            onChange={e => updateCustomSection(cs.id, 'subtitle', e.target.value)}
            placeholder="e.g. Fast-track government and embassy attestation"
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={labelStyle}>Paragraphs</label>
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
              style={{ ...inputStyle, resize: 'vertical', background: '#fff' }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
          <button
            type="button"
            onClick={() => addCustomSectionBox(cs.id)}
            style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
          >
            + Add Box / Card
          </button>
        </div>

        {(cs.boxes || []).length === 0 ? (
          <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '11.5px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
            No boxes added yet. Click "+ Add Box / Card" to display clickable cards (like Notarization, MEA Apostille, Embassy Attestation, Visa packages).
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
                    <label style={{ ...labelStyle, fontSize: '10px' }}>Icon / Emoji</label>
                    <input
                      style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }}
                      value={box.icon || ''}
                      onChange={e => updateCustomSectionBox(cs.id, box.id, 'icon', e.target.value)}
                      placeholder="e.g. 📋, 🏛️, 🌍"
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '10px' }}>Badge (e.g. DE, CA)</label>
                    <input
                      style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }}
                      value={box.badge || ''}
                      onChange={e => updateCustomSectionBox(cs.id, box.id, 'badge', e.target.value)}
                      placeholder="e.g. DE, CA, AU"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, fontSize: '10px' }}>Card Title</label>
                  <input
                    style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px', fontWeight: '700' }}
                    value={box.title}
                    onChange={e => updateCustomSectionBox(cs.id, box.id, 'title', e.target.value)}
                    placeholder="e.g. Notarization or Germany PR"
                  />
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, fontSize: '10px' }}>Subtitle / Price / Details</label>
                  <input
                    style={{ ...inputStyle, padding: '5px 8px', fontSize: '11.5px' }}
                    value={box.subtitle || ''}
                    onChange={e => updateCustomSectionBox(cs.id, box.id, 'subtitle', e.target.value)}
                    placeholder="e.g. ₹200/page · 1-2 days"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '10px' }}>🔗 Redirect URL / Page Link</label>
                  <input
                    style={{ ...inputStyle, padding: '5px 8px', fontSize: '11.5px', fontFamily: 'monospace', color: '#1d4ed8' }}
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

      {/* Highlight Note / Attestation Chain Banner */}
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--bd)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔗 Optional Highlight Note / Process Chain Banner</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <label style={{ ...labelStyle, fontSize: '10px' }}>Icon</label>
            <input
              style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }}
              value={cs.highlightBanner?.icon || '🔗'}
              onChange={e => updateCustomSectionBanner(cs.id, 'icon', e.target.value)}
              placeholder="🔗"
            />
          </div>
          <div>
            <label style={{ ...labelStyle, fontSize: '10px' }}>Banner Title</label>
            <input
              style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px', fontWeight: '700' }}
              value={cs.highlightBanner?.title || ''}
              onChange={e => updateCustomSectionBanner(cs.id, 'title', e.target.value)}
              placeholder="e.g. End-to-End Attestation Chain"
            />
          </div>
          <div>
            <label style={{ ...labelStyle, fontSize: '10px' }}>Redirect Link (Optional)</label>
            <input
              style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px', fontFamily: 'monospace' }}
              value={cs.highlightBanner?.link || ''}
              onChange={e => updateCustomSectionBanner(cs.id, 'link', e.target.value)}
              placeholder="e.g. /quote"
            />
          </div>
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: '10px' }}>Banner Text / Process Chain Sequence</label>
          <textarea
            rows={2}
            style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px', resize: 'vertical' }}
            value={cs.highlightBanner?.text || ''}
            onChange={e => updateCustomSectionBanner(cs.id, 'text', e.target.value)}
            placeholder="e.g. Translation → Notarization → HRD / Home Dept → MEA Apostille → Embassy Attestation → MOFA (Gulf)"
          />
        </div>
      </div>

      {/* CTA Banner Settings */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--bd)', marginBottom: '8px' }}>
          🔘 Optional Action Bar (Sub-CTA)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ ...labelStyle, fontSize: '10.5px' }}>CTA Prompt Text</label>
            <input
              style={inputStyle}
              value={cs.ctaText || ''}
              onChange={e => updateCustomSection(cs.id, 'ctaText', e.target.value)}
              placeholder="e.g. Need this service immediately?"
            />
          </div>
          <div>
            <label style={{ ...labelStyle, fontSize: '10.5px' }}>Button Label</label>
            <input
              style={inputStyle}
              value={cs.ctaBtnText || ''}
              onChange={e => updateCustomSection(cs.id, 'ctaBtnText', e.target.value)}
              placeholder="e.g. Get Instant Quote"
            />
          </div>
          <div>
            <label style={{ ...labelStyle, fontSize: '10.5px' }}>Button Link</label>
            <input
              style={inputStyle}
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
    const customs = ((formData.contentOverrides?.customSections as CustomSection[]) || []);
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

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--bd)',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Nunito', sans-serif"
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
    fontFamily: "'Nunito', sans-serif"
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Nunito', sans-serif",
    background: '#ffffff',
    color: '#1e293b',
    transition: 'border-color 0.15s ease'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav title="City Pages & Content CMS" />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--bd)', margin: 0 }}>
              🏙️ City Pages Content &amp; CMS Manager
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
              Full CRUD management for all {cities.length} city landing pages with rich pre-fills, custom sections, services, documents, and SEO controls.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{
              background: 'var(--bb)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(30,127,197,0.25)'
            }}
          >
            ➕ Add New City
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            ✕ {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {successMsg}
          </div>
        )}

        {/* Filters and Search */}
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--br)', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="🔍 Search by city name, state, or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--bd)' }}>State:</span>
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              style={{ ...inputStyle, width: 'auto', padding: '6px 12px' }}
            >
              <option value="All">All States ({cities.length})</option>
              {statesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--bd)' }}>Type:</span>
            <select
              value={filterMetro}
              onChange={e => setFilterMetro(e.target.value)}
              style={{ ...inputStyle, width: 'auto', padding: '6px 12px' }}
            >
              <option value="All">All Cities</option>
              <option value="Metro">Tier-1 Metro Only</option>
              <option value="Tier2">Tier-2 / Non-Metro Only</option>
            </select>
          </div>
        </div>

        {/* Cities Table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--br)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)', fontSize: '14px' }}>
              ⏳ Loading cities data...
            </div>
          ) : filteredCities.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)', fontSize: '14px' }}>
              No cities match your search criteria.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--br)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700', width: '50px' }}>Icon</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>City Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>State / Region</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>URL Slug</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map(city => (
                  <tr key={city.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px', fontSize: '20px', textAlign: 'center' }}>
                      {city.ic || '🏙️'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--bd)' }}>{city.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--mu)' }}>key: {city.key}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {city.state || 'India'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {city.isMetro ? (
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          Tier-1 Metro
                        </span>
                      ) : (
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                          Tier-2 City
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {slugEdit?.id === city.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="text"
                            value={slugEdit.value}
                            onChange={e => setSlugEdit({ id: city.id, value: slugify(e.target.value) })}
                            style={{ ...inputStyle, padding: '3px 6px', fontSize: '11.5px', width: '130px' }}
                            autoFocus
                          />
                          <button
                            onClick={() => saveSlug(city, slugEdit.value)}
                            disabled={slugSaving}
                            style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setSlugEdit(null)}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px', color: '#0f172a' }}>
                            /cities/{city.slug || city.key}
                          </code>
                          <button
                            onClick={() => setSlugEdit({ id: city.id, value: city.slug || city.key })}
                            style={{ background: 'none', border: 'none', color: 'var(--bb)', cursor: 'pointer', fontSize: '11px' }}
                            title="Edit URL Slug"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      {slugMsg?.id === city.id && (
                        <div style={{ fontSize: '10.5px', color: slugMsg.kind === 'ok' ? '#166534' : '#991b1b', marginTop: '2px' }}>
                          {slugMsg.text}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        background: city.isActive ? '#dcfce7' : '#fee2e2',
                        color: city.isActive ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {city.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(city)}
                          style={{
                            background: 'var(--bp)',
                            color: 'var(--bd)',
                            border: '1px solid var(--bb)',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ✏️ Edit Content
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCity(city)}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                          title="Delete City"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ─── FULL 6-TAB EDIT / CREATE MODAL ─── */}
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '1150px',
              height: '92vh',
              maxHeight: '880px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              
              {/* Modal Header */}
              <div style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #1a3a6b 0%, #1e5a9c 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0
                  }}>
                    {formData.ic || '🏙️'}
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '800',
                      fontFamily: "'Nunito', -apple-system, sans-serif",
                      color: '#ffffff',
                      letterSpacing: '-0.2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {editingCity ? 'Edit City: ' + formData.name : 'Add New City Landing Page'}
                    </h3>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.85)',
                      marginTop: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span>URL: <code style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11.5px', color: '#7dd3fc' }}>/cities/{formData.slug || formData.key || 'slug'}</code></span>
                      <span>•</span>
                      <span>State: <strong>{formData.state || 'India'}</strong></span>
                      {formData.isMetro && <span style={{ background: 'rgba(34,197,94,0.3)', color: '#86efac', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>Metro</span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="Close (Esc)"
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                >
                  ✕
                </button>
              </div>

              {/* Tabs Navigation Bar */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                padding: '6px 12px',
                gap: '4px',
                overflowX: 'auto',
                flexShrink: 0,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {TABS.map(t => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      style={{
                        padding: '9px 14px',
                        fontSize: '13px',
                        fontWeight: isActive ? '800' : '600',
                        color: isActive ? 'var(--bd)' : '#64748b',
                        background: isActive ? '#fff' : 'transparent',
                        border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease',
                        fontFamily: "'Nunito', sans-serif",
                        lineHeight: 1.2
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '15px' }}>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
                  
                  {/* ─── TAB 1: IDENTITY & HERO ─── */}
                  {activeTab === 'identity_hero' && (
                    <>
                      <div style={cardStyle}>
                        <h4 style={sectionTitleStyle}>🏙️ City Identity &amp; Routing</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>City Name</label>
                            <input
                              style={inputStyle}
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>City Key (Immutable Identifier)</label>
                            <input
                              style={{ ...inputStyle, background: editingCity ? '#f1f5f9' : '#fff' }}
                              value={formData.key}
                              onChange={e => !editingCity && setFormData({ ...formData, key: slugify(e.target.value) })}
                              readOnly={!!editingCity}
                              required
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>URL Slug (/cities/[slug])</label>
                            <input
                              style={inputStyle}
                              value={formData.slug || formData.key}
                              onChange={e => setFormData({ ...formData, slug: slugify(e.target.value) })}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>State / Union Territory</label>
                            <input
                              style={inputStyle}
                              value={formData.state}
                              onChange={e => setFormData({ ...formData, state: e.target.value })}
                              placeholder="e.g. Maharashtra, Karnataka..."
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>City Icon Emoji</label>
                            <input
                              style={{ ...inputStyle, textAlign: 'center', fontSize: '16px' }}
                              value={formData.ic}
                              onChange={e => setFormData({ ...formData, ic: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Metro Status</label>
                            <select
                              style={inputStyle}
                              value={formData.isMetro ? 'true' : 'false'}
                              onChange={e => setFormData({ ...formData, isMetro: e.target.value === 'true' })}
                            >
                              <option value="true">Tier-1 Metro</option>
                              <option value="false">Tier-2 / Non-Metro</option>
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Publish Status</label>
                            <select
                              style={inputStyle}
                              value={formData.isActive ? 'true' : 'false'}
                              onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                            >
                              <option value="true">Active (Published)</option>
                              <option value="false">Inactive (Draft)</option>
                            </select>
                          </div>
                        </div>

                        {/* Icon Quick Picker */}
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>Quick Pick Icon:</label>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {ICON_OPTIONS.map(ic => (
                              <button
                                key={ic}
                                type="button"
                                onClick={() => setFormData({ ...formData, ic })}
                                style={{
                                  background: formData.ic === ic ? 'var(--bd)' : '#fff',
                                  color: formData.ic === ic ? '#fff' : 'inherit',
                                  border: '1px solid var(--br)',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '14px',
                                  cursor: 'pointer'
                                }}
                              >
                                {ic}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={cardStyle}>
                        <h4 style={sectionTitleStyle}>🎯 Hero Header &amp; Contact Highlights</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Hero Golden Badge</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.heroBadge || ''}
                              onChange={e => handleCOChange('heroBadge', e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Hero Main Heading (HTML allowed)</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.heroTitle || ''}
                              onChange={e => handleCOChange('heroTitle', e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                          <label style={labelStyle}>Hero Subtitle</label>
                          <textarea
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            value={formData.contentOverrides?.heroSub || ''}
                            onChange={e => handleCOChange('heroSub', e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Primary Phone</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.phone1 || ''}
                              onChange={e => handleCOChange('phone1', e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Secondary Phone</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.phone2 || ''}
                              onChange={e => handleCOChange('phone2', e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>WhatsApp Number</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.whatsapp || ''}
                              onChange={e => handleCOChange('whatsapp', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Hero CTA Action Buttons */}
                        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--bd)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            🔘 Hero Action Buttons (CTAs)
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
                            <div>
                              <label style={labelStyle}>Primary Action Button Text</label>
                              <input
                                style={inputStyle}
                                value={formData.contentOverrides?.heroCtaBtn1Text ?? '⚡ Get Free Quote'}
                                onChange={e => handleCOChange('heroCtaBtn1Text', e.target.value)}
                                placeholder="e.g. ⚡ Get Free Quote"
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Primary Action Link / Target</label>
                              <input
                                style={inputStyle}
                                value={formData.contentOverrides?.heroCtaBtn1Link ?? '/quote'}
                                onChange={e => handleCOChange('heroCtaBtn1Link', e.target.value)}
                                placeholder="e.g. /quote"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                              <label style={labelStyle}>Call Button Label</label>
                              <input
                                style={inputStyle}
                                value={formData.contentOverrides?.heroCtaBtn2Text ?? '📞 Call Now'}
                                onChange={e => handleCOChange('heroCtaBtn2Text', e.target.value)}
                                placeholder="e.g. 📞 Call Now"
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>WhatsApp Button Label</label>
                              <input
                                style={inputStyle}
                                value={formData.contentOverrides?.heroCtaBtn3Text ?? '💬 WhatsApp Us'}
                                onChange={e => handleCOChange('heroCtaBtn3Text', e.target.value)}
                                placeholder="e.g. 💬 WhatsApp Us"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>Hero Trust Badges HTML</label>
                          <textarea
                            rows={4}
                            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '11.5px', resize: 'vertical' }}
                            value={formData.contentOverrides?.heroTrustBadges || ''}
                            onChange={e => handleCOChange('heroTrustBadges', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={cardStyle}>
                        <h4 style={sectionTitleStyle}>🖼️ Hero Banner Background Image</h4>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleHeroBgUpload}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingHeroBg}
                            style={{
                              background: 'var(--bp)',
                              color: 'var(--bd)',
                              border: '1px solid var(--bb)',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: uploadingHeroBg ? 'wait' : 'pointer'
                            }}
                          >
                            {uploadingHeroBg ? '⏳ Uploading...' : '📁 Upload Background Image'}
                          </button>
                          {formData.contentOverrides?.heroBgImage && (
                            <button
                              type="button"
                              onClick={() => handleCOChange('heroBgImage', '')}
                              style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              🗑️ Remove Image
                            </button>
                          )}
                        </div>
                        {formData.contentOverrides?.heroBgImage && (
                          <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--br)', background: '#0f172a' }}>
                            <img
                              src={getFullImgUrl(formData.contentOverrides?.heroBgImage)}
                              alt="Hero Background Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ─── TAB 2: ABOUT & PROCESS ─── */}
                  {activeTab === 'about_process' && (
                    <>
                                            <div style={cardStyle}>
                        {renderSectionHeader('about', '📖 About & Agency Overview in ' + formData.name, {
                          onAddParagraph: () => setAboutParagraphs([...aboutParagraphs, 'New paragraph content in ' + formData.name + '.'])
                        })}

                        <div style={{ marginBottom: '14px' }}>
                          <label style={labelStyle}>About Section Main Heading</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.aboutTitle || ''}
                            onChange={e => handleCOChange('aboutTitle', e.target.value)}
                          />
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Overview Paragraphs ({aboutParagraphs.length})</label>
                            <button
                              type="button"
                              onClick={() => setAboutParagraphs([...aboutParagraphs, 'New paragraph content in ' + formData.name + '.'])}
                              style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              + Add Paragraph
                            </button>
                          </div>
                          {aboutParagraphs.map((p, pIdx) => (
                            <div key={pIdx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>Paragraph {pIdx + 1}</span>
                                {aboutParagraphs.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...aboutParagraphs];
                                      next.splice(pIdx, 1);
                                      setAboutParagraphs(next);
                                    }}
                                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    ✕ Remove
                                  </button>
                                )}
                              </div>
                              <textarea
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical' }}
                                value={p}
                                onChange={e => {
                                  const next = [...aboutParagraphs];
                                  next[pIdx] = e.target.value;
                                  setAboutParagraphs(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                          <div>
                            <label style={labelStyle}>📍 Office Box Title</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.agencyOfficeTitle || ''}
                              onChange={e => handleCOChange('agencyOfficeTitle', e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Office Contact &amp; Address Details</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.officeAddressText || ''}
                              onChange={e => handleCOChange('officeAddressText', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      {renderInlineCustomSections('about')}

                      <div style={cardStyle}>
                        {renderSectionHeader('process', '⚡ 5-Step Translation Process in ' + formData.name, {
                          canDelete: true,
                          onDelete: () => toggleSectionVisibility('process')
                        })}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Process Tag</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.processTag || 'HOW IT WORKS'}
                              onChange={e => handleCOChange('processTag', e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Process Section Title</label>
                            <input
                              style={inputStyle}
                              value={formData.contentOverrides?.processTitle || ''}
                              onChange={e => handleCOChange('processTitle', e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                          {(formData.contentOverrides?.processSteps || []).map((st: ProcessStepItem, idx: number) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>STEP {idx + 1}</span>
                                <button type="button" onClick={() => removeProcessStep(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                              </div>
                              <div style={{ marginBottom: '6px' }}>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Step Title</label>
                                <input style={inputStyle} value={st.title} onChange={e => handleProcessStepChange(idx, 'title', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Step Description</label>
                                <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: '11.5px' }} value={st.desc} onChange={e => handleProcessStepChange(idx, 'desc', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── TAB 3: SERVICES & DOCUMENTS ─── */}
                  {activeTab === 'services_docs' && (
                    <>
                      <div style={cardStyle}>
                        {renderSectionHeader('services', '🌐 Available Services in ' + formData.name, {
                          onAddParagraph: addLocalService
                        })}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Section Heading Title</label>
                            <input style={inputStyle} value={formData.contentOverrides?.servicesTitle || ''} onChange={e => handleCOChange('servicesTitle', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Section Subtitle</label>
                            <input style={inputStyle} value={formData.contentOverrides?.servicesSubtitle || ''} onChange={e => handleCOChange('servicesSubtitle', e.target.value)} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                          {(formData.contentOverrides?.servicesList || []).map((s: LocalServiceItem, idx: number) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>Service #{idx + 1}</span>
                                <button type="button" onClick={() => removeLocalService(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px', marginBottom: '6px' }}>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Icon</label>
                                  <input style={{ ...inputStyle, textAlign: 'center' }} value={s.icon} onChange={e => handleLocalServiceChange(idx, 'icon', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Service Name</label>
                                  <input style={inputStyle} value={s.name} onChange={e => handleLocalServiceChange(idx, 'name', e.target.value)} />
                                </div>
                              </div>
                              <div style={{ marginBottom: '6px' }}>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Description</label>
                                <input style={{ ...inputStyle, fontSize: '11.5px' }} value={s.desc} onChange={e => handleLocalServiceChange(idx, 'desc', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Link URL</label>
                                <input style={{ ...inputStyle, fontSize: '11.5px' }} value={s.link} onChange={e => handleLocalServiceChange(idx, 'link', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={cardStyle}>
                        {renderSectionHeader('docs', '📄 Documents We Handle Categories in ' + formData.name, {
                          onAddParagraph: addDocCategory
                        })}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Documents Main Heading</label>
                            <input style={inputStyle} value={formData.contentOverrides?.docsTitle || ''} onChange={e => handleCOChange('docsTitle', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Documents Subtitle</label>
                            <input style={inputStyle} value={formData.contentOverrides?.docsSubtitle || ''} onChange={e => handleCOChange('docsSubtitle', e.target.value)} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {(formData.contentOverrides?.docCategories || []).map((cat: DocCategoryItem, idx: number) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--br)', paddingBottom: '6px' }}>
                                <span style={{ fontWeight: '800', color: 'var(--bd)', fontSize: '12px' }}>Category #{idx + 1}: {cat.name}</span>
                                <button type="button" onClick={() => removeDocCategory(idx)} style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}>✕ Remove</button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px', gap: '8px', marginBottom: '8px' }}>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Icon</label>
                                  <input style={{ ...inputStyle, textAlign: 'center' }} value={cat.icon} onChange={e => handleDocCategoryChange(idx, 'icon', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Category Name</label>
                                  <input style={inputStyle} value={cat.name} onChange={e => handleDocCategoryChange(idx, 'name', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Color</label>
                                  <input style={inputStyle} value={cat.color} onChange={e => handleDocCategoryChange(idx, 'color', e.target.value)} />
                                </div>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Documents List (Comma Separated)</label>
                                <textarea rows={2} style={{ ...inputStyle, fontSize: '11.5px', resize: 'vertical' }} value={cat.docs} onChange={e => handleDocCategoryChange(idx, 'docs', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── TAB 4: PRICING & WHY CHOOSE ─── */}
                  {activeTab === 'pricing_why' && (
                    <>
                      <div style={cardStyle}>
                        {renderSectionHeader('pricing', '💰 3-Tier Pricing Packages in ' + formData.name)}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={labelStyle}>Pricing Section Main Heading</label>
                          <input style={inputStyle} value={formData.contentOverrides?.pricingTitle || ''} onChange={e => handleCOChange('pricingTitle', e.target.value)} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                          {/* Package 1: Economy */}
                          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <div style={{ fontWeight: '800', fontSize: '12px', color: 'var(--bd)', marginBottom: '6px' }}>Package 1: Economy</div>
                            <div style={{ marginBottom: '6px' }}>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Name</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier1Name || ''} onChange={e => handleCOChange('tier1Name', e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Price</label>
                                <input style={inputStyle} value={formData.contentOverrides?.tier1Price || ''} onChange={e => handleCOChange('tier1Price', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Delivery</label>
                                <input style={inputStyle} value={formData.contentOverrides?.tier1Time || ''} onChange={e => handleCOChange('tier1Time', e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Features (1 per line)</label>
                              <textarea rows={3} style={{ ...inputStyle, fontSize: '11px', resize: 'vertical' }} value={formData.contentOverrides?.tier1Feats || ''} onChange={e => handleCOChange('tier1Feats', e.target.value)} />
                            </div>
                          </div>

                          {/* Package 2: Standard */}
                          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1.5px solid #86efac' }}>
                            <div style={{ fontWeight: '800', fontSize: '12px', color: '#166534', marginBottom: '6px' }}>Package 2: Standard (Recommended)</div>
                            <div style={{ marginBottom: '6px' }}>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Name</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier2Name || ''} onChange={e => handleCOChange('tier2Name', e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Price</label>
                                <input style={inputStyle} value={formData.contentOverrides?.tier2Price || ''} onChange={e => handleCOChange('tier2Price', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Delivery</label>
                                <input style={inputStyle} value={formData.contentOverrides?.tier2Time || ''} onChange={e => handleCOChange('tier2Time', e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Features (1 per line)</label>
                              <textarea rows={3} style={{ ...inputStyle, fontSize: '11px', resize: 'vertical' }} value={formData.contentOverrides?.tier2Feats || ''} onChange={e => handleCOChange('tier2Feats', e.target.value)} />
                            </div>
                          </div>

                          {/* Package 3: Express */}
                          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid var(--bb)' }}>
                            <div style={{ fontWeight: '800', fontSize: '12px', color: 'var(--bd)', marginBottom: '6px' }}>Package 3: Express 24H</div>
                            <div style={{ marginBottom: '6px' }}>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Name</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier3Name || ''} onChange={e => handleCOChange('tier3Name', e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Price</label>
                                <input style={inputStyle} value={formData.contentOverrides?.tier3Price || ''} onChange={e => handleCOChange('tier3Price', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Delivery</label>
                                <input style={inputStyle} value={formData.contentOverrides?.tier3Time || ''} onChange={e => handleCOChange('tier3Time', e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Features (1 per line)</label>
                              <textarea rows={3} style={{ ...inputStyle, fontSize: '11px', resize: 'vertical' }} value={formData.contentOverrides?.tier3Feats || ''} onChange={e => handleCOChange('tier3Feats', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={cardStyle}>
                        {renderSectionHeader('why', '🏅 Why Choose Language Guru in ' + formData.name, {
                          onAddParagraph: addWhyChooseItem
                        })}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Section Heading Title</label>
                            <input style={inputStyle} value={formData.contentOverrides?.whyChooseTitle || ''} onChange={e => handleCOChange('whyChooseTitle', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Section Subtitle</label>
                            <input style={inputStyle} value={formData.contentOverrides?.whyChooseSubtitle || ''} onChange={e => handleCOChange('whyChooseSubtitle', e.target.value)} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                          {(formData.contentOverrides?.whyChooseList || []).map((w: WhyChooseItem, idx: number) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>Why Choose Card #{idx + 1}</span>
                                <button type="button" onClick={() => removeWhyChooseItem(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px', marginBottom: '6px' }}>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Icon</label>
                                  <input style={{ ...inputStyle, textAlign: 'center' }} value={w.icon} onChange={e => handleWhyChooseChange(idx, 'icon', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Title</label>
                                  <input style={inputStyle} value={w.title} onChange={e => handleWhyChooseChange(idx, 'title', e.target.value)} />
                                </div>
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Description</label>
                                <textarea rows={2} style={{ ...inputStyle, fontSize: '11.5px', resize: 'vertical' }} value={w.desc} onChange={e => handleWhyChooseChange(idx, 'desc', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── TAB 5: REVIEWS & FAQS ─── */}
                  {activeTab === 'reviews_faqs' && (
                    <>
                      <div style={cardStyle}>
                        {renderSectionHeader('reviews', '⭐ Client Reviews & Ratings in ' + formData.name, {
                          onAddParagraph: addReview
                        })}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                          {(formData.reviews || formData.contentOverrides?.reviews || []).map((r: ReviewItem, idx: number) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>Review #{idx + 1}</span>
                                <button type="button" onClick={() => removeReview(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Stars</label>
                                  <input style={inputStyle} value={r.stars} onChange={e => handleReviewChange(idx, 'stars', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Author Name</label>
                                  <input style={inputStyle} value={r.name} onChange={e => handleReviewChange(idx, 'name', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...labelStyle, fontSize: '9px' }}>Role / Location</label>
                                  <input style={inputStyle} value={r.role} onChange={e => handleReviewChange(idx, 'role', e.target.value)} />
                                </div>
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Testimonial Quote Text</label>
                                <textarea rows={2} style={{ ...inputStyle, fontSize: '11.5px', resize: 'vertical' }} value={r.text} onChange={e => handleReviewChange(idx, 'text', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={cardStyle}>
                        {renderSectionHeader('faqs', '❓ Frequently Asked Questions in ' + formData.name, {
                          onAddParagraph: addFAQ
                        })}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(formData.faqs || formData.contentOverrides?.faqs || []).map((faq: FAQ, idx: number) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>FAQ #{idx + 1}</span>
                                <button type="button" onClick={() => removeFAQ(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                              </div>
                              <div style={{ marginBottom: '6px' }}>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Question</label>
                                <input style={inputStyle} value={faq.q} onChange={e => handleFAQChange(idx, 'q', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Answer</label>
                                <textarea rows={2} style={{ ...inputStyle, fontSize: '11.5px', resize: 'vertical' }} value={faq.a} onChange={e => handleFAQChange(idx, 'a', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  
                  {/* ─── TAB 7: SECTION ORDER & LAYOUT ─── */}
                  {activeTab === 'layout_order' && (
                    <>
                      <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h4 style={{ ...sectionTitleStyle, margin: 0 }}>📑 Section Order &amp; Page Layout Builder</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                              Reorder sections, hide/unhide any section, or create new custom sections with dedicated paragraphs and CTAs for {formData.name}.
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => addCustomSection()}
                              style={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 6px rgba(30,64,175,0.25)'
                              }}
                            >
                              ➕ Add New Custom Section
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCOChange('sectionOrder', DEFAULT_CITY_SECTIONS.map(s => s.id))}
                              style={{
                                background: '#fff',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              ↺ Reset Default Order
                            </button>
                          </div>
                        </div>

                        {/* Ordered Sections List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                          {getEffectiveSectionOrder().map((secId, idx, arr) => {
                            const defSec = DEFAULT_CITY_SECTIONS.find(s => s.id === secId);
                            const customSec = ((formData.contentOverrides?.customSections as CustomSection[]) || []).find(cs => cs.id === secId);
                            const isHidden = (formData.contentOverrides?.hiddenSections || []).includes(secId);
                            const isFirst = idx === 0;
                            const isLast = idx === arr.length - 1;

                            return (
                              <div
                                key={secId}
                                style={{
                                  background: isHidden ? '#f8fafc' : '#ffffff',
                                  border: '1.5px solid ' + (isHidden ? '#e2e8f0' : (customSec ? '#bfdbfe' : '#cbd5e1')),
                                  borderRadius: '10px',
                                  padding: '12px 16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  boxShadow: isHidden ? 'none' : '0 1px 4px rgba(0,0,0,0.04)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: isHidden ? '#cbd5e1' : (customSec ? '#1d4ed8' : '#0f172a'),
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    {idx + 1}
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
                      {((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => renderCustomSectionEditorCard(cs))}
                    </>
                  )}

                  {/* ─── TAB 6: SIDEBAR & SEO ─── */}
                  {activeTab === 'sidebar_seo' && (
                    <>
                      <div style={cardStyle}>
                        <h4 style={sectionTitleStyle}>📞 Sidebar Contact Widgets for {formData.name}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>Sidebar Phone</label>
                            <input style={inputStyle} value={formData.contentOverrides?.sidebarPhone1 || ''} onChange={e => handleCOChange('sidebarPhone1', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Sidebar Email</label>
                            <input style={inputStyle} value={formData.contentOverrides?.sidebarEmail || ''} onChange={e => handleCOChange('sidebarEmail', e.target.value)} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div>
                            <label style={labelStyle}>Working Hours</label>
                            <input style={inputStyle} value={formData.contentOverrides?.sidebarHours || ''} onChange={e => handleCOChange('sidebarHours', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Office Location Text</label>
                            <input style={inputStyle} value={formData.contentOverrides?.sidebarAddress || ''} onChange={e => handleCOChange('sidebarAddress', e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div style={cardStyle}>
                        <h4 style={sectionTitleStyle}>⚡ Bottom Call-to-Action Banner</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={labelStyle}>CTA Heading</label>
                            <input style={inputStyle} value={formData.contentOverrides?.ctaTitle || ''} onChange={e => handleCOChange('ctaTitle', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>CTA Subtitle</label>
                            <input style={inputStyle} value={formData.contentOverrides?.ctaSubtitle || ''} onChange={e => handleCOChange('ctaSubtitle', e.target.value)} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div>
                            <label style={labelStyle}>Primary Button Text</label>
                            <input style={inputStyle} value={formData.contentOverrides?.ctaBtnPrimary || ''} onChange={e => handleCOChange('ctaBtnPrimary', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Secondary Button Text</label>
                            <input style={inputStyle} value={formData.contentOverrides?.ctaBtnSecondary || ''} onChange={e => handleCOChange('ctaBtnSecondary', e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div style={cardStyle}>
                        <h4 style={sectionTitleStyle}>🔍 SEO Meta Data &amp; Search Engine Optimization</h4>
                        <div style={{ marginBottom: '14px' }}>
                          <label style={labelStyle}>SEO Meta Title (Title Tag)</label>
                          <input style={inputStyle} value={formData.contentOverrides?.metaTitle || formData.metaTitle || ''} onChange={e => { handleCOChange('metaTitle', e.target.value); setFormData({ ...formData, metaTitle: e.target.value }); }} />
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                          <label style={labelStyle}>SEO Meta Description</label>
                          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.metaDesc || formData.metaDesc || ''} onChange={e => { handleCOChange('metaDesc', e.target.value); setFormData({ ...formData, metaDesc: e.target.value }); }} />
                        </div>
                        <div>
                          <label style={labelStyle}>Meta Keywords (Comma separated)</label>
                          <input style={inputStyle} value={formData.contentOverrides?.metaKeywords || ''} onChange={e => handleCOChange('metaKeywords', e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}

                </div>

                {/* Modal Footer */}
                <div style={{
                  padding: '14px 24px',
                  background: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                  boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Active Tab:</span>
                    <strong style={{ color: 'var(--bd)', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                      {TABS.find(t => t.id === activeTab)?.label}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        background: 'linear-gradient(135deg, var(--bm) 0%, var(--bb) 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 22px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: saving ? 'wait' : 'pointer',
                        boxShadow: '0 4px 14px rgba(30,127,197,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {saving ? '⏳ Saving...' : '💾 Save City Content'}
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ─── DELETE CONFIRMATION MODAL ─── */}
        {deleteConfirmCity && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '24px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#991b1b', margin: '0 0 8px 0' }}>Delete City?</h3>
              <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deleteConfirmCity.name}</strong> (/cities/{deleteConfirmCity.slug || deleteConfirmCity.key})? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCity(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid var(--br)', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCity}
                  disabled={deleting}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: deleting ? 'wait' : 'pointer' }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete City'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
