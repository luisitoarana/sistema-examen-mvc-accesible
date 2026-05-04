import React from 'react';

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  required = true,
  helpText
}) {
  const helpId = helpText ? `${id}-help` : undefined;
  return (
    <div className="field-block">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-describedby={helpId}
      />
      {helpText && <small id={helpId} className="field-help">{helpText}</small>}
    </div>
  );
}
