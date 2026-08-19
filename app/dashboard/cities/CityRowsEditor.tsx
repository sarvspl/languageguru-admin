'use client';

import React from 'react';

/**
 * Repeatable rows for a city's own FAQs and reviews.
 *
 * Both are Json columns the API already accepts and the city page already
 * prefers over the shared list — a city with its own entries shows those
 * instead. Neither had an editor, so the columns were unreachable.
 */

export type Row = Record<string, string>;

export type RowField = {
  name: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  span?: number;
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid var(--br)',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: 'inherit',
};

export default function CityRowsEditor({
  rows,
  fields,
  noun,
  help,
  onChange,
}: {
  rows: Row[];
  fields: RowField[];
  noun: string;
  help?: string;
  onChange: (next: Row[]) => void;
}) {
  const patch = (i: number, name: string, v: string) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [name]: v } : r));
    onChange(next);
  };
  const add = () => {
    const blank: Row = {};
    fields.forEach((f) => { blank[f.name] = ''; });
    onChange([...rows, blank]);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {help && (
        <p style={{ fontSize: '12.5px', color: 'var(--mu)', lineHeight: 1.7, marginBottom: '12px' }}>{help}</p>
      )}

      <div style={{ maxHeight: '44vh', overflowY: 'auto', paddingRight: '6px' }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--br)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px',
              background: '#fcfcfd',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: 'var(--mu)' }}>
                {noun} {i + 1}
              </strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up"
                  style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down"
                  style={{ background: 'none', border: 'none', cursor: i === rows.length - 1 ? 'default' : 'pointer', opacity: i === rows.length - 1 ? 0.3 : 1 }}>↓</button>
                <button type="button" onClick={() => remove(i)}
                  style={{ background: 'none', border: 'none', color: 'var(--rd)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
              {fields.map((f) => (
                <div key={f.name} style={{ gridColumn: `span ${f.span ?? 12}` }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', color: 'var(--mu)' }}>
                    {f.label}
                  </label>
                  {f.multiline ? (
                    <textarea
                      rows={3}
                      value={row[f.name] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) => patch(i, f.name, e.target.value)}
                      style={{ ...input, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      value={row[f.name] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) => patch(i, f.name, e.target.value)}
                      style={input}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--mu)', padding: '12px 0' }}>
            None yet — this city uses the shared list.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        style={{
          marginTop: '10px',
          padding: '8px 14px',
          background: 'var(--bd)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '12.5px',
          cursor: 'pointer',
        }}
      >
        + Add {noun.toLowerCase()}
      </button>
    </div>
  );
}
