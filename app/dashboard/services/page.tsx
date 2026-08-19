'use client';

import React, { useEffect, useState, useRef } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';

/** Mirrors the backend slugify in config/slug.js so the field can never
 *  submit a shape the API will reject. */
const slugify = (raw: string) =>
  String(raw ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');


interface FAQ {
  q: string;
  a: string;
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
  panelTitle?: string;
  panelSub?: string;
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

interface SampleCertItem {
  doc: string;
  lang: string;
  flag: string;
  seal: string;
  acc: string;
  time: string;
  icon: string;
}

interface Service {
  id: string;
  name: string;
  key: string;
  /** Admin-editable URL slug. `key` above stays fixed as the identifier. */
  slug?: string;
  icon: string;
  description: string;
  price?: number | null;
  metaTitle?: string;
  metaDesc?: string;
  title?: string;
  label?: string;
  p1?: string;
  p2?: string;
  faqs?: FAQ[];
  contentOverrides?: Record<string, any>;
}

type TabId = 'hero' | 'process' | 'about_agency' | 'comparison_docs' | 'other_services' | 'pricing_samples' | 'why_sidebar' | 'reviews_faqs' | 'cta_seo';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline slug editing. `key` stays fixed as the identifier the site and the
  // legacy script resolve against; only the URL slug changes.
  const [slugEdit, setSlugEdit] = useState<{ id: string; value: string } | null>(null);
  const [slugMsg, setSlugMsg] = useState<{ id: string; kind: 'ok' | 'err'; text: string } | null>(null);
  const [slugSaving, setSlugSaving] = useState(false);

  const saveSlug = async (svc: any, nextSlug: string) => {
    const current = svc.slug || svc.key;
    if (nextSlug.trim() === current) { setSlugEdit(null); return; }
    setSlugSaving(true);
    setSlugMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/services/${svc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug: nextSlug.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSlugMsg({ id: svc.id, kind: 'ok', text: `URL is now /services/${data.data.slug}` });
        setSlugEdit(null);
        await fetchServices();
      } else {
        setSlugMsg({ id: svc.id, kind: 'err', text: data.message || 'Could not save the slug.' });
      }
    } catch {
      setSlugMsg({ id: svc.id, kind: 'err', text: 'Could not reach the API.' });
    } finally {
      setSlugSaving(false);
    }
  };

  const [formData, setFormData] = useState<Service>({
    id: '',
    name: '',
    key: '',
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

  const getFullImgUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const clean = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${clean}`;
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/services/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setServices(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError('Cannot connect to API');
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
    const pEcon = Math.max(priceVal - 250, 499);
    const pExp = Math.round(priceVal * 1.5);

    const defaultComparisonRows: ComparisonRow[] = [
      { feat: 'Official Letterhead', std: '✗', our: '✓ Included' },
      { feat: 'Certified Seal & Sign', std: '✗', our: '✓ Included' },
      { feat: 'ISO Certification', std: '✗', our: '✓ Included' },
      { feat: 'Statement of Accuracy', std: '✗', our: '✓ Included' },
      { feat: 'Embassy Accepted', std: '✗', our: '✓ All Embassies' },
      { feat: 'Court Accepted', std: '✗', our: '✓ All Courts' },
      { feat: 'MEA / Apostille Ready', std: '✗', our: '✓ MEA Accepted' },
      { feat: 'Notarization (add-on)', std: '✗', our: '✓ +₹200/page' }
    ];

    const defaultDocCategories: DocCategoryItem[] = [
      {
        id: 'academic',
        name: 'Academic',
        icon: '🎓',
        color: '#dcfce7',
        panelTitle: `Academic for ${SN}`,
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
        panelSub: `Certified & notarized for high courts, district courts and international arbitration`,
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
        panelSub: `Domain-expert medical translators for hospitals, clinics and visa health checks`,
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
        panelSub: `Accurate financial translation for audit, tax filing, banks and visa embassies`,
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
        panelSub: `Engineering and technical specification translations with strict quality checks`,
        docs: 'Machinery Manuals, Engineering Specs, Safety Data Sheets, Installation Guides, Patents & Trademarks, Software Docs, Compliance Certs',
        ctaText: 'Need translation for any of these Technical documents?',
        ctaBtn: '📋 Get Quote for Technical'
      }
    ];

    const defaultOtherServices: OtherServiceItem[] = [
      { icon: '🌐', name: `Apostille & Attestation in ${city}`, desc: 'MEA apostille + embassy, HRD & notary attestation', link: '/services/apostille' },
      { icon: '💼', name: `Business Translation in ${city}`, desc: 'Corporate docs, annual reports, business contracts', link: '/services/business' },
      { icon: '🏅', name: `Certified Translation in ${city}`, desc: 'Embassy & court accepted certified translations', link: '/services/certified' },
      { icon: '📋', name: `Document Translation in ${city}`, desc: 'Birth, marriage, degree, medical & all personal documents', link: '/services/document' },
      { icon: '📊', name: `Financial Translation in ${city}`, desc: 'Bank statements, financial reports, balance sheets', link: '/services/financial' },
      { icon: '✈️', name: `Immigration Translation in ${city}`, desc: 'Visa applications, immigration documents, PCC', link: '/services/immigration' },
      { icon: '🎙️', name: `Interpretation in ${city}`, desc: 'Simultaneous, consecutive, conference interpretation', link: '/services/interpretation' },
      { icon: '⚖️', name: `Legal Translation in ${city}`, desc: 'Court orders, contracts, agreements, affidavits', link: '/services/legal' },
      { icon: '🏥', name: `Medical Translation in ${city}`, desc: 'Medical reports, clinical docs, pharma documents', link: '/services/medical' },
      { icon: '🔏', name: `Notarized Translation in ${city}`, desc: 'Notary-sealed certified translations', link: '/services/notarized' },
      { icon: '⚙️', name: `Technical Translation in ${city}`, desc: 'Manuals, engineering docs, technical specifications', link: '/services/technical' },
      { icon: '🛠️', name: `Engineering Translation in ${city}`, desc: 'Engineering drawings, specs, user manuals', link: '/services/technical' },
      { icon: '✈️', name: `Visa & Immigration in ${city}`, desc: 'Visa applications, immigration documents, PCC', link: '/services/visa-immigration' },
      { icon: '🌐', name: `Website Localization in ${city}`, desc: 'Website, app, software translation & localization', link: '/services/website' },
      { icon: '🔬', name: `Scientific Translation in ${city}`, desc: 'Research papers, clinical studies, academic journals', link: '/services/academic' }
    ];

    const defaultReviews: ReviewItem[] = [
      {
        stars: '★★★★★',
        text: `"Language Guru handled all our ${SN} requirements. Embassy acceptance guaranteed every time. Impeccable quality, always on time."`,
        name: 'Anil Verma',
        role: `Partner, AV Law Associates · ${city}`,
        avatar: 'AV'
      },
      {
        stars: '★★★★★',
        text: `"We use Language Guru for ${SN} regularly. Domain expertise is exceptional and timelines always met. Highly recommended."`,
        name: 'Dr. Sunita Das',
        role: `Medical Director, ClinPath India · Mumbai`,
        avatar: 'SD'
      },
      {
        stars: '★★★★★',
        text: `"Delivered 50,000+ words of ${SN} in 10 days, under budget. Domain expert reviewers, outstanding quality. Simply the best in India."`,
        name: 'Rajiv Gupta',
        role: `GM Operations, TechPro · Faridabad`,
        avatar: 'RG'
      },
      {
        stars: '★★★★★',
        text: `"Regular client for ${SN}. Consistent quality, expert domain knowledge. Best translation agency in India by far!"`,
        name: 'Vikram Singh',
        role: `Corporate Client · ${city} NCR`,
        avatar: 'VS'
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
      `${SN} on Official Letterhead`,
      'Certified Seal & Stamp',
      'Certificate of Accuracy',
      'ISO-9001:2015 & ISO 17100:2015 Certified',
      'Soft Copy PDF + Editable Word File',
      'Hard Copy Courier Delivery on Request',
      'Embassy & Court Accepted Guarantee',
      'Quality Checked by Senior Proofreader'
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
      step1Title: 'Submit Docs',
      step1Desc: `Email / WhatsApp / Drop-off at ${city} office`,
      step2Title: 'Get Quote',
      step2Desc: 'Instant price in 30 minutes',
      step3Title: 'Expert Translates',
      step3Desc: 'Native translator + domain expert',
      step4Title: 'QA + Certify',
      step4Desc: 'Proofreader + letterhead + Certificate of Accuracy',
      step5Title: 'Delivery',
      step5Desc: `Soft copy + courier to ${city}`,

      // Main Overview & Paragraphs
      aboutTitle: `${SN} Services in ${city} – Language Guru`,
      aboutP1: `<strong>Language Guru</strong> is ${city}'s most trusted ISO-9001:2015 and ISO 17100:2015 certified translation agency with offices at 617, West End Mall, Janakpuri, New Delhi. Since 2005, we have delivered 50,000+ ${snLow} in ${city} NCR, covering 120+ languages and all document types for immigration, legal, academic, medical and corporate purposes.`,
      aboutP2: `Our ${snLow} includes official letterhead, Certified Seal & Sign, Certificate of Accuracy, and ISO certification – accepted by all 60+ embassies in New Delhi, MEA (Ministry of External Affairs), Delhi High Court, district courts and top universities worldwide.`,

      // Agency Section & Office Title
      agencyTitle: `${SN} Agency in ${city}`,
      agencyP1: `Language Guru is ${city}'s leading ISO-9001:2015 and ISO 17100:2015 certified ${snLow} agency, operating since 2005 with a dedicated team of 500+ qualified translators, legal specialists and domain experts. As an MSME-registered, government-authorized translation agency in ${city}, Language Guru has delivered 50,000+ certified ${snLow} projects accepted by all 60+ embassies in New Delhi, MEA (Ministry of External Affairs), all district courts and high courts, and top universities and corporations worldwide.`,
      agencyP2: `Our ${snLow} agency in ${city} offers end-to-end solutions: from initial document collection (share scanned copies via email / WhatsApp from anywhere in ${city}) to expert translation by native-speaking, domain-certified professionals, through rigorous 3-stage quality control, ISO certification and final delivery by speed post or express courier. We handle everything in-house – no outsourcing – ensuring consistent quality and absolute confidentiality under NDA-backed security protocols.`,
      agencyP3: `Language Guru's ${city} ${snLow} agency serves individuals, law firms, hospitals, embassies, MNCs, government departments, universities and export-import businesses across ${city} NCR and pan-India. Our clients include the Ministry of External Affairs, Delhi High Court, AIIMS, IITs, State Bank of India, Tata Consultancy Services, Sun Pharmaceutical and 500+ other organizations. Call +91-9312690490 or WhatsApp for an instant quote and free consultation from our ${city} ${snLow} team.`,

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
      // Tier 1 Economy
      tier1Name: 'Economy',
      tier1Price: `₹${pEcon}`,
      tier1Unit: 'per page',
      tier1Delivery: '⏱ 5–7 Working Days',
      tier1Features: 'Simple Translation\nCompany Sign & Seal\nOfficial Letterhead\nSoft Copy PDF\n! ISO Certification',
      
      // Tier 2 Certified (Popular)
      tier2Name: 'Certified',
      tier2Badge: '⭐ MOST POPULAR',
      tier2Price: `₹${priceVal}`,
      tier2Unit: 'per page',
      tier2Delivery: '⏱ 3–5 Working Days',
      tier2Features: `${SN}\nOfficial Letterhead\nISO Certified\nCertificate of Accuracy\nEmbassy Accepted`,
      
      // Tier 3 Express
      tier3Name: 'Express',
      tier3Price: `₹${pExp}`,
      tier3Unit: 'per page',
      tier3Delivery: '⚡ 24 Hours',
      tier3Features: 'All Features\nPriority Handling\nDedicated Manager\nWhatsApp Updates\nFree Courier',
      
      pricingAddons: '➕ Add-ons: Notarization ₹200/page · MEA Apostille ₹1,400/page · Embassy Attestation ₹5,500/page · Courier ₹200 | Bulk: 10+ pages – 10% off · 20+ pages – 15% off',
      certSampleTitle: `${SN} Certificate Samples`,
      certSampleSubtitle: `View verified ISO-certified samples for ${SN} in ${city}:`,
      sampleCertsList: defaultSampleCerts,

      // Why Choose Us & Sidebar
      whyChooseTitle: `Why Choose Language Guru in ${city}?`,
      whyChooseList: defaultWhyChooseList,
      
      // Sidebar Full Customization
      sidebarCtaTitle: `Get ${SN}`,
      sidebarCtaSub: `Expert in ${city} – instant quote in 30 minutes`,
      sidebarPhone1: '+919312690490',
      sidebarPhone2: '+919810693777',
      sidebarBtn1Text: '📋 Get Free Quote',
      sidebarBtn1Link: '/quote',
      sidebarBtn2Text: '💬 WhatsApp Us',
      sidebarBtn2WA: '919312690490',
      
      includesTitle: `${SN} Includes`,
      includesItems: defaultIncludesList,
      sidebarCitiesTitle: `🗺️ ${SN} – Other Cities`,
      sidebarLangsTitle: `🌍 Languages in ${city}`,
      sidebarOtherSvcsTitle: `📋 Other Services – ${city}`,
      certificationsTitle: 'Certifications & Accreditations',

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
      p1: defaults.aboutP1,
      p2: defaults.aboutP2,
      faqs: defaultFaqsFor('New Service'),
      contentOverrides: defaults
    });
    setActiveTab('hero');
    setShowModal(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    const defaults = getServiceDefaults(svc.name, svc.key, svc.price || 850);
    const mergedCO = { ...defaults, ...(svc.contentOverrides || {}) };

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
      p1: svc.p1 || defaults.aboutP1,
      p2: svc.p2 || defaults.aboutP2,
      faqs: (svc.faqs && svc.faqs.length > 0) ? svc.faqs : defaultFaqsFor(svc.name),
      contentOverrides: mergedCO
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
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleCOChange('heroBgImage', data.url);
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err) {
      alert('Error uploading image to server.');
    } finally {
      setUploadingHeroBg(false);
    }
  };

  /* ── FAQ Helpers ── */
  const handleFaqChange = (index: number, field: 'q' | 'a', value: string) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs[index][field] = value;
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { q: '', a: '' }]
    }));
  };

  const removeFaq = (index: number) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs.splice(index, 1);
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  /* ── Comparison Table Helpers ── */
  const handleDiffRowChange = (index: number, field: 'feat' | 'std' | 'our', value: string) => {
    const currentRows: ComparisonRow[] = [...(formData.contentOverrides?.diffRows || [])];
    currentRows[index][field] = value;
    handleCOChange('diffRows', currentRows);
  };

  const addDiffRow = () => {
    const currentRows: ComparisonRow[] = [...(formData.contentOverrides?.diffRows || [])];
    currentRows.push({ feat: 'New Feature', std: '✗', our: '✓ Included' });
    handleCOChange('diffRows', currentRows);
  };

  const removeDiffRow = (index: number) => {
    const currentRows: ComparisonRow[] = [...(formData.contentOverrides?.diffRows || [])];
    currentRows.splice(index, 1);
    handleCOChange('diffRows', currentRows);
  };

  /* ── Document Categories Helpers ── */
  const handleDocCategoryChange = (index: number, field: keyof DocCategoryItem, value: string) => {
    const currentCats: DocCategoryItem[] = [...(formData.contentOverrides?.docCategories || [])];
    currentCats[index] = { ...currentCats[index], [field]: value };
    handleCOChange('docCategories', currentCats);
  };

  const addDocCategory = () => {
    const currentCats: DocCategoryItem[] = [...(formData.contentOverrides?.docCategories || [])];
    currentCats.push({
      id: 'cat_' + Date.now(),
      name: 'New Category',
      icon: '📄',
      color: '#dbeafe',
      panelTitle: 'New Category Documents',
      panelSub: 'Available in 120+ languages with certification',
      docs: 'Doc 1, Doc 2, Doc 3',
      ctaText: 'Need translation for these documents?',
      ctaBtn: '📋 Get Quote'
    });
    handleCOChange('docCategories', currentCats);
  };

  const removeDocCategory = (index: number) => {
    const currentCats: DocCategoryItem[] = [...(formData.contentOverrides?.docCategories || [])];
    currentCats.splice(index, 1);
    handleCOChange('docCategories', currentCats);
  };

  /* ── Other Services List Helpers ── */
  const handleOtherSvcChange = (index: number, field: keyof OtherServiceItem, value: string) => {
    const list: OtherServiceItem[] = [...(formData.contentOverrides?.otherServicesList || [])];
    list[index] = { ...list[index], [field]: value };
    handleCOChange('otherServicesList', list);
  };

  const addOtherSvc = () => {
    const list: OtherServiceItem[] = [...(formData.contentOverrides?.otherServicesList || [])];
    list.push({ icon: '📄', name: 'New Translation Service', desc: 'Description of service', link: '/services/new-service' });
    handleCOChange('otherServicesList', list);
  };

  const removeOtherSvc = (index: number) => {
    const list: OtherServiceItem[] = [...(formData.contentOverrides?.otherServicesList || [])];
    list.splice(index, 1);
    handleCOChange('otherServicesList', list);
  };

  /* ── Why Choose List Helpers ── */
  const handleWhyChooseChange = (index: number, field: keyof WhyChooseItem, value: string) => {
    const list: WhyChooseItem[] = [...(formData.contentOverrides?.whyChooseList || [])];
    list[index] = { ...list[index], [field]: value };
    handleCOChange('whyChooseList', list);
  };

  const addWhyChoose = () => {
    const list: WhyChooseItem[] = [...(formData.contentOverrides?.whyChooseList || [])];
    list.push({ icon: '⭐', title: 'Why Choose Feature', desc: 'Description of this benefit.' });
    handleCOChange('whyChooseList', list);
  };

  const removeWhyChoose = (index: number) => {
    const list: WhyChooseItem[] = [...(formData.contentOverrides?.whyChooseList || [])];
    list.splice(index, 1);
    handleCOChange('whyChooseList', list);
  };

  /* ── Sample Certificates List Helpers ── */
  const handleSampleCertChange = (index: number, field: keyof SampleCertItem, value: string) => {
    const list: SampleCertItem[] = [...(formData.contentOverrides?.sampleCertsList || [])];
    list[index] = { ...list[index], [field]: value };
    handleCOChange('sampleCertsList', list);
  };

  const addSampleCert = () => {
    const list: SampleCertItem[] = [...(formData.contentOverrides?.sampleCertsList || [])];
    list.push({ doc: 'New Document Certificate', lang: 'English → German', flag: '🇩🇪', seal: '🇩🇪', acc: 'German Embassy', time: '24 Hrs', icon: '📜' });
    handleCOChange('sampleCertsList', list);
  };

  const removeSampleCert = (index: number) => {
    const list: SampleCertItem[] = [...(formData.contentOverrides?.sampleCertsList || [])];
    list.splice(index, 1);
    handleCOChange('sampleCertsList', list);
  };

  /* ── Sidebar Includes Checklist Helpers ── */
  const handleIncludesItemChange = (index: number, value: string) => {
    const list: string[] = [...(formData.contentOverrides?.includesItems || [])];
    list[index] = value;
    handleCOChange('includesItems', list);
  };

  const addIncludesItem = () => {
    const list: string[] = [...(formData.contentOverrides?.includesItems || [])];
    list.push('New Included Feature');
    handleCOChange('includesItems', list);
  };

  const removeIncludesItem = (index: number) => {
    const list: string[] = [...(formData.contentOverrides?.includesItems || [])];
    list.splice(index, 1);
    handleCOChange('includesItems', list);
  };

  /* ── Reviews List Helpers ── */
  const handleReviewChange = (index: number, field: keyof ReviewItem, value: string) => {
    const list: ReviewItem[] = [...(formData.contentOverrides?.reviewsList || [])];
    list[index] = { ...list[index], [field]: value };
    handleCOChange('reviewsList', list);
  };

  const addReview = () => {
    const list: ReviewItem[] = [...(formData.contentOverrides?.reviewsList || [])];
    list.push({ stars: '★★★★★', text: '"Excellent quality and quick delivery."', name: 'Client Name', role: 'Role · Delhi', avatar: 'CN' });
    handleCOChange('reviewsList', list);
  };

  const removeReview = (index: number) => {
    const list: ReviewItem[] = [...(formData.contentOverrides?.reviewsList || [])];
    list.splice(index, 1);
    handleCOChange('reviewsList', list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const url = formData.id ? `${API_URL}/api/v1/services/${formData.id}` : `${API_URL}/api/v1/services`;
      const method = formData.id ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        slug: slugify(formData.slug || formData.key),
        price: formData.price ? Number(formData.price) : 850,
        title: formData.contentOverrides?.heroTitle || formData.title,
        description: formData.contentOverrides?.heroSub || formData.description,
        label: formData.contentOverrides?.aboutTitle || formData.label,
        p1: formData.contentOverrides?.aboutP1 || formData.p1,
        p2: formData.contentOverrides?.aboutP2 || formData.p2,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Service saved successfully! Changes are live.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setShowModal(false);
        fetchServices();
      } else {
        alert(data.message || 'Error saving service');
      }
    } catch (err) {
      alert('Network error while saving service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/services/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        fetchServices();
      } else {
        alert(data.message || 'Error deleting service');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const TABS = [
    { id: 'hero' as TabId, icon: '🏷️', label: '1. Hero & Badges' },
    { id: 'process' as TabId, icon: '⚡', label: '2. 5-Step Process' },
    { id: 'about_agency' as TabId, icon: '📖', label: '3. Overview & Agency' },
    { id: 'comparison_docs' as TabId, icon: '⚖️', label: '4. Comparison & Docs' },
    { id: 'other_services' as TabId, icon: '🌐', label: '5. Other 15 Services' },
    { id: 'pricing_samples' as TabId, icon: '💰', label: '6. Pricing & Samples' },
    { id: 'why_sidebar' as TabId, icon: '🎯', label: '7. Why Choose & Sidebar' },
    { id: 'reviews_faqs' as TabId, icon: '⭐', label: '8. Reviews & FAQs' },
    { id: 'cta_seo' as TabId, icon: '🔍', label: '9. CTA & SEO' }
  ];

  return (
    <>
      <TopNav title="💼 Manage Services" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                All Services ({services.length})
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>
                Every service page has 16 fully editable sections (Hero with Image Upload, Action Buttons, Process, Agency, Comparison Table, Document Categories, 15 Other Services, Why Choose, Sidebar Widgets, Reviews, 3-Tier Pricing, Samples, FAQs, SEO).
              </p>
            </div>
            {successMsg && (
              <span style={{ fontSize: '13px', color: '#166534', background: '#dcfce7', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold' }}>
                ✓ {successMsg}
              </span>
            )}
            <button className="btn-b" onClick={handleOpenAdd}>+ Add Service</button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '14px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading services from API...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Icon</th>
                    <th>Service Name</th>
                    <th>Slug URL</th>
                    <th>Price / Page</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc.id}>
                      <td style={{ fontSize: '22px', textAlign: 'center' }}>{svc.icon}</td>
                      <td style={{ fontWeight: '700', color: 'var(--td)' }}>
                        {svc.name}
                        <div style={{ fontSize: '11px', color: 'var(--mu)', fontWeight: '400' }}>{svc.description?.substring(0, 75)}...</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px', minWidth: '260px' }}>
                        {slugEdit?.id === svc.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--mu)' }}>/services/</span>
                            <input
                              autoFocus
                              value={slugEdit.value}
                              onChange={(e) => setSlugEdit({ id: svc.id, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveSlug(svc, slugEdit.value);
                                if (e.key === 'Escape') { setSlugEdit(null); setSlugMsg(null); }
                              }}
                              style={{
                                width: '130px', padding: '4px 7px', borderRadius: '5px',
                                border: '1px solid var(--bb)', fontFamily: 'monospace', fontSize: '13px',
                              }}
                            />
                            <button
                              onClick={() => saveSlug(svc, slugEdit.value)}
                              disabled={slugSaving}
                              title="Save slug"
                              style={{ border: 'none', background: 'var(--bd)', color: '#fff', borderRadius: '5px', padding: '4px 9px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              {slugSaving ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setSlugEdit(null); setSlugMsg(null); }}
                              title="Cancel"
                              style={{ border: '1px solid var(--br)', background: '#fff', color: 'var(--mu)', borderRadius: '5px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSlugEdit({ id: svc.id, value: svc.slug || svc.key }); setSlugMsg(null); }}
                            title="Click to change this page's URL"
                            style={{
                              border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                              color: 'var(--bb)', fontFamily: 'monospace', fontSize: '13px',
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                            }}
                          >
                            /services/{svc.slug || svc.key}
                            <span style={{ fontSize: '11px', opacity: 0.55 }}>✏️</span>
                          </button>
                        )}
                        {slugMsg?.id === svc.id && (
                          <div style={{
                            fontFamily: 'inherit', fontSize: '11.5px', marginTop: '5px', lineHeight: 1.45,
                            color: slugMsg.kind === 'ok' ? '#166534' : '#b91c1c',
                          }}>
                            {slugMsg.text}
                          </div>
                        )}
                        {(svc.slug && svc.slug !== svc.key) && (
                          <div style={{ fontFamily: 'inherit', fontSize: '10.5px', color: 'var(--mu)', marginTop: '3px' }}>
                            id: <code>{svc.key}</code> (fixed)
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--bd)' }}>₹{svc.price || 850}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button onClick={() => handleOpenEdit(svc)} style={{ background: 'none', border: 'none', color: 'var(--bb)', cursor: 'pointer', fontWeight: '700', marginRight: '14px', fontSize: '13px' }}>
                          ✏️ Edit Page Content
                        </button>
                        <button onClick={() => handleDelete(svc.id, svc.name)} style={{ background: 'none', border: 'none', color: 'var(--rd)', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════ FULL RICH SERVICE EDIT MODAL ══════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '1100px', maxWidth: '98vw', maxHeight: '92vh', height: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shh)', border: '1px solid var(--br)', overflow: 'hidden' }}>
            
            {/* MODAL HEADER (STICKY) */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g1)', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>
                  {editingService ? `✏️ Edit Service: ${formData.name}` : '➕ Add New Service'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--mu)', margin: '2px 0 0 0' }}>
                  Slug URL: <code>/services/{formData.slug || formData.key || 'service-name'}</code>
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--mu)', cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            {/* TAB NAVIGATION (STICKY & ALWAYS VISIBLE) */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--br)', padding: '0 16px', background: '#f8fafc', overflowX: 'auto', gap: '4px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '12px 14px',
                    fontWeight: '700',
                    fontSize: '13px',
                    borderBottom: activeTab === tab.id ? '3px solid var(--bd)' : '3px solid transparent',
                    color: activeTab === tab.id ? 'var(--bd)' : 'var(--mu)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* MODAL CONTENT BODY (SCROLLABLE) */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* ─── TAB 1: HERO & HEADER & BUTTONS WITH PRO IMAGE UPLOAD ─── */}
                {activeTab === 'hero' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏷️ Basic Settings</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={labelStyle}>Service Name</label>
                          <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                          <label style={labelStyle}>Slug (URL)</label>
                          <input
                            style={inputStyle}
                            value={formData.slug ?? formData.key}
                            onChange={e => {
                              const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
                              // `key` is the immutable identifier the site resolves against and the
                              // API refuses to change, so only a brand-new service sets it here.
                              setFormData(prev => ({ ...prev, slug: next, ...(editingService ? {} : { key: next }) }));
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Icon Emoji</label>
                          <input style={inputStyle} value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} required />
                        </div>
                        <div>
                          <label style={labelStyle}>Base Price (₹ / page)</label>
                          <input type="number" style={inputStyle} value={formData.price || 850} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🖼️ Hero Banner &amp; Background Image Upload</h4>
                      
                      {/* PROFESSIONAL HERO BG UPLOAD SYSTEM */}
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1.5px dashed #cbd5e1', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <label style={{ ...labelStyle, marginBottom: '2px' }}>Hero Background Image</label>
                            <span style={{ fontSize: '11.5px', color: 'var(--mu)' }}>
                              Upload a background image (16:9 ratio recommended, 1920x1080px). If empty, the default navy gradient will be used.
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
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
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: uploadingHeroBg ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {uploadingHeroBg ? '⏳ Uploading...' : '📁 Upload Image File'}
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
                        </div>

                        {/* Image Preview Box with live src resolution */}
                        {formData.contentOverrides?.heroBgImage && (
                          <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--br)', marginBottom: '10px', background: '#0f172a' }}>
                            <img
                              src={getFullImgUrl(formData.contentOverrides?.heroBgImage)}
                              alt="Hero Background Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: '8px', left: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                ✓ Active Background Image
                              </span>
                              <a
                                href={getFullImgUrl(formData.contentOverrides?.heroBgImage)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: 'rgba(30,127,197,0.9)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}
                              >
                                🔗 Open in New Tab
                              </a>
                            </div>
                          </div>
                        )}

                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>Or Paste Direct Image URL</label>
                          <input
                            style={{ ...inputStyle, fontSize: '12px' }}
                            placeholder="e.g. /uploads/academic-bg.jpg or https://images.unsplash.com/..."
                            value={formData.contentOverrides?.heroBgImage || ''}
                            onChange={e => handleCOChange('heroBgImage', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Hero Top Badge Text</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroBadge || ''} onChange={e => handleCOChange('heroBadge', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>ISO Tagline</label>
                          <input style={inputStyle} value={formData.contentOverrides?.heroIso || ''} onChange={e => handleCOChange('heroIso', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Main Heading (HTML allowed, e.g. &lt;em&gt;Delhi&lt;/em&gt;)</label>
                        <input style={inputStyle} value={formData.contentOverrides?.heroTitle || ''} onChange={e => handleCOChange('heroTitle', e.target.value)} />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Subtitle Paragraph</label>
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.heroSub || ''} onChange={e => handleCOChange('heroSub', e.target.value)} />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Feature Badges (Separated by | )</label>
                        <input style={inputStyle} value={formData.contentOverrides?.heroBadgesList || ''} onChange={e => handleCOChange('heroBadgesList', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🔘 Hero Action Buttons (CTA Buttons)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                        <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                          <div style={{ fontWeight: '700', fontSize: '12px', color: '#991b1b', marginBottom: '8px' }}>🔴 Button 1 (Quote)</div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={labelStyle}>Button Text</label>
                            <input style={inputStyle} value={formData.contentOverrides?.heroBtn1Text || '📋 Get Free Quote'} onChange={e => handleCOChange('heroBtn1Text', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Link / Action</label>
                            <input style={inputStyle} value={formData.contentOverrides?.heroBtn1Link || '/quote'} onChange={e => handleCOChange('heroBtn1Link', e.target.value)} />
                          </div>
                        </div>

                        <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                          <div style={{ fontWeight: '700', fontSize: '12px', color: '#1e40af', marginBottom: '8px' }}>🔵 Button 2 (Call Expert)</div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={labelStyle}>Button Text</label>
                            <input style={inputStyle} value={formData.contentOverrides?.heroBtn2Text || '📞 Call Expert'} onChange={e => handleCOChange('heroBtn2Text', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input style={inputStyle} value={formData.contentOverrides?.heroBtn2Phone || '+919312690490'} onChange={e => handleCOChange('heroBtn2Phone', e.target.value)} />
                          </div>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          <div style={{ fontWeight: '700', fontSize: '12px', color: '#166534', marginBottom: '8px' }}>🟢 Button 3 (WhatsApp)</div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={labelStyle}>Button Text</label>
                            <input style={inputStyle} value={formData.contentOverrides?.heroBtn3Text || '💬 WhatsApp'} onChange={e => handleCOChange('heroBtn3Text', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>WhatsApp Number</label>
                            <input style={inputStyle} value={formData.contentOverrides?.heroBtn3WA || '919312690490'} onChange={e => handleCOChange('heroBtn3WA', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 2: 5-STEP PROCESS ─── */}
                {activeTab === 'process' && (
                  <div style={cardStyle}>
                    <h4 style={sectionTitleStyle}>⚡ How It Works (5-Step Process)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <label style={labelStyle}>Section Tag</label>
                        <input style={inputStyle} value={formData.contentOverrides?.processTag || ''} onChange={e => handleCOChange('processTag', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Process Header Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.processTitle || ''} onChange={e => handleCOChange('processTitle', e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                      {[
                        { step: 1, tKey: 'step1Title', dKey: 'step1Desc' },
                        { step: 2, tKey: 'step2Title', dKey: 'step2Desc' },
                        { step: 3, tKey: 'step3Title', dKey: 'step3Desc' },
                        { step: 4, tKey: 'step4Title', dKey: 'step4Desc' },
                        { step: 5, tKey: 'step5Title', dKey: 'step5Desc' },
                      ].map(st => (
                        <div key={st.step} style={{ background: 'var(--g1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)', marginBottom: '8px' }}>STEP {st.step}</div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Step Name</label>
                            <input style={{ ...inputStyle, fontSize: '12px', padding: '6px 8px' }} value={formData.contentOverrides?.[st.tKey] || ''} onChange={e => handleCOChange(st.tKey, e.target.value)} />
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Description</label>
                            <textarea rows={3} style={{ ...inputStyle, fontSize: '11px', padding: '6px 8px', resize: 'none' }} value={formData.contentOverrides?.[st.dKey] || ''} onChange={e => handleCOChange(st.dKey, e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: OVERVIEW & AGENCY (ALL PARAGRAPHS & OFFICE TITLE) ─── */}
                {activeTab === 'about_agency' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📖 Service Overview (Paragraphs 1 & 2)</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Overview Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.aboutTitle || ''} onChange={e => handleCOChange('aboutTitle', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Overview Paragraph 1 (Introduction, City Trust, 50,000+ docs)</label>
                        <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.aboutP1 || ''} onChange={e => handleCOChange('aboutP1', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Overview Paragraph 2 (Letterhead, Seal & Sign, Embassies & Courts acceptance)</label>
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.aboutP2 || ''} onChange={e => handleCOChange('aboutP2', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏛️ Agency Details & Long Description</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.agencyTitle || ''} onChange={e => handleCOChange('agencyTitle', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Paragraph 1 (History, 500+ translators, MEA empanelled)</label>
                        <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.agencyP1 || ''} onChange={e => handleCOChange('agencyP1', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Paragraph 2 (In-house process, 3-stage QC, courier delivery)</label>
                        <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.agencyP2 || ''} onChange={e => handleCOChange('agencyP2', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Paragraph 3 (Client profile: Law firms, Hospitals, IITs, MNCs)</label>
                        <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.agencyP3 || ''} onChange={e => handleCOChange('agencyP3', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🛡️ 6 Trust Badges & Office Address Box</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[
                          { num: 1, k: 'trustCard1', label: 'Card 1 (Govt. Authorized)' },
                          { num: 2, k: 'trustCard2', label: 'Card 2 (4.9/5 Rating)' },
                          { num: 3, k: 'trustCard3', label: 'Card 3 (Easy Submission)' },
                          { num: 4, k: 'trustCard4', label: 'Card 4 (24-Hr Express)' },
                          { num: 5, k: 'trustCard5', label: 'Card 5 (100% Accepted)' },
                          { num: 6, k: 'trustCard6', label: 'Card 6 (Confidential)' },
                        ].map(c => (
                          <div key={c.k} style={{ background: 'var(--g1)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--br)' }}>
                            <label style={{ ...labelStyle, fontSize: '11px' }}>{c.label}</label>
                            <input style={{ ...inputStyle, fontSize: '12px' }} value={formData.contentOverrides?.[c.k] || ''} onChange={e => handleCOChange(c.k, e.target.value)} />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                        <div>
                          <label style={labelStyle}>📍 Office Box Header Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.agencyOfficeTitle || ''} onChange={e => handleCOChange('agencyOfficeTitle', e.target.value)} placeholder="📍 Academic Translation Agency – Delhi Office" />
                        </div>
                        <div>
                          <label style={labelStyle}>Office Address & Contact Text</label>
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
                      <h4 style={sectionTitleStyle}>⚖️ Standard vs Service Comparison Table</h4>
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
                      <button type="button" onClick={addDiffRow} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        + Add Comparison Row
                      </button>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={sectionTitleStyle}>📄 Documents We Handle Categories, Lists &amp; Buttons</h4>
                        <button type="button" onClick={addDocCategory} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
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
                              <button type="button" onClick={() => removeDocCategory(idx)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '4px', padding: '3px 10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
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
                                <input style={inputStyle} value={cat.panelTitle || ''} onChange={e => handleDocCategoryChange(idx, 'panelTitle', e.target.value)} placeholder={`${cat.name} for ${formData.name}`} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Panel Subtitle</label>
                                <input style={inputStyle} value={cat.panelSub || ''} onChange={e => handleDocCategoryChange(idx, 'panelSub', e.target.value)} placeholder="Available in 120+ languages with certification" />
                              </div>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Documents List (Comma Separated)</label>
                              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: '12px' }} value={cat.docs} onChange={e => handleDocCategoryChange(idx, 'docs', e.target.value)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Bottom CTA Bar Text</label>
                                <input style={inputStyle} value={cat.ctaText || ''} onChange={e => handleDocCategoryChange(idx, 'ctaText', e.target.value)} placeholder={`Need translation for any of these ${cat.name} documents?`} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Bottom CTA Button Text</label>
                                <input style={inputStyle} value={cat.ctaBtn || ''} onChange={e => handleDocCategoryChange(idx, 'ctaBtn', e.target.value)} placeholder={`📋 Get Quote for ${cat.name}`} />
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
                          Edit all other services shown in the 15-cards grid below the Agency section.
                        </p>
                      </div>
                      <button type="button" onClick={addOtherSvc} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
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
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--bd)' }}>Service #{idx + 1}</span>
                            <button type="button" onClick={() => removeOtherSvc(idx)} style={{ background: 'none', border: 'none', color: 'var(--rd)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Icon</label>
                              <input style={{ ...inputStyle, padding: '4px 6px', fontSize: '13px', textAlign: 'center' }} value={os.icon} onChange={e => handleOtherSvcChange(idx, 'icon', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Name</label>
                              <input style={{ ...inputStyle, padding: '4px 6px', fontSize: '12px' }} value={os.name} onChange={e => handleOtherSvcChange(idx, 'name', e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '9px' }}>Short Description</label>
                            <input style={{ ...inputStyle, padding: '4px 6px', fontSize: '11px' }} value={os.desc} onChange={e => handleOtherSvcChange(idx, 'desc', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '9px' }}>Link URL</label>
                            <input style={{ ...inputStyle, padding: '4px 6px', fontSize: '11px' }} value={os.link} onChange={e => handleOtherSvcChange(idx, 'link', e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 6: FULL 3-TIER PRICING & SAMPLE CERTIFICATES (CLEAN & NO OVERFLOW) ─── */}
                {activeTab === 'pricing_samples' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>💰 Full 3-Tier Pricing Packages Breakdown</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Pricing Section Main Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.pricingTitle || ''} onChange={e => handleCOChange('pricingTitle', e.target.value)} placeholder={`${formData.name} Pricing in Delhi`} />
                      </div>

                      {/* 3 Full Package Cards Editor */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        
                        {/* Package 1: Economy */}
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--bd)' }}>Package 1: Economy</div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Name</label>
                            <input style={inputStyle} value={formData.contentOverrides?.tier1Name || 'Economy'} onChange={e => handleCOChange('tier1Name', e.target.value)} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Price</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier1Price || '₹600'} onChange={e => handleCOChange('tier1Price', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Unit</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier1Unit || 'per page'} onChange={e => handleCOChange('tier1Unit', e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Delivery Turnaround</label>
                            <input style={inputStyle} value={formData.contentOverrides?.tier1Delivery || '⏱ 5–7 Working Days'} onChange={e => handleCOChange('tier1Delivery', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Features (One per line; prefix with ! for excluded ✗)</label>
                            <textarea rows={4} style={{ ...inputStyle, resize: 'vertical', fontSize: '11.5px' }} value={formData.contentOverrides?.tier1Features || 'Simple Translation\nCompany Sign & Seal\nOfficial Letterhead\nSoft Copy PDF\n! ISO Certification'} onChange={e => handleCOChange('tier1Features', e.target.value)} />
                          </div>
                        </div>

                        {/* Package 2: Certified (Popular) */}
                        <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1.5px solid #93c5fd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#1e40af' }}>Package 2: Certified</div>
                            <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>⭐ POPULAR</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Name</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier2Name || 'Certified'} onChange={e => handleCOChange('tier2Name', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Badge Text</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier2Badge || '⭐ MOST POPULAR'} onChange={e => handleCOChange('tier2Badge', e.target.value)} />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Price</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier2Price || `₹${formData.price || 850}`} onChange={e => handleCOChange('tier2Price', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Unit</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier2Unit || 'per page'} onChange={e => handleCOChange('tier2Unit', e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Delivery Turnaround</label>
                            <input style={inputStyle} value={formData.contentOverrides?.tier2Delivery || '⏱ 3–5 Working Days'} onChange={e => handleCOChange('tier2Delivery', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Features (One per line)</label>
                            <textarea rows={4} style={{ ...inputStyle, resize: 'vertical', fontSize: '11.5px' }} value={formData.contentOverrides?.tier2Features || `${formData.name}\nOfficial Letterhead\nISO Certified\nCertificate of Accuracy\nEmbassy Accepted`} onChange={e => handleCOChange('tier2Features', e.target.value)} />
                          </div>
                        </div>

                        {/* Package 3: Express */}
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--bd)' }}>Package 3: Express</div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Name</label>
                            <input style={inputStyle} value={formData.contentOverrides?.tier3Name || 'Express'} onChange={e => handleCOChange('tier3Name', e.target.value)} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Price</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier3Price || '₹1275'} onChange={e => handleCOChange('tier3Price', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Unit</label>
                              <input style={inputStyle} value={formData.contentOverrides?.tier3Unit || 'per page'} onChange={e => handleCOChange('tier3Unit', e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Delivery Turnaround</label>
                            <input style={inputStyle} value={formData.contentOverrides?.tier3Delivery || '⚡ 24 Hours'} onChange={e => handleCOChange('tier3Delivery', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '10px' }}>Features (One per line)</label>
                            <textarea rows={4} style={{ ...inputStyle, resize: 'vertical', fontSize: '11.5px' }} value={formData.contentOverrides?.tier3Features || 'All Features\nPriority Handling\nDedicated Manager\nWhatsApp Updates\nFree Courier'} onChange={e => handleCOChange('tier3Features', e.target.value)} />
                          </div>
                        </div>

                      </div>

                      <div>
                        <label style={labelStyle}>Add-ons & Bulk Discounts Note Bar</label>
                        <input style={inputStyle} value={formData.contentOverrides?.pricingAddons || ''} onChange={e => handleCOChange('pricingAddons', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={sectionTitleStyle}>📜 Sample Certificates (Section &amp; Gallery Modal)</h4>
                        <button type="button" onClick={addSampleCert} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          + Add Sample Certificate
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                          <label style={labelStyle}>Sample Certificates Header Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.certSampleTitle || ''} onChange={e => handleCOChange('certSampleTitle', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Section Subtitle</label>
                          <input style={inputStyle} value={formData.contentOverrides?.certSampleSubtitle || ''} onChange={e => handleCOChange('certSampleSubtitle', e.target.value)} />
                        </div>
                      </div>

                      {/* Clean 2-column grid with dedicated header row so remove button NEVER overflows */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        {(formData.contentOverrides?.sampleCertsList || []).map((cert: SampleCertItem, idx: number) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                            
                            {/* CLEAN TOP HEADER WITH NO OVERFLOW */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--br)' }}>
                              <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--bd)' }}>Sample Certificate #{idx + 1}</span>
                              <button type="button" onClick={() => removeSampleCert(idx)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                ✕ Remove
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 50px', gap: '8px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Icon</label>
                                <input style={{ ...inputStyle, padding: '4px', textAlign: 'center' }} value={cert.icon} onChange={e => handleSampleCertChange(idx, 'icon', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Document Name</label>
                                <input style={{ ...inputStyle, padding: '4px 6px' }} value={cert.doc} onChange={e => handleSampleCertChange(idx, 'doc', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Flag</label>
                                <input style={{ ...inputStyle, padding: '4px', textAlign: 'center' }} value={cert.flag} onChange={e => handleSampleCertChange(idx, 'flag', e.target.value)} />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Language Pair</label>
                                <input style={{ ...inputStyle, padding: '4px 6px' }} value={cert.lang} onChange={e => handleSampleCertChange(idx, 'lang', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Accepted By</label>
                                <input style={{ ...inputStyle, padding: '4px 6px' }} value={cert.acc} onChange={e => handleSampleCertChange(idx, 'acc', e.target.value)} />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Turnaround</label>
                                <input style={{ ...inputStyle, padding: '4px 6px' }} value={cert.time} onChange={e => handleSampleCertChange(idx, 'time', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '9px' }}>Seal Flag</label>
                                <input style={{ ...inputStyle, padding: '4px 6px', textAlign: 'center' }} value={cert.seal} onChange={e => handleSampleCertChange(idx, 'seal', e.target.value)} />
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 7: WHY CHOOSE & SIDEBAR (FULL EDITABLE SIDEBAR CTA & INCLUDES) ─── */}
                {activeTab === 'why_sidebar' && (
                  <>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={sectionTitleStyle}>🎯 Why Choose Us Section</h4>
                        <button type="button" onClick={addWhyChoose} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          + Add Feature
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Why Choose Us Header Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.whyChooseTitle || ''} onChange={e => handleCOChange('whyChooseTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(formData.contentOverrides?.whyChooseList || []).map((wc: WhyChooseItem, idx: number) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--br)', display: 'grid', gridTemplateColumns: '50px 1fr 2fr 30px', gap: '10px', alignItems: 'center' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Icon</label>
                              <input style={{ ...inputStyle, padding: '6px', textAlign: 'center' }} value={wc.icon} onChange={e => handleWhyChooseChange(idx, 'icon', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Title</label>
                              <input style={{ ...inputStyle, padding: '6px' }} value={wc.title} onChange={e => handleWhyChooseChange(idx, 'title', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '9px' }}>Description</label>
                              <input style={{ ...inputStyle, padding: '6px' }} value={wc.desc} onChange={e => handleWhyChooseChange(idx, 'desc', e.target.value)} />
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '14px' }}>
                              <button type="button" onClick={() => removeWhyChoose(idx)} style={{ background: 'none', border: 'none', color: 'var(--rd)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📌 Sidebar Top Card (Get Service CTA Box)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Sidebar Box Main Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarCtaTitle || ''} onChange={e => handleCOChange('sidebarCtaTitle', e.target.value)} placeholder={`Get ${formData.name}`} />
                        </div>
                        <div>
                          <label style={labelStyle}>Sidebar Subtitle</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarCtaSub || ''} onChange={e => handleCOChange('sidebarCtaSub', e.target.value)} placeholder="Expert in Delhi – instant quote in 30 minutes" />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Primary Phone Number</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarPhone1 || '+919312690490'} onChange={e => handleCOChange('sidebarPhone1', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Secondary Phone Number</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarPhone2 || '+919810693777'} onChange={e => handleCOChange('sidebarPhone2', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>Button 1 (Quote) Text</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarBtn1Text || '📋 Get Free Quote'} onChange={e => handleCOChange('sidebarBtn1Text', e.target.value)} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>Button 1 Target URL</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarBtn1Link || '/quote'} onChange={e => handleCOChange('sidebarBtn1Link', e.target.value)} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>Button 2 (WhatsApp) Text</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarBtn2Text || '💬 WhatsApp Us'} onChange={e => handleCOChange('sidebarBtn2Text', e.target.value)} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>WhatsApp Number</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarBtn2WA || '919312690490'} onChange={e => handleCOChange('sidebarBtn2WA', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={sectionTitleStyle}>📋 Sidebar Checklist Card (What's Included)</h4>
                        <button type="button" onClick={addIncludesItem} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          + Add Included Item
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Checklist Card Header Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.includesTitle || ''} onChange={e => handleCOChange('includesTitle', e.target.value)} placeholder={`${formData.name} Includes`} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(formData.contentOverrides?.includesItems || []).map((item: string, idx: number) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: '#166534', fontWeight: 'bold' }}>✓</span>
                            <input style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} value={item} onChange={e => handleIncludesItemChange(idx, e.target.value)} />
                            <button type="button" onClick={() => removeIncludesItem(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', padding: '0 8px' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏛️ Sidebar Dynamic Sections Titles</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={labelStyle}>Other Cities Box Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarCitiesTitle || ''} onChange={e => handleCOChange('sidebarCitiesTitle', e.target.value)} placeholder="🗺️ Academic Translation – Other Cities" />
                        </div>
                        <div>
                          <label style={labelStyle}>Languages Box Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarLangsTitle || ''} onChange={e => handleCOChange('sidebarLangsTitle', e.target.value)} placeholder="🌍 Languages in Delhi" />
                        </div>
                        <div>
                          <label style={labelStyle}>Other Services Box Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.sidebarOtherSvcsTitle || ''} onChange={e => handleCOChange('sidebarOtherSvcsTitle', e.target.value)} placeholder="📋 Other Services – Delhi" />
                        </div>
                        <div>
                          <label style={labelStyle}>Certifications Box Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.certificationsTitle || ''} onChange={e => handleCOChange('certificationsTitle', e.target.value)} placeholder="Certifications & Accreditations" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 8: REVIEWS & FAQS ─── */}
                {activeTab === 'reviews_faqs' && (
                  <>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={sectionTitleStyle}>⭐ Client Reviews (Heading &amp; Testimonials)</h4>
                        <button type="button" onClick={addReview} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          + Add Review
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Reviews Section Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.reviewsTitle || ''} onChange={e => handleCOChange('reviewsTitle', e.target.value)} placeholder={`Client Reviews – ${formData.name} Delhi`} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(formData.contentOverrides?.reviewsList || []).map((rev: ReviewItem, idx: number) => (
                          <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', position: 'relative' }}>
                            <button type="button" onClick={() => removeReview(idx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--rd)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                              ✕ Remove
                            </button>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 50px', gap: '10px', marginBottom: '8px' }}>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Stars</label>
                                <input style={inputStyle} value={rev.stars} onChange={e => handleReviewChange(idx, 'stars', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Client Name</label>
                                <input style={inputStyle} value={rev.name} onChange={e => handleReviewChange(idx, 'name', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Role / Company / City</label>
                                <input style={inputStyle} value={rev.role} onChange={e => handleReviewChange(idx, 'role', e.target.value)} />
                              </div>
                              <div>
                                <label style={{ ...labelStyle, fontSize: '10px' }}>Avatar</label>
                                <input style={inputStyle} value={rev.avatar} onChange={e => handleReviewChange(idx, 'avatar', e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '10px' }}>Review Text</label>
                              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: '12px' }} value={rev.text} onChange={e => handleReviewChange(idx, 'text', e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={sectionTitleStyle}>❓ Frequently Asked Questions (FAQs)</h4>
                        <button type="button" onClick={addFaq} style={{ background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--bb)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          + Add FAQ
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>FAQs Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.faqsTitle || ''} onChange={e => handleCOChange('faqsTitle', e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {formData.faqs?.map((faq, idx) => (
                          <div key={idx} style={{ background: 'var(--g1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--br)', position: 'relative' }}>
                            <button type="button" onClick={() => removeFaq(idx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--rd)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                              ✕ Remove
                            </button>
                            <div style={{ marginBottom: '8px' }}>
                              <label style={{ ...labelStyle, fontSize: '11px' }}>Question {idx + 1}</label>
                              <input style={{ ...inputStyle, fontSize: '13px', width: '92%' }} value={faq.q} onChange={e => handleFaqChange(idx, 'q', e.target.value)} required />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '11px' }}>Answer</label>
                              <textarea rows={2} style={{ ...inputStyle, fontSize: '12px', resize: 'vertical' }} value={faq.a} onChange={e => handleFaqChange(idx, 'a', e.target.value)} required />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 9: CTA BANNER & SEO META ─── */}
                {activeTab === 'cta_seo' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📣 Bottom Call-To-Action (CTA) Banner</h4>
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
                      <h4 style={sectionTitleStyle}>🔍 SEO &amp; Meta Information (For Google &amp; Browser Tab)</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Meta Title</label>
                        <input style={inputStyle} value={formData.metaTitle || ''} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} placeholder="Academic Translation Services Delhi | Language Guru" />
                      </div>
                      <div>
                        <label style={labelStyle}>Meta Description</label>
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.metaDesc || ''} onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} placeholder="Professional ISO-certified translation services in Delhi..." />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* MODAL FOOTER (STICKY) */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--br)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--g1)', flexShrink: 0 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#fff', border: '1px solid var(--br)', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', color: 'var(--tm)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '10px 26px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {saving ? '⏳ Saving Service...' : '💾 Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '18px 20px',
  borderRadius: '10px',
  border: '1px solid var(--br)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--bd)',
  marginBottom: '14px'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#4b5563',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};
