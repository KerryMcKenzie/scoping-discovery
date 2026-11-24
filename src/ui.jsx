// Shared form building blocks, used by both the public login page and the
// password-protected tool (App.jsx).

import { inputStyle, CONTROL_HEIGHT } from './theme.js';

// ---- Reusable input components --------------------------------------------
// Each Field is 3 rows: label / input / hint (helper text below the input).
// When Fields sit side by side in a grid, "subgrid" makes them share those rows,
// so every label, input and hint lines up across the row — even if one label
// wraps to two lines or only one field has a hint. Outside a grid it simply
// stacks the three rows.
export const Field = ({ label, required, children, hint }) => (
  <div style={{
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridRow: 'span 3',
    rowGap: '6px',
    alignContent: 'start',
    marginBottom: '20px',
  }}>
    <label style={{
      display: 'block',
      alignSelf: 'end',
      fontSize: '13px',
      fontWeight: 600,
      color: '#1a2b4a',
      letterSpacing: '0.02em',
    }}>
      {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
    </label>
    <div>{children}</div>
    {hint && (
      <div style={{ fontSize: '12px', color: '#6b7a99', fontStyle: 'italic', lineHeight: 1.4 }}>
        {hint}
      </div>
    )}
  </div>
);

export const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ ...inputStyle, height: CONTROL_HEIGHT }}
    onFocus={(e) => { e.target.style.borderColor = '#4364F7'; e.target.style.boxShadow = '0 0 0 3px rgba(67,100,247,0.12)'; }}
    onBlur={(e) => { e.target.style.borderColor = '#d5dcea'; e.target.style.boxShadow = 'none'; }}
  />
);
