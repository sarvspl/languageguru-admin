/**
 * Field specifications for the typed section editors.
 *
 * `items` and `settings` are Json columns, so the shape varies by section. These
 * specs turn each shape into a real form. Lookup order is:
 *   1. an exact "pageKey:sectionKey" override
 *   2. the section's `kind`
 *   3. nothing — the editor falls back to raw JSON
 */

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'tags';

export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  help?: string;
  options?: string[];
  /** Grid columns this field spans, out of 12. */
  span?: number;
};

export type ItemSpec = {
  /** Singular noun for the add button and row labels. */
  noun: string;
  fields: Field[];
  /** Field whose value labels the row in the collapsed view. */
  titleField?: string;
  /** Set when rows are simple strings rather than objects. */
  primitive?: boolean;
};

const SOURCE_OPTIONS = [
  '', 'services', 'languages', 'cities', 'industries', 'gallery',
  'testimonials', 'clients', 'faqs', 'whyChoose', 'translators',
];

// ─── items: defaults by kind ────────────────────────────────────────────────
const BY_KIND: Record<string, ItemSpec> = {
  options: {
    noun: 'option',
    titleField: 'label',
    fields: [{ name: 'label', label: 'Label', span: 12 }],
  },
  stats: {
    noun: 'statistic',
    titleField: 'label',
    fields: [
      { name: 'value', label: 'Value', placeholder: '120+', span: 4 },
      { name: 'suffix', label: 'Suffix', placeholder: '+ or ★', help: 'Rendered in the accent colour.', span: 2 },
      { name: 'label', label: 'Label', placeholder: 'Languages', span: 6 },
    ],
  },
  cards: {
    noun: 'card',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Icon', placeholder: '🏛️', span: 2 },
      { name: 'title', label: 'Title', span: 10 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
    ],
  },
  steps: {
    noun: 'step',
    titleField: 'title',
    fields: [
      { name: 'num', label: 'Number', placeholder: '01', span: 2 },
      { name: 'title', label: 'Title', span: 10 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
    ],
  },
  faq: {
    noun: 'question',
    titleField: 'q',
    fields: [
      { name: 'q', label: 'Question', span: 12 },
      { name: 'a', label: 'Answer', type: 'textarea', span: 12 },
    ],
  },
  table: {
    noun: 'row',
    titleField: 'purpose',
    fields: [
      { name: 'purpose', label: 'Column 1', span: 3 },
      { name: 'svc', label: 'Column 2', span: 3 },
      { name: 'why', label: 'Column 3', span: 4 },
      { name: 'price', label: 'Column 4', span: 2 },
    ],
  },
};

// ─── items: per-section overrides ───────────────────────────────────────────
const BY_SECTION: Record<string, ItemSpec> = {
  'home:hero': {
    noun: 'hero button',
    titleField: 'label',
    fields: [
      { name: 'label', label: 'Button text', span: 5 },
      {
        name: 'href',
        label: 'Links to',
        help: 'A path such as /quote, a full URL, or {{phone}} / {{whatsapp}} to use the numbers from Settings.',
        span: 4,
      },
      {
        name: 'variant',
        label: 'Style',
        type: 'select',
        options: ['primary', 'outline', 'whatsapp'],
        span: 3,
      },
    ],
  },
  'home:quick-quote': {
    noun: 'assignment type',
    titleField: 'label',
    fields: [
      { name: 'label', label: 'Label', span: 8 },
      { name: 'value', label: 'Rate (₹)', span: 4 },
    ],
  },
  'home:interpreter-tabs': {
    noun: 'interpreter tab',
    titleField: 'label',
    fields: [
      { name: 'key', label: 'Key', help: 'Short identifier — must stay unique.', span: 3 },
      { name: 'label', label: 'Tab button', placeholder: '🎤 Conference', span: 4 },
      { name: 'icon', label: 'Icon', placeholder: '🎤', span: 2 },
      { name: 'bookAs', label: 'Books as', help: 'Pre-fills the quote form.', span: 3 },
      { name: 'title', label: 'Panel heading', span: 12 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
      { name: 'points', label: 'Bullet points', type: 'tags', span: 12 },
      { name: 'steps', label: 'How it works', type: 'tags', help: 'Numbered left to right.', span: 12 },
    ],
  },
  'languages:categories': {
    noun: 'category',
    titleField: 'title',
    fields: [
      { name: 'cat', label: 'Category key', help: 'Must match the Category field on your languages.', span: 4 },
      { name: 'icon', label: 'Icon', placeholder: '🌍', span: 2 },
      { name: 'title', label: 'Heading', span: 6 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
    ],
  },
  'cities:how-it-works': {
    noun: 'service model',
    titleField: 'title',
    fields: [
      { name: 'badge', label: 'Badge', placeholder: '📍 Physical Service', span: 5 },
      { name: 'title', label: 'Title', span: 5 },
      { name: 'accent', label: 'Accent', type: 'select', options: ['primary', 'accent'], span: 2 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
      { name: 'points', label: 'Bullet points', type: 'tags', span: 12 },
    ],
  },
  'cities:coverage': {
    noun: 'statistic',
    titleField: 'label',
    fields: [
      { name: 'value', label: 'Value', placeholder: '50', span: 3 },
      { name: 'suffix', label: 'Suffix', placeholder: '+', help: 'Rendered in the accent colour.', span: 3 },
      { name: 'label', label: 'Label', placeholder: 'CITIES COVERED', span: 6 },
    ],
  },
  'cities:breadcrumb': {
    noun: 'crumb',
    titleField: 'label',
    fields: [
      { name: 'label', label: 'Label', span: 7 },
      { name: 'href', label: 'Links to', help: 'Leave empty for the current page.', span: 5 },
    ],
  },
  'cities:detail-hero': {
    noun: 'hero button',
    titleField: 'label',
    fields: [
      { name: 'label', label: 'Button text', span: 5 },
      { name: 'href', label: 'Links to', help: 'A path, a full URL, or {{phone}} / {{whatsapp}}.', span: 4 },
      { name: 'variant', label: 'Style', type: 'select', options: ['white', 'outline', 'whatsapp'], span: 3 },
    ],
  },
  'cities:detail-hero-badges': {
    noun: 'badge',
    titleField: 'label',
    fields: [
      { name: 'icon', label: 'Icon', placeholder: '✅', span: 2 },
      { name: 'label', label: 'Label', help: '{city} and {reviewCount} are replaced.', span: 10 },
    ],
  },
  'cities:detail-documents': {
    noun: 'document',
    titleField: 'label',
    fields: [
      { name: 'icon', label: 'Icon', placeholder: '📄', span: 2 },
      { name: 'label', label: 'Document name', span: 10 },
    ],
  },
  'cities:detail-document-categories': {
    noun: 'category',
    titleField: 'name',
    fields: [
      { name: 'key', label: 'Key', help: 'Used in the tab id — keep it unique and URL-safe.', span: 3 },
      { name: 'label', label: 'Tab label', placeholder: '🛂 Immigration', span: 4 },
      { name: 'name', label: 'Category name', span: 3 },
      { name: 'icon', label: 'Icon', span: 1 },
      { name: 'tint', label: 'Tint', placeholder: '#dbeafe', span: 1 },
    ],
  },
  'cities:detail-agency-cards': {
    noun: 'credential',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Icon', span: 2 },
      { name: 'title', label: 'Title', span: 10 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
    ],
  },
  'cities:detail-notary-cards': {
    noun: 'attestation service',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Icon', span: 2 },
      { name: 'title', label: 'Service', span: 5 },
      { name: 'desc', label: 'Price · turnaround', span: 5 },
    ],
  },
  'cities:detail-visa-cards': {
    noun: 'destination',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Flag', span: 2 },
      { name: 'title', label: 'Destination', span: 10 },
      { name: 'desc', label: 'What we handle', type: 'textarea', span: 12 },
    ],
  },
  'cities:detail-legal-cards': {
    noun: 'legal specialism',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Icon', span: 2 },
      { name: 'title', label: 'Specialism', span: 10 },
      { name: 'points', label: 'Document types', type: 'tags', span: 12 },
    ],
  },
  'cities:detail-pricing': {
    noun: 'price row',
    titleField: 'service',
    fields: [
      { name: 'service', label: 'Service', span: 4 },
      { name: 'badge', label: 'Badge', placeholder: 'POPULAR', span: 2 },
      { name: 'price', label: 'Price', span: 3 },
      { name: 'delivery', label: 'Delivery', span: 3 },
      { name: 'includes', label: 'Includes', span: 12 },
    ],
  },
  'cities:detail-why-choose': {
    noun: 'reason',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', span: 6 },
      { name: 'titleWithLang', label: 'Title when a language is selected', help: '{lang} is replaced.', span: 6 },
      { name: 'desc', label: 'Description', type: 'textarea', span: 12 },
    ],
  },
  'cities:detail-faq': {
    noun: 'question',
    titleField: 'q',
    fields: [
      { name: 'q', label: 'Question', help: '{city} and {lang} are replaced.', span: 12 },
      { name: 'a', label: 'Answer', type: 'textarea', span: 12 },
    ],
  },
  'cities:detail-sidebar-pricing': {
    noun: 'price row',
    titleField: 'label',
    fields: [
      { name: 'label', label: 'Label', span: 8 },
      { name: 'value', label: 'Price', span: 4 },
    ],
  },
  'cities:detail-sidebar': {
    noun: 'trust badge',
    titleField: 'label',
    fields: [{ name: 'label', label: 'Badge', span: 12 }],
  },
  'cities:regions': {
    noun: 'region',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Icon', placeholder: '🌆', span: 2 },
      { name: 'title', label: 'Region name', span: 6 },
      { name: 'color', label: 'Accent colour', placeholder: '#1a56a7', span: 4 },
      {
        name: 'states',
        label: 'States in this region',
        type: 'tags',
        help: 'Must match the State field on your cities. Leave the last region empty to catch everything else.',
        span: 12,
      },
    ],
  },
  'payment:methods': {
    noun: 'payment method',
    titleField: 'title',
    fields: [
      { name: 'key', label: 'Method key', help: 'One of UPI, Card, NetBanking, Razorpay, PayPal, NEFT.', span: 3 },
      { name: 'icon', label: 'Icon', span: 2 },
      { name: 'title', label: 'Title', span: 7 },
      { name: 'desc', label: 'Description', type: 'textarea', help: 'Bank and UPI details come from Settings — do not repeat them here.', span: 12 },
    ],
  },
  'services:choose': {
    noun: 'row',
    titleField: 'purpose',
    fields: [
      { name: 'purpose', label: 'Your purpose', span: 3 },
      { name: 'svc', label: 'Recommended service', span: 3 },
      { name: 'why', label: 'Why', span: 4 },
      { name: 'price', label: 'Starting price', span: 2 },
    ],
  },
};

