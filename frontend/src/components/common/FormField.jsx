import React from 'react';

export function FormField({ label, id, error, children }) {
  return (
    <div className="form-group" style={error ? { marginBottom: '1.25rem' } : undefined}>
      {label && <label className="form-label" htmlFor={id} style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>{label}</label>}
      {children}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'hsl(var(--danger))', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</div>}
    </div>
  );
}

export function InputField({ label, id, error, type = 'text', style, ...props }) {
  return (
    <FormField label={label} id={id} error={error}>
      <input
        id={id}
        type={type}
        className="input-field"
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '0.6rem 0.8rem',
          color: 'white',
          fontSize: '0.85rem',
          outline: 'none',
          ...style
        }}
        {...props}
      />
    </FormField>
  );
}

export function TextAreaField({ label, id, error, style, ...props }) {
  return (
    <FormField label={label} id={id} error={error}>
      <textarea
        id={id}
        className="input-field"
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '0.6rem 0.8rem',
          color: 'white',
          fontSize: '0.85rem',
          outline: 'none',
          ...style
        }}
        {...props}
      />
    </FormField>
  );
}

export function SelectField({ label, id, options, error, style, ...props }) {
  return (
    <FormField label={label} id={id} error={error}>
      <select
        id={id}
        className="input-field"
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '0.6rem 0.8rem',
          color: 'white',
          fontSize: '0.85rem',
          outline: 'none',
          ...style
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  );
}
