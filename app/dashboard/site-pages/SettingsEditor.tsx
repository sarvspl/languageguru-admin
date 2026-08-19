'use client';

import React from 'react';
import FieldInput, { inputStyle, labelStyle } from './FieldInput';
import type { Field } from './sectionSchemas';

type Bag = Record<string, unknown>;

/**
 * Typed editor for a section's `settings` object.
 *
 * Known keys get a real input from the spec. Any key the spec does not describe
 * still appears as a text field, so nothing an admin (or a future section) stores
 * becomes invisible or gets silently dropped on save.
 */
export default function SettingsEditor({
  spec,
  value,
  onChange,
}: {
  spec: Field[];
  value: unknown;
  onChange: (bag: Bag | null) => void;
}) {
  const bag: Bag = value && typeof value === 'object' && !Array.isArray(value) ? (value as Bag) : {};
  const known = new Set(spec.map((f) => f.name));
  const allExtras = Object.keys(bag).filter((k) => !known.has(k));

  const patch = (k: string, v: unknown) => {
    const next: Bag = { ...bag, [k]: v };
    // Clearing a field removes the key. On a page template that means the text
    // stops rendering; on one entity's overrides it means the template shows
    // through again. Either way nothing falls back to copy baked into the code.
    if (v === '' || v === null || v === undefined) delete next[k];
    onChange(Object.keys(next).length ? next : null);
  };

  const [newKey, setNewKey] = React.useState('');
  const [filter, setFilter] = React.useState('');

  // Detail-page templates carry a few hundred strings. A filter box keeps them
  // findable without forcing a schema entry for every one.
  const needle = filter.trim().toLowerCase();
  const extras = needle
    ? allExtras.filter(
        (k) =>
          k.toLowerCase().includes(needle) ||
          String(bag[k] ?? '').toLowerCase().includes(needle)
      )
    : allExtras;

  if (spec.length === 0 && extras.length === 0) {
    return (
      <p style={{ fontSize: '12.5px', color: 'var(--mu)' }}>
        This section has no options.
      </p>
    );
  }

  return (
    <div>
      {allExtras.length > 12 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <input
            style={{ ...inputStyle, maxWidth: '280px' }}
            value={filter}
            placeholder="Filter these fields…"
            onChange={(e) => setFilter(e.target.value)}
          />
          <span style={{ fontSize: '12px', color: 'var(--mu)' }}>
            {needle ? `${extras.length} of ${allExtras.length}` : `${allExtras.length} fields`}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '11px' }}>
        {spec.map((f) => (
          <div key={f.name} style={{ gridColumn: `span ${f.span ?? 12}` }}>
            <FieldInput field={f} value={bag[f.name]} onChange={(v) => patch(f.name, v)} />
          </div>
        ))}

        {extras.map((k) => {
          const raw = typeof bag[k] === 'object' ? JSON.stringify(bag[k]) : String(bag[k] ?? '');
          // Paragraphs and bullet lists need room; labels and icons do not.
          const long = raw.length > 90 || raw.includes('\n');
          return (
          <div key={k} style={{ gridColumn: `span ${long ? 12 : 6}` }}>
            <label style={labelStyle}>
              {k} <span style={{ textTransform: 'none', fontWeight: 600 }}>(custom)</span>
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {long ? (
                <textarea
                  style={{ ...inputStyle, minHeight: '84px', lineHeight: 1.6, resize: 'vertical' }}
                  value={raw}
                  onChange={(e) => patch(k, e.target.value)}
                />
              ) : (
              <input
                style={inputStyle}
                value={raw}
                onChange={(e) => patch(k, e.target.value)}
              />
              )}
              <button
                type="button"
                title={`Remove ${k}`}
                aria-label={`Remove ${k}`}
                onClick={() => patch(k, '')}
                style={{
                  border: '1px solid #fca5a5',
                  background: '#fff',
                  color: '#b91c1c',
                  borderRadius: '7px',
                  padding: '0 10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                ✕
              </button>
            </div>
          </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginTop: '12px' }}>
        <input
          style={{ ...inputStyle, maxWidth: '220px' }}
          value={newKey}
          placeholder="Add a custom option key"
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const k = newKey.trim();
              if (k) {
                onChange({ ...bag, [k]: '' });
                setNewKey('');
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const k = newKey.trim();
            if (k) {
              onChange({ ...bag, [k]: '' });
              setNewKey('');
            }
          }}
          style={{
            border: '1px solid var(--br)',
            background: '#fff',
            borderRadius: '6px',
            padding: '7px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--mu)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + Add option
        </button>
      </div>
    </div>
  );
}
