'use client';

import React, { useMemo, useState } from 'react';

/**
 * Per-city overrides for the shared city page template.
 *
 * Every /cities/… page is written once, under Site Pages → Cities → "City page
 * template", using {city} and {lang} placeholders. A city may override any of
 * those keys with wording of its own — the renderer already checks the city's
 * record before falling back to the template — but there was no way to enter
 * one. This is that editor.
 *
 * Only keys the admin has actually filled in are stored, so a city carries just
 * its exceptions and keeps inheriting everything else.
 */

const label = (key: string) => {
  const withLang = key.endsWith('WithLang');
  const base = withLang ? key.slice(0, -'WithLang'.length) : key;
  const words = base.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  const text = words.charAt(0).toUpperCase() + words.slice(1);
  return withLang ? `${text} (language variant)` : text;
};

/** Long values get a textarea; short ones a single line. */
const isLong = (v: string) => v.length > 90;

const input: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid var(--br)',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: 'inherit',
};

export default function CityOverridesEditor({
  template,
  value,
  onChange,
  cityName,
}: {
  /** The shared template: key → the wording every city inherits. */
  template: Record<string, string>;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  cityName: string;
}) {
  const [query, setQuery] = useState('');
  const [onlySet, setOnlySet] = useState(false);

  const keys = useMemo(() => {
    const all = Object.keys(template).sort();
    const q = query.trim().toLowerCase();
    return all.filter((k) => {
      if (onlySet && !String(value[k] || '').trim()) return false;
      if (!q) return true;
      return k.toLowerCase().includes(q) || String(template[k] || '').toLowerCase().includes(q);
    });
  }, [template, value, query, onlySet]);

  const setKey = (k: string, v: string) => {
    const next = { ...value };
    if (v.trim() === '') delete next[k];
    else next[k] = v;
    onChange(next);
  };

  const setCount = Object.keys(value).filter((k) => String(value[k] || '').trim()).length;

  if (!Object.keys(template).length) {
    return (
      <p style={{ fontSize: '13px', color: 'var(--mu)', lineHeight: 1.7 }}>
        The city page template could not be loaded, so there is nothing to override yet. Check that
        Site Pages → Cities has a &ldquo;City page template&rdquo; section.
      </p>
    );
  }

  return (
    <div>
      <p style={{ fontSize: '12.5px', color: 'var(--mu)', lineHeight: 1.7, marginBottom: '12px' }}>
        Leave a field empty and {cityName || 'this city'} uses the shared wording shown as the
        placeholder. Fill one in and only this city changes. <code>{'{city}'}</code>,{' '}
        <code>{'{state}'}</code> and <code>{'{lang}'}</code> still work here.
      </p>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
        <input
          placeholder="Search the template…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...input, flex: 1 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={onlySet} onChange={(e) => setOnlySet(e.target.checked)} />
          Only overridden ({setCount})
        </label>
      </div>

      <div style={{ maxHeight: '46vh', overflowY: 'auto', paddingRight: '6px' }}>
        {keys.map((k) => {
          const shared = String(template[k] ?? '');
          const current = String(value[k] ?? '');
          const overridden = current.trim() !== '';
          return (
            <div key={k} style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: overridden ? 'var(--bd)' : 'var(--mu)',
                }}
              >
                <span>{label(k)}</span>
                <code style={{ fontWeight: 400, fontSize: '10.5px', opacity: 0.6 }}>{k}</code>
              </label>
              {isLong(shared) || isLong(current) ? (
                <textarea
                  rows={3}
                  value={current}
                  placeholder={shared}
                  onChange={(e) => setKey(k, e.target.value)}
                  style={{ ...input, resize: 'vertical', borderColor: overridden ? 'var(--bb)' : 'var(--br)' }}
                />
              ) : (
                <input
                  value={current}
                  placeholder={shared}
                  onChange={(e) => setKey(k, e.target.value)}
                  style={{ ...input, borderColor: overridden ? 'var(--bb)' : 'var(--br)' }}
                />
              )}
              {overridden && (
                <button
                  type="button"
                  onClick={() => setKey(k, '')}
                  style={{
                    marginTop: '4px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--rd)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Reset to the shared wording
                </button>
              )}
            </div>
          );
        })}
        {keys.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--mu)' }}>Nothing matches that search.</p>
        )}
      </div>
    </div>
  );
}
