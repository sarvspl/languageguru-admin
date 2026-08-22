'use client';

import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';


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

interface ComparisonRow {
  feat: string;
  std: string;
  our: string;
}

interface DocCategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  panelTitle: string;
  panelSub: string;
  docs: string;
  ctaText?: string;
  ctaBtn?: string;
}

interface OtherServiceItem {
  icon: string;
  name: string;
  desc: string;
  link: string;
}

interface SampleCertItem {
  doc: string;
  lang: string;
  flag: string;
  seal?: string;
  acc: string;
  time: string;
  icon: string;
}

interface WhyChooseItem {
  icon: string;
  title: string;
  desc: string;
}

interface ReviewItem {
  stars: string;
  text: string;
  name: string;
  role: string;
  avatar: string;
}

interface FAQItem {
  q: string;
  a: string;
}

interface ProcessStepItem {
  step: number;
  title: string;
  desc: string;
}

interface PricingTierItem {
  name: string;
  badge?: string;
  price: string;
  unit: string;
  delivery: string;
  features: string;
}

interface Service {
  id: string;
  key: string;
  slug?: string;
  name: string;
  icon: string;
  price: number;
  fast?: string;
  description?: string;
  label?: string;
  tag?: string;
  title?: string;
  alt?: string;
  p1?: string;
  p2?: string;
  features?: string[];
  docs?: string[];
  ctaLabel?: string;
  ctaKey?: string;
  certLang?: string;
  certDoc?: string;
  certFlag?: string;
  certAcc?: string;
  certTime?: string;
  certIcon?: string;
  metaTitle?: string;
  metaDesc?: string;
  faqs?: FAQItem[];
  reviews?: any[];
  contentOverrides?: Record<string, any>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const TABS = [
  { id: 'hero', label: '🎨 1. Hero & Badges' },
  { id: 'process', label: '⚡ 2. 5-Step Process' },
  { id: 'about_agency', label: '📖 3. Overview & Agency' },
  { id: 'comparison_docs', label: '⚖️ 4. Comparison & Docs' },
  { id: 'other_services', label: '🌐 5. Other 15 Services' },
  { id: 'pricing_samples', label: '💰 6. Pricing & Samples' },
  { id: 'why_sidebar', label: '🏆 7. Why Us & Sidebar' },
  { id: 'reviews_faqs', label: '⭐ 8. Reviews & FAQs' },
  { id: 'cta_seo', label: '🔍 9. CTA & SEO' },
  { id: 'layout_order', label: '📑 10. Section Order & Layout' },
];


const DEFAULT_SERVICE_SECTIONS = [
  { id: 'about', label: '📖 Overview & Agency Overview', tab: 'about_agency' },
  { id: 'process', label: '⚡ 5-Step Translation Process', tab: 'process' },
  { id: 'agency', label: '🏢 Agency Trust Badges & Office', tab: 'about_agency' },
  { id: 'other_services', label: '🌐 Other 15 Services Grid', tab: 'other_services' },
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);

