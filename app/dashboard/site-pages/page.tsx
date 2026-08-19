'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TopNav from '@/components/TopNav';
import ItemsEditor from './ItemsEditor';
import SettingsEditor from './SettingsEditor';
import { itemSpec, settingsSpec, KIND_HELP, SOURCED_KINDS } from './sectionSchemas';
import { API_URL } from '../../../lib/env';


type Section = {
  id?: string;
  sectionKey: string;
  kind: string;
  tag?: string | null;
  heading?: string | null;
  subheading?: string | null;
  body?: string | null;
  layout?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  button2Text?: string | null;
  button2Link?: string | null;
  items?: unknown;
  settings?: unknown;
  sortOrder?: number;
  isActive?: boolean;
};

type Page = {
  key: string;
  slug: string;
  title: string;
  navLabel?: string | null;
  heroTag?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  metaKeywords?: string | null;
  showInNav?: boolean;
  showInFooter?: boolean;
  showInSitemap?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  sections: Section[];
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: 'var(--mu)',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid var(--br)',
  fontSize: '14px',
  fontFamily: 'inherit',
  background: '#fff',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--br)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

export default function SitePagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Page | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  // Per-section escape hatch for shapes the typed editors do not describe.
  const [rawKeys, setRawKeys] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/site-pages/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setPages(data.data);
      else setMsg({ kind: 'err', text: data.message || 'Could not load pages.' });
    } catch {
      setMsg({ kind: 'err', text: 'Could not reach the API. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openPage = (p: Page) => {
    setOpenKey(p.key);
    setDraft(JSON.parse(JSON.stringify(p)));
    setOpenSection(null);
    setMsg(null);
  };

  const savePage = async () => {
    if (!draft) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/site-pages/${draft.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: draft.slug,
          title: draft.title,
          navLabel: draft.navLabel,
          heroTag: draft.heroTag,
          heroTitle: draft.heroTitle,
          heroSubtitle: draft.heroSubtitle,
          metaTitle: draft.metaTitle,
          metaDesc: draft.metaDesc,
          metaKeywords: draft.metaKeywords,
          showInNav: draft.showInNav,
          showInFooter: draft.showInFooter,
          showInSitemap: draft.showInSitemap,
          isActive: draft.isActive,
          sortOrder: draft.sortOrder,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ kind: 'ok', text: 'Page saved.' });
        await load();
      } else {
        setMsg({ kind: 'err', text: data.message || 'Could not save the page.' });
      }
    } catch {
      setMsg({ kind: 'err', text: 'Could not reach the API.' });
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (s: Section) => {
    if (!draft) return;
    setSaving(true);
    setMsg(null);

    let items = s.items;
    let settings = s.settings;
    try {
      if (typeof items === 'string') items = items.trim() ? JSON.parse(items) : null;
      if (typeof settings === 'string') settings = settings.trim() ? JSON.parse(settings) : null;
    } catch {
      setSaving(false);
      setMsg({ kind: 'err', text: 'Items or Settings is not valid JSON — fix the highlighted field and save again.' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/site-pages/${draft.key}/sections/${s.sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...s, items, settings }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ kind: 'ok', text: `Section "${s.sectionKey}" saved.` });
        await load();
      } else {
        setMsg({ kind: 'err', text: data.message || 'Could not save the section.' });
      }
    } catch {
      setMsg({ kind: 'err', text: 'Could not reach the API.' });
    } finally {
      setSaving(false);
    }
  };

  const patchDraft = (field: keyof Page, value: unknown) =>
    setDraft((d) => (d ? { ...d, [field]: value } : d));

  const patchSection = (key: string, field: keyof Section, value: unknown) =>
    setDraft((d) =>
      d
        ? { ...d, sections: d.sections.map((s) => (s.sectionKey === key ? { ...s, [field]: value } : s)) }
        : d
    );

  const asText = (v: unknown) =>
    v === null || v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v, null, 2);

  return (
    <>
      <TopNav title="Site Pages & Sections" />
      <div style={{ padding: '28px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--mu)', fontSize: '14px', maxWidth: '70ch' }}>
            Every page on the website. Change a page&rsquo;s URL slug, its navigation label, its hero and
            its SEO here, and edit each section&rsquo;s copy and lists below it. Changing a slug changes
            the public URL immediately.
          </p>
        </div>

        {msg && (
          <div
            role="status"
            style={{
              padding: '11px 15px',
              borderRadius: '9px',
              marginBottom: '16px',
              fontSize: '13.5px',
              fontWeight: 600,
              background: msg.kind === 'ok' ? '#dcfce7' : '#fef2f2',
              color: msg.kind === 'ok' ? '#166534' : '#b91c1c',
              border: `1px solid ${msg.kind === 'ok' ? '#bbf7d0' : '#fca5a5'}`,
            }}
          >
            {msg.text}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--mu)' }}>Loading pages…</div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {pages.map((p) => {
              const isOpen = openKey === p.key;
              const d = isOpen ? draft : null;
              return (
                <div key={p.key} style={{ ...card, marginBottom: 0, padding: isOpen ? '20px' : '14px 18px' }}>
                  {/* ── row header ───────────────────────────────── */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', cursor: 'pointer' }}
                    onClick={() => (isOpen ? setOpenKey(null) : openPage(p))}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--mu)', width: '18px' }}>{isOpen ? '▾' : '▸'}</span>
                    <strong style={{ fontSize: '15px', color: 'var(--td)', minWidth: '190px' }}>{p.title}</strong>
                    <code
                      style={{
                        fontSize: '12.5px',
                        background: 'var(--g1, #f1f5f9)',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        color: 'var(--bb, #1e7fc5)',
                      }}
                    >
                      /{p.slug}
                    </code>
                    <span style={{ fontSize: '12px', color: 'var(--mu)' }}>{p.sections.length} sections</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                      {p.showInNav && <Tag>nav</Tag>}
                      {p.showInFooter && <Tag>footer</Tag>}
                      {!p.isActive && <Tag tone="warn">hidden</Tag>}
                    </span>
                  </div>

                  {/* ── expanded editor ──────────────────────────── */}
                  {isOpen && d && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--br)', paddingTop: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={label}>
                            URL slug{' '}
                            <span style={{ textTransform: 'none', fontWeight: 600, color: 'var(--mu)' }}>
                              — this is the public URL
                            </span>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--mu)', fontSize: '14px' }}>/</span>
                            <input
                              style={input}
                              value={d.slug}
                              placeholder={d.key === 'home' ? '(home page — leave empty)' : 'about-us'}
                              onChange={(e) => patchDraft('slug', e.target.value)}
                            />
                          </div>
                          <p style={{ fontSize: '11.5px', color: 'var(--mu)', marginTop: '5px' }}>
                            Lower-case letters, numbers and single hyphens. Must be unique.
                          </p>
                        </div>
                        <div>
                          <label style={label}>Page title</label>
                          <input style={input} value={d.title} onChange={(e) => patchDraft('title', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={label}>Navigation label</label>
                          <input style={input} value={d.navLabel ?? ''} onChange={(e) => patchDraft('navLabel', e.target.value)} />
                        </div>
                        <div>
                          <label style={label}>Hero eyebrow / tag</label>
                          <input style={input} value={d.heroTag ?? ''} onChange={(e) => patchDraft('heroTag', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={label}>Hero heading (basic HTML allowed)</label>
                        <input style={input} value={d.heroTitle ?? ''} onChange={(e) => patchDraft('heroTitle', e.target.value)} />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={label}>Hero subtitle</label>
                        <textarea
                          style={{ ...input, minHeight: '64px', resize: 'vertical' }}
                          value={d.heroSubtitle ?? ''}
                          onChange={(e) => patchDraft('heroSubtitle', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={label}>SEO title</label>
                          <input style={input} value={d.metaTitle ?? ''} onChange={(e) => patchDraft('metaTitle', e.target.value)} />
                        </div>
                        <div>
                          <label style={label}>SEO keywords</label>
                          <input style={input} value={d.metaKeywords ?? ''} onChange={(e) => patchDraft('metaKeywords', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={label}>SEO description</label>
                        <textarea
                          style={{ ...input, minHeight: '58px', resize: 'vertical' }}
                          value={d.metaDesc ?? ''}
                          onChange={(e) => patchDraft('metaDesc', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        <Check checked={!!d.showInNav} onChange={(v) => patchDraft('showInNav', v)} text="Show in header nav" />
                        <Check checked={!!d.showInFooter} onChange={(v) => patchDraft('showInFooter', v)} text="Show in footer" />
                        <Check checked={!!d.showInSitemap} onChange={(v) => patchDraft('showInSitemap', v)} text="Include in sitemap" />
                        <Check checked={!!d.isActive} onChange={(v) => patchDraft('isActive', v)} text="Published" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--mu)' }}>Order</span>
                          <input
                            style={{ ...input, width: '78px' }}
                            type="number"
                            value={d.sortOrder ?? 0}
                            onChange={(e) => patchDraft('sortOrder', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                      </div>

                      <button onClick={savePage} disabled={saving} style={primaryBtn(saving)}>
                        {saving ? 'Saving…' : 'Save page settings'}
                      </button>

                      {/* ── sections ──────────────────────────────── */}
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--td)', margin: '26px 0 4px' }}>
                        Sections on this page
                      </h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--mu)', marginBottom: '12px' }}>
                        Open a section to edit its copy, its repeatable content and its options. Each
                        section shows the right form for what it renders; use <em>Edit as JSON</em> if you
                        need the raw values.
                      </p>

                      {d.sections.length === 0 && (
                        <p style={{ fontSize: '13px', color: 'var(--mu)' }}>
                          This page&rsquo;s content is managed on its own dedicated screen.
                        </p>
                      )}

                      {d.sections.map((s) => {
                        const sOpen = openSection === s.sectionKey;
                        return (
                          <div
                            key={s.sectionKey}
                            style={{ border: '1px solid var(--br)', borderRadius: '10px', marginBottom: '8px', overflow: 'hidden' }}
                          >
                            <button
                              onClick={() => setOpenSection(sOpen ? null : s.sectionKey)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '11px 14px',
                                background: sOpen ? 'var(--g1, #f8fafc)' : '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: 'inherit',
                              }}
                            >
                              <span style={{ fontSize: '12px', color: 'var(--mu)' }}>{sOpen ? '▾' : '▸'}</span>
                              <code style={{ fontSize: '12px', color: 'var(--bb, #1e7fc5)' }}>{s.sectionKey}</code>
                              <Tag>{s.kind}</Tag>
                              <span style={{ fontSize: '13px', color: 'var(--td)' }}>{s.heading || s.tag || ''}</span>
                              {!s.isActive && <Tag tone="warn">hidden</Tag>}
                            </button>

                            {sOpen && (
                              <div style={{ padding: '16px', borderTop: '1px solid var(--br)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                  <div>
                                    <label style={label}>Eyebrow / tag</label>
                                    <input style={input} value={s.tag ?? ''} onChange={(e) => patchSection(s.sectionKey, 'tag', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={label}>Layout</label>
                                    <select style={input} value={s.layout ?? 'text-only'} onChange={(e) => patchSection(s.sectionKey, 'layout', e.target.value)}>
                                      <option value="text-only">text-only</option>
                                      <option value="image-right">image-right</option>
                                      <option value="image-left">image-left</option>
                                    </select>
                                  </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                  <label style={label}>Heading</label>
                                  <input style={input} value={s.heading ?? ''} onChange={(e) => patchSection(s.sectionKey, 'heading', e.target.value)} />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                  <label style={label}>Subheading</label>
                                  <textarea
                                    style={{ ...input, minHeight: '54px', resize: 'vertical' }}
                                    value={s.subheading ?? ''}
                                    onChange={(e) => patchSection(s.sectionKey, 'subheading', e.target.value)}
                                  />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                  <label style={label}>Body copy</label>
                                  <textarea
                                    style={{ ...input, minHeight: '96px', resize: 'vertical' }}
                                    value={s.body ?? ''}
                                    onChange={(e) => patchSection(s.sectionKey, 'body', e.target.value)}
                                  />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                  <div>
                                    <label style={label}>Button text</label>
                                    <input style={input} value={s.buttonText ?? ''} onChange={(e) => patchSection(s.sectionKey, 'buttonText', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={label}>Button link</label>
                                    <input style={input} value={s.buttonLink ?? ''} onChange={(e) => patchSection(s.sectionKey, 'buttonLink', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={label}>2nd button text</label>
                                    <input style={input} value={s.button2Text ?? ''} onChange={(e) => patchSection(s.sectionKey, 'button2Text', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={label}>2nd button link</label>
                                    <input style={input} value={s.button2Link ?? ''} onChange={(e) => patchSection(s.sectionKey, 'button2Link', e.target.value)} />
                                  </div>
                                </div>

                                {(() => {
                                  const spec = itemSpec(d.key, s.sectionKey, s.kind);
                                  const setSpec = settingsSpec(d.key, s.sectionKey, s.kind);
                                  const rawId = `${d.key}:${s.sectionKey}`;
                                  const raw = !!rawKeys[rawId];
                                  const sourced = SOURCED_KINDS.has(s.kind) || !!(s.settings as any)?.source;

                                  return (
                                    <>
                                      {KIND_HELP[s.kind] && (
                                        <p style={{ fontSize: '12.5px', color: 'var(--mu)', margin: '0 0 14px', lineHeight: 1.6 }}>
                                          {KIND_HELP[s.kind]}
                                        </p>
                                      )}

                                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                        <button
                                          type="button"
                                          onClick={() => setRawKeys((r) => ({ ...r, [rawId]: !raw }))}
                                          style={{
                                            border: '1px solid var(--br)', background: '#fff', borderRadius: '6px',
                                            padding: '4px 10px', fontSize: '11.5px', fontWeight: 700,
                                            color: 'var(--mu)', cursor: 'pointer', fontFamily: 'inherit',
                                          }}
                                        >
                                          {raw ? 'Use the form editor' : 'Edit as JSON'}
                                        </button>
                                      </div>

                                      {raw ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                          <div>
                                            <label style={label}>Items (JSON list)</label>
                                            <textarea
                                              style={{ ...input, minHeight: '170px', fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px', resize: 'vertical' }}
                                              value={asText(s.items)}
                                              onChange={(e) => patchSection(s.sectionKey, 'items', e.target.value)}
                                            />
                                          </div>
                                          <div>
                                            <label style={label}>Settings (JSON object)</label>
                                            <textarea
                                              style={{ ...input, minHeight: '170px', fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px', resize: 'vertical' }}
                                              value={asText(s.settings)}
                                              onChange={(e) => patchSection(s.sectionKey, 'settings', e.target.value)}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          {spec && !sourced && (
                                            <div style={{ marginBottom: '16px' }}>
                                              <ItemsEditor
                                                spec={spec}
                                                value={s.items}
                                                onChange={(rows) => patchSection(s.sectionKey, 'items', rows)}
                                              />
                                            </div>
                                          )}

                                          {spec && sourced && Array.isArray(s.items) && s.items.length > 0 && (
                                            <div style={{ marginBottom: '16px' }}>
                                              <p style={{ fontSize: '12px', color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '7px', padding: '9px 11px', marginBottom: '10px' }}>
                                                This section pulls live records from its data source, so these items are only a fallback.
                                              </p>
                                              <ItemsEditor
                                                spec={spec}
                                                value={s.items}
                                                onChange={(rows) => patchSection(s.sectionKey, 'items', rows)}
                                              />
                                            </div>
                                          )}

                                          <div style={{ borderTop: '1px solid var(--br)', paddingTop: '13px', marginBottom: '12px' }}>
                                            <p style={{ ...label, marginBottom: '9px' }}>Section options</p>
                                            <SettingsEditor
                                              spec={setSpec}
                                              value={s.settings}
                                              onChange={(bag) => patchSection(s.sectionKey, 'settings', bag)}
                                            />
                                          </div>
                                        </>
                                      )}
                                    </>
                                  );
                                })()}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                                  <Check checked={s.isActive !== false} onChange={(v) => patchSection(s.sectionKey, 'isActive', v)} text="Show this section" />
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--mu)' }}>Order</span>
                                    <input
                                      style={{ ...input, width: '78px' }}
                                      type="number"
                                      value={s.sortOrder ?? 0}
                                      onChange={(e) => patchSection(s.sectionKey, 'sortOrder', parseInt(e.target.value, 10) || 0)}
                                    />
                                  </div>
                                  <button onClick={() => saveSection(s)} disabled={saving} style={{ ...primaryBtn(saving), marginLeft: 'auto' }}>
                                    {saving ? 'Saving…' : 'Save section'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Tag({ children, tone = 'ok' }: { children: React.ReactNode; tone?: 'ok' | 'warn' }) {
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        padding: '2px 7px',
        borderRadius: '4px',
        background: tone === 'warn' ? '#fef3c7' : 'var(--g1, #eef2f7)',
        color: tone === 'warn' ? '#92400e' : 'var(--mu, #64748b)',
      }}
    >
      {children}
    </span>
  );
}

function Check({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--td)', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {text}
    </label>
  );
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    background: 'var(--bd, #1a3a6b)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 800,
    cursor: disabled ? 'wait' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    fontFamily: 'inherit',
  };
}