// ─── settings: per-section specs ────────────────────────────────────────────
const SETTINGS: Record<string, Field[]> = {
  'home:hero': [
    { name: 'badge', label: 'Badge pill above the heading', span: 12 },
  ],
  'home:quick-quote': [
    { name: 'serviceLabel', label: 'Service field label', span: 4 },
    { name: 'fromLabel', label: 'From-language label', span: 4 },
    { name: 'toLabel', label: 'To-language label', span: 4 },
    { name: 'fromDefault', label: 'From-language default', span: 3 },
    { name: 'toDefault', label: 'To-language default', span: 3 },
    { name: 'fromPlaceholder', label: 'From placeholder', span: 3 },
    { name: 'toPlaceholder', label: 'To placeholder', span: 3 },
    { name: 'pagesLabel', label: 'Pages label', span: 4 },
    { name: 'docLabel', label: 'Document-type label', span: 4 },
    { name: 'assignLabel', label: 'Assignment-type label', span: 4 },
    { name: 'unitPage', label: 'Per-page suffix', placeholder: '/page', span: 4 },
    { name: 'unitDoc', label: 'Per-document suffix', placeholder: '/doc', span: 4 },
    { name: 'unitDay', label: 'Per-day suffix', placeholder: '/day', span: 4 },
    { name: 'baseLabel', label: 'Base-price row label', span: 4 },
    { name: 'gstLabel', label: 'Tax row label', span: 4 },
    { name: 'gstRate', label: 'Tax rate (%)', type: 'number', span: 4 },
    { name: 'totalLabel', label: 'Total row label', span: 12 },
  ],
  'home:interpreter-tabs': [
    { name: 'stepsHeading', label: '"How it works" heading', span: 12 },
  ],
  'home:industries': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 4 },
    { name: 'fallbackLabel', label: 'Label when an industry has no description', span: 4 },
  ],
  'home:gallery': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 4 },
    { name: 'categoryLimit', label: 'How many filter chips', type: 'number', span: 4 },
    { name: 'allLabel', label: '"All" chip label', help: 'Leave empty to drop the chip.', span: 6 },
    { name: 'watermark', label: 'Thumbnail watermark', span: 6 },
  ],
  'home:testimonials': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'defaultRole', label: 'Role shown when blank', span: 4 },
    { name: 'defaultCity', label: 'City shown when blank', span: 4 },
  ],
  'home:quote': [
    { name: 'source', label: 'Service list source', type: 'select', options: SOURCE_OPTIONS, span: 12 },
    { name: 'nameLabel', label: 'Name label', span: 6 },
    { name: 'namePlaceholder', label: 'Name placeholder', span: 6 },
    { name: 'phoneLabel', label: 'Phone label', span: 6 },
    { name: 'phonePlaceholder', label: 'Phone placeholder', span: 6 },
    { name: 'serviceLabel', label: 'Service label', span: 6 },
    { name: 'cityLabel', label: 'City label', span: 6 },
    { name: 'cityPlaceholder', label: 'City placeholder', span: 6 },
    { name: 'messageLabel', label: 'Message label', span: 6 },
    { name: 'messagePlaceholder', label: 'Message placeholder', type: 'textarea', span: 12 },
    { name: 'sendingLabel', label: 'Button text while sending', span: 6 },
    { name: 'whatsappShortLabel', label: 'WhatsApp label on small screens', span: 6 },
    { name: 'successMessage', label: 'Success message', type: 'textarea', span: 12 },
    { name: 'nameError', label: 'Missing-name error', span: 6 },
    { name: 'phoneError', label: 'Invalid-phone error', span: 6 },
    { name: 'genericError', label: 'Rejected-submission error', span: 6 },
    { name: 'networkError', label: 'Network-failure error', span: 6 },
  ],
  'home:services': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'limit', label: 'Cards to show', type: 'number', span: 4 },
    { name: 'sidebarLimit', label: 'Sidebar links to show', type: 'number', span: 4 },
    { name: 'sidebarHeading', label: 'Sidebar heading', span: 4 },
    { name: 'linkLabel', label: 'Card link label', placeholder: 'View Details →', span: 4 },
    { name: 'allLabel', label: '"See all" link', help: '{count} is replaced with the number of services.', span: 4 },
  ],
  'home:languages': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 3 },
    { name: 'columns', label: 'Columns', type: 'number', span: 3 },
    { name: 'perColumn', label: 'Languages per column', type: 'number', span: 3 },
    { name: 'columnHeading', label: 'Column heading', span: 3 },
  ],
  'home:cities': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 4 },
    { name: 'defaultIcon', label: 'Icon when a city has none', span: 4 },
    { name: 'moreIcon', label: '"More cities" icon', span: 4 },
    { name: 'moreLabel', label: '"More cities" label', help: '{count} is replaced with the number not shown.', span: 8 },
  ],
  'home:faq': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'category', label: 'FAQ category', span: 4 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 4 },
  ],
  'services:grid': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'priceLabelPrefix', label: 'Price prefix', placeholder: 'From', span: 4 },
    { name: 'linkLabel', label: 'Link label', placeholder: 'View Details →', span: 4 },
  ],
  'services:choose': [
    { name: 'columns', label: 'Table column headings', type: 'tags', help: 'Four headings, left to right.', span: 12 },
  ],
  'services:faq': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 6 },
    { name: 'category', label: 'FAQ category', span: 6 },
  ],
  'cities:grid': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 6 },
    { name: 'defaultIcon', label: 'Icon when a city has none', span: 6 },
  ],
  'cities:services': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 6 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 6 },
  ],
  'cities:cta': [
    { name: 'phoneButton', label: 'Show a call button with the phone number', type: 'boolean', span: 12 },
  ],
  'cities:detail-pricing': [
    { name: 'columns', label: 'Table column headings', type: 'tags', help: 'Four headings, left to right.', span: 12 },
  ],
  'cities:detail-sidebar': [
    { name: 'languageLimit', label: 'Languages listed', type: 'number', span: 4 },
    { name: 'cityLimit', label: 'Other cities listed', type: 'number', span: 4 },
    { name: 'reviewCount', label: 'Review count', help: 'Shown wherever {reviewCount} appears.', span: 4 },
    { name: 'ratingLine', label: 'Rating line', span: 12 },
  ],
  'cities:faq': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 6 },
    { name: 'category', label: 'FAQ category', span: 6 },
  ],
  'languages:stats': [
    { name: 'prependLanguageCount', label: 'Show live language count first', type: 'boolean', span: 6 },
    { name: 'languageCountLabel', label: 'Label for that count', span: 6 },
  ],
  'languages:search': [
    { name: 'searchPlaceholder', label: 'Search placeholder', span: 12 },
    { name: 'allLabel', label: '"All categories" label', span: 6 },
    { name: 'buttonText', label: 'Button text', span: 6 },
  ],
  'gallery:filters': [
    { name: 'langFilterHeading', label: 'Language filter heading', span: 8 },
    { name: 'langLimit', label: 'Languages to offer', type: 'number', span: 4 },
  ],
  'gallery:modal': [
    { name: 'previewTabLabel', label: 'Preview tab label', span: 4 },
    { name: 'downloadTabLabel', label: 'Download tab label', span: 4 },
    { name: 'isoBadge', label: 'ISO badge text', span: 4 },
  ],
  'translators:filters': [
    { name: 'searchLabel', label: 'Search label', span: 4 },
    { name: 'searchPlaceholder', label: 'Search placeholder', span: 8 },
    { name: 'allLanguages', label: '"All languages" label', span: 4 },
    { name: 'allCities', label: '"All cities" label', span: 4 },
    { name: 'allSpecs', label: '"All specialisations" label', span: 4 },
    { name: 'resetLabel', label: 'Reset button', span: 6 },
    { name: 'emptyHeading', label: 'Empty-state heading', span: 6 },
  ],
  'quote:notes': [
    { name: 'translation', label: 'Translation pricing note', type: 'textarea', span: 12 },
    { name: 'interpretation', label: 'Interpretation pricing note', type: 'textarea', span: 12 },
    { name: 'gstLabel', label: 'GST label', span: 6 },
    { name: 'gstRate', label: 'GST rate (%)', type: 'number', span: 6 },
  ],
  'join:consent': [
    { name: 'submitLabel', label: 'Submit button', span: 6 },
    { name: 'successHeading', label: 'Success heading', span: 6 },
  ],
  'payment:security': [
    { name: 'note', label: 'Follow-up note', type: 'textarea', span: 12 },
  ],
};