  // Dynamic state arrays for modal
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>([]);
  const [agencyParagraphs, setAgencyParagraphs] = useState<string[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStepItem[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTierItem[]>([]);
  const [whyChooseList, setWhyChooseList] = useState<WhyChooseItem[]>([]);
  const [includesList, setIncludesList] = useState<string[]>([]);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [faqsList, setFaqsList] = useState<FAQItem[]>([]);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    key: string;
    slug: string;
    icon: string;
    description: string;
    price: number;
    metaTitle: string;
    metaDesc: string;
    title: string;
    label: string;
    p1: string;
    p2: string;
    faqs: FAQItem[];
    contentOverrides: Record<string, any>;
  }>({
    id: '',
    name: '',
    key: '',
    slug: '',
    icon: '🌐',
    description: '',
    price: 850,
    metaTitle: '',
    metaDesc: '',
    title: '',
    label: '',
    p1: '',
    p2: '',
    faqs: [],
    contentOverrides: {}
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/v1/services/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getServiceDefaults = (name: string, key: string, priceVal: number = 850) => {
    const SN = name || 'Academic Translation';
    const snLow = SN.toLowerCase();
    const city = 'Delhi';
    const pEcon = Math.round(priceVal * 0.7);
    const pExp = Math.round(priceVal * 1.5);

    const defaultComparisonRows: ComparisonRow[] = [
      { feat: 'Translator Qualification', std: 'Freelance / General linguist', our: 'Certified Native & Domain Specialist' },
      { feat: 'Certification Letterhead', std: 'Plain Word Document / None', our: 'Official Corporate Letterhead + ISO Stamp' },
      { feat: 'Certificate of Accuracy', std: 'Not included (extra cost)', our: 'Included Free with Every Order' },
      { feat: 'Embassy & Court Acceptance', std: 'Not guaranteed', our: '100% Unconditional Embassy Acceptance' },
      { feat: 'Quality Control Workflow', std: 'Single translator check', our: '3-Stage Review: Linguist + SME + QA' },
      { feat: 'Turnaround Time', std: '3–5 Business Days', our: 'Same Day / 24-Hr Express Delivery' },
      { feat: 'Data Privacy & Security', std: 'Standard email handling', our: 'End-to-End Encrypted + Strict NDA' }
    ];

    const defaultDocCategories: DocCategoryItem[] = [
      {
        id: 'academic',
        name: 'Academic',
        icon: '🎓',
        color: '#dcfce7',
        panelTitle: `Academic Documents for ${SN}`,
        panelSub: `Available in 120+ languages with international certification & embassy acceptance in ${city}`,
        docs: 'Degree Certificate, Mark Sheets / Transcripts, Migration Certificate, School Leaving Cert, DDV (Germany), Research Papers, Scholarship Docs, Medium of Instruction Cert',
        ctaText: 'Need translation for any of these Academic documents?',
        ctaBtn: '📋 Get Quote for Academic'
      },
      {
        id: 'immigration',
        name: 'Immigration & Visa',
        icon: '🛂',
        color: '#dbeafe',
        panelTitle: `Immigration & Visa for ${SN}`,
        panelSub: `Available in 120+ languages with embassy acceptance & MEA apostille in ${city}`,
        docs: 'Birth Certificate, Marriage Certificate, Death Certificate, Police Clearance (PCC), Domicile Certificate, Sponsor Letter, Passport Pages, Travel History',
        ctaText: 'Need translation for any of these Immigration & Visa documents?',
        ctaBtn: '📋 Get Quote for Immigration & Visa'
      },
      {
        id: 'legal',
        name: 'Legal Documents',
        icon: '⚖️',
        color: '#fef3c7',
        panelTitle: `Legal Documents for ${SN}`,
        panelSub: 'Certified & notarized for high courts, district courts and international arbitration',
        docs: 'Court Orders / Judgments, Power of Attorney, Partnership Deed, Property Papers, Affidavits, Legal Notices, MOA / AOA, Contracts & Agreements',
        ctaText: 'Need translation for any of these Legal documents?',
        ctaBtn: '📋 Get Quote for Legal Documents'
      },
      {
        id: 'medical',
        name: 'Medical',
        icon: '🏥',
        color: '#fce7f3',
        panelTitle: `Medical Documents for ${SN}`,
        panelSub: 'Domain-expert medical translators for hospitals, clinics and visa health checks',
        docs: 'Medical Reports, Hospital Records, Prescriptions, Lab Reports, Clinical Trial Docs, Pharma Documents, Disability Certificates',
        ctaText: 'Need translation for any of these Medical documents?',
        ctaBtn: '📋 Get Quote for Medical'
      },
      {
        id: 'financial',
        name: 'Financial & Business',
        icon: '💼',
        color: '#fff7ed',
        panelTitle: `Financial & Business for ${SN}`,
        panelSub: 'Accurate financial translation for audit, tax filing, banks and visa embassies',
        docs: 'Bank Statements, Income Tax Returns, Balance Sheets, Annual Reports, Company Registration, Business Contracts, Investment Docs',
        ctaText: 'Need translation for any of these Financial & Business documents?',
        ctaBtn: '📋 Get Quote for Financial'
      },
      {
        id: 'technical',
        name: 'Technical',
        icon: '🔬',
        color: '#f0fdf4',
        panelTitle: `Technical Documents for ${SN}`,
        panelSub: 'Engineering drawings, specs, user manuals, safety datasheets and patents',
        docs: 'User Manuals, Engineering Drawings, Patents & IP Filings, Technical Specifications, MSDS / Safety Sheets, Software Strings / UI',
        ctaText: 'Need translation for any of these Technical documents?',
        ctaBtn: '📋 Get Quote for Technical'
      }
    ];

    const defaultOtherServices: OtherServiceItem[] = [
      { icon: '🏅', name: 'Certified Translation', desc: 'Embassy & court accepted certified translations', link: '/services/certified' },
      { icon: '🔏', name: 'Notarized Translation', desc: 'Notary-sealed certified translations for legal & official use', link: '/services/notarization' },
      { icon: '🌐', name: 'Apostille & Attestation', desc: 'MEA apostille + embassy, HRD & notary attestation', link: '/services/apostille' },
      { icon: '📋', name: 'Document Translation', desc: 'Birth, marriage, degree, medical & all personal docs', link: '/services/document' },
      { icon: '🎓', name: 'Academic Translation', desc: 'Degrees, transcripts, mark sheets, educational certificates', link: '/services/academic' },
      { icon: '✈️', name: 'Immigration Translation', desc: 'Visa applications, immigration documents, PCC', link: '/services/immigration' },
      { icon: '⚖️', name: 'Legal Translation', desc: 'Court orders, contracts, agreements, affidavits', link: '/services/legal' },
      { icon: '🏥', name: 'Medical Translation', desc: 'Medical reports, clinical docs, pharma documents', link: '/services/medical' },
      { icon: '💼', name: 'Business Translation', desc: 'Corporate docs, annual reports, business contracts', link: '/services/business' },
      { icon: '📊', name: 'Financial Translation', desc: 'Bank statements, financial reports, balance sheets', link: '/services/financial' },
      { icon: '⚙️', name: 'Technical Translation', desc: 'Manuals, engineering docs, technical specs', link: '/services/technical' },
      { icon: '🎙️', name: 'Interpretation', desc: 'Simultaneous, consecutive, conference interpretation', link: '/services/interpretation' },
      { icon: '🌍', name: 'Website Translation', desc: 'Multilingual websites, CMS localization, SEO', link: '/services/website' },
      { icon: '🎬', name: 'Voiceover & Subtitling', desc: 'Video subtitling, dubbing, audio transcription', link: '/services/voiceover' },
      { icon: '📜', name: 'Attestation Services', desc: 'HRD, MEA, Embassy, SDM, Notary attestation', link: '/services/attestation' }
    ];

    const defaultProcessSteps: ProcessStepItem[] = [
      { step: 1, title: 'Submit Docs', desc: `Email / WhatsApp / Drop-off at ${city} office` },
      { step: 2, title: 'Get Quote', desc: 'Instant price in 30 minutes' },
      { step: 3, title: 'Expert Translates', desc: 'Native translator + domain expert' },
      { step: 4, title: 'QA + Certify', desc: 'Proofreader + letterhead + Certificate of Accuracy' },
      { step: 5, title: 'Delivery', desc: `Soft copy + courier to ${city}` }
    ];

    const defaultPricingTiers: PricingTierItem[] = [
      {
        name: 'Economy',
        price: `₹${pEcon}`,
        unit: 'per page',
        delivery: '⏱ 5–7 Working Days',
        features: 'Simple Translation\nCompany Sign & Seal\nOfficial Letterhead\nSoft Copy PDF\n! ISO Certification'
      },
      {
        name: 'Certified',
        badge: '⭐ MOST POPULAR',
        price: `₹${priceVal}`,
        unit: 'per page',
        delivery: '⏱ 3–5 Working Days',
        features: `${SN}\nOfficial Letterhead\nISO Certified\nCertificate of Accuracy\nEmbassy Accepted`
      },
      {
        name: 'Express',
        price: `₹${pExp}`,
        unit: 'per page',
        delivery: '⚡ 24 Hours',
        features: 'All Features\nPriority Handling\nDedicated Manager\nWhatsApp Updates\nFree Courier'
      }
    ];

    const defaultWhyChooseList: WhyChooseItem[] = [
      { icon: '🏅', title: 'ISO-9001:2015 & ISO 17100:2015 Certified', desc: 'Quality management system certified by leading international bodies.' },
      { icon: '🏛️', title: 'Government Authorized', desc: `MSME registered and internationally certified. Accepted by MEA, all courts and all embassies in ${city}.` },
      { icon: '🌍', title: '120+ Languages', desc: 'Native speakers for every language — European, Asian, Middle Eastern and Indian regional languages.' },
      { icon: '✅', title: 'All Embassy Accepted', desc: 'German, French, US, UK, Canadian, Australian, UAE and 60+ embassies in New Delhi.' },
      { icon: '⚡', title: '24-Hour Express', desc: `Urgent ${SN} in 24 hours for all common language pairs. Weekend service available.` },
      { icon: '🔒', title: '100% Confidential', desc: 'NDA-backed confidentiality. Secure document handling. GDPR-compliant data practices.' },
      { icon: '📧', title: 'Easy Document Submission', desc: `Submit documents at our ${city} office or share scanned copies via email / WhatsApp.` }
    ];

    const defaultSampleCerts: SampleCertItem[] = [
      { doc: 'Degree Certificate', lang: 'English → Spanish', flag: '🇪🇸', seal: '🇪🇸', acc: 'Spanish Embassy', time: '24 Hrs', icon: '🎓' },
      { doc: 'Academic Transcript', lang: 'English → German', flag: '🇩🇪', seal: '🇩🇪', acc: 'German Embassy', time: '48 Hrs', icon: '📋' },
      { doc: 'School Leaving Certificate', lang: 'Hindi → English', flag: '🇬🇧', seal: '🇬🇧', acc: 'UK NARIC / Embassy', time: '24 Hrs', icon: '📜' },
      { doc: 'Migration Certificate', lang: 'English → French', flag: '🇫🇷', seal: '🇫🇷', acc: 'French Consulate', time: '48 Hrs', icon: '🎓' },
      { doc: 'Mark Sheet Translation', lang: 'English → Arabic', flag: '🇸🇦', seal: '🇸🇦', acc: 'Saudi Ministry', time: '48 Hrs', icon: '📄' },
      { doc: 'Diploma Certificate', lang: 'English → Italian', flag: '🇮🇹', seal: '🇮🇹', acc: 'Italian Embassy', time: '24 Hrs', icon: '🎓' }
    ];

    const defaultIncludesList: string[] = [
      'Native Human Translator with Subject Expertise',
      'Official Language Guru Letterhead & Stamp',
      'Certificate of Accuracy with Translator Declaration',
      'ISO-9001:2015 & ISO 17100:2015 Certification Seal',
      '100% Embassy, Court & Government Acceptance',
      'Digital Soft Copy (PDF) via Email / WhatsApp',
      'Free Stamped Hard Copy Door Delivery'
    ];

    const defaultAboutParagraphs: string[] = [
      `<strong>Language Guru</strong> is ${city}'s most trusted ISO-9001:2015 and ISO 17100:2015 certified translation agency with offices at 617, West End Mall, Janakpuri, New Delhi. Since 2005, we have delivered 50,000+ ${snLow} in ${city} NCR, covering 120+ languages and all document types for immigration, legal, academic, medical and corporate purposes.`,
      `Our ${snLow} includes official letterhead, Certified Seal & Sign, Certificate of Accuracy, and ISO certification – accepted by all 60+ embassies in New Delhi, MEA (Ministry of External Affairs), Delhi High Court, district courts and top universities worldwide.`
    ];

    const defaultAgencyParagraphs: string[] = [
      `Language Guru is ${city}'s leading ISO-9001:2015 and ISO 17100:2015 certified ${snLow} agency, operating since 2005 with a dedicated team of 500+ qualified translators, legal specialists and domain experts. As an MSME-registered, government-authorized translation agency in ${city}, Language Guru has delivered 50,000+ certified ${snLow} projects accepted by all 60+ embassies in New Delhi, MEA (Ministry of External Affairs), all district courts and high courts, and top universities and corporations worldwide.`,
      `Our ${snLow} agency in ${city} offers end-to-end solutions: from initial document collection (share scanned copies via email / WhatsApp from anywhere in ${city}) to expert translation by native-speaking, domain-certified professionals, through rigorous 3-stage quality control, ISO certification and final delivery by speed post or express courier. We handle everything in-house – no outsourcing – ensuring consistent quality and absolute confidentiality under NDA-backed security protocols.`,
      `Language Guru's ${city} ${snLow} agency serves individuals, law firms, hospitals, embassies, MNCs, government departments, universities and export-import businesses across ${city} NCR and pan-India. Our clients include the Ministry of External Affairs, Delhi High Court, AIIMS, IITs, State Bank of India, Tata Consultancy Services, Sun Pharmaceutical and 500+ other organizations. Call +91-9312690490 or WhatsApp for an instant quote and free consultation from our ${city} ${snLow} team.`
    ];

    const defaultReviews: ReviewItem[] = [
      {
        stars: '★★★★★',
        text: `"Language Guru provided certified ${snLow} for my Germany visa in 24 hours. The embassy accepted it immediately without questions. Super fast and reliable!"`,
        name: 'Rohit Sharma',
        role: `Student Visa Applicant · ${city}`,
        avatar: 'RS'
      },
      {
        stars: '★★★★★',
        text: `"Outstanding legal ${snLow} for our corporate contract. Accurate terminology and prompt delivery with official Certificate of Accuracy. Highly recommended!"`,
        name: 'Pooja Verma',
        role: `Corporate Legal Counsel · ${city}`,
        avatar: 'PV'
      },
      {
        stars: '★★★★★',
        text: `"Very professional team. Got my French academic transcripts and degree certificate translated in 2 days. Clear pricing and no hidden costs."`,
        name: 'Aakash Gupta',
        role: `Higher Studies · ${city}`,
        avatar: 'AG'
      }
    ];

    return {
      // Basic / Hero
      heroBgImage: '',
      heroTitle: `${SN}<br>Services in <em>${city}</em>`,
      heroSub: `Language Guru is ${city}'s leading ${snLow} agency – ISO-9001:2015 and ISO 17100:2015 certified. 120+ languages, 50,000+ documents delivered, accepted by all embassies, courts and universities. Serving ${city} since 2005.`,
      heroBadge: 'Govt. Authorized · Embassy Approved · MSME Registered',
      heroIso: 'ISO-9001:2015 and ISO 17100:2015 CERTIFIED',
      heroBadgesList: '✅ All Embassy Accepted | ⚡ 24-Hr Express | 🔏 Notarized & Apostilled | ⭐ 4.9/5 · 2,847 Reviews',

      // Hero Buttons
      heroBtn1Text: '📋 Get Free Quote',
      heroBtn1Link: '/quote',
      heroBtn2Text: '📞 Call Expert',
      heroBtn2Phone: '+919312690490',
      heroBtn3Text: '💬 WhatsApp',
      heroBtn3WA: '919312690490',

      // 5-Step Process
      processTag: 'How It Works',
      processTitle: `5-Step ${SN} Process`,
      processSteps: defaultProcessSteps,

      // Main Overview & Paragraphs
      aboutTitle: `${SN} Services in ${city} – Language Guru`,
      aboutParagraphs: defaultAboutParagraphs,
      aboutP1: defaultAboutParagraphs[0],
      aboutP2: defaultAboutParagraphs[1],

      // Agency Section & Office Title
      agencyTitle: `${SN} Agency in ${city}`,
      agencyParagraphs: defaultAgencyParagraphs,
      agencyP1: defaultAgencyParagraphs[0],
      agencyP2: defaultAgencyParagraphs[1],
      agencyP3: defaultAgencyParagraphs[2],

      // 6 Trust Cards & Office Address Bar
      trustCard1: '🏛️ Govt. Authorized | MSME Reg. · ISO-9001:2015 and ISO 17100:2015',
      trustCard2: `⭐ 4.9/5 Rating | 2,847 verified Google reviews in ${city}`,
      trustCard3: '🚗 Easy Submission | Office / email / WhatsApp submission',
      trustCard4: `⚡ 24-Hr Express | Urgent ${snLow} in 24 hours`,
      trustCard5: '✅ 100% Accepted | All embassies · All courts · MEA New Delhi',
      trustCard6: '🔒 Confidential | NDA-backed · GDPR compliant · Secure',
      agencyOfficeTitle: `📍 ${SN} Agency – ${city} Office`,
      officeAddressText: '617, West End Mall, Janakpuri, New Delhi – 110058 | 📞 +91-9312690490 | ✉ info@languageguruindia.com | Open Mon–Sat 9AM–7PM',

      // Comparison & Documents Handled
      diffTitle: `Standard vs ${SN} – What's the Difference?`,
      diffCol1Header: 'Standard Translation',
      diffCol2Header: `${SN} (Our Service)`,
      diffRows: defaultComparisonRows,
      docsTitle: `${SN} Documents We Handle in ${city}`,
      docsSubtitle: 'We handle 100+ document types across all categories. Click a category to explore:',
      docCategories: defaultDocCategories,

      // Other 15 Translation Services Section
      otherSvcsTitle: `Other Translation Service Types in ${city}`,
      otherSvcsSubtitle: `Language Guru provides a full range of certified translation services in ${city}. Explore all service types:`,
      otherServicesList: defaultOtherServices,

      // Comprehensive 3-Tier Pricing Breakdown
      pricingTitle: `${SN} Pricing in ${city}`,
      pricingTiers: defaultPricingTiers,
      tier1Price: `₹${pEcon}`,
      tier2Price: `₹${priceVal}`,
      tier3Price: `₹${pExp}`,
      pricingAddons: '➕ Add-ons: Notarization ₹200/page · MEA Apostille ₹1,400/page · Embassy Attestation ₹5,500/page · Courier ₹200 | Bulk: 10+ pages – 10% off · 20+ pages – 15% off',
      certSampleTitle: `${SN} Certificate Samples`,
      certSampleSubtitle: `View verified ISO-certified samples for ${SN} in ${city}:`,
      sampleCertsList: defaultSampleCerts,

      // Why Choose Us & Sidebar
      whyChooseTitle: `Why Choose Language Guru in ${city}?`,
      whyChooseList: defaultWhyChooseList,
      
      // Sidebar Full Customization
      sidebarCtaTitle: `Need Official ${SN}?`,
      sidebarCtaSub: 'Talk directly with our senior language specialists for instant price estimates & document verification.',
      sidebarPhone1: '+91-9312690490',
      sidebarPhone2: '+91-9810693777',
      sidebarBtn1Text: '⚡ Get Instant Quote',
      sidebarBtn1Link: '/quote',
      sidebarBtn2Text: '💬 WhatsApp Consultation',
      sidebarBtn2WA: '919312690490',
      
      includesTitle: `What Every ${SN} Includes`,
      includesItems: defaultIncludesList,
      sidebarCitiesTitle: `🏙️ ${SN} – Available Cities`,
      sidebarLangsTitle: '🌐 Popular Languages',
      sidebarOtherSvcsTitle: '📋 Other Services',
      sidebarOtherSvcsLimit: 12,
      certificationsTitle: 'Government Accreditations',

      // Reviews & FAQs
      reviewsTitle: `Client Reviews – ${SN} ${city}`,
      reviewsList: defaultReviews,
      faqsTitle: `FAQs – ${SN} ${city}`,

      // Bottom CTA & SEO
      ctaTitle: `Need ${SN} in ${city}?`,
      ctaSubtitle: 'Instant quote in 30 minutes. 24-hour express. Email / WhatsApp submission.',
      metaTitle: `${SN} Services ${city} | Language Guru`,
      metaDesc: `Professional ${snLow} services in ${city} - ISO-9001:2015 & ISO 17100:2015 certified. Embassy-accepted, court-ready, MSME registered. Language Guru ${city}.`
    };
  };

  const defaultFaqsFor = (name: string) => {
    const SN = name || 'Academic Translation';
    const city = 'Delhi';
    return [
      { q: `Are your translations accepted by all Govt Departments & Indian Courts?`, a: 'Yes — our certified translations carry the Agency Sign & Stamp and Certificate of Accuracy under ISO-9001:2015 and ISO 17100:2015 standards, and are routinely accepted by Indian government departments, courts, passport offices, RTOs, universities and banks.' },
      { q: `How much does ${SN} cost in ${city}?`, a: `${SN} in ${city} starts from ₹600/page (standard), ₹850/page (certified with letterhead + Certificate of Accuracy), and ₹1,275/page (express 24hr). Bulk discounts available.` },
      { q: `Do you provide ${SN} in cities other than ${city}?`, a: `Yes! We provide ISO-certified, embassy-approved ${SN} in 150+ cities including Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Chandigarh, Jaipur, Noida, Gurgaon and more.` },
      { q: `Which languages do you support for ${SN} in ${city}?`, a: 'We support 120+ language pairs: German, French, Spanish, Italian, Russian, Portuguese, Dutch, Chinese, Japanese, Korean, Arabic, Turkish, Thai, Vietnamese, and all Indian regional languages.' },
      { q: `How do I submit my documents in ${city}?`, a: `Submit at our ${city} office or share scanned copies via email / WhatsApp — 100% online process with free courier delivery.` },
      { q: `Are your ${SN} accepted by all embassies?`, a: 'Our certified translations are routinely submitted to the German, French and US Embassies, the Australian, Canadian and British High Commissions, the UAE Embassy and 60+ embassies in New Delhi.' }
    ];
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    const defaults = getServiceDefaults('New Service', 'new-service', 850);
    
    setAboutParagraphs(defaults.aboutParagraphs || []);
    setAgencyParagraphs(defaults.agencyParagraphs || []);
    setProcessSteps(defaults.processSteps || []);
    setPricingTiers(defaults.pricingTiers || []);
    setWhyChooseList(defaults.whyChooseList || []);
    setIncludesList(defaults.includesItems || []);
    setReviewsList(defaults.reviewsList || []);
    setFaqsList(defaultFaqsFor('New Service'));

    setFormData({
      id: '',
      name: 'New Service',
      key: 'new-service',
      slug: 'new-service',
      icon: '🌐',
      description: defaults.heroSub,
      price: 850,
      metaTitle: defaults.metaTitle,
      metaDesc: defaults.metaDesc,
      title: defaults.heroTitle,
      label: defaults.aboutTitle,
      p1: defaults.aboutParagraphs[0] || '',
      p2: defaults.aboutParagraphs[1] || '',
      faqs: defaultFaqsFor('New Service'),
      contentOverrides: defaults
    });
    setActiveTab('hero');
    setShowModal(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    const defaults = getServiceDefaults(svc.name, svc.key, svc.price || 850);
    const cO: Record<string, any> = { ...defaults, ...(svc.contentOverrides || {}) };

    // Extract About Paragraphs
    let abPs: string[] = [];
    if (Array.isArray(cO.aboutParagraphs) && cO.aboutParagraphs.length > 0) {
      abPs = [...cO.aboutParagraphs];
    } else {
      if (cO.aboutP1) abPs.push(cO.aboutP1);
      if (cO.aboutP2) abPs.push(cO.aboutP2);
      if (cO.aboutP3) abPs.push(cO.aboutP3);
      if (cO.aboutP4) abPs.push(cO.aboutP4);
      if (cO.aboutP5) abPs.push(cO.aboutP5);
      if (abPs.length === 0) abPs = defaults.aboutParagraphs || [];
    }
    setAboutParagraphs(abPs);

    // Extract Agency Paragraphs
    let agPs: string[] = [];
    if (Array.isArray(cO.agencyParagraphs) && cO.agencyParagraphs.length > 0) {
      agPs = [...cO.agencyParagraphs];
    } else {
      if (cO.agencyP1) agPs.push(cO.agencyP1);
      if (cO.agencyP2) agPs.push(cO.agencyP2);
      if (cO.agencyP3) agPs.push(cO.agencyP3);
      if (cO.agencyP4) agPs.push(cO.agencyP4);
      if (cO.agencyP5) agPs.push(cO.agencyP5);
      if (agPs.length === 0) agPs = defaults.agencyParagraphs || [];
    }
    setAgencyParagraphs(agPs);

    // Extract Process Steps
    setProcessSteps(Array.isArray(cO.processSteps) && cO.processSteps.length > 0 ? cO.processSteps : defaults.processSteps || []);

    // Extract Pricing Tiers
    setPricingTiers(Array.isArray(cO.pricingTiers) && cO.pricingTiers.length > 0 ? cO.pricingTiers : defaults.pricingTiers || []);

    // Extract Why Choose List
    setWhyChooseList(Array.isArray(cO.whyChooseList) && cO.whyChooseList.length > 0 ? cO.whyChooseList : defaults.whyChooseList || []);

    // Extract Includes Checklist
    setIncludesList(Array.isArray(cO.includesItems) && cO.includesItems.length > 0 ? cO.includesItems : defaults.includesItems || []);

    // Extract Reviews & FAQs
    setReviewsList(Array.isArray(cO.reviewsList) && cO.reviewsList.length > 0 ? cO.reviewsList : defaults.reviewsList || []);
    setFaqsList((svc.faqs && svc.faqs.length > 0) ? svc.faqs : defaultFaqsFor(svc.name));

    setFormData({
      id: svc.id,
      name: svc.name,
      key: svc.key,
      slug: svc.slug || svc.key,
      icon: svc.icon || '🌐',
      description: svc.description || defaults.heroSub,
      price: svc.price || 850,
      metaTitle: svc.metaTitle || defaults.metaTitle,
      metaDesc: svc.metaDesc || defaults.metaDesc,
      title: svc.title || defaults.heroTitle,
      label: svc.label || defaults.aboutTitle,
      p1: svc.p1 || abPs[0] || '',
      p2: svc.p2 || abPs[1] || '',
      faqs: (svc.faqs && svc.faqs.length > 0) ? svc.faqs : defaultFaqsFor(svc.name),
      contentOverrides: cO
    });
    setActiveTab('hero');
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
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        credentials: 'include',
        body: data
      });
      const json = await res.json();
      if (json.success && json.url) {
        handleCOChange('heroBgImage', json.url);
      } else {
        alert(json.message || 'Image upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading hero image');
    } finally {
      setUploadingHeroBg(false);
    }
  };

  /* ── Comparison Rows Handlers ── */
  const handleDiffRowChange = (index: number, field: 'feat' | 'std' | 'our', val: string) => {
    const rows = [...(formData.contentOverrides?.diffRows || [])];
    if (rows[index]) {
      rows[index] = { ...rows[index], [field]: val };
      handleCOChange('diffRows', rows);
    }
  };
  const addDiffRow = () => {
    const rows = [...(formData.contentOverrides?.diffRows || [])];
    rows.push({ feat: 'New Feature', std: 'Standard feature description', our: 'Our premium feature description' });
    handleCOChange('diffRows', rows);
  };
  const removeDiffRow = (index: number) => {
    const rows = [...(formData.contentOverrides?.diffRows || [])];
    rows.splice(index, 1);
    handleCOChange('diffRows', rows);
  };

  /* ── Document Categories Handlers ── */
  const handleDocCategoryChange = (index: number, field: keyof DocCategoryItem, val: string) => {
    const cats = [...(formData.contentOverrides?.docCategories || [])];
    if (cats[index]) {
      cats[index] = { ...cats[index], [field]: val };
      handleCOChange('docCategories', cats);
    }
  };
  const addDocCategory = () => {
    const cats = [...(formData.contentOverrides?.docCategories || [])];
    cats.push({
      id: `cat-${Date.now()}`,
      name: 'New Category',
      icon: '📋',
      color: '#dbeafe',
      panelTitle: `New Category for ${formData.name}`,
      panelSub: 'Available in 120+ languages with certification',
      docs: 'Document 1, Document 2, Document 3',
      ctaText: 'Need translation for any of these documents?',
      ctaBtn: '📋 Get Free Quote'
    });
    handleCOChange('docCategories', cats);
  };
  const removeDocCategory = (index: number) => {
    const cats = [...(formData.contentOverrides?.docCategories || [])];
    cats.splice(index, 1);
    handleCOChange('docCategories', cats);
  };

  /* ── Other 15 Services Handlers ── */
  const handleOtherSvcChange = (index: number, field: keyof OtherServiceItem, val: string) => {
    const list = [...(formData.contentOverrides?.otherServicesList || [])];
    if (list[index]) {
      list[index] = { ...list[index], [field]: val };
      handleCOChange('otherServicesList', list);
    }
  };
  const addOtherSvc = () => {
    const list = [...(formData.contentOverrides?.otherServicesList || [])];
    list.push({
      icon: '🌐',
      name: 'New Translation Service',
      desc: 'High accuracy translation services with fast turnaround',
      link: '/services'
    });
    handleCOChange('otherServicesList', list);
  };
  const removeOtherSvc = (index: number) => {
    const list = [...(formData.contentOverrides?.otherServicesList || [])];
    list.splice(index, 1);
    handleCOChange('otherServicesList', list);
  };

  /* ── Sample Certificates Handlers ── */
  const handleSampleCertChange = (index: number, field: keyof SampleCertItem, val: string) => {
    const list = [...(formData.contentOverrides?.sampleCertsList || [])];
    if (list[index]) {
      list[index] = { ...list[index], [field]: val };
      handleCOChange('sampleCertsList', list);
    }
  };
  const addSampleCert = () => {
    const list = [...(formData.contentOverrides?.sampleCertsList || [])];
    list.push({
      doc: 'New Certificate',
      lang: 'English → German',
      flag: '🇩🇪',
      seal: '🇩🇪',
      acc: 'German Embassy',
      time: '24 Hrs',
      icon: '🎓'
    });
    handleCOChange('sampleCertsList', list);
  };
  const removeSampleCert = (index: number) => {
    const list = [...(formData.contentOverrides?.sampleCertsList || [])];
    list.splice(index, 1);
    handleCOChange('sampleCertsList', list);
  };

  /* ── Save & Delete Handlers ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const mergedCO = {
      ...(formData.contentOverrides || {}),
      aboutParagraphs: aboutParagraphs.filter(p => p.trim()),
      agencyParagraphs: agencyParagraphs.filter(p => p.trim()),
      processSteps,
      pricingTiers,
      whyChooseList,
      includesItems: includesList,
      reviewsList,
      faqsList,
    };

    const payload = {
      name: formData.name,
      key: formData.key,
      slug: formData.slug || formData.key,
      icon: formData.icon,
      price: formData.price,
      description: formData.description,
      title: formData.title,
      label: formData.label,
      metaTitle: formData.metaTitle,
      metaDesc: formData.metaDesc,
      contentOverrides: mergedCO,
      faqs: faqsList,
      reviews: reviewsList
    };

    try {
      const url = editingService?.id
        ? `${API_URL}/api/v1/services/${editingService.id}`
        : `${API_URL}/api/v1/services`;
      const method = editingService?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Service "${formData.name}" saved successfully!`);
        setShowModal(false);
        fetchServices();
      } else {
        setError(data.message || 'Failed to save service');
      }
    } catch (err: any) {
      setError(err.message || 'Network error saving service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/services/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Service "${name}" deleted successfully.`);
        fetchServices();
      } else {
        setError(data.message || 'Failed to delete service');
      }
    } catch (err: any) {
      setError(err.message || 'Network error deleting service');
    } finally {
      setLoading(false);
    }
  };

  /* ── Section Ordering & Custom Sections Handlers ── */
  const getEffectiveSectionOrder = () => {
    const defaultIds = DEFAULT_SERVICE_SECTIONS.map(s => s.id);
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
      title: 'New Section for ' + formData.name,
      subtitle: 'Section subtitle description',
      paragraphs: ['Paragraph 1 content details for this new custom section in ' + formData.name + '.'],
      ctaText: 'Need ' + formData.name + ' assistance?',
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
        return { ...cs, paragraphs: [...(cs.paragraphs || []), 'New paragraph content for ' + formData.name + '.'] };
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
          title: 'Service Feature',
          subtitle: '₹850/page · 1-2 days',
          link: '/quote'
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

  const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid var(--br)', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
  const sectionTitleStyle: React.CSSProperties = { fontSize: '15px', fontWeight: '800', color: 'var(--bd)', margin: 0, fontFamily: "'Nunito', sans-serif" };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--td)', marginBottom: '6px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--br)', fontSize: '13px', boxSizing: 'border-box' };

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
    <div key={cs.id} style={{ ...cardStyle, border: '2px solid #93c5fd', background: '#f0f7ff', marginTop: '12px' }}>
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
            placeholder={`e.g. Specialized Features for ${formData.name}`}
          />
        </div>
        <div>
          <label style={labelStyle}>Section Subtitle (Optional)</label>
          <input
            style={{ ...inputStyle, background: '#fff' }}
            value={cs.subtitle || ''}
            onChange={e => updateCustomSection(cs.id, 'subtitle', e.target.value)}
            placeholder="e.g. Accurate and accredited translation solutions"
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

  const addBtnStyle: React.CSSProperties = { background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' };
  const delBtnStyle: React.CSSProperties = { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' };

  const filteredServices = services.filter(s =>
    !searchTerm ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav title="Services CMS Manager" />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--bd)', margin: 0 }}>
              Services CMS Manager
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
              Manage and edit all 16 translation service pages with dynamic sections, paragraphs, comparison tables, documents handled, other services and certificate samples.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(26,58,107,0.15)' }}
          >
            <span>+ Add New Service</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#991b1b', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {success && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✓ {success}</span>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Filter / Search */}
        <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mu)', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search services by name, key or slug URL..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '34px' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--mu)', fontWeight: '600' }}>
            Showing {filteredServices.length} of {services.length} services
          </div>
        </div>

