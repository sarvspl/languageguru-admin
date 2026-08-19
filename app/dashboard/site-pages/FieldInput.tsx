'use client';

import React from 'react';
import type { Field } from './sectionSchemas';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  borderRadius: '7px',
  border: '1px solid var(--br)',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  background: '#fff',
  boxSizing: 'border-box',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10.5px',
  fontWeight: 800,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: 'var(--mu)',
  marginBottom: '5px',
};

const helpStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--mu)',
  marginTop: '4px',
  lineHeight: 1.5,
};

/** One typed input, driven by a Field spec. */
export default function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const type = field.type || 'text';

  if (type === 'boolean') {
    return (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--td)',
          cursor: 'pointer',
          paddingTop: '18px',
        }}
      >
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }

  return (
    <div>
      <label style={labelStyle}>{field.label}</label>

      {type === 'textarea' && (
        <textarea
          style={{ ...inputStyle, minHeight: '72px', resize: 'vertical', lineHeight: 1.6 }}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {type === 'select' && (
        <select
          style={inputStyle}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options || []).map((o) => (
            <option key={o} value={o}>
              {o === '' ? '— none —' : o}
            </option>
          ))}
        </select>
      )}

      {type === 'number' && (
        <input
          style={inputStyle}
          type="number"
          value={value === undefined || value === null || value === '' ? '' : Number(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      )}

      {type === 'tags' && <TagsInput value={value} onChange={onChange} placeholder={field.placeholder} />}

      {type === 'text' && (
        <input
          style={inputStyle}
          value={typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.help && <p style={helpStyle}>{field.help}</p>}
    </div>
  );
}

/** Editable chip list for string arrays (region states, table headings). */
function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const list = Array.isArray(value) ? value.map((v) => String(v)) : [];
  const [pending, setPending] = React.useState('');

  const commit = () => {
    const parts = pending
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) onChange([...list, ...parts]);
    setPending('');
  };

  return (
    <div style={{ border: '1px solid var(--br)', borderRadius: '7px', padding: '7px', background: '#fff' }}>
      {list.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '7px' }}>
          {list.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--g1, #eef2f7)',
                borderRadius: '5px',
                padding: '3px 6px 3px 9px',
                fontSize: '12.5px',
                color: 'var(--td)',
              }}
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--mu)',
                  fontSize: '14px',
                  lineHeight: 1,
                  padding: '0 2px',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        style={{ ...inputStyle, border: 'none', padding: '2px 4px', fontSize: '13px' }}
        value={pending}
        placeholder={placeholder || 'Type and press Enter — commas add several at once'}
        onChange={(e) => setPending(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Backspace' && pending === '' && list.length) {
            onChange(list.slice(0, -1));
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}
