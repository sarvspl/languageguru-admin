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
  const extras = Object.keys(bag).filter((k) => !known.has(k));

  const patch = (k: string, v: unknown) => {
    const next: Bag = { ...bag, [k]: v };
    // Drop empty strings so a cleared field falls back to the code default
    // rather than rendering as blank on the site.
    if (v === '' || v === null || v === undefined) delete next[k];
    onChange(Object.keys(next).length ? next : null);
  };

  const [newKey, setNewKey] = React.useState('');

  if (spec.length === 0 && extras.length === 0) {
    return (
      <p style={{ fontSize: '12.5px', color: 'var(--mu)' }}>
        This section has no options.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '11px' }}>
        {spec.map((f) => (
          <div key={f.name} style={{ gridColumn: `span ${f.span ?? 12}` }}>
            <FieldInput field={f} value={bag[f.name]} onChange={(v) => patch(f.name, v)} />
          </div>
        ))}

        {extras.map((k) => (
          <div key={k} style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>
              {k} <span style={{ textTransform: 'none', fontWeight: 600 }}>(custom)</span>
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                style={inputStyle}
                value={typeof bag[k] === 'object' ? JSON.stringify(bag[k]) : String(bag[k] ?? '')}
                onChange={(e) => patch(k, e.target.value)}
              />
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
        ))}
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
