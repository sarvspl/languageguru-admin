'use client';

import React, { useEffect, useState, useRef } from 'react';
import { adminPath } from '../../../lib/basePath';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';

/** Mirrors the backend slugify in config/slug.js so the field can never
 *  submit a shape the API will reject. */
const slugify = (raw: string) =>
  String(raw ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');


// Extended icon options for the icon pickers
const ICON_OPTIONS = [
  '🏛️','🛂','🎓','🔏','⚖️','🏠','📝','🏢','🛡️','📜','🗂️','📋','🤝','💼','🏅','🗃️','📑','🔒','✍️','🖊️','📂','🎯','🧾','💡','🌐','🏦','💰','🔖','📌','🔑','🏥','🔬','⚙️','✈️','💍','💀','👮','✉️','🌍','📊','🚀','🏫','🛏️','💊','🩺','♿','🧬','📈','🔧','⚠️','📖','💻','🏭','📐','🔩','🌿'
];


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

interface Language {
  id?: string;
  name: string;
  key: string;
  /** Admin-editable URL slug. `key` above stays fixed as the identifier. */
  slug?: string;
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

type TabId = 'identity_hero' | 'intro_legal' | 'official_certified' | 'agency_process_ind' | 'docs_interp_svc' | 'pricing_why_reviews' | 'sidebar_seo' | 'layout_order';


const DEFAULT_LANG_SECTIONS = [
  { id: 'intro', label: '📖 Overview & Introduction', tab: 'intro_legal' as TabId },
  { id: 'legal', label: '⚖️ Legal & Court Document Translation', tab: 'intro_legal' as TabId },
  { id: 'official', label: '🏛️ Official Translation & 4 Pillars', tab: 'official_certified' as TabId },
  { id: 'certified', label: '📜 Certified Packages & Checklist', tab: 'official_certified' as TabId },
  { id: 'agency', label: '🏢 Agency Details & Trust Badges', tab: 'agency_process_ind' as TabId },
  { id: 'process', label: '⚡ 5-Step Translation Process', tab: 'agency_process_ind' as TabId },
  { id: 'industries', label: '🏭 Industry-Specific Solutions', tab: 'agency_process_ind' as TabId },
  { id: 'docs', label: '📄 Documents We Translate (6 Categories)', tab: 'docs_interp_svc' as TabId },
  { id: 'interp', label: '🎙️ Professional Interpretation Services', tab: 'docs_interp_svc' as TabId },
  { id: 'services', label: '📋 Translation Service Types', tab: 'docs_interp_svc' as TabId },
  { id: 'pricing', label: '💰 Pricing Packages Table', tab: 'pricing_why_reviews' as TabId },
  { id: 'samples', label: '📑 Certificate Samples Gallery', tab: 'pricing_why_reviews' as TabId },
  { id: 'why', label: '🏅 Why Choose Language Guru', tab: 'pricing_why_reviews' as TabId },
  { id: 'reviews', label: '⭐ Client Reviews & Ratings', tab: 'pricing_why_reviews' as TabId },
  { id: 'faqs', label: '❓ Frequently Asked Questions (8 FAQs)', tab: 'pricing_why_reviews' as TabId },
  { id: 'cities', label: '🗺️ Available Across 100+ Cities', tab: 'sidebar_seo' as TabId },
  { id: 'languages', label: '🌐 Other Supported Languages', tab: 'sidebar_seo' as TabId },
];

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
  const [certIncCount, setCertIncCount] = useState(8);
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
      certifiedP1: `Language Guru delivers internationally certified ${LN} translation services across India. A certified ${LN} translation includes official agency letterhead, certified translator signature and stamp.`,
      certifiedP2: `Our certified ${LN} translations are prepared exclusively by native ${LN} speakers with minimum 5 years of domain-specific experience, with a mandatory 3-stage quality check.`,
      certifiedP3: `Whether you need a single certified ${LN} document or a bulk project of 100+ pages, Language Guru offers consistent quality with transparent pricing starting at ₹${priceVal}/page.`,
      priceStandardVal: `₹${pStd}`, priceStandardUnit: 'per page', priceStandardLabel: 'Standard', priceStandardTime: '5–7 working days',
      priceCertifiedVal: `₹${priceVal}`, priceCertifiedUnit: 'per page', priceCertifiedLabel: 'Certified', priceCertifiedTime: '3–5 working days',
      priceExpressVal: `₹${pExp}`, priceExpressUnit: 'per page', priceExpressLabel: 'Express', priceExpressTime: '24 hours',
      certifiedIncludesTitle: `📋 Every Certified ${LN} Translation Includes:`,
      certInc1: 'Translation on official letterhead',
      certInc2: 'Certified Agency Sign & Stamp',
      certInc3: 'Sworn affidavit & statement of accuracy',
      certInc4: 'internationally certified quality certification',
      certInc5: 'Embassy-ready format (all 60+ embassies)',
      certInc6: 'Soft copy PDF + hard copy on request',
      certInc7: 'Scanned + hard copy available',
      certInc8: 'NDA confidentiality assured',

      // 6. Agency Details & Trust Badges
      agencyTitle: `${LN} Translation Agency in India`,
      agencyP1: `Language Guru is a leading internationally certified ${LN} translation agency in India. Our network of 200+ sworn ${LN} translators has delivered 20,000+ certified projects.`,
      agencyP2: `Our ${LN} translators hold recognized qualifications from top European and Indian universities. We serve individuals, law firms, hospitals, MNCs, and government departments across India.`,
      agencyBadge1Icon: '🏅', agencyBadge1Title: 'ISO 9001:2015', agencyBadge1Desc: 'Quality certified',
      agencyBadge2Icon: '🌐', agencyBadge2Title: 'ISO 17100:2015', agencyBadge2Desc: 'Translation standard',
      agencyBadge3Icon: '🏛️', agencyBadge3Title: 'MSME Registered', agencyBadge3Desc: 'Govt. of India',

      // 5-Step Process
      processTitle: `5-Step ${LN} Translation & Certification Process`,
      step1Title: 'Submit Document', step1Desc: 'Upload via quote form, email or WhatsApp for an instant rate.',
      step2Title: 'Native Translation', step2Desc: `Assigned to a certified native ${LN} linguistic specialist.`,
      step3Title: 'Dual Quality Review', step3Desc: 'Independent proofreading for accuracy, formatting and terminology.',
      step4Title: 'Official Certification', step4Desc: 'Certified on agency letterhead with official seal and declaration.',
      step5Title: 'Instant Delivery', step5Desc: 'Digital scan in 24 hours + doorstep hard copy courier pan-India.',

      // Industry Solutions
      indTitle: `Industry-Specific ${LN} Translation Solutions`,
      ind1Icon: '⚖️', ind1Name: 'Legal & Judicial', ind1Desc: 'Court documents, patents, contracts, decrees, and regulatory submissions.',
      ind2Icon: '🏥', ind2Name: 'Healthcare & Pharma', ind2Desc: 'Clinical trials, medical reports, patient histories, and pharma manuals.',
      ind3Icon: '🔬', ind3Name: 'Engineering & Tech', ind3Desc: 'Technical user guides, schematics, safety specifications, and IT files.',
      ind4Icon: '💼', ind4Name: 'Banking & Finance', ind4Desc: 'Audit statements, annual reports, balance sheets, and tax filings.',
      ind5Icon: '🎓', ind5Name: 'Academic & Education', ind5Desc: 'Diplomas, transcripts, degree certificates, research papers, and LORs.',
      ind6Icon: '✈️', ind6Name: 'Immigration & Travel', ind6Desc: 'Visas, birth certificates, marriage certificates, and PCC records.',

      // Documents We Translate
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

      // Reviews
      revHeading: `Verified Client Reviews for ${LN} Translation`,
      rev1Stars: '★★★★★', rev1Text: `Received certified ${LN} translation for embassy visa application within 24 hours. Flawless formatting and unconditional embassy approval.`, rev1Author: 'Rahul Verma', rev1Role: 'Visa Applicant · Verified Client',
      rev2Stars: '★★★★★', rev2Text: `Translated our academic degree transcripts from ${LN} for WES Canada evaluation. Highly professional and accepted without issue.`, rev2Author: 'Ananya Roy', rev2Role: 'Higher Studies · Canada',
      rev3Stars: '★★★★★', rev3Text: `Our legal contracts and commercial agreements in ${LN} were translated with utmost technical accuracy and notarized promptly.`, rev3Author: 'Vikramaditya S.', rev3Role: 'Corporate Legal Counsel',

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

      // 11. Sidebar, Cities & SEO
      sbCertTitle: '🏆 Certifications',
      sbCertBadge1: '🏛️ MSME Reg.',
      sbCertBadge2: '📋 ISO 9001',
      sbCertBadge3: '🌐 ISO 17100',
      sbCertBadge4: '🏆 MEA Cert.',
      sbCertRatingText: '⭐ 4.9/5 · 10,000+ Reviews',
      sidebarCtaTitle: `📞 ${LN} Translation Help`,
      expertQuoteText: `Expert in ${LN} — instant quote in 30 minutes`,
      citySectionHeading: `${LN} Translation Available Across India`,
      citySectionSub: `We provide certified ${LN} translation across 100+ cities in India. Click any city to view local services:`,
      citySectionAllBtn: '🗺️ View All 100+ Cities →',
      otherLangsHeading: 'Other Languages Available',
      otherLangsAllBtn: '🌐 View All 120+ Languages →',
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
    return Math.max(count, 8);
  };

  const handleOpenAdd = () => {
    setEditingLang(null);
    const defaults = getLanguageDefaults('New Language', 'new-language', '🌐', 850);
    setFormData({ name: '', key: '', slug: '', flag: '🌐', native: '', cat: 'European', speakers: '', region: '',
      difficulty: 'Medium', script: 'Latin', price: 850, isActive: true,
      metaTitle: defaults.metaTitle, metaDesc: defaults.metaDesc, metaKeywords: defaults.metaKeywords,
      ogImage: '', contentOverrides: defaults });
    setHeroImgPreview('');
    setIntroPCount(3); setLegalPCount(3); setOfficialPCount(3);
    setCertifiedPCount(3); setCertIncCount(8); setAgencyPCount(2); setInterpPCount(3);
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
      id: lang.id, name: lang.name, key: lang.key, slug: lang.slug || lang.key, flag: lang.flag || '🌐',
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

  
  /* ── Section Ordering & Custom Sections Handlers ── */
  const getEffectiveSectionOrder = () => {
    const defaultIds = DEFAULT_LANG_SECTIONS.map(s => s.id);
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
      title: 'New Section for ' + formData.name + ' Translation',
      subtitle: 'Section subtitle description',
      paragraphs: ['Paragraph 1 content details for this new custom section in ' + formData.name + '.'],
      ctaText: 'Need ' + formData.name + ' translation assistance?',
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
          title: 'Translation Service',
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

  /* ── Custom Section Checklist Group Handlers ── */
  const addCustomSectionChecklistGroup = (secId: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
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
    handleCOChange('customSections', currentCustoms);
  };

  const updateCustomSectionChecklistGroup = (secId: string, groupId: string, field: keyof CustomChecklistGroup, val: any) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const groups = (cs.checklistGroups || []).map(g => g.id === groupId ? { ...g, [field]: val } : g);
        return { ...cs, checklistGroups: groups };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
  };

  const removeCustomSectionChecklistGroup = (secId: string, groupId: string) => {
    const currentCustoms = ((formData.contentOverrides?.customSections as CustomSection[]) || []).map(cs => {
      if (cs.id === secId) {
        const groups = (cs.checklistGroups || []).filter(g => g.id !== groupId);
        return { ...cs, checklistGroups: groups };
      }
      return cs;
    });
    handleCOChange('customSections', currentCustoms);
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
          <label style={labelStyle}>Section Heading / Title</label>
          <input
            style={{ ...inputStyle, background: '#fff' }}
            value={cs.title}
            onChange={e => updateCustomSection(cs.id, 'title', e.target.value)}
            placeholder="e.g. Specialized Dialect & Technical Translation"
          />
        </div>
        <div>
          <label style={labelStyle}>Section Subtitle (Optional)</label>
          <input
            style={{ ...inputStyle, background: '#fff' }}
            value={cs.subtitle || ''}
            onChange={e => updateCustomSection(cs.id, 'subtitle', e.target.value)}
            placeholder="e.g. Native translators accredited by top international institutes"
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
                      <label style={{ ...labelStyle, fontSize: '10px' }}>Icon</label>
                      <input
                        style={{ ...inputStyle, padding: '5px 8px', fontSize: '14px', textAlign: 'center', background: '#fff' }}
                        value={grp.icon || '✓'}
                        onChange={e => updateCustomSectionChecklistGroup(cs.id, grp.id, 'icon', e.target.value)}
                        placeholder="⚖️"
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '10px' }}>Group Heading / Title</label>
                      <input
                        style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px', fontWeight: '700', background: '#fff' }}
                        value={grp.title}
                        onChange={e => updateCustomSectionChecklistGroup(cs.id, grp.id, 'title', e.target.value)}
                        placeholder="e.g. Court & Litigation"
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ ...labelStyle, fontSize: '10px', margin: 0 }}>Checklist Items (1 per line)</label>
                      <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: '700' }}>✓ {lineCount} items</span>
                    </div>
                    <textarea
                      rows={5}
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px', resize: 'vertical', background: '#fff', fontFamily: 'monospace' }}
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
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--bd)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--bd)' }}>
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccessMsg('');
    try {
      const url = editingLang?.id ? `${API_URL}/api/v1/languages/${editingLang.id}` : `${API_URL}/api/v1/languages`;
      const method = editingLang?.id ? 'PUT' : 'POST';
      const payload = {
        ...formData, price: Number(formData.price) || 850,
        slug: slugify(formData.slug || formData.key),
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
    { id: 'agency_process_ind' as TabId, icon: '🏢', label: '4. Agency, Process & Industries' },
    { id: 'docs_interp_svc' as TabId, icon: '📄', label: '5. Documents, Interp & Services' },
    { id: 'pricing_why_reviews' as TabId, icon: '💰', label: '6. Pricing, Why, Reviews & FAQs' },
    { id: 'sidebar_seo' as TabId, icon: '📞', label: '7. Sidebar, Cities & SEO' },
    { id: 'layout_order' as TabId, icon: '📑', label: '8. Section Order & Layout' }
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
                      <td style={{ color: 'var(--bb)', fontFamily: 'monospace', fontSize: '13px' }}>/languages/{lang.slug || lang.key}</td>
                      <td><span style={{ fontSize: '11px', background: 'var(--bp)', color: 'var(--bd)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>{lang.cat || 'General'}</span></td>
                      <td style={{ fontWeight: '700', color: 'var(--bd)' }}>₹{lang.price || 850}/pg</td>
                      <td>
                        <span className="price-badge" style={{ background: lang.isActive ? '#dcfce7' : '#fee2e2', color: lang.isActive ? '#166534' : '#991b1b' }}>
                          {lang.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <a href={adminPath(`dashboard/languages/city?language=${lang.key}`)} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: '700', marginRight: '12px', fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>📍 City Pages</a>
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
                  Live URL: <code>/languages/{formData.slug || formData.key || 'language-slug'}</code> · All fields are 100% editable and live-synced.
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
                        <div>
                          <label style={labelStyle}>Slug (URL: /languages/[slug])</label>
                          <input
                            style={inputStyle}
                            value={formData.slug ?? formData.key}
                            onChange={e => {
                              const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
                              // `key` is the immutable identifier the API refuses to change,
                              // so only a brand-new language sets it here.
                              setFormData(prev => ({ ...prev, slug: next, ...(editingLang ? {} : { key: next }) }));
                            }}
                            required
                          />
                        </div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <label style={{ ...labelStyle, margin: 0 }}>Hero Background Image (Upload or paste URL)</label>
                          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', color: '#1d4ed8', fontWeight: '700' }}>
                            📐 Recommended Ratio: 16:9 or 21:9 (1920×600 px) · Max 2MB · JPG, PNG, WebP
                          </div>
                        </div>

                        {/* Image Ratio Guidelines Box */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11.5px', color: '#475569' }}>
                          <div>🎯 <strong>Aspect Ratio:</strong> 16:9 or 21:9 (Wide Landscape)</div>
                          <div>📏 <strong>Recommended Size:</strong> 1920 × 600 px (Min 1280×500)</div>
                          <div>📁 <strong>Formats:</strong> JPG, WebP, PNG (Max 2MB)</div>
                          <div>👁️ <strong>Design Note:</strong> Center-right focal area; dark overlay applied automatically</div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                          <input style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                            placeholder="e.g. /uploads/hero-arabic.jpg or https://..."
                            value={formData.contentOverrides?.heroBgImage || ''}
                            onChange={e => {
                              handleCOChange('heroBgImage', e.target.value);
                              const v = e.target.value;
                              setHeroImgPreview(v ? (v.startsWith('http') ? v : `${API_URL}${v.startsWith('/') ? '' : '/'}${v}`) : '');
                            }}
                          />
                          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'heroBgImage')} />
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                            style={{ padding: '8px 18px', background: 'var(--bd)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {uploadingImage ? '⏳ Uploading...' : '📁 Upload Image'}
                          </button>
                        </div>


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
                      {renderSectionHeader('intro', '📖 Overview / Introduction Section', {
                        onAddParagraph: () => addParagraph('intro', setIntroPCount, introPCount)
                      })}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Intro Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.introTitle || ''} onChange={e => handleCOChange('introTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('intro', introPCount, setIntroPCount, 'Intro')}
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('legal', '⚖️ Legal Translation Section', {
                        onAddParagraph: () => addParagraph('legal', setLegalPCount, legalPCount)
                      })}
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
                      {renderSectionHeader('official', '🏛️ Official Translation & 4 Pillars', {
                        onAddParagraph: () => addParagraph('official', setOfficialPCount, officialPCount)
                      })}
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
                      {renderSectionHeader('certified', '📜 Certified Packages & Inclusions Checklist', {
                        onAddParagraph: () => addParagraph('certified', setCertifiedPCount, certifiedPCount)
                      })}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Certified Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.certifiedTitle || ''} onChange={e => handleCOChange('certifiedTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('certified', certifiedPCount, setCertifiedPCount, 'Certified')}

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>3 Price Cards</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[
                          { label: 'Standard', vKey: 'priceStandardVal', lKey: 'priceStandardLabel', tKey: 'priceStandardTime' },
                          { label: 'Certified (⭐ Popular)', vKey: 'priceCertifiedVal', lKey: 'priceCertifiedLabel', tKey: 'priceCertifiedTime' },
                          { label: 'Express (24H)', vKey: 'priceExpressVal', lKey: 'priceExpressLabel', tKey: 'priceExpressTime' },
                        ].map(pc => (
                          <div key={pc.vKey} style={subCardStyle}>
                            <label style={labelStyle}>{pc.label}</label>
                            <input style={{ ...inputStyle, marginBottom: '4px' }} value={formData.contentOverrides?.[pc.vKey] || ''} onChange={e => handleCOChange(pc.vKey, e.target.value)} placeholder="Price e.g. ₹649" />
                            <input style={{ ...inputStyle, marginBottom: '4px' }} value={formData.contentOverrides?.[pc.lKey] || ''} onChange={e => handleCOChange(pc.lKey, e.target.value)} placeholder="Label e.g. Standard" />
                            <input style={inputStyle} value={formData.contentOverrides?.[pc.tKey] || ''} onChange={e => handleCOChange(pc.tKey, e.target.value)} placeholder="Time e.g. 5–7 working days" />
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

                {/* ─── TAB 4: AGENCY, PROCESS & INDUSTRIES ─── */}
                {activeTab === 'agency_process_ind' && (
                  <>
                    <div style={cardStyle}>
                      {renderSectionHeader('agency', '🏢 Agency Details & Trust Badges', {
                        onAddParagraph: () => addParagraph('agency', setAgencyPCount, agencyPCount)
                      })}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Agency Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.agencyTitle || ''} onChange={e => handleCOChange('agencyTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('agency', agencyPCount, setAgencyPCount, 'Agency')}

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>3 Trust Badges</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 1, iKey: 'agencyBadge1Icon', tKey: 'agencyBadge1Title', dKey: 'agencyBadge1Desc', defIco: '🏅', defTitle: 'ISO 9001:2015', defDesc: 'Quality certified' },
                          { id: 2, iKey: 'agencyBadge2Icon', tKey: 'agencyBadge2Title', dKey: 'agencyBadge2Desc', defIco: '🌐', defTitle: 'ISO 17100:2015', defDesc: 'Translation standard' },
                          { id: 3, iKey: 'agencyBadge3Icon', tKey: 'agencyBadge3Title', dKey: 'agencyBadge3Desc', defIco: '🏛️', defTitle: 'MSME Registered', defDesc: 'Govt. of India' },
                        ].map(b => (
                          <div key={b.id} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <button type="button"
                                onClick={() => setIconPickerCard(iconPickerCard === `badge${b.id}` ? null : `badge${b.id}`)}
                                title="Click to select icon"
                                style={{ fontSize: '20px', background: '#fff', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                {formData.contentOverrides?.[b.iKey] || b.defIco}
                              </button>
                              <label style={{ ...labelStyle, margin: 0 }}>Badge {b.id}</label>
                            </div>
                            {iconPickerCard === `badge${b.id}` && (
                              <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {ICON_OPTIONS.map(ic => (
                                  <button key={ic} type="button"
                                    onClick={() => { handleCOChange(b.iKey, ic); setIconPickerCard(null); }}
                                    style={{ fontSize: '18px', background: (formData.contentOverrides?.[b.iKey] || b.defIco) === ic ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                    {ic}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[b.tKey] || ''} onChange={e => handleCOChange(b.tKey, e.target.value)} placeholder={b.defTitle} />
                            <input style={inputStyle} value={formData.contentOverrides?.[b.dKey] || ''} onChange={e => handleCOChange(b.dKey, e.target.value)} placeholder={b.defDesc} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('process', '⚡ 5-Step Translation & Certification Process')}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Process Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.processTitle || ''} onChange={e => handleCOChange('processTitle', e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                        {[
                          { num: 1, tKey: 'step1Title', dKey: 'step1Desc', defTitle: 'Submit Document', defDesc: 'Upload via quote form, email or WhatsApp for an instant rate.' },
                          { num: 2, tKey: 'step2Title', dKey: 'step2Desc', defTitle: 'Native Translation', defDesc: 'Assigned to a certified native linguistic specialist.' },
                          { num: 3, tKey: 'step3Title', dKey: 'step3Desc', defTitle: 'Dual Quality Review', defDesc: 'Independent proofreading for accuracy, formatting and terminology.' },
                          { num: 4, tKey: 'step4Title', dKey: 'step4Desc', defTitle: 'Official Certification', defDesc: 'Certified on agency letterhead with official seal and declaration.' },
                          { num: 5, tKey: 'step5Title', dKey: 'step5Desc', defTitle: 'Instant Delivery', defDesc: 'Digital scan in 24 hours + doorstep hard copy courier pan-India.' },
                        ].map(st => (
                          <div key={st.num} style={{ ...subCardStyle, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: st.num === 5 ? '#16a34a' : 'var(--bd)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                              {st.num}
                            </div>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px' }}>
                              <input style={inputStyle} value={formData.contentOverrides?.[st.tKey] || ''} onChange={e => handleCOChange(st.tKey, e.target.value)} placeholder={st.defTitle} />
                              <input style={inputStyle} value={formData.contentOverrides?.[st.dKey] || ''} onChange={e => handleCOChange(st.dKey, e.target.value)} placeholder={st.defDesc} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('industries', '🏭 Industry-Specific Translation Solutions')}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Industries Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.indTitle || ''} onChange={e => handleCOChange('indTitle', e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 1, iKey: 'ind1Icon', nKey: 'ind1Name', dKey: 'ind1Desc', defIco: '⚖️', defName: 'Legal & Judicial', defDesc: 'Court documents, patents, contracts, decrees, and regulatory submissions.' },
                          { id: 2, iKey: 'ind2Icon', nKey: 'ind2Name', dKey: 'ind2Desc', defIco: '🏥', defName: 'Healthcare & Pharma', defDesc: 'Clinical trials, medical reports, patient histories, and pharma manuals.' },
                          { id: 3, iKey: 'ind3Icon', nKey: 'ind3Name', dKey: 'ind3Desc', defIco: '🔬', defName: 'Engineering & Tech', defDesc: 'Technical user guides, schematics, safety specifications, and IT files.' },
                          { id: 4, iKey: 'ind4Icon', nKey: 'ind4Name', dKey: 'ind4Desc', defIco: '💼', defName: 'Banking & Finance', defDesc: 'Audit statements, annual reports, balance sheets, and tax filings.' },
                          { id: 5, iKey: 'ind5Icon', nKey: 'ind5Name', dKey: 'ind5Desc', defIco: '🎓', defName: 'Academic & Education', defDesc: 'Diplomas, transcripts, degree certificates, research papers, and LORs.' },
                          { id: 6, iKey: 'ind6Icon', nKey: 'ind6Name', dKey: 'ind6Desc', defIco: '✈️', defName: 'Immigration & Travel', defDesc: 'Visas, birth certificates, marriage certificates, and PCC records.' },
                        ].map(ind => (
                          <div key={ind.id} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <button type="button"
                                onClick={() => setIconPickerCard(iconPickerCard === `ind${ind.id}` ? null : `ind${ind.id}`)}
                                title="Click to select icon"
                                style={{ fontSize: '20px', background: '#fff', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                {formData.contentOverrides?.[ind.iKey] || ind.defIco}
                              </button>
                              <input style={{ ...inputStyle, flex: 1, margin: 0, fontWeight: '700' }} value={formData.contentOverrides?.[ind.nKey] || ''} onChange={e => handleCOChange(ind.nKey, e.target.value)} placeholder={ind.defName} />
                            </div>
                            {iconPickerCard === `ind${ind.id}` && (
                              <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {ICON_OPTIONS.map(ic => (
                                  <button key={ic} type="button"
                                    onClick={() => { handleCOChange(ind.iKey, ic); setIconPickerCard(null); }}
                                    style={{ fontSize: '18px', background: (formData.contentOverrides?.[ind.iKey] || ind.defIco) === ic ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                    {ic}
                                  </button>
                                ))}
                              </div>
                            )}
                            <textarea rows={2} style={inputStyle} value={formData.contentOverrides?.[ind.dKey] || ''} onChange={e => handleCOChange(ind.dKey, e.target.value)} placeholder={ind.defDesc} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 5: DOCUMENTS, INTERP & SERVICES ─── */}
                {activeTab === 'docs_interp_svc' && (
                  <>
                    {/* FULL DYNAMIC "DOCUMENTS WE TRANSLATE" SECTION */}
                    <div style={cardStyle}>
                      {renderSectionHeader('docs', '📄 Documents We Translate (6 Categories)')}
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
                      {renderSectionHeader('interp', '🎙️ Professional Interpretation Services', {
                        onAddParagraph: () => addParagraph('interp', setInterpPCount, interpPCount)
                      })}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Interpreter Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.interpTitle || ''} onChange={e => handleCOChange('interpTitle', e.target.value)} />
                      </div>
                      {renderParagraphs('interp', interpPCount, setInterpPCount, 'Interpreter')}

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>6 Interpretation Type Cards</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 1, label: 'Card 1: Conference', iKey: 'interpCard1Icon', tKey: 'interpCard1Title', dKey: 'interpCard1Desc', defIco: '🎤' },
                          { id: 2, label: 'Card 2: Legal Court', iKey: 'interpCard2Icon', tKey: 'interpCard2Title', dKey: 'interpCard2Desc', defIco: '⚖️' },
                          { id: 3, label: 'Card 3: Medical', iKey: 'interpCard3Icon', tKey: 'interpCard3Title', dKey: 'interpCard3Desc', defIco: '🏥' },
                          { id: 4, label: 'Card 4: Business', iKey: 'interpCard4Icon', tKey: 'interpCard4Title', dKey: 'interpCard4Desc', defIco: '💼' },
                          { id: 5, label: 'Card 5: Remote / Telephone', iKey: 'interpCard5Icon', tKey: 'interpCard5Title', dKey: 'interpCard5Desc', defIco: '📞' },
                          { id: 6, label: 'Card 6: Escort & Liaison', iKey: 'interpCard6Icon', tKey: 'interpCard6Title', dKey: 'interpCard6Desc', defIco: '✈️' },
                        ].map(ic => (
                          <div key={ic.id} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <button type="button"
                                onClick={() => setIconPickerCard(iconPickerCard === `interp${ic.id}` ? null : `interp${ic.id}`)}
                                title="Click to select icon"
                                style={{ fontSize: '20px', background: '#fff', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                {formData.contentOverrides?.[ic.iKey] || ic.defIco}
                              </button>
                              <label style={{ ...labelStyle, margin: 0 }}>{ic.label}</label>
                            </div>
                            {iconPickerCard === `interp${ic.id}` && (
                              <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {ICON_OPTIONS.map(ico => (
                                  <button key={ico} type="button"
                                    onClick={() => { handleCOChange(ic.iKey, ico); setIconPickerCard(null); }}
                                    style={{ fontSize: '18px', background: (formData.contentOverrides?.[ic.iKey] || ic.defIco) === ico ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                    {ico}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[ic.tKey] || ''} onChange={e => handleCOChange(ic.tKey, e.target.value)} placeholder="Title" />
                            <input style={inputStyle} value={formData.contentOverrides?.[ic.dKey] || ''} onChange={e => handleCOChange(ic.dKey, e.target.value)} placeholder="Description" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('services', '📋 Translation Service Types')}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Service Types Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.svcTypesTitle || ''} onChange={e => handleCOChange('svcTypesTitle', e.target.value)} />
                      </div>

                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bd)', margin: '18px 0 10px 0' }}>6 Service Type Cards</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 1, label: 'Type 1: Certified', iKey: 'svcType1Icon', tKey: 'svcType1Title', dKey: 'svcType1Desc', lKey: 'svcType1Link', defIco: '📄' },
                          { id: 2, label: 'Type 2: Legal', iKey: 'svcType2Icon', tKey: 'svcType2Title', dKey: 'svcType2Desc', lKey: 'svcType2Link', defIco: '⚖️' },
                          { id: 3, label: 'Type 3: Technical', iKey: 'svcType3Icon', tKey: 'svcType3Title', dKey: 'svcType3Desc', lKey: 'svcType3Link', defIco: '🔬' },
                          { id: 4, label: 'Type 4: Academic', iKey: 'svcType4Icon', tKey: 'svcType4Title', dKey: 'svcType4Desc', lKey: 'svcType4Link', defIco: '🎓' },
                          { id: 5, label: 'Type 5: Immigration', iKey: 'svcType5Icon', tKey: 'svcType5Title', dKey: 'svcType5Desc', lKey: 'svcType5Link', defIco: '🛂' },
                          { id: 6, label: 'Type 6: Apostille', iKey: 'svcType6Icon', tKey: 'svcType6Title', dKey: 'svcType6Desc', lKey: 'svcType6Link', defIco: '🔏' },
                        ].map(st => (
                          <div key={st.id} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <button type="button"
                                onClick={() => setIconPickerCard(iconPickerCard === `svcType${st.id}` ? null : `svcType${st.id}`)}
                                title="Click to select icon"
                                style={{ fontSize: '20px', background: '#fff', border: '2px solid var(--br)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', lineHeight: 1 }}>
                                {formData.contentOverrides?.[st.iKey] || st.defIco}
                              </button>
                              <label style={{ ...labelStyle, margin: 0 }}>{st.label}</label>
                            </div>
                            {iconPickerCard === `svcType${st.id}` && (
                              <div style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: '6px', padding: '8px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {ICON_OPTIONS.map(ico => (
                                  <button key={ico} type="button"
                                    onClick={() => { handleCOChange(st.iKey, ico); setIconPickerCard(null); }}
                                    style={{ fontSize: '18px', background: (formData.contentOverrides?.[st.iKey] || st.defIco) === ico ? '#dbeafe' : 'none', border: '1px solid var(--br)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                    {ico}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[st.tKey] || ''} onChange={e => handleCOChange(st.tKey, e.target.value)} placeholder="Title" />
                            <input style={{ ...inputStyle, marginBottom: '6px' }} value={formData.contentOverrides?.[st.dKey] || ''} onChange={e => handleCOChange(st.dKey, e.target.value)} placeholder="Description" />
                            <input style={inputStyle} value={formData.contentOverrides?.[st.lKey] || ''} onChange={e => handleCOChange(st.lKey, e.target.value)} placeholder="Link Text" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB 6: PRICING, WHY, REVIEWS & FAQS ─── */}
                {activeTab === 'pricing_why_reviews' && (
                  <>
                    <div style={cardStyle}>
                      {renderSectionHeader('pricing', '💰 Pricing Packages Table')}
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
                      {renderSectionHeader('samples', '📑 Certificate Samples Gallery')}
                      <div>
                        <label style={labelStyle}>Certificate Samples Section Title</label>
                        <input style={inputStyle} value={formData.contentOverrides?.sampleTitle || ''} onChange={e => handleCOChange('sampleTitle', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('why', '🏅 Why Choose Language Guru')}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Why Choose Us Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.whyChooseTitle || ''} onChange={e => handleCOChange('whyChooseTitle', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Why Choose Bullet Points (Format: Title | Description — 1 per line)</label>
                        <textarea rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} value={formData.contentOverrides?.whyChooseBullets || ''} onChange={e => handleCOChange('whyChooseBullets', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('reviews', '⭐ Client Reviews & Ratings')}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Reviews Heading</label>
                        <input style={inputStyle} value={formData.contentOverrides?.revHeading || ''} onChange={e => handleCOChange('revHeading', e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 1, starsKey: 'rev1Stars', textKey: 'rev1Text', authKey: 'rev1Author', roleKey: 'rev1Role', defAuthor: 'Rahul Verma', defRole: 'Visa Applicant · Verified Client' },
                          { id: 2, starsKey: 'rev2Stars', textKey: 'rev2Text', authKey: 'rev2Author', roleKey: 'rev2Role', defAuthor: 'Ananya Roy', defRole: 'Higher Studies · Canada' },
                          { id: 3, starsKey: 'rev3Stars', textKey: 'rev3Text', authKey: 'rev3Author', roleKey: 'rev3Role', defAuthor: 'Vikramaditya S.', defRole: 'Corporate Legal Counsel' },
                        ].map(rv => (
                          <div key={rv.id} style={subCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ ...labelStyle, margin: 0 }}>Review {rv.id}</label>
                              <input style={{ ...inputStyle, width: '90px', padding: '2px 6px', fontSize: '12px', textAlign: 'right' }} value={formData.contentOverrides?.[rv.starsKey] || '★★★★★'} onChange={e => handleCOChange(rv.starsKey, e.target.value)} />
                            </div>
                            <textarea rows={3} style={{ ...inputStyle, marginBottom: '6px', resize: 'vertical' }} value={formData.contentOverrides?.[rv.textKey] || ''} onChange={e => handleCOChange(rv.textKey, e.target.value)} placeholder="Review comment text..." />
                            <input style={{ ...inputStyle, marginBottom: '4px' }} value={formData.contentOverrides?.[rv.authKey] || ''} onChange={e => handleCOChange(rv.authKey, e.target.value)} placeholder={rv.defAuthor} />
                            <input style={inputStyle} value={formData.contentOverrides?.[rv.roleKey] || ''} onChange={e => handleCOChange(rv.roleKey, e.target.value)} placeholder={rv.defRole} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('faqs', '❓ Frequently Asked Questions (8 FAQs)')}
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

                {/* ─── TAB 7: SIDEBAR, CITIES & SEO ─── */}
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
                      {renderSectionHeader('cities', '🗺️ Available Across 100+ Cities')}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div><label style={labelStyle}>Section Heading</label><input style={inputStyle} value={formData.contentOverrides?.citySectionHeading || ''} onChange={e => handleCOChange('citySectionHeading', e.target.value)} /></div>
                        <div><label style={labelStyle}>View All Button Text</label><input style={inputStyle} value={formData.contentOverrides?.citySectionAllBtn || ''} onChange={e => handleCOChange('citySectionAllBtn', e.target.value)} /></div>
                      </div>
                      <div>
                        <label style={labelStyle}>Section Subtitle</label>
                        <textarea rows={2} style={inputStyle} value={formData.contentOverrides?.citySectionSub || ''} onChange={e => handleCOChange('citySectionSub', e.target.value)} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {renderSectionHeader('languages', '🌐 Other Supported Languages')}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div><label style={labelStyle}>Section Heading</label><input style={inputStyle} value={formData.contentOverrides?.otherLangsHeading || ''} onChange={e => handleCOChange('otherLangsHeading', e.target.value)} /></div>
                        <div><label style={labelStyle}>View All Button Text</label><input style={inputStyle} value={formData.contentOverrides?.otherLangsAllBtn || ''} onChange={e => handleCOChange('otherLangsAllBtn', e.target.value)} /></div>
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
                        <label style={labelStyle}>URL Slug</label>
                        <input 
                          style={inputStyle} 
                          value={formData.slug || ''} 
                          onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                          placeholder="e.g. albanian" 
                        />
                        <span style={{ fontSize: '11px', color: 'var(--mu)', display: 'block', marginTop: '4px' }}>
                          Live URL: <strong>/languages/{formData.slug || formData.key || 'language-slug'}</strong>
                        </span>
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
                            Reorder sections, hide/unhide any section, or create new custom sections with dedicated paragraphs, cards and CTAs for {formData.name} Translation.
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
                            onClick={() => handleCOChange('sectionOrder', DEFAULT_LANG_SECTIONS.map(s => s.id))}
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
                          const defSec = DEFAULT_LANG_SECTIONS.find(s => s.id === secId);
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
