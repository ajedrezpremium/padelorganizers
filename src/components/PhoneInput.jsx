import React, { useState } from 'react';

// Prefijos internacionales más comunes (estilo Playtomic: selector de país + número).
const COUNTRIES = [
  { flag: '🇪🇸', code: '+34', country: 'ES', name: 'España' },
  { flag: '🇬🇧', code: '+44', country: 'GB', name: 'Reino Unido' },
  { flag: '🇫🇷', code: '+33', country: 'FR', name: 'Francia' },
  { flag: '🇵🇹', code: '+351', country: 'PT', name: 'Portugal' },
  { flag: '🇩🇪', code: '+49', country: 'DE', name: 'Alemania' },
  { flag: '🇮🇹', code: '+39', country: 'IT', name: 'Italia' },
  { flag: '🇳🇱', code: '+31', country: 'NL', name: 'Países Bajos' },
  { flag: '🇧🇪', code: '+32', country: 'BE', name: 'Bélgica' },
  { flag: '🇮🇪', code: '+353', country: 'IE', name: 'Irlanda' },
  { flag: '🇺🇸', code: '+1', country: 'US', name: 'Estados Unidos' },
  { flag: '🇨🇦', code: '+1', country: 'CA', name: 'Canadá' },
  { flag: '🇲🇽', code: '+52', country: 'MX', name: 'México' },
  { flag: '🇦🇷', code: '+54', country: 'AR', name: 'Argentina' },
  { flag: '🇨🇱', code: '+56', country: 'CL', name: 'Chile' },
  { flag: '🇺🇾', code: '+598', country: 'UY', name: 'Uruguay' },
  { flag: '🇵🇾', code: '+595', country: 'PY', name: 'Paraguay' },
  { flag: '🇧🇷', code: '+55', country: 'BR', name: 'Brasil' },
];

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, boxSizing: 'border-box',
};
const selectStyle = {
  ...inputStyle, cursor: 'pointer', flex: '0 0 auto', width: 'auto', minWidth: 118, padding: '12px 10px',
};

// Separa "+34 612345678" en { code: '34', num: '612345678' } (o valores en blanco).
function parseValue(value = '') {
  const clean = (value || '').replace(/\s+/g, '');
  if (/^\+\d{1,4}/.test(clean)) {
    for (const c of COUNTRIES) {
      if (clean.startsWith(c.code)) {
        return { code: c.code.slice(1), num: clean.slice(c.code.length) };
      }
    }
  }
  return { code: '34', num: clean };
}

// Selector de prefijo internacional + número. Contracto controlado:
// value = "+34 612 345 678", onChange(full, prefix).
export default function PhoneInput({
  value = '', onChange = () => {}, placeholder = '600 000 000',
}) {
  const [countryCode, setCountryCode] = useState(() => parseValue(value).code);
  const [number, setNumber] = useState(() => parseValue(value).num);

  const emit = (code, num) => {
    const country = COUNTRIES.find((c) => c.code.slice(1) === code);
    const prefix = country ? country.code : `+${code}`;
    onChange(num.replace(/\D/g, '') ? `${prefix} ${num.replace(/\D/g, '')}` : '', prefix);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select value={countryCode} onChange={(e) => { const c = e.target.value; setCountryCode(c); emit(c, number); }} aria-label="Código de país" style={selectStyle}>
        <optgroup label="Europa">
          {COUNTRIES.slice(0, 9).map((c) => (
            <option key={c.country} value={c.code.slice(1)}>{c.flag} {c.code}</option>
          ))}
        </optgroup>
        <optgroup label="América">
          {COUNTRIES.slice(9).map((c) => (
            <option key={c.country} value={c.code.slice(1)}>{c.flag} {c.code}</option>
          ))}
        </optgroup>
      </select>
      <input
        style={inputStyle}
        type="tel"
        inputMode="tel"
        value={number}
        onChange={(e) => { const n = e.target.value; setNumber(n); emit(countryCode, n); }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}