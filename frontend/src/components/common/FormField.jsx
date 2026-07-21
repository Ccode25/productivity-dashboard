import React from 'react';

export function FormField({ label, id, error, children }) {
  return (
    <div className="form-group" style={error ? { marginBottom: '1.25rem' } : undefined}>
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      {children}
      {error && <div className="form-error">{error}</div>}
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
        style={style}
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
        style={style}
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
        style={style}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  );
}
