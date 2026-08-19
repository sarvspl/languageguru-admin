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
  'home:hero-badges': [
    { name: 'badge', label: 'Hero badge line', span: 12 },
  ],
  'home:services': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 4 },
    { name: 'sidebarHeading', label: 'Sidebar heading', span: 4 },
  ],
  'home:languages': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 4 },
    { name: 'groupBy', label: 'Group by field', placeholder: 'cat', span: 4 },
    { name: 'perGroup', label: 'Per group', type: 'number', span: 4 },
  ],
  'home:cities': [
    { name: 'source', label: 'Data source', type: 'select', options: SOURCE_OPTIONS, span: 6 },
    { name: 'limit', label: 'How many to show', type: 'number', span: 6 },
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
export const SOURCED_KINDS = new Set(['grid', 'cta', 'form', 'richtext']);

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
};
