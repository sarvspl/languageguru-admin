'use client';

import React from 'react';
import FieldInput, { labelStyle } from './FieldInput';
import { blankItem, type Field, type ItemSpec } from './sectionSchemas';

type Row = Record<string, unknown>;

const ghostBtn: React.CSSProperties = {
  border: '1px solid var(--br)',
  background: '#fff',
  borderRadius: '6px',
  padding: '4px 9px',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--mu)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1.4,
};

/**
 * Repeatable-row editor for a section's `items`.
 *
 * Options-style sections (a flat list of labels) get a compact one-line-per-row
 * layout; everything else gets a full field grid per row. Both support add,
 * duplicate, delete and reordering.
 */
export default function ItemsEditor({
  spec,
  value,
  onChange,
}: {
  spec: ItemSpec;
  value: unknown;
  onChange: (rows: Row[]) => void;
}) {
  const rows: Row[] = React.useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map((v) => (typeof v === 'string' ? { label: v } : (v as Row) || {}));
  }, [value]);

  const isSimple = spec.fields.length === 1 && (spec.fields[0].type ?? 'text') === 'text';

  const patch = (i: number, name: string, v: unknown) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [name]: v } : r)));

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const add = () => onChange([...rows, blankItem(spec)]);
  const duplicate = (i: number) =>
    onChange([...rows.slice(0, i + 1), JSON.parse(JSON.stringify(rows[i])), ...rows.slice(i + 1)]);
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '9px' }}>
        <span style={labelStyle}>
          {rows.length} {spec.noun}
          {rows.length === 1 ? '' : 's'}
        </span>
        <button type="button" onClick={add} style={{ ...ghostBtn, marginLeft: 'auto' }}>
          + Add {spec.noun}
        </button>
      </div>

      {rows.length === 0 && (
        <p style={{ fontSize: '12.5px', color: 'var(--mu)', padding: '10px 0' }}>
          Nothing here yet. Add a {spec.noun} to start — the section is hidden on the site while it is empty.
        </p>
      )}

      {/* ── compact layout for flat option lists ───────────────────────── */}
      {isSimple &&
        rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--mu)',
                width: '24px',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {i + 1}
            </span>
            <input
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid var(--br)',
                fontSize: '13.5px',
                fontFamily: 'inherit',
              }}
              value={String(row[spec.fields[0].name] ?? '')}
              placeholder={spec.fields[0].placeholder}
              onChange={(e) => patch(i, spec.fields[0].name, e.target.value)}
            />
            <RowControls
              index={i}
              total={rows.length}
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              onDuplicate={() => duplicate(i)}
              onRemove={() => remove(i)}
              noun={spec.noun}
            />
          </div>
        ))}

      {/* ── full field grid per row ────────────────────────────────────── */}
      {!isSimple &&
        rows.map((row, i) => {
          const title = spec.titleField ? String(row[spec.titleField] ?? '') : '';
          return (
            <div
              key={i}
              style={{
                border: '1px solid var(--br)',
                borderRadius: '9px',
                padding: '13px',
                marginBottom: '9px',
                background: 'var(--g1, #fbfcfe)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '11px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mu)', letterSpacing: '.05em' }}>
                  {spec.noun.toUpperCase()} {i + 1}
                </span>
                {title && (
                  <span style={{ fontSize: '13px', color: 'var(--td)', fontWeight: 600 }}>{title}</span>
                )}
                <span style={{ marginLeft: 'auto' }}>
                  <RowControls
                    index={i}
                    total={rows.length}
                    onUp={() => move(i, -1)}
                    onDown={() => move(i, 1)}
                    onDuplicate={() => duplicate(i)}
                    onRemove={() => remove(i)}
                    noun={spec.noun}
                  />
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
                {spec.fields.map((f: Field) => (
                  <div key={f.name} style={{ gridColumn: `span ${f.span ?? 12}` }}>
                    <FieldInput field={f} value={row[f.name]} onChange={(v) => patch(i, f.name, v)} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {rows.length > 2 && (
        <button type="button" onClick={add} style={{ ...ghostBtn, marginTop: '4px' }}>
          + Add {spec.noun}
        </button>
      )}
    </div>
  );
}

function RowControls({
  index,
  total,
  onUp,
  onDown,
  onDuplicate,
  onRemove,
  noun,
}: {
  index: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  noun: string;
}) {
  const icon: React.CSSProperties = {
    ...ghostBtn,
    padding: '3px 7px',
    fontSize: '12px',
    minWidth: '26px',
  };
  return (
    <span style={{ display: 'inline-flex', gap: '4px' }}>
      <button type="button" style={icon} onClick={onUp} disabled={index === 0} aria-label="Move up" title="Move up">
        ↑
      </button>
      <button
        type="button"
        style={icon}
        onClick={onDown}
        disabled={index === total - 1}
        aria-label="Move down"
        title="Move down"
      >
        ↓
      </button>
      <button type="button" style={icon} onClick={onDuplicate} aria-label="Duplicate" title="Duplicate">
        ⧉
      </button>
      <button
        type="button"
        style={{ ...icon, color: '#b91c1c', borderColor: '#fca5a5' }}
        onClick={() => {
          if (window.confirm(`Delete this ${noun}? This cannot be undone once you save the section.`)) onRemove();
        }}
        aria-label={`Delete ${noun}`}
        title={`Delete ${noun}`}
      >
        ✕
      </button>
    </span>
  );
}
