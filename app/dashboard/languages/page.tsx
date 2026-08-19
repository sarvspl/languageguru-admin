'use client';

import React, { useEffect, useState, useRef } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';


// Extended icon options for the icon pickers
const ICON_OPTIONS = [
  '🏛️','🛂','🎓','🔏','⚖️','🏠','📝','🏢','🛡️','📜','🗂️','📋','🤝','💼','🏅','🗃️','📑','🔒','✍️','🖊️','📂','🎯','🧾','💡','🌐','🏦','💰','🔖','📌','🔑','🏥','🔬','⚙️','✈️','💍','💀','👮','✉️','🌍','📊','🚀','🏫','🛏️','💊','🩺','♿','🧬','📈','🔧','⚠️','📖','💻','🏭','📐','🔩','🌿'
];

interface Language {
  id?: string;
  name: string;
  key: string;
  flag: string;
  native?: string;
  cat?: string;
  speakers?: string;
  region?: string;
  difficulty?: string;
  script?: string;
  price?: number;
  isActive: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
  ogImage?: string;
  contentOverrides?: Record<string, any>;
}

type TabId = 'identity_hero' | 'intro_legal' | 'official_certified' | 'agency_docs_interp' | 'pricing_why' | 'sidebar_seo';

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('identity_hero');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [heroImgPreview, setHeroImgPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic paragraph & checklist counts
  const [introPCount, setIntroPCount] = useState(3);
  const [legalPCount, setLegalPCount] = useState(3);
  const [officialPCount, setOfficialPCount] = useState(3);
  const [certifiedPCount, setCertifiedPCount] = useState(3);
  const [certIncCount, setCertIncCount] = useState(6);
  const [agencyPCount, setAgencyPCount] = useState(2);
  const [interpPCount, setInterpPCount] = useState(3);

  // Icon picker state
  const [iconPickerCard, setIconPickerCard] = useState<string | null>(null);

  const getLanguageDefaults = (name: string, key: string, flag: string = '🌐', priceVal: number = 850) => {
    const LN = name || 'German';
    const FLAG = flag || '🌐';
    const pStd = Math.max(priceVal - 250, 499);
    const pExp = Math.round(priceVal * 1.5);
    return {
      // 1. Hero
      heroBgImage: '',
      breadcrumbLabel: `${FLAG} ${LN} Translation Services`,
      heroFlag: `${FLAG} ${LN} Translation Services · India`,
      heroTitle: `${LN} Translation<br>Services in <em>India</em>`,
      heroSub: `Professional, ISO-certified ${LN}↔English/Hindi translation services across India. Accepted by embassies, MEA, courts and government authorities. Serving India since 2005.`,
      phone1: '+91-9312690490',
      phone2: '+91-9810693777',
      heroTrustBadges: '<div class="htrust"><span class="htrust-icon">✅</span> Embassy Accepted</div>\n<div class="htrust"><span class="htrust-icon">⚡</span> 24-Hr Express</div>\n<div class="htrust"><span class="htrust-icon">🔏</span> Notarized & Apostilled</div>\n<div class="htrust"><span class="htrust-icon">🏆</span> ISO-9001:2015 and ISO 17100:2015</div>\n<div class="htrust"><span class="htrust-icon">⭐</span> 4.9/5 · 10,000+ Reviews</div>',

      // 2. Intro
      introTitle: `${LN} Translation Services in India`,
      introP1: `Language Guru is a leading certified ${LN} translation agency, offering professional ${LN}↔English/Hindi translation services since 2005. ISO-9001:2015 and ISO 17100:2015 certified, MSME registered, government-authorized — translations accepted by all embassies, MEA and courts.`,
      introP2: `Our ${LN} translators are native speakers and domain experts across legal, medical, technical, academic and immigration fields. All translations on official letterhead with notarization, Certificate of Accuracy and ISO stamp — embassy-ready on first submission.`,
      introP3: `From birth certificates to large corporate translation projects, we deliver accurate ${LN} translations on time. 24-hour express delivery available across India. Office submission or email / WhatsApp in Delhi NCR.`,

      // 3. Legal
      legalTitle: `Legal ${LN} Translation Services in India`,
      legalP1: `Language Guru is one of India's most trusted providers of legal ${LN} translation services. Our legal ${LN} translators are qualified professionals with deep expertise in Indian and international law, court procedures, contract law, immigration regulations and corporate compliance.`,
      legalP2: `We provide court-certified and embassy-accepted legal ${LN} translations for all types of legal documents – from court orders and judgments to contracts, affidavits, power of attorney, partnership deeds, MOA/AOA, and property papers.`,
      legalP3: `For legal professionals, law firms, corporate legal departments and individuals needing court-ready ${LN} translation across India, Language Guru delivers with precision, confidentiality and legal accuracy.`,
      legalCard1Icon: '⚖️', legalCard1Title: 'Court Documents', legalCard1Desc: 'Orders, judgments, decrees, summons',
      legalCard2Icon: '🔏', legalCard2Title: 'Contracts & Agreements', legalCard2Desc: 'Business contracts, MOU, partnership deed',
      legalCard3Icon: '🏠', legalCard3Title: 'Property Documents', legalCard3Desc: 'Sale deed, gift deed, mortgage docs',
      legalCard4Icon: '📝', legalCard4Title: 'Affidavits & POA', legalCard4Desc: 'Sworn statements, power of attorney',
      legalCard5Icon: '🏢', legalCard5Title: 'Corporate Legal', legalCard5Desc: 'MOA/AOA, board resolutions, filings',
      legalCard6Icon: '🛡️', legalCard6Title: 'NDA & IP Documents', legalCard6Desc: 'Patents, trademarks, confidentiality agreements',
      legalAcceptedText: 'Delhi High Court · Supreme Court · All District Courts · MEA New Delhi · German Embassy · French Embassy · US Embassy · 60+ Embassies in New Delhi',

      // 4. Official & Pillars
      officialTitle: `Official ${LN} Translation Services in India`,
      officialP1: `Language Guru provides official ${LN} translation services accepted by all government bodies, regulatory authorities, embassies and public institutions in India and abroad.`,
      officialP2: `Official ${LN} translation is required for visa and immigration applications, MEA apostille, embassy attestation, court submissions, university admissions abroad, and government tenders.`,
      officialP3: `We offer official ${LN} translations with turnaround as fast as 24 hours, with easy document submission via email/WhatsApp across India and secure courier delivery anywhere in India.`,
      officialPillar1Icon: '🏛️', officialPillar1Title: 'Government & Ministry', officialPillar1Desc: 'Ministry submissions, government tenders, PSU documents, official records translation for all central and state government bodies',
      officialPillar2Icon: '🛂', officialPillar2Title: 'Embassy & Consulate', officialPillar2Desc: 'All 60+ embassies in New Delhi, consular submissions, visa applications, PR and work permit documentation',
      officialPillar3Icon: '🎓', officialPillar3Title: 'University & Academic', officialPillar3Desc: 'Foreign university admissions, WES evaluation, DDV for Germany, ENIC/NARIC, NACES member organizations',
      officialPillar4Icon: '🔏', officialPillar4Title: 'MEA Apostille Ready', officialPillar4Desc: 'End-to-end apostille service – translation + notarization + MEA apostille sticker, valid in all 125 Hague Convention countries',

      // 5. Certified & Price & Checklist
      certifiedTitle: `Certified ${LN} Translation Services in India`,
      certifiedP1: `Language Guru delivers ISO-9001:2015 and ISO 17100:2015 certified ${LN} translation services across India. A certified ${LN} translation includes official agency letterhead, certified translator signature and stamp.`,
      certifiedP2: `Our certified ${LN} translations are prepared exclusively by native ${LN} speakers with minimum 5 years of domain-specific experience, with a mandatory 3-stage quality check.`,
      certifiedP3: `Whether you need a single certified ${LN} document or a bulk project of 100+ pages, Language Guru offers consistent quality with transparent pricing starting at ₹${priceVal}/page.`,
      priceStandardVal: `₹${pStd}`, priceStandardUnit: 'per page', priceStandardLabel: 'Standard', priceStandardTime: '5–7 working days',
      priceCertifiedVal: `₹${priceVal}`, priceCertifiedUnit: 'per page', priceCertifiedLabel: 'Certified', priceCertifiedTime: '3–5 working days',
      priceExpressVal: `₹${pExp}`, priceExpressUnit: 'per page', priceExpressLabel: 'Express', priceExpressTime: '24 hours',
      certifiedIncludesTitle: `📋 Every Certified ${LN} Translation Includes:`,
      certInc1: 'Translation on official letterhead',
      certInc2: 'Certified Agency Sign & Stamp',
      certInc3: 'Sworn affidavit & statement of accuracy',
      certInc4: 'ISO-9001:2015 and ISO 17100:2015 quality certification',
      certInc5: 'Embassy-ready format (all 60+ embassies)',
      certInc6: 'Soft copy PDF + hard copy on request',

      // 6. Agency & Documents We Translate
      agencyTitle: `${LN} Translation Agency in India`,
      agencyP1: `Language Guru is a leading ISO-9001:2015 and ISO 17100:2015 certified ${LN} translation agency in India. Our network of 200+ sworn ${LN} translators has delivered 20,000+ certified projects.`,
      agencyP2: `Our ${LN} translators hold recognized qualifications from top European and Indian universities. We serve individuals, law firms, hospitals, MNCs, and government departments across India.`,
      docsTitle: `${LN} Documents We Translate`,
      docsSubtitle: `Language Guru handles 100+ ${LN} document types for individuals, corporates, law firms, hospitals, embassies and government agencies across India. Browse by category:`,
      docCat1Icon: '🛂', docCat1Name: 'Immigration & Visa',
      docCat1Items: `Birth Certificate\nMarriage Certificate\nDeath Certificate\nPolice Clearance (PCC)\nDomicile Certificate\nSponsor Letter\nPassport Pages\nTravel History\nMedical Fitness Cert\nIncome / Employment Proof\nEducational Certificates\nBank Statements\nAffidavit of Support\nPower of Attorney\nVisa Application Forms\nFamily Registration Docs`,
      docCat2Icon: '⚖️', docCat2Name: 'Legal Documents',
      docCat2Items: `Court Orders / Judgments\nPower of Attorney\nPartnership Deed\nProperty / Sale Deed\nAffidavits\nLegal Notices\nMOA / AOA\nContracts / Agreements\nArbitration Awards\nDivorce Decree\nInvestigation Reports\nCompany Registration\nImport / Export Licenses\nEmployment Contracts\nNDA / Agreements\nWills & Trusts`,
      docCat3Icon: '🎓', docCat3Name: 'Academic',
      docCat3Items: `Degree Certificate\nMark Sheets / Transcripts\nMigration Certificate\nSchool Leaving Certificate\nDDV (Germany)\nMedium of Instruction\nAchievement Certificates\nResearch Papers\nScholarship Docs\nThesis / Dissertation\nWES / IQAS Evaluation\nProfessional Certifications`,
      docCat4Icon: '🏥', docCat4Name: 'Medical',
      docCat4Items: `Medical Reports\nHospital Discharge Summary\nPrescriptions / Lab Reports\nClinical Trial Docs\nPharma Documentation\nDisability Certificates\nHealth Insurance Docs\nMedical Device Manuals\nDrug Approvals\nResearch Papers\nAyurvedic / Herbal Docs\nMedical Certificates`,
      docCat5Icon: '💼', docCat5Name: 'Financial & Business',
      docCat5Items: `Bank Statements\nIncome Tax Returns\nBalance Sheets / P&L\nAnnual Reports\nBusiness Contracts\nSalary Certificates\nGST / VAT Documents\nImport / Export Docs\nInsurance Policies\nInvestment Documents\nRBI / SEBI Filings\nAudit Reports`,
      docCat6Icon: '🔬', docCat6Name: 'Technical',
      docCat6Items: `Machinery Manuals\nEngineering Specifications\nSafety Data Sheets (SDS)\nInstallation / User Guides\nPatents & Trademarks\nSoftware Documentation\nQuality Certifications\nTechnical Drawings\nMaintenance Guides\nEnvironmental Reports\nRisk Assessments\nCompliance Certificates`,

      // 7. Interpreters
      interpTitle: `Professional ${LN} Interpreters in India`,
      interpP1: `Language Guru provides certified ${LN} interpretation services across India. Our professional ${LN} interpreters are qualified, native-speaking language specialists with domain expertise in legal, medical, corporate and conference settings.`,
      interpP2: `Our ${LN} interpreters serve clients across all major Indian cities for court hearings, business negotiations, medical consultations, embassy appointments, trade fairs and international conferences.`,
      interpP3: `Whether you need a consecutive interpreter, a simultaneous interpreter for a large conference, or a telephone interpreter — Language Guru has certified ${LN} interpreters for same-day bookings.`,
      interpCard1Icon: '🎤', interpCard1Title: 'Conference Interpretation', interpCard1Desc: 'Simultaneous & consecutive for events, summits and seminars',
      interpCard2Icon: '⚖️', interpCard2Title: 'Legal Court Interpretation', interpCard2Desc: 'Court hearings, depositions and arbitration sessions',
      interpCard3Icon: '🏥', interpCard3Title: 'Medical Interpretation', interpCard3Desc: 'Hospital visits, clinical trials & patient consultations',
      interpCard4Icon: '💼', interpCard4Title: 'Business Interpretation', interpCard4Desc: 'Board meetings, negotiations & trade fairs',
      interpCard5Icon: '📞', interpCard5Title: 'Remote / Telephone', interpCard5Desc: `24x7 over-the-phone & video in ${LN}`,
      interpCard6Icon: '✈️', interpCard6Title: 'Escort & Liaison', interpCard6Desc: 'Personal interpreter for delegation & embassy visits',

      // 8. Service Types
      svcTypesTitle: `${LN} Translation Service Types`,
      svcType1Icon: '📄', svcType1Title: `Certified ${LN} Translation`, svcType1Desc: 'Official certified translation on letterhead with notarization and Certificate of Accuracy. Accepted by all embassies, MEA and courts.', svcType1Link: 'View Certified Translation →',
      svcType2Icon: '⚖️', svcType2Title: `Legal ${LN} Translation`, svcType2Desc: 'Court-certified translation of contracts, property papers and court orders by qualified legal translators.', svcType2Link: 'View Legal Translation →',
      svcType3Icon: '🔬', svcType3Title: `Technical ${LN} Translation`, svcType3Desc: 'Machinery, engineering and technical document translation for manufacturing, IT and regulatory compliance.', svcType3Link: 'View Technical Translation →',
      svcType4Icon: '🎓', svcType4Title: `Academic ${LN} Translation`, svcType4Desc: 'Degree certificates, transcripts translated for university admissions and scholarship applications worldwide.', svcType4Link: 'View Academic Translation →',
      svcType5Icon: '🛂', svcType5Title: `${LN} Immigration Translation`, svcType5Desc: 'Complete immigration document translation for visas, PR applications and work permits through embassies.', svcType5Link: 'View Immigration Translation →',
      svcType6Icon: '🔏', svcType6Title: 'Apostille & MEA Attestation', svcType6Desc: 'Official MEA apostille, state authentication and embassy attestation services for all documents.', svcType6Link: 'View Apostille Services →',

      // 9. Pricing & Why Choose
      pricingTableTitle: `${LN} Translation Pricing`,
      pricingTableSub: 'Transparent all-inclusive pricing with no hidden charges. All prices include translation on official letterhead.',
      pricingStandardRate: `₹${pStd}/page`,
      pricingCertifiedRate: `₹${priceVal}/page`,
      pricingExpressRate: `₹${pExp}/page`,
      pricingNotaryRate: '₹200/page',
      pricingApostilleRate: '₹1,400/page',
      pricingStandardDelivery: '5–7 days',
      pricingCertifiedDelivery: '3–5 days',
      pricingExpressDelivery: '24 hours',
      pricingNotaryDelivery: '2–3 days',
      pricingApostilleDelivery: '2 working days',
      pricingStandardIncludes: 'Simple translation · Company Sign & Seal · Letterhead · Soft Copy PDF',
      pricingCertifiedIncludes: 'Letterhead + Certificate of Accuracy',
      pricingExpressIncludes: 'Certified + Priority',
      pricingNotaryIncludes: 'Notary seal',
      pricingApostilleIncludes: 'Apostille sticker',

      sampleTitle: `${LN} Translation Certificate Samples`,
      whyChooseTitle: `Why Choose Language Guru for ${LN} Translation?`,
      whyChooseBullets: `Native ${LN} Translators | Native-speaking translators with domain expertise in legal, medical and technical fields.\nEmbassy-Accepted | Certified translations accepted by all embassies and government offices without re-certification.\nISO-9001:2015 and ISO 17100:2015 Certified | Quality management system certified by leading international bodies.\nMSME Registered Government-Authorized | Legally authorized for all government offices and courts in India.\nExpress 24-Hour Service | Urgent translation with same-day office submission in Delhi and express pan-India delivery.\nEnd-to-End Services | Translation + notarization + MEA apostille + embassy attestation under one roof.\nDocument Submission & Delivery | Office / email / WhatsApp submission in Delhi NCR; pan-India courier for all cities.\nTransparent Pricing | No hidden charges. Per-page pricing with bulk discounts for large projects.`,

      // 10. FAQs
      faqTitle: `❓ ${LN} Translation — Frequently Asked Questions`,
      faqSub: `Common questions about ${LN} translation and interpretation services in India.`,
      faqQ1: `How much does ${LN} translation cost in India?`,
      faqA1: `${LN} translation in India starts from ₹600/page (Economy, 5–7 days), ₹${priceVal}/page (Certified with ISO certification + Certificate of Accuracy), and ₹${pExp}/page (Express 24-hour). MEA Apostille is available at ₹1,400/page and Notarization at ₹200/page. Get an exact quote instantly using our online quote form.`,
      faqQ2: `How long does ${LN} to English translation take?`,
      faqA2: `Standard certified ${LN} translation takes 3–5 business days. Urgent documents can be delivered within 24 hours with our Express service. Large projects (100+ pages) are scheduled with a dedicated project manager and delivered in agreed milestones.`,
      faqQ3: `Is your ${LN} translation accepted by embassies and MEA?`,
      faqA3: `Yes. Language Guru is an ISO-9001:2015 and ISO 17100:2015 certified agency — our ${LN} translations carry a Certified Seal & Sign and Certificate of Accuracy, and are routinely accepted by embassies, MEA (Ministry of External Affairs), courts, universities and government authorities across India and abroad.`,
      faqQ4: `Are your translations accepted by all Govt Departments & Indian Courts?`,
      faqA4: `Yes — our certified translations carry the Agency Sign & Stamp and Certificate of Accuracy under ISO-9001:2015 and ISO 17100:2015 standards, and are routinely accepted by Indian government departments, courts, passport offices, RTOs, universities and banks.`,
      faqQ5: `Do you have certified ${LN} translators?`,
      faqA5: `Yes — our ${LN} team consists of certified, experienced linguists with domain expertise in legal, medical, technical, academic and business translation. Every document goes through a two-step process: translation by a native-level expert followed by proofreading and quality review.`,
      faqQ6: `Do you provide ${LN} interpreter services in India?`,
      faqA6: `Yes. We provide professional ${LN} interpreters for conferences, court/legal proceedings, medical consultations, business meetings, remote (video/phone) sessions, and escort assignments at ₹7,500/day (full-day 8 hrs; half-day 4 hrs at ₹4,500). Rates may vary with interpreter experience and project requirements.`,
      faqQ7: `Which ${LN} language pairs do you support?`,
      faqA7: `We translate ${LN} ↔ English, ${LN} ↔ Hindi, and ${LN} to/from 100+ other languages including French, German, Spanish, Chinese, Japanese, Arabic and all major Indian languages — all with certified quality.`,
      faqQ8: `How do I get a ${LN} translation quote?`,
      faqA8: `Three easy ways: (1) use the Instant Quote form on this page, (2) WhatsApp your documents to +91-9312690490, or (3) call us directly. You will receive a detailed quote within 30 minutes (Mon–Sat, 9am–7pm). Share scanned copies via email / WhatsApp — fully online process.`,

      // 11. Sidebar Certifications & SEO
      sbCertTitle: '🏆 Certifications',
      sbCertBadge1: '🏛️ MSME Reg.',
      sbCertBadge2: '📋 ISO 9001',
      sbCertBadge3: '🌐 ISO 17100',
      sbCertBadge4: '🏆 MEA Cert.',
      sbCertRatingText: '⭐ 4.9/5 · 10,000+ Reviews',
      sidebarCtaTitle: `📞 ${LN} Translation Help`,
      expertQuoteText: `Expert in ${LN} — instant quote in 30 minutes`,
      metaTitle: `${LN} Translation Services in India | Language Guru`,
      metaDesc: `Professional, ISO-certified ${LN} translation services in Delhi and across India. Accepted by embassies, courts, MEA, and government authorities. Express delivery available.`,
      metaKeywords: `${LN} translation, certified ${LN} translator, ${LN} interpreter India, embassy certified ${LN} translation`,
      ogImage: ''
    };
  };

  const [formData, setFormData] = useState<Language>({
    name: '', key: '', flag: '🌐', native: '', cat: 'European', speakers: '', region: '',
    difficulty: 'Medium', script: 'Latin', price: 850, isActive: true,
    metaTitle: '', metaDesc: '', metaKeywords: '', ogImage: '', contentOverrides: {}
  });
  
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/languages/all`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.json();
      setLanguages(data.data || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLanguages(); }, []);

  const countParagraphs = (co: Record<string, any>, prefix: string) => {
    let count = 0;
    for (let i = 1; i <= 10; i++) { if (co[`${prefix}P${i}`] !== undefined) count = i; }
    return Math.max(count, prefix === 'agency' ? 2 : 3);
  };

  const countChecklist = (co: Record<string, any>) => {
    let count = 0;
    for (let i = 1; i <= 30; i++) { if (co[`certInc${i}`] !== undefined) count = i; }
    return Math.max(count, 6);
  };

  const handleOpenAdd = () => {
    setEditingLang(null);
    const defaults = getLanguageDefaults('New Language', 'new-language', '🌐', 850);
    setFormData({ name: '', key: '', flag: '🌐', native: '', cat: 'European', speakers: '', region: '',
      difficulty: 'Medium', script: 'Latin', price: 850, isActive: true,
      metaTitle: defaults.metaTitle, metaDesc: defaults.metaDesc, metaKeywords: defaults.metaKeywords,
      ogImage: '', contentOverrides: defaults });
    setHeroImgPreview('');
    setIntroPCount(3); setLegalPCount(3); setOfficialPCount(3);
    setCertifiedPCount(3); setCertIncCount(6); setAgencyPCount(2); setInterpPCount(3);
    setActiveTab('identity_hero'); setShowModal(true);
  };

  const handleOpenEdit = (lang: Language) => {
    setEditingLang(lang);
    const defaults = getLanguageDefaults(lang.name, lang.key, lang.flag, lang.price || 850);
    const mergedCO = { ...defaults, ...(lang.contentOverrides || {}) };
    setIntroPCount(countParagraphs(mergedCO, 'intro'));
    setLegalPCount(countParagraphs(mergedCO, 'legal'));
    setOfficialPCount(countParagraphs(mergedCO, 'official'));
    setCertifiedPCount(countParagraphs(mergedCO, 'certified'));
    setCertIncCount(countChecklist(mergedCO));
    setAgencyPCount(countParagraphs(mergedCO, 'agency'));
    setInterpPCount(countParagraphs(mergedCO, 'interp'));
    const heroImg = mergedCO.heroBgImage || '';
    setHeroImgPreview(heroImg ? (heroImg.startsWith('http') ? heroImg : `${API_URL}${heroImg}`) : '');
    setFormData({
      id: lang.id, name: lang.name, key: lang.key, flag: lang.flag || '🌐',
      native: lang.native || '', cat: lang.cat || 'European', speakers: lang.speakers || '',
      region: lang.region || '', difficulty: lang.difficulty || 'Medium', script: lang.script || 'Latin',
      price: lang.price || 850, isActive: lang.isActive ?? true,
      metaTitle: lang.metaTitle || defaults.metaTitle, metaDesc: lang.metaDesc || defaults.metaDesc,
      metaKeywords: lang.metaKeywords || defaults.metaKeywords, ogImage: lang.ogImage || '',
      contentOverrides: mergedCO
    });
    setActiveTab('identity_hero'); setShowModal(true);
  };

  const handleCOChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, contentOverrides: { ...(prev.contentOverrides || {}), [key]: value } }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploadingImage(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/upload`, { method: 'POST', credentials: 'include', body: uploadData });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        if (targetField === 'ogImage') {
          setFormData(prev => ({ ...prev, ogImage: data.url }));
        } else {
          handleCOChange(targetField, data.url);
          if (targetField === 'heroBgImage') {
            setHeroImgPreview(data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`);
          }
        }
      } else { alert(data.message || 'Image upload failed'); }
    } catch { alert('Error uploading image to server'); }
    finally { setUploadingImage(false); e.target.value = ''; }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccessMsg('');
    try {
      const url = editingLang?.id ? `${API_URL}/api/v1/languages/${editingLang.id}` : `${API_URL}/api/v1/languages`;
      const method = editingLang?.id ? 'PUT' : 'POST';
      const payload = {
        ...formData, price: Number(formData.price) || 850,
        metaTitle: formData.metaTitle || formData.contentOverrides?.metaTitle,
        metaDesc: formData.metaDesc || formData.contentOverrides?.metaDesc,
        metaKeywords: formData.metaKeywords || formData.contentOverrides?.metaKeywords,
        ogImage: formData.ogImage || formData.contentOverrides?.ogImage,
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Language "${formData.name}" saved successfully! Live content updated.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setShowModal(false); fetchLanguages();
      } else { alert(data.message || 'Error saving language'); }
    } catch (err: any) { alert(err.message || 'Network error'); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (lang: Language) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/languages/${lang.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...lang, isActive: !lang.isActive })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed');
      fetchLanguages();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`PERMANENTLY delete "${name}"? This cannot be undone!`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/languages/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed');
      fetchLanguages();
    } catch (err: any) { alert(err.message); }
  };

  // Paragraph Add/Delete
  const addParagraph = (prefix: string, setter: React.Dispatch<React.SetStateAction<number>>, currentCount: number) => {
    setter(currentCount + 1);
    handleCOChange(`${prefix}P${currentCount + 1}`, '');
  };

  const removeParagraph = (prefix: string, setter: React.Dispatch<React.SetStateAction<number>>, currentCount: number, n: number) => {
    const newCO = { ...(formData.contentOverrides || {}) };
    for (let j = n; j < currentCount; j++) { newCO[`${prefix}P${j}`] = newCO[`${prefix}P${j + 1}`] || ''; }
    delete newCO[`${prefix}P${currentCount}`];
    setFormData(prev => ({ ...prev, contentOverrides: newCO }));
    setter(currentCount - 1);
  };

  // Certified Checklist Add/Delete
  const addChecklistItem = () => {
    const newCount = certIncCount + 1;
    setCertIncCount(newCount);
    handleCOChange(`certInc${newCount}`, '');
  };

  const removeChecklistItem = (n: number) => {
    if (certIncCount <= 1) return;
    const newCO = { ...(formData.contentOverrides || {}) };
    for (let j = n; j < certIncCount; j++) {
      newCO[`certInc${j}`] = newCO[`certInc${j + 1}`] || '';
    }
    delete newCO[`certInc${certIncCount}`];
    setFormData(prev => ({ ...prev, contentOverrides: newCO }));
    setCertIncCount(certIncCount - 1);
  };

  const renderParagraphs = (prefix: string, count: number, setter: React.Dispatch<React.SetStateAction<number>>, label: string) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={labelStyle}>{label} Paragraphs ({count} total)</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" onClick={() => count > 1 && removeParagraph(prefix, setter, count, count)} disabled={count <= 1}
            style={{ padding: '2px 10px', fontSize: '18px', fontWeight: '800', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', cursor: count <= 1 ? 'not-allowed' : 'pointer', opacity: count <= 1 ? 0.4 : 1, lineHeight: 1.2 }}>−</button>
          <button type="button" onClick={() => addParagraph(prefix, setter, count)}
            style={{ padding: '2px 10px', fontSize: '18px', fontWeight: '800', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer', lineHeight: 1.2 }}>+</button>
        </div>
      </div>
      {Array.from({ length: count }, (_, i) => i + 1).map(n => (
        <div key={n} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ fontSize: '11px', color: 'var(--mu)', fontWeight: '700', minWidth: '18px' }}>P{n}</span>
            {n > 1 && (
              <button type="button" onClick={() => removeParagraph(prefix, setter, count, n)}
                style={{ fontSize: '11px', padding: '1px 7px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer' }}>✕ delete</button>
            )}
          </div>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
            value={formData.contentOverrides?.[`${prefix}P${n}`] || ''}
            onChange={e => handleCOChange(`${prefix}P${n}`, e.target.value)}
            placeholder={`Paragraph ${n}...`}
          />
        </div>
      ))}
    </div>
  );

  const TABS = [
    { id: 'identity_hero' as TabId, icon: '🏷️', label: '1. Identity & Hero' },
    { id: 'intro_legal' as TabId, icon: '📖', label: '2. Intro & Legal' },
    { id: 'official_certified' as TabId, icon: '🏛️', label: '3. Official & Certified' },
    { id: 'agency_docs_interp' as TabId, icon: '📑', label: '4. Agency, Docs & Interp' },
    { id: 'pricing_why' as TabId, icon: '💰', label: '5. Pricing & Why Choose' },
    { id: 'sidebar_seo' as TabId, icon: '📞', label: '6. Sidebar & SEO' }
  ];

  const filteredLanguages = languages.filter(l =>
    (l.name.toLowerCase().includes(search.toLowerCase()) || l.key.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === 'All' || l.cat === filterCat)
  );

  return (
    <>
      <TopNav title="Language CMS Manager" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)', margin: 0 }}>All Languages ({languages.length})</h2>
              <p style={{ fontSize: '13px', color: 'var(--mu)', margin: '4px 0 0 0' }}>Every language page has 14 fully editable pre-filled sections.</p>
            </div>
            {successMsg && (
              <span style={{ fontSize: '13px', color: '#166534', background: '#dcfce7', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold' }}>✓ {successMsg}</span>
            )}
            <button className="btn-b" onClick={handleOpenAdd}>+ Add Language</button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="🔍 Search language name or slug..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: '280px' }} />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: '180px' }}>
              <option value="All">All Categories</option>
              <option value="European">European</option>
              <option value="Asian">Asian</option>
              <option value="Middle East">Middle East</option>
              <option value="African">African</option>
              <option value="Indian">Indian</option>
            </select>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading languages from database...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Flag</th>
                    <th>Language Name</th>
                    <th>Slug URL</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLanguages.map(lang => (
                    <tr key={lang.id}>
                      <td style={{ fontSize: '22px', textAlign: 'center' }}>{lang.flag}</td>
                      <td style={{ fontWeight: '700', color: 'var(--td)' }}>
                        {lang.name}
                        {lang.native && <span style={{ fontSize: '11px', color: 'var(--mu)', marginLeft: '6px', fontWeight: '400' }}>({lang.native})</span>}
                      </td>
                      <td style={{ color: 'var(--bb)', fontFamily: 'monospace', fontSize: '13px' }}>/languages/{lang.key}</td>
                      <td><span style={{ fontSize: '11px', background: 'var(--bp)', color: 'var(--bd)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>{lang.cat || 'General'}</span></td>
                      <td style={{ fontWeight: '700', color: 'var(--bd)' }}>₹{lang.price || 850}/pg</td>
                      <td>
                        <span className="price-badge" style={{ background: lang.isActive ? '#dcfce7' : '#fee2e2', color: lang.isActive ? '#166534' : '#991b1b' }}>
                          {lang.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button onClick={() => handleOpenEdit(lang)} style={{ background: 'none', border: 'none', color: 'var(--bb)', cursor: 'pointer', fontWeight: '700', marginRight: '12px', fontSize: '13px' }}>✏️ Edit Content</button>
                        <button onClick={() => handleToggleActive(lang)} style={{ background: 'none', border: 'none', color: lang.isActive ? '#d97706' : '#16a34a', cursor: 'pointer', fontWeight: '700', marginRight: '12px', fontSize: '13px' }}>
                          {lang.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(lang.id!, lang.name)} style={{ background: 'none', border: 'none', color: 'var(--rd)', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ MODAL ══════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '1050px', maxWidth: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shh)', border: '1px solid var(--br)', overflow: 'hidden' }}>

            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g1)', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', fontWeight: '700', color: 'var(--bd)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{formData.flag || '🌐'}</span> {editingLang ? `Edit Language: ${formData.name}` : 'Add New Language'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--mu)', margin: '2px 0 0 0' }}>
                  Live URL: <code>/languages/{formData.key || 'language-slug'}</code> · All fields are 100% editable and live-synced.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--mu)', cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--br)', padding: '0 16px', background: '#fff', overflowX: 'auto', flexShrink: 0, gap: '4px' }}>
              {TABS.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  style={{ background: 'none', border: 'none', padding: '12px 14px', fontWeight: '700', fontSize: '13px',
                    borderBottom: activeTab === tab.id ? '3px solid var(--bd)' : '3px solid transparent',
                    color: activeTab === tab.id ? 'var(--bd)' : 'var(--mu)', cursor: 'pointer', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* ─── TAB 1: IDENTITY & HERO ─── */}
                {activeTab === 'identity_hero' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏷️ Basic Language Information</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={labelStyle}>Language Name</label><input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                        <div><label style={labelStyle}>Slug Key (URL: /languages/[slug])</label><input style={inputStyle} value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })} required /></div>
                        <div><label style={labelStyle}>Flag Emoji</label><input style={inputStyle} value={formData.flag} onChange={e => setFormData({ ...formData, flag: e.target.value })} required /></div>
                        <div><label style={labelStyle}>Native Name (e.g. Deutsch)</label><input style={inputStyle} value={formData.native || ''} onChange={e => setFormData({ ...formData, native: e.target.value })} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Category</label>
                          <select value={formData.cat || 'European'} onChange={e => setFormData({ ...formData, cat: e.target.value })} style={inputStyle} required>
                            <option value="European">European</option><option value="Asian">Asian</option><option value="Middle East">Middle East</option><option value="African">African</option><option value="Indian">Indian</option>
                          </select>
                        </div>
                        <div><label style={labelStyle}>Region / Origin</label><input style={inputStyle} value={formData.region || ''} onChange={e => setFormData({ ...formData, region: e.target.value })} placeholder="e.g. Germany" /></div>
                        <div><label style={labelStyle}>Difficulty</label><input style={inputStyle} value={formData.difficulty || ''} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} placeholder="Medium / High" /></div>
                        <div><label style={labelStyle}>Base Price (₹ / page)</label><input type="number" style={inputStyle} value={formData.price || 850} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                        <div><label style={labelStyle}>Speakers Count</label><input style={inputStyle} value={formData.speakers || ''} onChange={e => setFormData({ ...formData, speakers: e.target.value })} placeholder="e.g. 135M+" /></div>
                        <div><label style={labelStyle}>Script</label><input style={inputStyle} value={formData.script || ''} onChange={e => setFormData({ ...formData, script: e.target.value })} placeholder="e.g. Latin / Arabic" /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px' }}>
                          <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                          <label htmlFor="isActive" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', cursor: 'pointer' }}>Published (Active on live website)</label>
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🖼️ Hero Banner & Background Image</h4>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Hero Background Image (Upload or paste URL)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                          <input style={{ ...inputStyle, flex: 1 }}
                            placeholder="e.g. /uploads/hero-arabic.jpg or https://..."
                            value={formData.contentOverrides?.heroBgImage || ''}
                            onChange={e => {
                              handleCOChange('heroBgImage', e.target.value);
                              const v = e.target.value;
                              setHeroImgPreview(v ? (v.startsWith('http') ? v : `${API_URL}${v}`) : '');
                            }}
                          />
                          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'heroBgImage')} />
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                            style={{ padding: '8px 18px', background: 'var(--bd)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {uploadingImage ? '⏳ Uploading...' : '📁 Upload Image'}
                          </button>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--mu)', display: 'block', marginTop: '4px' }}>
                          💡 Accepted: JPG, PNG, WebP. This image shows as the hero section background.
                        </span>

                        {heroImgPreview ? (
                          <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--br)' }}>
                            <div style={{ height: '140px', background: `linear-gradient(135deg, rgba(15,23,42,0.60), rgba(30,58,107,0.55)), url(${heroImgPreview}) center/cover no-repeat`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ textAlign: 'center', color: '#fff' }}>
                                <div style={{ fontSize: '20px', fontWeight: '800', textShadow: '0 2px 8px rgba(0,0,0,.7)' }}>{formData.name || 'Language'} Translation</div>
                                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>Services in India — Live Preview</div>
                              </div>
                            </div>
                            <div style={{ background: '#f0fdf4', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>✅ Hero background preview — overlay opacity matches live site</span>
                              <button type="button" onClick={() => { handleCOChange('heroBgImage', ''); setHeroImgPreview(''); }}
                                style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}>✕ Remove image</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '8px', padding: '12px', background: 'var(--g1)', borderRadius: '6px', border: '1px dashed var(--br)', textAlign: 'center', fontSize: '12px', color: 'var(--mu)' }}>
                            📷 No image — default navy-blue gradient will be shown as the hero background
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={labelStyle}>Breadcrumb Label</label><input style={inputStyle} value={formData.contentOverrides?.breadcrumbLabel || ''} onChange={e => handleCOChange('breadcrumbLabel', e.target.value)} /></div>
                        <div><label style={labelStyle}>Hero Top Flag Tagline</label><input style={inputStyle} value={formData.contentOverrides?.heroFlag || ''} onChange={e => handleCOChange('heroFlag', e.target.value)} /></div>
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Main Heading (HTML allowed, e.g. &lt;em&gt;India&lt;/em&gt;)</label>
                        <input style={inputStyle} value={formData.contentOverrides?.heroTitle || ''} onChange={e => handleCOChange('heroTitle', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Hero Subtitle Paragraph</label>
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.heroSub || ''} onChange={e => handleCOChange('heroSub', e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={labelStyle}>Contact Phone 1 <span style={{ fontWeight: '400', color: 'var(--mu)' }}>(shown in "📞 Call Now" button)</span></label>
                          <input style={inputStyle} value={formData.contentOverrides?.phone1 || ''} onChange={e => handleCOChange('phone1', e.target.value)} placeholder="+91-9312690490" />
                        </div>
                        <div>
                          <label style={labelStyle}>Contact Phone 2</label>
                          <input style={inputStyle} value={formData.contentOverrides?.phone2 || ''} onChange={e => handleCOChange('phone2', e.target.value)} placeholder="+91-9810693777" />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Hero Trust Badges HTML</label>
                        <textarea rows={4} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '11.5px' }} value={formData.contentOverrides?.heroTrustBadges || ''} onChange={e => handleCOChange('heroTrustBadges', e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 2: INTRO & LEGAL ─── */}
                {activeTab === 'intro_legal' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📖 Overview / Introduction Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Intro Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.introTitle || ''} onChange={e => handleCOChange('introTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('intro', introPCount, setIntroPCount, 'Intro')}
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>⚖️ Legal Translation Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Legal Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.legalTitle || ''} onChange={e => handleCOChange('legalTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('legal', legalPCount, setLegalPCount, 'Legal')}

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>
                        6 Legal Feature Cards <span style={{ fontWeight: '400', fontSize: '11px', color: 'var(--mu)' }}>— click the emoji to change icon</span>
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[1,2,3,4,5,6].map(n => (
                          <div key={n} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <button type="button"
                                onClick={() => setIconPickerCard(iconPickerCard === `legal${n}` ? null : `legal${n}`)}
                                title="Click to change icon"
                                style={{ fontSize: '22px', background: 'var(--g1)', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                {formData.contentOverrides?.[`legalCard${n}Icon`] || ['⚖️','🔏','🏠','📝','🏢','🛡️'][n-1]}
                              </button>
                              <label style={{ ...labelStyle, margin: 0 }}>Card {n}</label>
                            </div>
                            {iconPickerCard === `legal${n}` && (
                              <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {ICON_OPTIONS.map(ic => (
                                  <button key={ic} type="button"
                                    onClick={() => { handleCOChange(`legalCard${n}Icon`, ic); setIconPickerCard(null); }}
                                    style={{ fontSize: '18px', background: formData.contentOverrides?.[`legalCard${n}Icon`] === ic ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                    {ic}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[`legalCard${n}Title`] || ''} onChange={e => handleCOChange(`legalCard${n}Title`, e.target.value)} placeholder="Card title" />
                            <input style={inputStyle} value={formData.contentOverrides?.[`legalCard${n}Desc`] || ''} onChange={e => handleCOChange(`legalCard${n}Desc`, e.target.value)} placeholder="Short description" />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label style={labelStyle}>⚖️ Accepted Courts & Embassies Banner Text <span style={{ fontWeight: '400', color: 'var(--mu)' }}>(shown below legal cards)</span></label>
                        <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                          value={formData.contentOverrides?.legalAcceptedText || ''}
                          onChange={e => handleCOChange('legalAcceptedText', e.target.value)}
                          placeholder="Delhi High Court · Supreme Court · All District Courts · MEA New Delhi · German Embassy..." />
                        <span style={{ fontSize: '11px', color: 'var(--mu)', display: 'block', marginTop: '3px' }}>
                          💡 Separate entries with · (middle dot). This text appears in the banner below legal cards.
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 3: OFFICIAL & CERTIFIED ─── */}
                {activeTab === 'official_certified' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏛️ Official Translation Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Official Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.officialTitle || ''} onChange={e => handleCOChange('officialTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('official', officialPCount, setOfficialPCount, 'Official')}

                      {/* 4 OFFICIAL PILLARS WITH ICON PICKER */}
                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>
                        4 Official Pillars <span style={{ fontWeight: '400', fontSize: '11px', color: 'var(--mu)' }}>— click the emoji button to select/change icon</span>
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 1, label: 'Pillar 1: Government & Ministry', iKey: 'officialPillar1Icon', tKey: 'officialPillar1Title', dKey: 'officialPillar1Desc', defIcon: '🏛️' },
                          { id: 2, label: 'Pillar 2: Embassy & Consulate', iKey: 'officialPillar2Icon', tKey: 'officialPillar2Title', dKey: 'officialPillar2Desc', defIcon: '🛂' },
                          { id: 3, label: 'Pillar 3: University & Academic', iKey: 'officialPillar3Icon', tKey: 'officialPillar3Title', dKey: 'officialPillar3Desc', defIcon: '🎓' },
                          { id: 4, label: 'Pillar 4: MEA Apostille Ready', iKey: 'officialPillar4Icon', tKey: 'officialPillar4Title', dKey: 'officialPillar4Desc', defIcon: '🔏' },
                        ].map(p => (
                          <div key={p.id} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <button type="button"
                                onClick={() => setIconPickerCard(iconPickerCard === `pillar${p.id}` ? null : `pillar${p.id}`)}
                                title="Click to select icon"
                                style={{ fontSize: '22px', background: '#fff', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                {formData.contentOverrides?.[p.iKey] || p.defIcon}
                              </button>
                              <label style={{ ...labelStyle, margin: 0 }}>{p.label}</label>
                            </div>
                            {iconPickerCard === `pillar${p.id}` && (
                              <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {ICON_OPTIONS.map(ic => (
                                  <button key={ic} type="button"
                                    onClick={() => { handleCOChange(p.iKey, ic); setIconPickerCard(null); }}
                                    style={{ fontSize: '18px', background: (formData.contentOverrides?.[p.iKey] || p.defIcon) === ic ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                    {ic}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[p.tKey] || ''} onChange={e => handleCOChange(p.tKey, e.target.value)} placeholder="Title" />
                            <textarea rows={2} style={inputStyle} value={formData.contentOverrides?.[p.dKey] || ''} onChange={e => handleCOChange(p.dKey, e.target.value)} placeholder="Description" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏆 Certified Translation Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Certified Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.certifiedTitle || ''} onChange={e => handleCOChange('certifiedTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('certified', certifiedPCount, setCertifiedPCount, 'Certified')}

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>3 Price Cards</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[
                          { label: 'Standard', vKey: 'priceStandardVal', lKey: 'priceStandardLabel', tKey: 'priceStandardTime' },
                          { label: 'Certified', vKey: 'priceCertifiedVal', lKey: 'priceCertifiedLabel', tKey: 'priceCertifiedTime' },
                          { label: 'Express', vKey: 'priceExpressVal', lKey: 'priceExpressLabel', tKey: 'priceExpressTime' },
                        ].map(pc => (
                          <div key={pc.vKey} style={subCardStyle}>
                            <label style={labelStyle}>{pc.label} Card</label>
                            <input style={{ ...inputStyle, marginBottom: '4px' }} value={formData.contentOverrides?.[pc.vKey] || ''} onChange={e => handleCOChange(pc.vKey, e.target.value)} placeholder="Price" />
                            <input style={{ ...inputStyle, marginBottom: '4px' }} value={formData.contentOverrides?.[pc.lKey] || ''} onChange={e => handleCOChange(pc.lKey, e.target.value)} placeholder="Label" />
                            <input style={inputStyle} value={formData.contentOverrides?.[pc.tKey] || ''} onChange={e => handleCOChange(pc.tKey, e.target.value)} placeholder="Time" />
                          </div>
                        ))}
                      </div>

                      {/* DYNAMIC CERTIFIED CHECKLIST SECTION */}
                      <div style={{ background: 'var(--g1)', border: '1.5px solid var(--br)', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <h5 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--bd)', margin: 0 }}>
                              📋 Certified Includes Checklist ({certIncCount} items)
                            </h5>
                            <span style={{ fontSize: '11px', color: 'var(--mu)' }}>Add, edit, or delete any checklist item shown with green checkmarks.</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button type="button" onClick={() => removeChecklistItem(certIncCount)} disabled={certIncCount <= 1}
                              style={{ padding: '3px 10px', fontSize: '16px', fontWeight: '800', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', cursor: certIncCount <= 1 ? 'not-allowed' : 'pointer', opacity: certIncCount <= 1 ? 0.4 : 1 }}>−</button>
                            <button type="button" onClick={addChecklistItem}
                              style={{ padding: '3px 10px', fontSize: '16px', fontWeight: '800', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelStyle}>Checklist Header Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.certifiedIncludesTitle || ''} onChange={e => handleCOChange('certifiedIncludesTitle', e.target.value)} placeholder="📋 Every Certified ... Includes:" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          {Array.from({ length: certIncCount }, (_, i) => i + 1).map(n => (
                            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--br)' }}>
                              <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '13px' }}>✓</span>
                              <input style={{ ...inputStyle, border: 'none', padding: '4px 6px', fontSize: '12px' }}
                                value={formData.contentOverrides?.[`certInc${n}`] || ''}
                                onChange={e => handleCOChange(`certInc${n}`, e.target.value)}
                                placeholder={`Checklist item ${n}...`}
                              />
                              {certIncCount > 1 && (
                                <button type="button" onClick={() => removeChecklistItem(n)}
                                  title="Delete item"
                                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', padding: '2px 5px' }}>
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button type="button" onClick={addChecklistItem}
                          style={{ padding: '6px 14px', background: '#fff', border: '1px dashed var(--bb)', color: 'var(--bb)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          + Add Checklist Item
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 4: AGENCY, DOCS & INTERP ─── */}
                {activeTab === 'agency_docs_interp' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏢 Translation Agency in India Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.agencyTitle || ''} onChange={e => handleCOChange('agencyTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('agency', agencyPCount, setAgencyPCount, 'Agency')}
                    </div>

                    {/* FULL DYNAMIC "DOCUMENTS WE TRANSLATE" SECTION */}
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📑 Documents We Translate — Complete Details Editor</h4>
                      <p style={{ fontSize: '12px', color: 'var(--mu)', margin: '0 0 14px 0' }}>
                        Edit the section header, choose icons for each category, change category names, and edit the exact list of document types.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                          <label style={labelStyle}>Documents Section Title</label>
                          <input style={inputStyle} value={formData.contentOverrides?.docsTitle || ''} onChange={e => handleCOChange('docsTitle', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Documents Section Subtitle</label>
                          <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.docsSubtitle || ''} onChange={e => handleCOChange('docsSubtitle', e.target.value)} />
                        </div>
                      </div>

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '14px 0 10px 0' }}>
                        6 Document Categories (Click icon to change emoji · Edit title · 1 document per line)
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        {[
                          { id: 1, label: 'Category 1', iKey: 'docCat1Icon', nKey: 'docCat1Name', itKey: 'docCat1Items', defIcon: '🛂', defName: 'Immigration & Visa' },
                          { id: 2, label: 'Category 2', iKey: 'docCat2Icon', nKey: 'docCat2Name', itKey: 'docCat2Items', defIcon: '⚖️', defName: 'Legal Documents' },
                          { id: 3, label: 'Category 3', iKey: 'docCat3Icon', nKey: 'docCat3Name', itKey: 'docCat3Items', defIcon: '🎓', defName: 'Academic' },
                          { id: 4, label: 'Category 4', iKey: 'docCat4Icon', nKey: 'docCat4Name', itKey: 'docCat4Items', defIcon: '🏥', defName: 'Medical' },
                          { id: 5, label: 'Category 5', iKey: 'docCat5Icon', nKey: 'docCat5Name', itKey: 'docCat5Items', defIcon: '💼', defName: 'Financial & Business' },
                          { id: 6, label: 'Category 6', iKey: 'docCat6Icon', nKey: 'docCat6Name', itKey: 'docCat6Items', defIcon: '🔬', defName: 'Technical' },
                        ].map(c => {
                          const currentItems = formData.contentOverrides?.[c.itKey] || '';
                          const lineCount = currentItems.split('\n').filter((x: string) => x.trim().length > 0).length;
                          return (
                            <div key={c.id} style={subCardStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <button type="button"
                                  onClick={() => setIconPickerCard(iconPickerCard === `docCat${c.id}` ? null : `docCat${c.id}`)}
                                  title="Click to select category icon"
                                  style={{ fontSize: '22px', background: '#fff', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                  {formData.contentOverrides?.[c.iKey] || c.defIcon}
                                </button>
                                <div style={{ flex: 1 }}>
                                  <label style={{ ...labelStyle, marginBottom: '2px' }}>{c.label} Name</label>
                                  <input style={inputStyle}
                                    value={formData.contentOverrides?.[c.nKey] || c.defName}
                                    onChange={e => handleCOChange(c.nKey, e.target.value)}
                                    placeholder="Category Name"
                                  />
                                </div>
                              </div>

                              {iconPickerCard === `docCat${c.id}` && (
                                <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                  {ICON_OPTIONS.map(ic => (
                                    <button key={ic} type="button"
                                      onClick={() => { handleCOChange(c.iKey, ic); setIconPickerCard(null); }}
                                      style={{ fontSize: '18px', background: (formData.contentOverrides?.[c.iKey] || c.defIcon) === ic ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                      {ic}
                                    </button>
                                  ))}
                                </div>
                              )}

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <label style={{ ...labelStyle, margin: 0 }}>Document Types List (1 per line):</label>
                                  <span style={{ fontSize: '11px', color: 'var(--bb)', fontWeight: '700' }}>({lineCount} items)</span>
                                </div>
                                <textarea rows={6} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '11.5px', resize: 'vertical' }}
                                  value={formData.contentOverrides?.[c.itKey] || ''}
                                  onChange={e => handleCOChange(c.itKey, e.target.value)}
                                  placeholder="Birth Certificate\nMarriage Certificate\nDeath Certificate..."
                                />
                                <span style={{ fontSize: '10.5px', color: 'var(--mu)', display: 'block', marginTop: '2px' }}>
                                  💡 Each line appears in the category tab & top 7 items show in the overview grid.
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🎙️ Professional Interpreter Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Interpreter Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.interpTitle || ''} onChange={e => handleCOChange('interpTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('interp', interpPCount, setInterpPCount, 'Interpreter')}

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>6 Interpretation Type Cards</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { label: 'Card 1: Conference', iKey: 'interpCard1Icon', tKey: 'interpCard1Title', dKey: 'interpCard1Desc', defIco: '🎤' },
                          { label: 'Card 2: Legal Court', iKey: 'interpCard2Icon', tKey: 'interpCard2Title', dKey: 'interpCard2Desc', defIco: '⚖️' },
                          { label: 'Card 3: Medical', iKey: 'interpCard3Icon', tKey: 'interpCard3Title', dKey: 'interpCard3Desc', defIco: '🏥' },
                          { label: 'Card 4: Business', iKey: 'interpCard4Icon', tKey: 'interpCard4Title', dKey: 'interpCard4Desc', defIco: '💼' },
                          { label: 'Card 5: Remote / Telephone', iKey: 'interpCard5Icon', tKey: 'interpCard5Title', dKey: 'interpCard5Desc', defIco: '📞' },
                          { label: 'Card 6: Escort & Liaison', iKey: 'interpCard6Icon', tKey: 'interpCard6Title', dKey: 'interpCard6Desc', defIco: '✈️' },
                        ].map(ic => (
                          <div key={ic.tKey} style={subCardStyle}>
                            <label style={labelStyle}>{ic.label}</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                              <div style={{ position: 'relative' }}>
                                <button type="button" onClick={() => setShowIconPicker(ic.iKey)} style={{ background: '#f8fafc', border: '1px solid var(--br)', borderRadius: '6px', width: '38px', height: '38px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{formData.contentOverrides?.[ic.iKey] || ic.defIco}</button>
                                {showIconPicker === ic.iKey && (
                                  <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '4px', background: '#fff', border: '1px solid var(--br)', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '220px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setShowIconPicker(null)} />
                                    {ICON_OPTIONS.map(ico => (
                                      <div key={ico} onClick={() => { handleCOChange(ic.iKey, ico); setShowIconPicker(null); }} style={{ cursor: 'pointer', textAlign: 'center', fontSize: '18px', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{ico}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input style={{ ...inputStyle, flex: 1, margin: 0 }} value={formData.contentOverrides?.[ic.tKey] || ''} onChange={e => handleCOChange(ic.tKey, e.target.value)} placeholder="Title" />
                            </div>
                            <input style={inputStyle} value={formData.contentOverrides?.[ic.dKey] || ''} onChange={e => handleCOChange(ic.dKey, e.target.value)} placeholder="Description" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📑 Translation Service Types Section</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Service Types Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.svcTypesTitle || ''} onChange={e => handleCOChange('svcTypesTitle', e.target.value)} />
                      </div>

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>6 Service Type Cards</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { label: 'Type 1: Certified', iKey: 'svcType1Icon', tKey: 'svcType1Title', dKey: 'svcType1Desc', lKey: 'svcType1Link', defIco: '📄' },
                          { label: 'Type 2: Legal', iKey: 'svcType2Icon', tKey: 'svcType2Title', dKey: 'svcType2Desc', lKey: 'svcType2Link', defIco: '⚖️' },
                          { label: 'Type 3: Technical', iKey: 'svcType3Icon', tKey: 'svcType3Title', dKey: 'svcType3Desc', lKey: 'svcType3Link', defIco: '🔬' },
                          { label: 'Type 4: Academic', iKey: 'svcType4Icon', tKey: 'svcType4Title', dKey: 'svcType4Desc', lKey: 'svcType4Link', defIco: '🎓' },
                          { label: 'Type 5: Immigration', iKey: 'svcType5Icon', tKey: 'svcType5Title', dKey: 'svcType5Desc', lKey: 'svcType5Link', defIco: '🛂' },
                          { label: 'Type 6: Apostille', iKey: 'svcType6Icon', tKey: 'svcType6Title', dKey: 'svcType6Desc', lKey: 'svcType6Link', defIco: '🔏' },
                        ].map(st => (
                          <div key={st.tKey} style={subCardStyle}>
                            <label style={labelStyle}>{st.label}</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                              <div style={{ position: 'relative' }}>
                                <button type="button" onClick={() => setShowIconPicker(st.iKey)} style={{ background: '#f8fafc', border: '1px solid var(--br)', borderRadius: '6px', width: '38px', height: '38px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{formData.contentOverrides?.[st.iKey] || st.defIco}</button>
                                {showIconPicker === st.iKey && (
                                  <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '4px', background: '#fff', border: '1px solid var(--br)', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '220px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setShowIconPicker(null)} />
                                    {ICON_OPTIONS.map(ico => (
                                      <div key={ico} onClick={() => { handleCOChange(st.iKey, ico); setShowIconPicker(null); }} style={{ cursor: 'pointer', textAlign: 'center', fontSize: '18px', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{ico}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input style={{ ...inputStyle, flex: 1, margin: 0 }} value={formData.contentOverrides?.[st.tKey] || ''} onChange={e => handleCOChange(st.tKey, e.target.value)} placeholder="Title" />
                            </div>
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[st.dKey] || ''} onChange={e => handleCOChange(st.dKey, e.target.value)} placeholder="Description" />
                            <input style={inputStyle} value={formData.contentOverrides?.[st.lKey] || ''} onChange={e => handleCOChange(st.lKey, e.target.value)} placeholder="Link Text" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 5: PRICING & WHY CHOOSE ─── */}
                {activeTab === 'pricing_why' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>💰 Translation Pricing Table</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={labelStyle}>Pricing Table Title</label><input style={inputStyle} value={formData.contentOverrides?.pricingTableTitle || ''} onChange={e => handleCOChange('pricingTableTitle', e.target.value)} /></div>
                        <div><label style={labelStyle}>Pricing Table Subtitle</label><input style={inputStyle} value={formData.contentOverrides?.pricingTableSub || ''} onChange={e => handleCOChange('pricingTableSub', e.target.value)} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        {[
                          { label: 'Standard Rate', key: 'pricingStandardRate' },
                          { label: 'Certified Rate', key: 'pricingCertifiedRate' },
                          { label: 'Express Rate', key: 'pricingExpressRate' },
                          { label: 'Notarization', key: 'pricingNotaryRate' },
                          { label: 'MEA Apostille', key: 'pricingApostilleRate' },
                        ].map(pr => (
                          <div key={pr.key}><label style={labelStyle}>{pr.label}</label><input style={inputStyle} value={formData.contentOverrides?.[pr.key] || ''} onChange={e => handleCOChange(pr.key, e.target.value)} /></div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🌟 Why Choose Us & Certificate Samples</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Why Choose Us Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.whyChooseTitle || ''} onChange={e => handleCOChange('whyChooseTitle', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Why Choose Bullet Points (Format: Title | Description — 1 per line)</label>
                        <textarea rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} value={formData.contentOverrides?.whyChooseBullets || ''} onChange={e => handleCOChange('whyChooseBullets', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Certificate Samples Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.sampleTitle || ''} onChange={e => handleCOChange('sampleTitle', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>❓ Frequently Asked Questions (FAQ)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={labelStyle}>FAQ Section Title</label><input style={inputStyle} value={formData.contentOverrides?.faqTitle || ''} onChange={e => handleCOChange('faqTitle', e.target.value)} /></div>
                        <div><label style={labelStyle}>FAQ Subtitle</label><input style={inputStyle} value={formData.contentOverrides?.faqSub || ''} onChange={e => handleCOChange('faqSub', e.target.value)} /></div>
                      </div>
                      
                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>8 FAQ Items</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { i: 1, qKey: 'faqQ1', aKey: 'faqA1' },
                          { i: 2, qKey: 'faqQ2', aKey: 'faqA2' },
                          { i: 3, qKey: 'faqQ3', aKey: 'faqA3' },
                          { i: 4, qKey: 'faqQ4', aKey: 'faqA4' },
                          { i: 5, qKey: 'faqQ5', aKey: 'faqA5' },
                          { i: 6, qKey: 'faqQ6', aKey: 'faqA6' },
                          { i: 7, qKey: 'faqQ7', aKey: 'faqA7' },
                          { i: 8, qKey: 'faqQ8', aKey: 'faqA8' }
                        ].map(f => (
                          <div key={f.qKey} style={subCardStyle}>
                            <label style={labelStyle}>FAQ {f.i}</label>
                            <input style={{ ...inputStyle, marginBottom: '6px', fontWeight: 600 }} value={formData.contentOverrides?.[f.qKey] || ''} onChange={e => handleCOChange(f.qKey, e.target.value)} placeholder="Question" />
                            <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.contentOverrides?.[f.aKey] || ''} onChange={e => handleCOChange(f.aKey, e.target.value)} placeholder="Answer" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 6: SIDEBAR & SEO ─── */}
                {activeTab === 'sidebar_seo' && (
                  <>
                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>📞 Sidebar Help Box</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div><label style={labelStyle}>Sidebar CTA Title</label><input style={inputStyle} value={formData.contentOverrides?.sidebarCtaTitle || ''} onChange={e => handleCOChange('sidebarCtaTitle', e.target.value)} /></div>
                        <div><label style={labelStyle}>Expert Quote Tagline</label><input style={inputStyle} value={formData.contentOverrides?.expertQuoteText || ''} onChange={e => handleCOChange('expertQuoteText', e.target.value)} /></div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🏆 Sidebar Certifications Box</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={labelStyle}>Certifications Title</label><input style={inputStyle} value={formData.contentOverrides?.sbCertTitle || ''} onChange={e => handleCOChange('sbCertTitle', e.target.value)} /></div>
                        <div><label style={labelStyle}>Rating Tagline</label><input style={inputStyle} value={formData.contentOverrides?.sbCertRatingText || ''} onChange={e => handleCOChange('sbCertRatingText', e.target.value)} /></div>
                      </div>
                      <label style={labelStyle}>4 Certification Badges</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {[
                          { label: 'Badge 1', key: 'sbCertBadge1', def: '🏛️ MSME Reg.' },
                          { label: 'Badge 2', key: 'sbCertBadge2', def: '📋 ISO 9001' },
                          { label: 'Badge 3', key: 'sbCertBadge3', def: '🌐 ISO 17100' },
                          { label: 'Badge 4', key: 'sbCertBadge4', def: '🏆 MEA Cert.' },
                        ].map(b => (
                          <div key={b.key}>
                            <input style={inputStyle} value={formData.contentOverrides?.[b.key] || ''} onChange={e => handleCOChange(b.key, e.target.value)} placeholder={b.def} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h4 style={sectionTitleStyle}>🔍 SEO & Social Meta</h4>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Meta Title (Google Search Result Title)</label>
                        <input style={inputStyle} value={formData.metaTitle || ''} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} placeholder="e.g. Arabic Translation Services in India | Language Guru" />
                        <span style={{ fontSize: '11px', color: 'var(--mu)', display: 'block', marginTop: '4px' }}>Recommended: 50–60 characters. Current: {(formData.metaTitle || '').length} characters.</span>
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Meta Description (Google Snippet)</label>
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={formData.metaDesc || ''} onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} placeholder="Brief summary for search engine results" />
                        <span style={{ fontSize: '11px', color: 'var(--mu)', display: 'block', marginTop: '4px' }}>Recommended: 150–160 characters. Current: {(formData.metaDesc || '').length} characters.</span>
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Meta Keywords (comma-separated)</label>
                        <input style={inputStyle} value={formData.metaKeywords || ''} onChange={e => setFormData({ ...formData, metaKeywords: e.target.value })} placeholder="e.g. arabic translation, certified arabic translator" />
                      </div>
                      <div>
                        <label style={labelStyle}>OG Social Share Image (URL or Upload)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input style={{ ...inputStyle, flex: 1 }} placeholder="e.g. /images/og-arabic.jpg or https://..." value={formData.ogImage || ''} onChange={e => setFormData({ ...formData, ogImage: e.target.value })} />
                          <input type="file" accept="image/*" ref={ogFileInputRef} style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'ogImage')} />
                          <button type="button" onClick={() => ogFileInputRef.current?.click()} disabled={uploadingImage}
                            style={{ padding: '8px 16px', background: 'var(--bp)', color: 'var(--bd)', border: '1px solid var(--br)', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {uploadingImage ? 'Uploading...' : '📁 Upload OG Image'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: 'var(--mu)' }}>Active Tab: <strong>{TABS.find(t => t.id === activeTab)?.label}</strong></span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 18px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ padding: '9px 24px', background: 'var(--bd)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    {saving ? 'Saving Changes...' : '💾 Save Language Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid var(--br)', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
};
const subCardStyle: React.CSSProperties = {
  background: 'var(--g1)', border: '1px solid var(--br)', borderRadius: '8px', padding: '14px'
};
const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px', fontWeight: '700', color: 'var(--bd)', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px'
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px', color: 'var(--td)'
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid var(--br)', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit'
};