        {/* Services Table */}
        <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--mu)' }}>
              Loading services...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--br)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--bd)', width: '60px' }}>Icon</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--bd)' }}>Service Name &amp; Key</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--bd)' }}>URL Slug</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--bd)', width: '120px' }}>Base Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--bd)', textAlign: 'right', width: '260px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(svc => (
                  <tr key={svc.id || svc.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '20px' }}>{svc.icon || '🌐'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--bd)' }}>{svc.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--mu)' }}>key: {svc.key}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--bd)' }}>
                        /services/{svc.slug || svc.key}
                      </code>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#166534' }}>
                      ₹{svc.price || 850}/page
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(svc)}
                          style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ✏️ Edit Base
                        </button>
                        <button
                          onClick={() => { window.location.href = `/dashboard/services/city?service=${svc.key}`; }}
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          title="Edit City-Specific Pages"
                        >
                          📍 City Pages
                        </button>
                        <button
                          onClick={() => handleDelete(svc.id, svc.name)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          title="Delete Service"
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

        {/* ═══ COMPREHENSIVE SERVICE EDIT MODAL ═══ */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '1100px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--bd)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✏️ Edit Service: {formData.name}</span>
                  </h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--mu)', marginTop: '2px' }}>
                    Slug URL: <code style={{ color: 'var(--bd)', fontWeight: 'bold' }}>/services/{formData.slug || formData.key}</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--mu)', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Tabs Navigation */}
              <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 16px'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1.5px solid var(--bd)' : '1px solid #cbd5e1',
              background: activeTab === tab.id ? 'var(--bd)' : '#ffffff',
              color: activeTab === tab.id ? '#ffffff' : '#334155',
              fontWeight: activeTab === tab.id ? 700 : 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(26,58,107,0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

              {/* Form Content Area */}
              <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '24px', flex: 1, background: '#f8fafc' }}>
                
                {/* ─── TAB 1: HERO & BADGES ─── */}
                {activeTab === 'hero' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📌 Basic Service Info</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 120px', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Service Name</label>
                          <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                          <label style={labelStyle}>URL Slug (URL Segment)</label>
                          <input style={inputStyle} value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
                        </div>
                        <div>
                          <label style={labelStyle}>Icon</label>
                          <input style={{ ...inputStyle, textAlign: 'center', fontSize: '16px' }} value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} required />
                        </div>
                        <div>
                          <label style={labelStyle}>Base Price (₹)</label>
                          <input type="number" style={inputStyle} value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🎨 Hero Section & Background</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Hero Golden Badge</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroBadge || ''} onChange={e => handleCOChange('heroBadge', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Hero ISO Sub-badge</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroIso || ''} onChange={e => handleCOChange('heroIso', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Main Heading (HTML Allowed: e.g. &lt;br&gt;, &lt;em&gt;)</label>
                        <input style={inputStyle} value={formData.contentOverrides?.heroTitle || ''} onChange={e => handleCOChange('heroTitle', e.target.value)} />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Subtitle Paragraph</label>
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.heroSub || ''} onChange={e => handleCOChange('heroSub', e.target.value)} />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Trust Badges Line (Separated by |)</label>
                        <input style={inputStyle} value={formData.contentOverrides?.heroBadgesList || ''} onChange={e => handleCOChange('heroBadgesList', e.target.value)} placeholder="✅ Embassy Accepted | ⚡ 24-Hr Express | 🔏 Notarized" />
                      </div>

                      {/* Hero Image Upload */}
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          <label style={{ ...labelStyle, margin: 0 }}>Hero Background Image (Optional Custom Hero Banner)</label>
                          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', color: '#1d4ed8', fontWeight: '700' }}>
                            📐 Recommended Ratio: 16:9 or 21:9 (1920×600 px) · Max 2MB · JPG, PNG, WebP
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
                          <input
                            style={{ ...inputStyle, flex: 1, margin: 0, fontFamily: 'monospace' }}
                            placeholder="e.g. /uploads/... or https://..."
                            value={formData.contentOverrides?.heroBgImage || ''}
                            onChange={e => handleCOChange('heroBgImage', e.target.value)}
                          />
                          <label style={{ padding: '8px 16px', background: 'var(--bd)', color: '#fff', border: 'none', borderRadius: '6px', cursor: uploadingHeroBg ? 'not-allowed' : 'pointer', fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span>{uploadingHeroBg ? '⏳ Uploading...' : '📁 Upload Image'}</span>
                            <input type="file" accept="image/*" onChange={handleHeroBgUpload} disabled={uploadingHeroBg} style={{ display: 'none' }} />
                          </label>
                          {formData.contentOverrides?.heroBgImage && (
                            <button
                              type="button"
                              onClick={() => handleCOChange('heroBgImage', '')}
                              style={{ padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              ✕ Remove Image
                            </button>
                          )}
                        </div>

                        {formData.contentOverrides?.heroBgImage ? (() => {
                          const bgImg = formData.contentOverrides.heroBgImage.trim();
                          const fullUrl = bgImg.startsWith('http') ? bgImg : `${API_URL}${bgImg.startsWith('/') ? '' : '/'}${bgImg}`;
                          return (
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                              <div
                                style={{
                                  height: '140px',
                                  background: `linear-gradient(135deg, rgba(15,23,42,0.65), rgba(30,58,107,0.60)), url('${fullUrl}') center/cover no-repeat`,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  alignItems: 'flex-start',
                                  padding: '16px 20px',
                                  color: '#ffffff',
                                }}
                              >
                                <div style={{ fontSize: '18px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                  {formData.name || 'Service'} Translation Services
                                </div>
                                <div style={{ fontSize: '11.5px', opacity: 0.9, marginTop: '4px' }}>
                                  Live hero background preview with standard overlay
                                </div>
                              </div>
                              <div style={{ background: '#f8fafc', padding: '6px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: '700' }}>✅ Hero background preview active</span>
                                <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                                  🔗 Open Full Image ↗
                                </a>
                              </div>
                            </div>
                          );
                        })() : (
                          <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '6px', border: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                            📷 No image — standard gradient theme is shown as the hero background
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📞 Hero Action Buttons & WhatsApp</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={labelStyle}>Button 1 (Quote Link)</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroBtn1Text || '📋 Get Free Quote'} onChange={e => handleCOChange('heroBtn1Text', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Button 2 Phone</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroBtn2Phone || '+919312690490'} onChange={e => handleCOChange('heroBtn2Phone', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Button 3 WhatsApp Number</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroBtn3WA || '919312690490'} onChange={e => handleCOChange('heroBtn3WA', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 2: 5-STEP PROCESS (DYNAMIC ADD & DELETE) ─── */}
                {activeTab === 'process' && (
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <h4 style={sectionTitleStyle}>⚡ How It Works (Process Steps)</h4>
                        <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Add, edit or delete process steps displayed in the How It Works section.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const steps = [...processSteps];
                          steps.push({ step: steps.length + 1, title: 'New Step', desc: 'Description of the step' });
                          setProcessSteps(steps);
                        }}
                        style={addBtnStyle}
                      >
                        + Add Step
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>Section Tag</label>
                        <input style={inputStyle} value={formData.contentOverrides?.processTag || ''} onChange={e => handleCOChange('processTag', e.target.value)} placeholder="How It Works" />
                      </div>
                      <div>
                        <label style={labelStyle}>Process Header Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.processTitle || ''} onChange={e => handleCOChange('processTitle', e.target.value)} placeholder="5-Step Process" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {processSteps.map((st, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>STEP {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const steps = [...processSteps];
                                steps.splice(idx, 1);
                                setProcessSteps(steps);
                              }}
                              style={delBtnStyle}
                            >
                              ✕ Remove
                            </button>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Step Name</label>
                            <input
                              style={{ ...inputStyle, fontSize: '12px', padding: '6px 8px' }}
                              value={st.title}
                              onChange={e => {
                                const steps = [...processSteps];
                                steps[idx].title = e.target.value;
                                setProcessSteps(steps);
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Description</label>
                            <textarea
                              rows={3}
                              style={{ ...inputStyle, fontSize: '11px', padding: '6px 8px', resize: 'vertical' }}
                              value={st.desc}
                              onChange={e => {
                                const steps = [...processSteps];
                                steps[idx].desc = e.target.value;
                                setProcessSteps(steps);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: OVERVIEW & AGENCY (DYNAMIC PARAGRAPHS ADD & DELETE) ─── */}
                {activeTab === 'about_agency' && (
                  <>
                    <div style={cardStyle}>
                      {renderSectionHeader('about', '📖 Service Overview Paragraphs', {
                        onAddParagraph: () => setAboutParagraphs([...aboutParagraphs, 'New overview paragraph text.'])
                      })}

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Overview Section Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.aboutTitle || ''} onChange={e => handleCOChange('aboutTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {aboutParagraphs.map((para, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ ...labelStyle, marginBottom: 0 }}>Paragraph {idx + 1}</label>
                              {aboutParagraphs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = [...aboutParagraphs];
                                    arr.splice(idx, 1);
                                    setAboutParagraphs(arr);
                                  }}
                                  style={delBtnStyle}
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>
                            <textarea
                              rows={3}
                              style={{ ...inputStyle, resize: 'vertical' }}
                              value={para}
                              onChange={e => {
                                const arr = [...aboutParagraphs];
                                arr[idx] = e.target.value;
                                setAboutParagraphs(arr);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('agency', '🏛️ Agency Details & Long Description', {
                        onAddParagraph: () => setAgencyParagraphs([...agencyParagraphs, 'New agency detail paragraph text.'])
                      })}

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.agencyTitle || ''} onChange={e => handleCOChange('agencyTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {agencyParagraphs.map((para, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ ...labelStyle, marginBottom: 0 }}>Agency Paragraph {idx + 1}</label>
                              {agencyParagraphs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = [...agencyParagraphs];
                                    arr.splice(idx, 1);
                                    setAgencyParagraphs(arr);
                                  }}
                                  style={delBtnStyle}
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>
                            <textarea
                              rows={3}
                              style={{ ...inputStyle, resize: 'vertical' }}
                              value={para}
                              onChange={e => {
                                const arr = [...agencyParagraphs];
                                arr[idx] = e.target.value;
                                setAgencyParagraphs(arr);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🛡️ 6 Trust Badges &amp; Office Address Box</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[
                          { k: 'trustCard1', label: 'Card 1 (Govt. Authorized)' },
                          { k: 'trustCard2', label: 'Card 2 (4.9/5 Rating)' },
                          { k: 'trustCard3', label: 'Card 3 (Easy Submission)' },
                          { k: 'trustCard4', label: 'Card 4 (24-Hr Express)' },
                          { k: 'trustCard5', label: 'Card 5 (100% Accepted)' },
                          { k: 'trustCard6', label: 'Card 6 (Confidential)' },
                        ].map(c => (
                          <div key={c.k} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <label style={{ ...labelStyle, fontSize: '11px' }}>{c.label}</label>
                            <input style={{ ...inputStyle, fontSize: '12px' }} value={formData.contentOverrides?.[c.k] || ''} onChange={e => handleCOChange(c.k, e.target.value)} />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                        <div>
                          <label style={labelStyle}>📍 Office Box Header Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.agencyOfficeTitle || ''} onChange={e => handleCOChange('agencyOfficeTitle', e.target.value)} placeholder="📍 Service Agency – Delhi Office" />
                        </div>
                        <div>
                          <label style={labelStyle}>Office Address &amp; Contact Text</label>
                          <input style={inputStyle} value={formData.contentOverrides?.officeAddressText || ''} onChange={e => handleCOChange('officeAddressText', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 4: COMPARISON TABLE & DOCUMENT CATEGORIES ─── */}
                {activeTab === 'comparison_docs' && (
                  <>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={sectionTitleStyle}>⚖️ Standard vs Service Comparison Table</h4>
                        <button type="button" onClick={addDiffRow} style={addBtnStyle}>
                          + Add Comparison Row
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Comparison Table Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.diffTitle || ''} onChange={e => handleCOChange('diffTitle', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Column 1 Header</label>
                          <input style={inputStyle} value={formData.contentOverrides?.diffCol1Header || 'Standard Translation'} onChange={e => handleCOChange('diffCol1Header', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Column 2 Header</label>
                          <input style={inputStyle} value={formData.contentOverrides?.diffCol2Header || `${formData.name} (Our Service)`} onChange={e => handleCOChange('diffCol2Header', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ border: '1px solid var(--br)', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--br)', textAlign: 'left' }}>
                              <th style={{ padding: '10px 12px', fontWeight: '700' }}>Feature</th>
                              <th style={{ padding: '10px 12px', fontWeight: '700', width: '25%' }}>Standard Translation</th>
                              <th style={{ padding: '10px 12px', fontWeight: '700', width: '25%' }}>Our Service</th>
                              <th style={{ padding: '10px 12px', width: '40px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(formData.contentOverrides?.diffRows || []).map((row: ComparisonRow, idx: number) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px 8px' }}>
                                  <input style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }} value={row.feat} onChange={e => handleDiffRowChange(idx, 'feat', e.target.value)} />
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                  <input style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }} value={row.std} onChange={e => handleDiffRowChange(idx, 'std', e.target.value)} />
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                  <input style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px', color: '#166534', fontWeight: 'bold' }} value={row.our} onChange={e => handleDiffRowChange(idx, 'our', e.target.value)} />
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                  <button type="button" onClick={() => removeDiffRow(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>📄 Documents We Handle Categories &amp; Lists</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Manage document category tabs, lists and call-to-action buttons.</p>
                        </div>
                        <button type="button" onClick={addDocCategory} style={addBtnStyle}>
                          + Add Category
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Documents Section Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.docsTitle || ''} onChange={e => handleCOChange('docsTitle', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Documents Subtitle</label>
                          <input style={inputStyle} value={formData.contentOverrides?.docsSubtitle || ''} onChange={e => handleCOChange('docsSubtitle', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(formData.contentOverrides?.docCategories || []).map((cat: DocCategoryItem, idx: number) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--br)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--br)' }}>
                              <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--bd)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>Category #{idx + 1}:</span> <span>{cat.name || 'Untitled'}</span>
                              </div>
                              <button type="button" onClick={() => removeDocCategory(idx)} style={delBtnStyle}>
                                ✕ Remove Category
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 120px', gap: '10px', marginBottom: '10px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Icon</label>
                                <input style={{ ...inputStyle, fontSize: '14px', textAlign: 'center' }} value={cat.icon} onChange={e => handleDocCategoryChange(idx, 'icon', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Category Name (Tab Label)</label>
                                <input style={inputStyle} value={cat.name} onChange={e => handleDocCategoryChange(idx, 'name', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Badge Color</label>
                                <input style={inputStyle} value={cat.color} onChange={e => handleDocCategoryChange(idx, 'color', e.target.value)} />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Panel Heading Title</label>
                                <input style={inputStyle} value={cat.panelTitle || ''} onChange={e => handleDocCategoryChange(idx, 'panelTitle', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Panel Subtitle</label>
                                <input style={inputStyle} value={cat.panelSub || ''} onChange={e => handleDocCategoryChange(idx, 'panelSub', e.target.value)} />
                              </div>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Documents List (Comma Separated)</label>
                              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: '12px' }} value={cat.docs} onChange={e => handleDocCategoryChange(idx, 'docs', e.target.value)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Bottom CTA Bar Text</label>
                                <input style={inputStyle} value={cat.ctaText || ''} onChange={e => handleDocCategoryChange(idx, 'ctaText', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Bottom CTA Button Text</label>
                                <input style={inputStyle} value={cat.ctaBtn || ''} onChange={e => handleDocCategoryChange(idx, 'ctaBtn', e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 5: OTHER 15 TRANSLATION SERVICES ─── */}
                {activeTab === 'other_services' && (
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={sectionTitleStyle}>🌐 Other 15 Translation Service Types in City</h4>
                        <p style={{ fontSize: '12px', color: 'var(--mu)', margin: '2px 0 0 0' }}>
                          Add, edit or delete services in the 15-cards grid for this specific service.
                        </p>
                      </div>
                      <button type="button" onClick={addOtherSvc} style={addBtnStyle}>
                        + Add Other Service
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>Section Heading Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.otherSvcsTitle || ''} onChange={e => handleCOChange('otherSvcsTitle', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Section Subtitle</label>
                        <input style={inputStyle} value={formData.contentOverrides?.otherSvcsSubtitle || ''} onChange={e => handleCOChange('otherSvcsSubtitle', e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {(formData.contentOverrides?.otherServicesList || []).map((os: OtherServiceItem, idx: number) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input style={{ ...inputStyle, width: '45px', textAlign: 'center', padding: '4px', fontSize: '14px' }} value={os.icon} onChange={e => handleOtherSvcChange(idx, 'icon', e.target.value)} />
                              <input style={{ ...inputStyle, fontWeight: '700', padding: '4px 8px', fontSize: '12px' }} value={os.name} onChange={e => handleOtherSvcChange(idx, 'name', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeOtherSvc(idx)} style={delBtnStyle}>
                              ✕ Remove
                            </button>
                          </div>
                          <div>
                            <input style={{ ...inputStyle, fontSize: '11px', padding: '4px 8px' }} value={os.desc} onChange={e => handleOtherSvcChange(idx, 'desc', e.target.value)} placeholder="Short description" />
                          </div>
                          <div>
                            <input style={{ ...inputStyle, fontSize: '11px', padding: '4px 8px', color: 'var(--bd)' }} value={os.link} onChange={e => handleOtherSvcChange(idx, 'link', e.target.value)} placeholder="/services/slug" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 6: PRICING & SAMPLES (DYNAMIC ADD & DELETE) ─── */}
                {activeTab === 'pricing_samples' && (
                  <>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>💰 Pricing Packages Breakdown</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Add, edit or delete pricing packages for this service.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const tiers = [...pricingTiers];
                            tiers.push({
                              name: 'Custom Package',
                              badge: '',
                              price: '₹1,000',
                              unit: 'per page',
                              delivery: '⏱ 2–3 Days',
                              features: 'Feature 1\nFeature 2\nFeature 3'
                            });
                            setPricingTiers(tiers);
                          }}
                          style={addBtnStyle}
                        >
                          + Add Pricing Package
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Pricing Section Main Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.pricingTitle || ''} onChange={e => handleCOChange('pricingTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                        {pricingTiers.map((tier, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--bd)' }}>Package #{idx + 1}</span>
                              {pricingTiers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tiers = [...pricingTiers];
                                    tiers.splice(idx, 1);
                                    setPricingTiers(tiers);
                                  }}
                                  style={delBtnStyle}
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Package Name</label>
                                <input
                                  style={inputStyle}
                                  value={tier.name}
                                  onChange={e => {
                                    const tiers = [...pricingTiers];
                                    tiers[idx].name = e.target.value;
                                    setPricingTiers(tiers);
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Badge (Optional)</label>
                                <input
                                  style={inputStyle}
                                  value={tier.badge || ''}
                                  onChange={e => {
                                    const tiers = [...pricingTiers];
                                    tiers[idx].badge = e.target.value;
                                    setPricingTiers(tiers);
                                  }}
                                  placeholder="⭐ POPULAR"
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Price</label>
                                <input
                                  style={inputStyle}
                                  value={tier.price}
                                  onChange={e => {
                                    const tiers = [...pricingTiers];
                                    tiers[idx].price = e.target.value;
                                    setPricingTiers(tiers);
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Unit</label>
                                <input
                                  style={inputStyle}
                                  value={tier.unit}
                                  onChange={e => {
                                    const tiers = [...pricingTiers];
                                    tiers[idx].unit = e.target.value;
                                    setPricingTiers(tiers);
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Delivery Turnaround</label>
                              <input
                                style={inputStyle}
                                value={tier.delivery}
                                onChange={e => {
                                    const tiers = [...pricingTiers];
                                    tiers[idx].delivery = e.target.value;
                                    setPricingTiers(tiers);
                                  }}
                              />
                            </div>

                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Features (One per line; prefix with ! for excluded ✗)</label>
                              <textarea
                                rows={4}
                                style={{ ...inputStyle, resize: 'vertical', fontSize: '11px' }}
                                value={tier.features}
                                onChange={e => {
                                  const tiers = [...pricingTiers];
                                  tiers[idx].features = e.target.value;
                                  setPricingTiers(tiers);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label style={labelStyle}>➕ Pricing Add-ons Bar Text</label>
                        <input style={inputStyle} value={formData.contentOverrides?.pricingAddons || ''} onChange={e => handleCOChange('pricingAddons', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>📜 Certificate Samples (Interactive Preview Cards)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Add or delete sample certificates shown in the Certificate Samples grid.</p>
                        </div>
                        <button type="button" onClick={addSampleCert} style={addBtnStyle}>
                          + Add Sample Cert
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Section Heading</label>
                          <input style={inputStyle} value={formData.contentOverrides?.certSampleTitle || ''} onChange={e => handleCOChange('certSampleTitle', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Section Subtitle</label>
                          <input style={inputStyle} value={formData.contentOverrides?.certSampleSubtitle || ''} onChange={e => handleCOChange('certSampleSubtitle', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {(formData.contentOverrides?.sampleCertsList || []).map((sc: SampleCertItem, idx: number) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input style={{ ...inputStyle, width: '40px', textAlign: 'center', padding: '4px', fontSize: '14px' }} value={sc.icon || '🎓'} onChange={e => handleSampleCertChange(idx, 'icon', e.target.value)} />
                                <input style={{ ...inputStyle, fontWeight: '700', padding: '4px 8px', fontSize: '12px' }} value={sc.doc} onChange={e => handleSampleCertChange(idx, 'doc', e.target.value)} />
                              </div>
                              <button type="button" onClick={() => removeSampleCert(idx)} style={delBtnStyle}>
                                ✕ Remove
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '6px' }}>
                              <input style={{ ...inputStyle, textAlign: 'center', padding: '4px', fontSize: '14px' }} value={sc.flag} onChange={e => handleSampleCertChange(idx, 'flag', e.target.value)} title="Flag emoji" />
                              <input style={{ ...inputStyle, padding: '4px 8px', fontSize: '11.5px' }} value={sc.lang} onChange={e => handleSampleCertChange(idx, 'lang', e.target.value)} placeholder="e.g. English → German" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <input style={{ ...inputStyle, padding: '4px 8px', fontSize: '11.5px' }} value={sc.acc} onChange={e => handleSampleCertChange(idx, 'acc', e.target.value)} placeholder="e.g. German Embassy" />
                              <input style={{ ...inputStyle, padding: '4px 8px', fontSize: '11.5px' }} value={sc.time} onChange={e => handleSampleCertChange(idx, 'time', e.target.value)} placeholder="e.g. 24 Hrs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 7: WHY CHOOSE US & SIDEBAR (DYNAMIC ADD & DELETE) ─── */}
                {activeTab === 'why_sidebar' && (
                  <>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>🏆 Why Choose Language Guru Cards</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Add or delete advantage cards shown in the Why Choose section.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...whyChooseList];
                            list.push({ icon: '⭐', title: 'New Advantage', desc: 'Advantage description text.' });
                            setWhyChooseList(list);
                          }}
                          style={addBtnStyle}
                        >
                          + Add Card
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Why Choose Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.whyChooseTitle || ''} onChange={e => handleCOChange('whyChooseTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {whyChooseList.map((wc, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1 }}>
                                <input
                                  style={{ ...inputStyle, width: '40px', textAlign: 'center', padding: '4px', fontSize: '14px' }}
                                  value={wc.icon}
                                  onChange={e => {
                                    const list = [...whyChooseList];
                                    list[idx].icon = e.target.value;
                                    setWhyChooseList(list);
                                  }}
                                />
                                <input
                                  style={{ ...inputStyle, fontWeight: '700', padding: '4px 8px', fontSize: '12px' }}
                                  value={wc.title}
                                  onChange={e => {
                                    const list = [...whyChooseList];
                                    list[idx].title = e.target.value;
                                    setWhyChooseList(list);
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...whyChooseList];
                                  list.splice(idx, 1);
                                  setWhyChooseList(list);
                                }}
                                style={delBtnStyle}
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              style={{ ...inputStyle, fontSize: '11.5px', resize: 'vertical' }}
                              value={wc.desc}
                              onChange={e => {
                                const list = [...whyChooseList];
                                list[idx].desc = e.target.value;
                                setWhyChooseList(list);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>📋 What's Included Checklist (Sidebar Widget)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Configure the "What Every {formData.name} Includes" sidebar card title and checkmark items.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIncludesList([...includesList, 'New included feature guarantee'])}
                          style={addBtnStyle}
                        >
                          + Add Item
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Checklist Card Title (Sidebar)</label>
                        <input
                          style={inputStyle}
                          value={formData.contentOverrides?.includesTitle || ''}
                          onChange={e => handleCOChange('includesTitle', e.target.value)}
                          placeholder={`e.g. What Every ${formData.name || 'Service'} Includes`}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                          Default: <em>What Every {formData.name || 'Service'} Includes</em>
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {includesList.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '800', paddingLeft: '4px' }}>✓</span>
                            <input
                              style={{ ...inputStyle, fontSize: '12.5px' }}
                              value={item}
                              onChange={e => {
                                const list = [...includesList];
                                list[idx] = e.target.value;
                                setIncludesList(list);
                              }}
                              placeholder="Included feature item text"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...includesList];
                                list.splice(idx, 1);
                                setIncludesList(list);
                              }}
                              style={delBtnStyle}
                              title="Delete Item"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📞 Sidebar CTA &amp; Contact Box</h4>
                      <p style={{ fontSize: '12px', color: 'var(--mu)', marginBottom: '14px' }}>Configure the urgent consultation &amp; quote widget in the right sidebar.</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={labelStyle}>Sidebar CTA Heading</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarCtaTitle || ''}
                            onChange={e => handleCOChange('sidebarCtaTitle', e.target.value)}
                            placeholder={`e.g. Need Official ${formData.name || 'Service'}?`}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Phone 1 (Direct Call)</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarPhone1 || ''}
                            onChange={e => handleCOChange('sidebarPhone1', e.target.value)}
                            placeholder="+91-9312690490"
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Sidebar CTA Subtitle</label>
                        <textarea
                          rows={2}
                          style={{ ...inputStyle, resize: 'vertical', fontSize: '12px' }}
                          value={formData.contentOverrides?.sidebarCtaSub || ''}
                          onChange={e => handleCOChange('sidebarCtaSub', e.target.value)}
                          placeholder="Talk directly with our senior language specialists for instant price estimates & document verification."
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={labelStyle}>Phone 2 (Secondary)</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarPhone2 || ''}
                            onChange={e => handleCOChange('sidebarPhone2', e.target.value)}
                            placeholder="+91-9810693777"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Primary Button Text</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarBtn1Text || ''}
                            onChange={e => handleCOChange('sidebarBtn1Text', e.target.value)}
                            placeholder="⚡ Get Instant Quote"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Primary Button Link</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarBtn1Link || ''}
                            onChange={e => handleCOChange('sidebarBtn1Link', e.target.value)}
                            placeholder="/quote"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={labelStyle}>WhatsApp Button Text</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarBtn2Text || ''}
                            onChange={e => handleCOChange('sidebarBtn2Text', e.target.value)}
                            placeholder="💬 WhatsApp Consultation"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>WhatsApp Number (Digits only)</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarBtn2WA || ''}
                            onChange={e => handleCOChange('sidebarBtn2WA', e.target.value)}
                            placeholder="919312690490"
                          />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🗂️ Sidebar Navigation &amp; Widget Headings</h4>
                      <p style={{ fontSize: '12px', color: 'var(--mu)', marginBottom: '14px' }}>Customize heading titles and display limits for sidebar list widgets.</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={labelStyle}>Cities Widget Title</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarCitiesTitle || ''}
                            onChange={e => handleCOChange('sidebarCitiesTitle', e.target.value)}
                            placeholder={`e.g. 🏙️ ${formData.name || 'Service'} – Available Cities`}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Languages Widget Title</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarLangsTitle || ''}
                            onChange={e => handleCOChange('sidebarLangsTitle', e.target.value)}
                            placeholder="e.g. 🌐 Popular Languages"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={labelStyle}>Other Services Widget Title</label>
                          <input
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarOtherSvcsTitle || ''}
                            onChange={e => handleCOChange('sidebarOtherSvcsTitle', e.target.value)}
                            placeholder="e.g. 📋 Other Services"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Other Services Limit (Count)</label>
                          <input
                            type="number"
                            style={inputStyle}
                            value={formData.contentOverrides?.sidebarOtherSvcsLimit || ''}
                            onChange={e => handleCOChange('sidebarOtherSvcsLimit', e.target.value)}
                            placeholder="12"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 8: REVIEWS & FAQS (DYNAMIC ADD & DELETE) ─── */}
                {activeTab === 'reviews_faqs' && (
                  <>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>⭐ Client Reviews &amp; Testimonials</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Add, edit or delete real client testimonials.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...reviewsList];
                            list.push({
                              stars: '★★★★★',
                              text: 'Great translation service! Quick turnaround and accepted by embassy.',
                              name: 'Client Name',
                              role: 'Client Role · Delhi',
                              avatar: 'CN'
                            });
                            setReviewsList(list);
                          }}
                          style={addBtnStyle}
                        >
                          + Add Review
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Reviews Section Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.reviewsTitle || ''} onChange={e => handleCOChange('reviewsTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reviewsList.map((rev, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  style={{ ...inputStyle, width: '40px', textAlign: 'center', padding: '4px', fontWeight: 'bold' }}
                                  value={rev.avatar}
                                  onChange={e => {
                                    const list = [...reviewsList];
                                    list[idx].avatar = e.target.value;
                                    setReviewsList(list);
                                  }}
                                  title="Avatar initials"
                                />
                                <input
                                  style={{ ...inputStyle, fontWeight: '700', padding: '4px 8px', fontSize: '12px' }}
                                  value={rev.name}
                                  onChange={e => {
                                    const list = [...reviewsList];
                                    list[idx].name = e.target.value;
                                    setReviewsList(list);
                                  }}
                                  placeholder="Client Name"
                                />
                                <input
                                  style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                                  value={rev.role}
                                  onChange={e => {
                                    const list = [...reviewsList];
                                    list[idx].role = e.target.value;
                                    setReviewsList(list);
                                  }}
                                  placeholder="Role / City"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...reviewsList];
                                  list.splice(idx, 1);
                                  setReviewsList(list);
                                }}
                                style={delBtnStyle}
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              style={{ ...inputStyle, fontSize: '12px', resize: 'vertical' }}
                              value={rev.text}
                              onChange={e => {
                                const list = [...reviewsList];
                                list[idx].text = e.target.value;
                                setReviewsList(list);
                              }}
                              placeholder="Review quotation text"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h4 style={sectionTitleStyle}>❓ Frequently Asked Questions (FAQs)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--mu)', margin: 0 }}>Add, edit or delete FAQs specific to this translation service.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...faqsList];
                            list.push({ q: 'New question title?', a: 'Detailed answer explanation.' });
                            setFaqsList(list);
                          }}
                          style={addBtnStyle}
                        >
                          + Add FAQ
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>FAQs Section Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.faqsTitle || ''} onChange={e => handleCOChange('faqsTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {faqsList.map((faq, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ ...labelStyle, marginBottom: 0 }}>Question #{idx + 1}</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...faqsList];
                                  list.splice(idx, 1);
                                  setFaqsList(list);
                                }}
                                style={delBtnStyle}
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <input
                              style={{ ...inputStyle, fontWeight: '700' }}
                              value={faq.q}
                              onChange={e => {
                                const list = [...faqsList];
                                list[idx].q = e.target.value;
                                setFaqsList(list);
                              }}
                              placeholder="Enter FAQ Question"
                            />
                            <textarea
                              rows={3}
                              style={{ ...inputStyle, resize: 'vertical' }}
                              value={faq.a}
                              onChange={e => {
                                const list = [...faqsList];
                                list[idx].a = e.target.value;
                                setFaqsList(list);
                              }}
                              placeholder="Enter detailed FAQ Answer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              {/* ─── TAB 9: CTA & SEO ─── */}
              {activeTab === 'cta_seo' && (
                <>
                  <div style={cardStyle}>
                    <h4 style={sectionTitleStyle}>📣 Bottom Full-Width CTA Banner</h4>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>CTA Heading</label>
                      <input style={inputStyle} value={formData.contentOverrides?.ctaTitle || ''} onChange={e => handleCOChange('ctaTitle', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>CTA Subtitle</label>
                      <input style={inputStyle} value={formData.contentOverrides?.ctaSubtitle || ''} onChange={e => handleCOChange('ctaSubtitle', e.target.value)} />
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <h4 style={sectionTitleStyle}>🔍 SEO &amp; Meta Tags</h4>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>SEO Meta Title (&lt;title&gt;)</label>
                      <input style={inputStyle} value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>SEO Meta Description</label>
                      <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.metaDesc} onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              {/* ─── TAB 10: SECTION ORDER & LAYOUT ─── */}
              {activeTab === 'layout_order' && (
                <>
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--bd)', margin: 0, fontFamily: "'Nunito', sans-serif" }}>📑 Section Order &amp; Page Layout Builder</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                          Reorder sections, hide/unhide any section, or create new custom sections with dedicated paragraphs, cards and CTAs for {formData.name}.
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
                          onClick={() => handleCOChange('sectionOrder', DEFAULT_SERVICE_SECTIONS.map(s => s.id))}
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
                        const defSec = DEFAULT_SERVICE_SECTIONS.find(s => s.id === secId);
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

                  {/* Custom Sections Full Editors with Cards / Boxes Grid */}
                  {((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => renderCustomSectionEditorCard(cs))}
                </>
              )}

                {/* Modal Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--br)' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ background: '#fff', border: '1px solid var(--br)', color: 'var(--bd)', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ background: 'var(--bd)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(26,58,107,0.2)' }}
                  >
                    <span>{saving ? '⏳ Saving...' : '💾 Save Changes'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