const GENERIC_SOURCE_SETTINGS: Field[] = [
  { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 6 },
  { name: 'limit', label: 'How many to show', type: 'number', span: 6 },
];

/** Kinds that never carry `items` — their content comes from a collection. */
// 'form' is deliberately absent: a form band can carry real items (the hero
// calculator's assignment types) as well as pull a list from a source. Whether
// it is sourced is decided by its `source` setting, not by its kind.
export const SOURCED_KINDS = new Set(['grid', 'cta', 'richtext']);

export function itemSpec(pageKey: string, sectionKey: string, kind: string): ItemSpec | null {
  return BY_SECTION[`${pageKey}:${sectionKey}`] || BY_KIND[kind] || null;
}

export function settingsSpec(pageKey: string, sectionKey: string, kind: string): Field[] {
  const exact = SETTINGS[`${pageKey}:${sectionKey}`];
  if (exact) return exact;
  if (kind === 'grid' || kind === 'faq' || kind === 'cards') return GENERIC_SOURCE_SETTINGS;
  return [];
}

/** A blank row matching a spec, so "Add" produces the right shape. */
export function blankItem(spec: ItemSpec): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  spec.fields.forEach((f) => {
    row[f.name] = f.type === 'tags' ? [] : f.type === 'boolean' ? false : f.type === 'number' ? 0 : '';
  });
  return row;
}

/** Human-readable explanation of what a section does, shown above its editor. */
export const KIND_HELP: Record<string, string> = {
  options: 'A list of choices — dropdown options or filter chips.',
  stats: 'A row of headline numbers.',
  cards: 'A grid of cards, each with an icon, title and description.',
  steps: 'A numbered process, rendered left to right.',
  table: 'A comparison table. Column headings are set under Settings.',
  faq: 'Questions and answers. When a data source is set, these come from the FAQ collection instead.',
  grid: 'Renders live records from the data source chosen under Settings — no items needed here.',
  cta: 'A call-to-action band: heading, subtitle and up to two buttons.',
  richtext: 'Free-form copy. Basic formatting HTML is allowed and sanitised.',
  form: 'A form band. The heading, subtitle and button text are editable here.',
  hero: 'The hero band. Its eyebrow, heading and subtitle are the page-level Hero fields above; the badge pill and buttons are here.',
'doc-categories': 'Tabbed document categories on every city page. Each row also carries its own document list.',
  sidebar: 'The sidebar on every city page — its headings live under the city page template.',
    'interpreter-tabs': 'The tabs under the interpreter band — one row per tab, each with its own panel copy.',
};
