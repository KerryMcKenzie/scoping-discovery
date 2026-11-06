import React, { useState, useEffect } from 'react';

// ============================================================================
// BSM Discovery Tool — Single-file React artifact
// Matches Reimbursements Calculator pattern: no external UI libs, Blue Lagoo
// gradient (#0052D4 -> #4364F7 -> #6FB1FC), left-side section nav, PDF/JSON
// export on review page.
// ============================================================================

// ---- Reference data -------------------------------------------------------
const ERP_OPTIONS = [
  'Oracle Financial Cloud',
  'Oracle NetSuite',
  'SAP ECC',
  'SAP S/4HANA',
  'SAP Business One',
  'Infor',
  'JD Edwards',
  'Sage Intacct',
  'Microsoft Dynamics 365',
  'Workday Financials',
  'QuickBooks Enterprise',
  'Other',
];

const HR_OPTIONS = [
  'Workday',
  'UKG / UltiPro',
  'ADP Workforce Now',
  'BambooHR',
  'Oracle HCM',
  'SAP SuccessFactors',
  'Paycom',
  'Paylocity',
  'Rippling',
  'Other',
];

const BANK_OPTIONS = [
  'JPMorgan Chase',
  'U.S. Bank',
  'Bank of America',
  'Wells Fargo',
  'Citi',
  'PNC',
  'Barclays',
  'HSBC',
  'Deutsche Bank',
  'Other',
];

const TRAVEL_OPTIONS = [
  'SAP Concur',
  'FCM Travel',
  'Egencia',
  'BCD Travel',
  'American Express GBT',
  'Navan (TripActions)',
  'CWT',
  'Other',
];

const AP_PORTAL_OPTIONS = [
  'Coupa',
  'Ariba',
  'Tipalto',
  'Bill.com',
  'Stampli',
  'AvidXchange',
  'Basware',
  'Medius',
  'Other',
];

const SPEND_MGMT_OPTIONS = [
  'Ramp',
  'Brex',
  'Emburse',
  'SAP Concur',
  'Coupa',
  'Airbase',
  'Divvy (BILL Spend & Expense)',
  'Expensify',
  'None / In-house',
  'Other',
];

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Ireland',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Sweden',
  'Norway',
  'Denmark',
  'Switzerland',
  'Poland',
  'Brazil',
  'Argentina',
  'Colombia',
  'Chile',
  'Australia',
  'New Zealand',
  'Japan',
  'Singapore',
  'India',
];

const INDUSTRY_OPTIONS = [
  'Technology / SaaS',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Retail / E-commerce',
  'Professional Services',
  'Media / Entertainment',
  'Energy / Utilities',
  'Real Estate',
  'Education',
  'Non-profit',
  'Government',
  'Other',
];

// ---- Section definitions --------------------------------------------------
const SECTIONS = [
  { id: 'welcome', label: 'Welcome', shortLabel: '00' },
  { id: 'company', label: 'Company Info', shortLabel: '01' },
  { id: 'baseline', label: 'Foundation & Systems', shortLabel: '02' },
  { id: 'travel', label: 'Travel & Expense', shortLabel: '03' },
  { id: 'ap', label: 'Accounts Payable', shortLabel: '04' },
  { id: 'review', label: 'Review & Submit', shortLabel: '05' },
];

// ---- Reusable input components --------------------------------------------
const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: '#1a2b4a',
      marginBottom: '6px',
      letterSpacing: '0.02em',
    }}>
      {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
    </label>
    {hint && (
      <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '8px', fontStyle: 'italic' }}>
        {hint}
      </div>
    )}
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d5dcea',
  borderRadius: '6px',
  background: '#fff',
  color: '#1a2b4a',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  outline: 'none',
};

const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={inputStyle}
    onFocus={(e) => { e.target.style.borderColor = '#4364F7'; e.target.style.boxShadow = '0 0 0 3px rgba(67,100,247,0.12)'; }}
    onBlur={(e) => { e.target.style.borderColor = '#d5dcea'; e.target.style.boxShadow = 'none'; }}
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
    onFocus={(e) => { e.target.style.borderColor = '#4364F7'; e.target.style.boxShadow = '0 0 0 3px rgba(67,100,247,0.12)'; }}
    onBlur={(e) => { e.target.style.borderColor = '#d5dcea'; e.target.style.boxShadow = 'none'; }}
  />
);

const Select = ({ value, onChange, options, placeholder = 'Select...' }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    style={{ ...inputStyle, cursor: 'pointer' }}
    onFocus={(e) => { e.target.style.borderColor = '#4364F7'; e.target.style.boxShadow = '0 0 0 3px rgba(67,100,247,0.12)'; }}
    onBlur={(e) => { e.target.style.borderColor = '#d5dcea'; e.target.style.boxShadow = 'none'; }}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const MultiSelect = ({ values = [], onChange, options }) => {
  const toggle = (opt) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '8px',
      padding: '12px',
      border: '1px solid #d5dcea',
      borderRadius: '6px',
      background: '#fafbfe',
      maxHeight: '220px',
      overflowY: 'auto',
    }}>
      {options.map((opt) => {
        const checked = values.includes(opt);
        return (
          <label key={opt} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#1a2b4a',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '4px',
            background: checked ? 'rgba(67,100,247,0.08)' : 'transparent',
          }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt)}
              style={{ accentColor: '#4364F7', cursor: 'pointer' }}
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
};

const YesNo = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    {['Yes', 'No', 'Unsure'].map((opt) => {
      const active = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: `1px solid ${active ? '#4364F7' : '#d5dcea'}`,
            background: active ? 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)' : '#fff',
            color: active ? '#fff' : '#1a2b4a',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// Component for ERP/HR/Bank-style selects that also need an "Other" free-text
const SelectWithOther = ({ value = { selection: '', other: '' }, onChange, options, placeholder }) => (
  <div>
    <Select
      value={value.selection}
      onChange={(sel) => onChange({ ...value, selection: sel, other: sel === 'Other' ? value.other : '' })}
      options={options}
      placeholder={placeholder}
    />
    {value.selection === 'Other' && (
      <div style={{ marginTop: '8px' }}>
        <TextInput
          value={value.other}
          onChange={(v) => onChange({ ...value, other: v })}
          placeholder="Please specify..."
        />
      </div>
    )}
  </div>
);

// ---- Login Page -----------------------------------------------------------
const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setLoading(true);
    // Simulate federated SSO roundtrip
    setTimeout(() => onLogin({ name: name.trim(), email: email.trim() }), 700);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f6fb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle decorative gradient accent */}
      <div style={{
        position: 'absolute',
        top: '-200px',
        right: '-200px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(67,100,247,0.08) 0%, rgba(111,177,252,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,82,212,0.06) 0%, rgba(67,100,247,0) 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 40px rgba(26,43,74,0.08), 0 2px 8px rgba(26,43,74,0.04)',
        border: '1px solid #e0e8f7',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            // background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 700,
          }}>
            
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a2b4a',
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            Discovery Tool
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7a99', margin: 0 }}>
            Sign in with your work account
          </p>
        </div>

        <Field label="Full Name" required>
          <TextInput value={name} onChange={setName} placeholder="Test User" />
        </Field>

        <Field label="Work Email" required>
          <TextInput value={email} onChange={setEmail} placeholder="test.user@company.com" type="email" />
        </Field>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '8px',
            background: canSubmit
              ? 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)'
              : '#c5ccdd',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.15s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Authenticating…' : 'Sign in with SSO'}
        </button>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #eef1f8',
          fontSize: '12px',
          color: '#8a97b3',
          textAlign: 'center',
        }}>
          Secured by Federated Identity · Demo Environment
        </div>
      </div>
    </div>
  );
};

// ---- Sidebar --------------------------------------------------------------
const Sidebar = ({ currentSection, onNavigate, user, completionMap, onLogout }) => (
  <div style={{
    width: '260px',
    background: 'linear-gradient(180deg, #0a1f4a 0%, #1a2b4a 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
  }}>
    <div style={{ padding: '0 24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 700,
        }}>◆</div>
        <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>Discovery Tool</span>
      </div>
      <div style={{ fontSize: '11px', color: '#8a97b3', marginLeft: '42px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        BSM Sales Workflow
      </div>
    </div>

    <div style={{ flex: 1, padding: '0 12px' }}>
      <div style={{
        fontSize: '11px',
        color: '#6b7a99',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '0 12px 12px',
      }}>
        Sections
      </div>
      {SECTIONS.map((section) => {
        const active = currentSection === section.id;
        const complete = completionMap[section.id];
        return (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: '12px',
              padding: '12px',
              marginBottom: '4px',
              background: active ? 'rgba(67,100,247,0.25)' : 'transparent',
              color: active ? '#fff' : '#c5ccdd',
              border: 'none',
              borderLeft: active ? '3px solid #6FB1FC' : '3px solid transparent',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: active ? '#6FB1FC' : '#6b7a99',
              minWidth: '20px',
            }}>
              {section.shortLabel}
            </span>
            <span style={{ flex: 1 }}>{section.label}</span>
            {complete && (
              <span style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#2ecc71',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fff',
              }}>✓</span>
            )}
          </button>
        );
      })}
    </div>

    <div style={{
      padding: '16px 24px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      fontSize: '13px',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{user.name}</div>
      <div style={{ fontSize: '11px', color: '#8a97b3', marginBottom: '10px' }}>{user.email}</div>
      <button
        onClick={onLogout}
        style={{
          fontSize: '12px',
          color: '#8a97b3',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px',
          padding: '6px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Sign out
      </button>
    </div>
  </div>
);

// ---- Section Header -------------------------------------------------------
const SectionHeader = ({ sectionNumber, title, subtitle }) => (
  <div style={{ marginBottom: '32px' }}>
    <div style={{
      display: 'inline-block',
      fontSize: '11px',
      fontWeight: 700,
      color: '#4364F7',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: '8px',
    }}>
      Section {sectionNumber}
    </div>
    <h1 style={{
      fontSize: '28px',
      fontWeight: 700,
      color: '#1a2b4a',
      margin: '0 0 8px',
      letterSpacing: '-0.02em',
    }}>
      {title}
    </h1>
    {subtitle && (
      <p style={{ fontSize: '15px', color: '#6b7a99', margin: 0, lineHeight: 1.5 }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ---- Nav Buttons ----------------------------------------------------------
const NavButtons = ({ onBack, onNext, nextLabel = 'Continue', backLabel = 'Back' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid #eef1f8',
  }}>
    {onBack ? (
      <button
        onClick={onBack}
        style={{
          padding: '10px 20px',
          background: '#fff',
          color: '#1a2b4a',
          border: '1px solid #d5dcea',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ← {backLabel}
      </button>
    ) : <div />}
    <button
      onClick={onNext}
      style={{
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(67,100,247,0.25)',
      }}
    >
      {nextLabel} →
    </button>
  </div>
);

// ---- WELCOME / INSTRUCTIONS ------------------------------------------------
const WelcomeSection = ({ user, onNext }) => (
  <div>
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 700,
        color: '#4364F7',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        Getting Started
      </div>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 700,
        color: '#1a2b4a',
        margin: '0 0 12px',
        letterSpacing: '-0.02em',
      }}>
        Welcome to the Discovery Tool
      </h1>
      <p style={{ fontSize: '15px', color: '#6b7a99', margin: 0, lineHeight: 1.6 }}>
        Hi {user.name.split(' ')[0]}, this tool streamlines the discovery process for Business Spend Management
        opportunities. Follow each section to capture key technical, operational, and commercial context about
        your prospect. Once complete, generate a PDF summary to attach to the Salesforce Opportunity record.
      </p>
    </div>

    {/* How it works */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,82,212,0.03) 0%, rgba(111,177,252,0.06) 100%)',
      border: '1px solid #e0e8f7',
      borderRadius: '8px',
      padding: '24px 28px',
      marginBottom: '28px',
    }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#4364F7',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: '0 0 20px',
      }}>
        How It Works
      </h3>

      {[
        { step: '01', title: 'Company Information', desc: 'Capture the basics — name, industry, size, and primary contacts involved in the evaluation.' },
        { step: '02', title: 'Foundation & Systems', desc: 'Document ERPs, geography, banking partners, HR systems, integration requirements, and decision context.' },
        { step: '03', title: 'Travel & Expense', desc: 'Scope T&E volume, incumbent tools, compliance constraints (GDPR, VAT), and friction points.' },
        { step: '04', title: 'Accounts Payable', desc: 'Invoice volume, matching complexity, portal burden, payment mix, and pain points.' },
        { step: '05', title: 'Review & Submit', desc: 'Review the full summary, add final sales notes, and export as PDF / JSON or attach to Salesforce.' },
      ].map((item, idx, arr) => (
        <div key={item.step} style={{
          display: 'flex',
          gap: '16px',
          paddingBottom: idx < arr.length - 1 ? '16px' : 0,
          marginBottom: idx < arr.length - 1 ? '16px' : 0,
          borderBottom: idx < arr.length - 1 ? '1px solid rgba(67,100,247,0.08)' : 'none',
        }}>
          <div style={{
            flexShrink: 0,
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            {item.step}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a2b4a', marginBottom: '2px' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7a99', lineHeight: 1.5 }}>
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Tips */}
    <div style={{
      background: '#fff',
      border: '1px solid #eef1f8',
      borderRadius: '8px',
      padding: '20px 24px',
      marginBottom: '8px',
    }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#1a2b4a',
        margin: '0 0 12px',
      }}>
        Before you begin
      </h3>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
        <li>You can jump between sections at any time using the left-hand navigation.</li>
        <li>Sections with a green checkmark are complete; blank fields are optional unless marked with an asterisk.</li>
        <li>Your entries stay in place as long as this session is open — export to PDF or JSON to preserve them.</li>
        <li>The "Additional Notes" field in each section is for qualitative context that doesn't fit the structured questions.</li>
      </ul>
    </div>

    <NavButtons onNext={onNext} nextLabel="Start Discovery" />
  </div>
);

// ---- Repeatable Contacts Block --------------------------------------------
const ContactsBlock = ({ contacts = [], onChange }) => {
  const addContact = () => {
    onChange([...contacts, { id: Date.now(), name: '', title: '', role: '', email: '' }]);
  };
  const updateContact = (id, field, value) => {
    onChange(contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };
  const removeContact = (id) => {
    onChange(contacts.filter((c) => c.id !== id));
  };

  // Ensure at least one contact exists when first rendered
  useEffect(() => {
    if (contacts.length === 0) {
      onChange([{ id: Date.now(), name: '', title: '', role: '', email: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {contacts.map((contact, idx) => (
        <div key={contact.id} style={{
          border: '1px solid #e0e8f7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '12px',
          background: '#fafbfe',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#4364F7',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Contact {idx + 1}
            </div>
            {contacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeContact(contact.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#e74c3c',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontFamily: 'inherit',
                }}
              >
                Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Name">
              <TextInput
                value={contact.name}
                onChange={(v) => updateContact(contact.id, 'name', v)}
                placeholder="e.g. Sarah Chen"
              />
            </Field>
            <Field label="Title">
              <TextInput
                value={contact.title}
                onChange={(v) => updateContact(contact.id, 'title', v)}
                placeholder="e.g. VP of Finance"
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Email">
              <TextInput
                value={contact.email}
                onChange={(v) => updateContact(contact.id, 'email', v)}
                placeholder="sarah.chen@company.com"
                type="email"
              />
            </Field>
            <Field label="Role in Evaluation">
              <Select
                value={contact.role}
                onChange={(v) => updateContact(contact.id, 'role', v)}
                options={[
                  'Economic Buyer',
                  'Technical Buyer',
                  'Champion',
                  'End User',
                  'Influencer',
                  'Blocker',
                  'Executive Sponsor',
                  'Procurement',
                  'IT / Security',
                  'Other',
                ]}
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addContact}
        style={{
          width: '100%',
          padding: '12px',
          background: '#fff',
          border: '1px dashed #b4c0d8',
          borderRadius: '8px',
          color: '#4364F7',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#4364F7';
          e.currentTarget.style.background = 'rgba(67,100,247,0.04)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#b4c0d8';
          e.currentTarget.style.background = '#fff';
        }}
      >
        + Add Another Contact
      </button>
    </div>
  );
};

// ---- SECTION 1: Company Info ----------------------------------------------
const CompanySection = ({ data, update, onNext, onBack }) => (
  <div>
    <SectionHeader
      sectionNumber="01"
      title="Company Information"
      subtitle="Capture the essentials about the prospect before diving into the discovery."
    />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Company Name" required>
        <TextInput value={data.companyName} onChange={(v) => update('companyName', v)} placeholder="Acme Corp" />
      </Field>
      <Field label="Company Website / URL">
        <TextInput value={data.companyUrl} onChange={(v) => update('companyUrl', v)} placeholder="https://acme.com" />
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Industry">
        <Select value={data.industry} onChange={(v) => update('industry', v)} options={INDUSTRY_OPTIONS} />
      </Field>
      <Field label="Annual Revenue (USD)" hint="Approx. — use the closest publicly known figure.">
        <Select
          value={data.annualRevenue}
          onChange={(v) => update('annualRevenue', v)}
          options={['< $50M', '$50M – $250M', '$250M – $1B', '$1B – $5B', '$5B+', 'Unknown']}
        />
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Employee Count">
        <Select
          value={data.employeeCount}
          onChange={(v) => update('employeeCount', v)}
          options={['< 100', '100 – 500', '500 – 2,000', '2,000 – 10,000', '10,000+']}
        />
      </Field>
      <Field label="Headquarters Location">
        <TextInput value={data.hqLocation} onChange={(v) => update('hqLocation', v)} placeholder="City, State/Country" />
      </Field>
    </div>

    {/* Primary Contacts block */}
    <div style={{ marginTop: '28px', marginBottom: '8px' }}>
      <h3 style={{
        fontSize: '16px',
        color: '#1a2b4a',
        margin: '0 0 4px',
        fontWeight: 700,
      }}>
        Primary Contact(s)
      </h3>
      <p style={{ fontSize: '13px', color: '#6b7a99', margin: '0 0 16px' }}>
        Add each person involved in the evaluation and their role.
      </p>
      <ContactsBlock
        contacts={data.contacts}
        onChange={(v) => update('contacts', v)}
      />
    </div>

    <NavButtons onBack={onBack} onNext={onNext} />
  </div>
);

// ---- SECTION 2: Foundation & Systems --------------------------------------
const BaselineSection = ({ data, update, onNext, onBack }) => (
  <div>
    <SectionHeader
      sectionNumber="02"
      title="Foundation & Systems"
      subtitle="Understand the prospect's core financial systems, integration surface, and technical readiness."
    />

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '0 0 16px', fontWeight: 700 }}>Financial Systems</h3>

    {/* Row 1: ERP 1, ERP 2, Business Segments — aligned in 3-column grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
      <Field label="Primary ERP (ERP 1)" required>
        <SelectWithOther
          value={data.erp1}
          onChange={(v) => update('erp1', v)}
          options={ERP_OPTIONS}
          placeholder="Select primary ERP"
        />
      </Field>
      <Field label="Secondary ERP (ERP 2)" hint="If they run multiple ERPs">
        <SelectWithOther
          value={data.erp2}
          onChange={(v) => update('erp2', v)}
          options={ERP_OPTIONS}
          placeholder="Select secondary ERP"
        />
      </Field>
      <Field label="Business Segments" hint="e.g. regions or product lines">
        <TextInput
          value={data.businessSegments}
          onChange={(v) => update('businessSegments', v)}
          placeholder="e.g. NA Retail, EMEA Services"
        />
      </Field>
    </div>

    {/* Row 2: ERP Instances + Migrations */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Number of ERP Instances" hint="Often tied to segments or acquisitions">
        <TextInput
          value={data.erpInstances}
          onChange={(v) => update('erpInstances', v)}
          placeholder="e.g. 3"
          type="number"
        />
      </Field>
      <Field label="Current or Upcoming ERP Migrations?" hint="Critical for timeline and scope">
        <YesNo value={data.currentMigrations} onChange={(v) => update('currentMigrations', v)} />
      </Field>
    </div>

    {data.currentMigrations === 'Yes' && (
      <Field label="Migration Details">
        <TextInput
          value={data.migrationsDetails}
          onChange={(v) => update('migrationsDetails', v)}
          placeholder="Which systems? Expected timeline?"
        />
      </Field>
    )}

    {/* Geography */}
    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Geography & Currency</h3>

    <Field label="Countries (and currencies) in Scope" required hint="Select all operating countries">
      <MultiSelect
        values={data.countriesInScope}
        onChange={(v) => update('countriesInScope', v)}
        options={COUNTRY_OPTIONS}
      />
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Primary Functional Currency">
        <Select
          value={data.primaryCurrency}
          onChange={(v) => update('primaryCurrency', v)}
          options={['USD', 'EUR', 'GBP', 'CAD', 'MXN', 'BRL', 'JPY', 'AUD', 'Other']}
        />
      </Field>
      <Field label="Multi-entity consolidation required?">
        <YesNo value={data.multiEntity} onChange={(v) => update('multiEntity', v)} />
      </Field>
    </div>

    {/* HR / Banking / Integration */}
    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>People & Money Movement</h3>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="HR System">
        <SelectWithOther
          value={data.hrSystem}
          onChange={(v) => update('hrSystem', v)}
          options={HR_OPTIONS}
          placeholder="Select HR system"
        />
      </Field>
      <Field label="Primary Banking Partner">
        <SelectWithOther
          value={data.bankingPartner}
          onChange={(v) => update('bankingPartner', v)}
          options={BANK_OPTIONS}
          placeholder="Select banking partner"
        />
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="B2B Card Program in place?">
        <YesNo value={data.b2bCardProgram} onChange={(v) => update('b2bCardProgram', v)} />
      </Field>
      <Field label="Card Issuer" hint="If B2B card program exists">
        <TextInput
          value={data.cardIssuer}
          onChange={(v) => update('cardIssuer', v)}
          placeholder="e.g. Visa, Mastercard, Amex"
        />
      </Field>
    </div>

    <Field label="Other systems to integrate with?" hint="CRM, Procurement, Data Warehouse, etc.">
      <TextArea
        value={data.otherSystems}
        onChange={(v) => update('otherSystems', v)}
        placeholder="e.g. Salesforce, Snowflake, Coupa, custom procurement portal"
        rows={2}
      />
    </Field>

    <Field label="Is IT familiar with Flat File & Web API data exchange?">
      <YesNo value={data.itFamiliarity} onChange={(v) => update('itFamiliarity', v)} />
    </Field>

    <Field label="Security / Compliance Requirements" hint="SOC 2, ISO 27001, SSO/SAML, SCIM, etc.">
      <TextArea
        value={data.securityRequirements}
        onChange={(v) => update('securityRequirements', v)}
        placeholder="List any mandatory security certifications or authentication standards"
        rows={2}
      />
    </Field>

    {/* Expanded questions (Claude-added) */}
    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>
      Decision Context
      <span style={{ fontSize: '11px', color: '#8a97b3', fontWeight: 500, marginLeft: '8px' }}>
        (expanded discovery)
      </span>
    </h3>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Evaluation Timeline">
        <Select
          value={data.evalTimeline}
          onChange={(v) => update('evalTimeline', v)}
          options={['< 30 days', '30 – 90 days', '3 – 6 months', '6 – 12 months', '12+ months', 'Exploratory']}
        />
      </Field>
      <Field label="Budget Status">
        <Select
          value={data.budgetStatus}
          onChange={(v) => update('budgetStatus', v)}
          options={['Approved', 'In planning', 'Need to build business case', 'No budget identified']}
        />
      </Field>
    </div>

    <Field label="Decision-making process" hint="Who are the decision makers, influencers, and blockers?">
      <TextArea
        value={data.decisionProcess}
        onChange={(v) => update('decisionProcess', v)}
        placeholder="e.g. CFO signs off, IT Security reviews, Controller is champion…"
        rows={3}
      />
    </Field>

    <Field label="Additional Notes — Baseline">
      <TextArea
        value={data.baselineNotes}
        onChange={(v) => update('baselineNotes', v)}
        placeholder="Anything else worth capturing from this section…"
        rows={3}
      />
    </Field>

    <NavButtons onBack={onBack} onNext={onNext} />
  </div>
);

// ---- SECTION 2: Travel & Expense ------------------------------------------
const TravelSection = ({ data, update, onNext, onBack }) => (
  <div>
    <SectionHeader
      sectionNumber="03"
      title="Travel & Expense"
      subtitle="Scope T&E volume, incumbent tools, compliance constraints, and friction points."
    />

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '0 0 16px', fontWeight: 700 }}>Volume & Scope</h3>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
      <Field label="Total Employees">
        <TextInput value={data.totalEmployees} onChange={(v) => update('totalEmployees', v)} placeholder="e.g. 2,500" type="number" />
      </Field>
      <Field label="Active Expense Submitters">
        <TextInput value={data.numSubmitters} onChange={(v) => update('numSubmitters', v)} placeholder="e.g. 800" type="number" />
      </Field>
      <Field label="Reports Submitted / Month">
        <TextInput value={data.reportsPerMonth} onChange={(v) => update('reportsPerMonth', v)} placeholder="e.g. 1,200" type="number" />
      </Field>
    </div>

    <Field label="Countries in Scope (T&E)">
      <MultiSelect
        values={data.travelCountries}
        onChange={(v) => update('travelCountries', v)}
        options={COUNTRY_OPTIONS}
      />
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="GDPR Compliance Required?">
        <YesNo value={data.gdprRequired} onChange={(v) => update('gdprRequired', v)} />
      </Field>
      <Field label="Monthly T&E Spend (USD)">
        <Select
          value={data.monthlySpend}
          onChange={(v) => update('monthlySpend', v)}
          options={['< $100K', '$100K – $500K', '$500K – $2M', '$2M – $10M', '$10M+', 'Unknown']}
        />
      </Field>
    </div>

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Incumbent Tools</h3>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Travel Booking Program">
        <SelectWithOther
          value={data.travelProgram}
          onChange={(v) => update('travelProgram', v)}
          options={TRAVEL_OPTIONS}
          placeholder="Select travel program"
        />
      </Field>
      <Field label="Incumbent T&E / Spend Mgmt System">
        <SelectWithOther
          value={data.incumbentTE}
          onChange={(v) => update('incumbentTE', v)}
          options={SPEND_MGMT_OPTIONS}
          placeholder="Select current system"
        />
      </Field>
    </div>

    <Field label="Contract renewal date for incumbent" hint="Key timing signal">
      <TextInput value={data.renewalDate} onChange={(v) => update('renewalDate', v)} placeholder="e.g. Q2 2027" />
    </Field>

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Process & Policy</h3>

    <Field label="Challenges with current Travel & Expense process" required>
      <TextArea
        value={data.teChallenges}
        onChange={(v) => update('teChallenges', v)}
        placeholder="e.g. Manual receipt capture, slow reimbursement cycle, policy enforcement gaps, no mobile app, poor reporting…"
        rows={4}
      />
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Average reimbursement turnaround">
        <Select
          value={data.reimbursementTurnaround}
          onChange={(v) => update('reimbursementTurnaround', v)}
          options={['< 3 days', '3 – 7 days', '1 – 2 weeks', '2 – 4 weeks', '> 1 month', 'Unknown']}
        />
      </Field>
      <Field label="Corporate card program type">
        <Select
          value={data.corpCardType}
          onChange={(v) => update('corpCardType', v)}
          options={['Individual-pay', 'Company-pay', 'Both', 'No corporate cards', 'Unknown']}
        />
      </Field>
    </div>

    <Field label="Policy compliance approach" hint="How are policy violations caught today?">
      <Select
        value={data.policyCompliance}
        onChange={(v) => update('policyCompliance', v)}
        options={['Manual review by managers', 'Automated flags in incumbent tool', 'Post-audit spot checks', 'No formal enforcement', 'Mixed approach']}
      />
    </Field>

    <Field label="Mobile / receipt capture required?">
      <YesNo value={data.mobileRequired} onChange={(v) => update('mobileRequired', v)} />
    </Field>

    <Field label="VAT / Tax reclaim requirements" hint="Especially relevant for European operations">
      <TextArea
        value={data.vatRequirements}
        onChange={(v) => update('vatRequirements', v)}
        placeholder="Which countries require VAT reclaim? Using a VAT reclaim service?"
        rows={2}
      />
    </Field>

    <Field label="Additional Notes — Travel & Expense">
      <TextArea
        value={data.travelNotes}
        onChange={(v) => update('travelNotes', v)}
        placeholder="Anything else worth capturing from this section…"
        rows={3}
      />
    </Field>

    <NavButtons onBack={onBack} onNext={onNext} />
  </div>
);

// ---- SECTION 3: Accounts Payable ------------------------------------------
const APSection = ({ data, update, onNext, onBack }) => (
  <div>
    <SectionHeader
      sectionNumber="04"
      title="Accounts Payable"
      subtitle="Invoice volume, matching complexity, portal burden, and payment mix."
    />

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '0 0 16px', fontWeight: 700 }}>Invoice Volume & Mix</h3>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Invoices Processed / Month" required>
        <TextInput value={data.invoicesPerMonth} onChange={(v) => update('invoicesPerMonth', v)} placeholder="e.g. 5,000" type="number" />
      </Field>
      <Field label="Annual AP Spend (USD)">
        <Select
          value={data.apSpend}
          onChange={(v) => update('apSpend', v)}
          options={['< $10M', '$10M – $50M', '$50M – $250M', '$250M – $1B', '$1B+', 'Unknown']}
        />
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Invoice intake channels" hint="Where do invoices come from?">
        <MultiSelect
          values={data.invoiceChannels}
          onChange={(v) => update('invoiceChannels', v)}
          options={['Email / PDF', 'Paper / mail', 'Supplier portals', 'EDI', 'E-invoicing (Peppol, etc.)', 'API / direct integration']}
        />
      </Field>
      <Field label="Active supplier count">
        <Select
          value={data.supplierCount}
          onChange={(v) => update('supplierCount', v)}
          options={['< 500', '500 – 2,500', '2,500 – 10,000', '10,000 – 50,000', '50,000+', 'Unknown']}
        />
      </Field>
    </div>

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Portals & Systems</h3>

    <Field label="A/P Portals used to pay invoices" hint="Select all that apply">
      <MultiSelect
        values={data.apPortals}
        onChange={(v) => update('apPortals', v)}
        options={AP_PORTAL_OPTIONS}
      />
    </Field>

    <Field label="Incumbent AP / Spend Mgmt System">
      <SelectWithOther
        value={data.incumbentAP}
        onChange={(v) => update('incumbentAP', v)}
        options={SPEND_MGMT_OPTIONS}
        placeholder="Select current AP system"
      />
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="B2B Card Program in use for AP?">
        <YesNo value={data.apB2bCard} onChange={(v) => update('apB2bCard', v)} />
      </Field>
      <Field label="Virtual card rebate program?" hint="Revenue share on card payments">
        <YesNo value={data.virtualCardRebate} onChange={(v) => update('virtualCardRebate', v)} />
      </Field>
    </div>

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Matching & Approval</h3>

    <Field label="Invoice Matching Criteria" required>
      <Select
        value={data.matchingCriteria}
        onChange={(v) => update('matchingCriteria', v)}
        options={[
          '2-way match (Invoice ↔ PO)',
          '3-way match (Invoice ↔ PO ↔ Receipt)',
          '4-way match (+ inspection)',
          'Mix of 2-way and 3-way',
          'No formal matching',
        ]}
      />
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Field label="Approval workflow levels">
        <Select
          value={data.approvalLevels}
          onChange={(v) => update('approvalLevels', v)}
          options={['1 level', '2 levels', '3 levels', '4+ levels', 'Tiered by amount']}
        />
      </Field>
      <Field label="Avg invoice processing time">
        <Select
          value={data.processingTime}
          onChange={(v) => update('processingTime', v)}
          options={['< 3 days', '3 – 7 days', '1 – 2 weeks', '2 – 4 weeks', '> 1 month', 'Unknown']}
        />
      </Field>
    </div>

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Payment Methods & Fraud</h3>

    <Field label="Current payment method mix" hint="Select all that apply">
      <MultiSelect
        values={data.paymentMethods}
        onChange={(v) => update('paymentMethods', v)}
        options={['ACH', 'Check', 'Wire', 'Virtual Card', 'Physical Card', 'International wire / SWIFT', 'Cross-border payment rails']}
      />
    </Field>

    <Field label="Early-pay / dynamic discounting program?">
      <YesNo value={data.earlyPayProgram} onChange={(v) => update('earlyPayProgram', v)} />
    </Field>

    <Field label="Recent AP fraud incidents or near-misses?" hint="Sensitive — but high-signal for urgency">
      <YesNo value={data.fraudIncidents} onChange={(v) => update('fraudIncidents', v)} />
    </Field>

    <h3 style={{ fontSize: '16px', color: '#1a2b4a', margin: '24px 0 16px', fontWeight: 700 }}>Pain Points</h3>

    <Field label="Challenges with current AP process" required>
      <TextArea
        value={data.apChallenges}
        onChange={(v) => update('apChallenges', v)}
        placeholder="e.g. Manual data entry, high error rates, supplier portal burden, missed early-pay discounts, lack of visibility, audit friction…"
        rows={4}
      />
    </Field>

    <Field label="Top 3 outcomes they want from a new system" hint="Framed in their words">
      <TextArea
        value={data.desiredOutcomes}
        onChange={(v) => update('desiredOutcomes', v)}
        placeholder="1. …&#10;2. …&#10;3. …"
        rows={4}
      />
    </Field>

    <Field label="Additional Notes — Accounts Payable">
      <TextArea
        value={data.apNotes}
        onChange={(v) => update('apNotes', v)}
        placeholder="Anything else worth capturing from this section…"
        rows={3}
      />
    </Field>

    <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review & Submit" />
  </div>
);

// ---- SECTION 4: Review & Submit -------------------------------------------
const ReviewSection = ({ data, update, user, onBack, onSubmit }) => {
  const [exportStatus, setExportStatus] = useState('');

  const handlePdfExport = () => {
    // Use window.print() - clean solution that works in any browser
    const printWindow = window.open('', '_blank');
    const reportHtml = buildPrintableHtml(data, user);
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleJsonExport = () => {
    const payload = {
      metadata: {
        submittedBy: user,
        submittedAt: new Date().toISOString(),
        toolVersion: '1.0',
      },
      discovery: data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery-${(data.companyName || 'untitled').replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSalesforceAttach = () => {
    setExportStatus('attaching');
    setTimeout(() => {
      setExportStatus('success');
      setTimeout(() => setExportStatus(''), 3500);
    }, 1200);
  };

  return (
    <div>
      <SectionHeader
        sectionNumber="05"
        title="Review & Submit"
        subtitle="Review the discovery summary, add final sales notes, and export to Salesforce."
      />

      <SummaryCard data={data} user={user} />

      <div style={{ marginTop: '32px' }}>
        <Field
          label="Additional Sales Notes"
          hint="Capture qualitative context — competitive positioning, next steps, champions, risks."
        >
          <TextArea
            value={data.salesNotes}
            onChange={(v) => update('salesNotes', v)}
            placeholder="e.g. Prospect currently on SAP Concur, contract renews Q3. Champion is AP Director — needs exec sponsorship. Competitor: Coupa. Next step: demo on Thu."
            rows={6}
          />
        </Field>
      </div>

      {/* Export actions */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(0,82,212,0.03) 0%, rgba(111,177,252,0.06) 100%)',
        border: '1px solid #e0e8f7',
        borderRadius: '8px',
      }}>
        <h3 style={{ fontSize: '15px', color: '#1a2b4a', margin: '0 0 4px', fontWeight: 700 }}>
          Export & Submit
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7a99', margin: '0 0 20px' }}>
          Generate a PDF for your Salesforce record or download the raw data.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePdfExport}
            style={{
              padding: '10px 18px',
              background: '#fff',
              color: '#1a2b4a',
              border: '1px solid #d5dcea',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📄 Generate PDF
          </button>
          <button
            onClick={handleJsonExport}
            style={{
              padding: '10px 18px',
              background: '#fff',
              color: '#1a2b4a',
              border: '1px solid #d5dcea',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ⬇ Download JSON
          </button>
          <button
            onClick={handleSalesforceAttach}
            disabled={exportStatus === 'attaching'}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: exportStatus === 'attaching' ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(67,100,247,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: exportStatus === 'attaching' ? 0.7 : 1,
            }}
          >
            {exportStatus === 'attaching' ? '⟳ Attaching…' : '☁ Attach to Salesforce'}
          </button>
        </div>

        {exportStatus === 'success' && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#e6f7ec',
            border: '1px solid #2ecc71',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1a6e3a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ✓ Discovery attached to Salesforce Opportunity · {data.companyName || 'Untitled'} · {new Date().toLocaleString()}
          </div>
        )}
      </div>

      <NavButtons onBack={onBack} onNext={onSubmit} nextLabel="Finish & Reset" />
    </div>
  );
};

// ---- Summary Card (used in review) ----------------------------------------
const SummaryCard = ({ data, user }) => {
  const row = (label, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    let display = value;
    if (typeof value === 'object' && !Array.isArray(value)) {
      display = value.selection === 'Other' && value.other ? value.other : value.selection;
    }
    if (Array.isArray(value)) display = value.join(', ');
    if (!display) return null;
    return (
      <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f0f3fa', fontSize: '13px' }}>
        <div style={{ flex: '0 0 200px', color: '#6b7a99', fontWeight: 500 }}>{label}</div>
        <div style={{ flex: 1, color: '#1a2b4a' }}>{display}</div>
      </div>
    );
  };

  const sectionHeader = (label) => (
    <div style={{
      fontSize: '11px',
      fontWeight: 700,
      color: '#4364F7',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '20px 0 8px',
      borderBottom: '2px solid #4364F7',
      marginBottom: '4px',
    }}>
      {label}
    </div>
  );

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e8f7',
      borderRadius: '8px',
      padding: '24px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#8a97b3', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Submitted by
        </div>
        <div style={{ fontSize: '14px', color: '#1a2b4a', fontWeight: 600 }}>
          {user.name} · {user.email}
        </div>
      </div>

      {sectionHeader('Company')}
      {row('Company', data.companyName)}
      {row('URL', data.companyUrl)}
      {row('Industry', data.industry)}
      {row('Revenue', data.annualRevenue)}
      {row('Employees', data.employeeCount)}
      {row('HQ', data.hqLocation)}
      {(data.contacts || []).filter((c) => c.name || c.title || c.email || c.role).map((c, i) => {
        const parts = [c.name, c.title, c.role, c.email].filter(Boolean);
        return row(`Contact ${i + 1}`, parts.join(' · '));
      })}

      {sectionHeader('Foundation & Systems')}
      {row('Primary ERP', data.erp1)}
      {row('Secondary ERP', data.erp2)}
      {row('ERP Instances', data.erpInstances)}
      {row('Business Segments', data.businessSegments)}
      {row('Migrations', data.currentMigrations)}
      {row('Migration Details', data.migrationsDetails)}
      {row('Countries', data.countriesInScope)}
      {row('Primary Currency', data.primaryCurrency)}
      {row('Multi-entity', data.multiEntity)}
      {row('HR System', data.hrSystem)}
      {row('Banking Partner', data.bankingPartner)}
      {row('B2B Card Program', data.b2bCardProgram)}
      {row('Card Issuer', data.cardIssuer)}
      {row('Other Systems', data.otherSystems)}
      {row('IT Familiarity (API/Flat)', data.itFamiliarity)}
      {row('Security Requirements', data.securityRequirements)}
      {row('Eval Timeline', data.evalTimeline)}
      {row('Budget Status', data.budgetStatus)}
      {row('Decision Process', data.decisionProcess)}
      {row('Notes', data.baselineNotes)}

      {sectionHeader('Travel & Expense')}
      {row('Total Employees', data.totalEmployees)}
      {row('Submitters', data.numSubmitters)}
      {row('Reports / Month', data.reportsPerMonth)}
      {row('Countries (T&E)', data.travelCountries)}
      {row('GDPR', data.gdprRequired)}
      {row('Monthly Spend', data.monthlySpend)}
      {row('Travel Program', data.travelProgram)}
      {row('Incumbent T&E', data.incumbentTE)}
      {row('Renewal Date', data.renewalDate)}
      {row('Challenges', data.teChallenges)}
      {row('Reimbursement Turnaround', data.reimbursementTurnaround)}
      {row('Corp Card Type', data.corpCardType)}
      {row('Policy Compliance', data.policyCompliance)}
      {row('Mobile Required', data.mobileRequired)}
      {row('VAT Requirements', data.vatRequirements)}
      {row('Notes', data.travelNotes)}

      {sectionHeader('Accounts Payable')}
      {row('Invoices / Month', data.invoicesPerMonth)}
      {row('Annual AP Spend', data.apSpend)}
      {row('Invoice Channels', data.invoiceChannels)}
      {row('Supplier Count', data.supplierCount)}
      {row('A/P Portals', data.apPortals)}
      {row('Incumbent AP', data.incumbentAP)}
      {row('B2B Card (AP)', data.apB2bCard)}
      {row('Virtual Card Rebate', data.virtualCardRebate)}
      {row('Matching', data.matchingCriteria)}
      {row('Approval Levels', data.approvalLevels)}
      {row('Processing Time', data.processingTime)}
      {row('Payment Methods', data.paymentMethods)}
      {row('Early-Pay Program', data.earlyPayProgram)}
      {row('Fraud Incidents', data.fraudIncidents)}
      {row('Challenges', data.apChallenges)}
      {row('Desired Outcomes', data.desiredOutcomes)}
      {row('Notes', data.apNotes)}
    </div>
  );
};

// ---- Printable HTML builder (for PDF export) ------------------------------
const buildPrintableHtml = (data, user) => {
  const fmt = (v) => {
    if (!v) return '—';
    if (Array.isArray(v)) return v.join(', ') || '—';
    if (typeof v === 'object') return v.selection === 'Other' && v.other ? v.other : (v.selection || '—');
    return v;
  };

  const row = (label, value) => {
    const v = fmt(value);
    if (v === '—') return '';
    return `<tr><td style="padding:6px 12px 6px 0;color:#6b7a99;font-size:12px;vertical-align:top;width:200px;">${label}</td><td style="padding:6px 0;color:#1a2b4a;font-size:12px;">${String(v).replace(/\n/g, '<br>')}</td></tr>`;
  };

  return `<!DOCTYPE html>
<html>
<head>
<title>Discovery Report — ${data.companyName || 'Untitled'}</title>
<style>
  @page { margin: 0.6in; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a2b4a; line-height: 1.4; }
  .hdr { background: linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%); color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
  .hdr h1 { margin: 0 0 4px; font-size: 24px; }
  .hdr p { margin: 0; font-size: 13px; opacity: 0.9; }
  .section-title { color: #4364F7; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 2px solid #4364F7; padding: 20px 0 6px; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  .notes-box { background: #f7f9fd; border-left: 3px solid #4364F7; padding: 12px 16px; margin-top: 8px; font-size: 12px; white-space: pre-wrap; }
</style>
</head>
<body>
  <div class="hdr">
    <h1>${data.companyName || 'Untitled Discovery'}</h1>
    <p>${data.industry || ''} · Submitted by ${user.name} (${user.email}) on ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="section-title">Company</div>
  <table>
    ${row('Company', data.companyName)}
    ${row('URL', data.companyUrl)}
    ${row('Industry', data.industry)}
    ${row('Revenue', data.annualRevenue)}
    ${row('Employees', data.employeeCount)}
    ${row('HQ', data.hqLocation)}
    ${(data.contacts || []).filter((c) => c.name || c.title || c.email || c.role).map((c, i) => {
      const parts = [c.name, c.title, c.role, c.email].filter(Boolean).join(' · ');
      return row(`Contact ${i + 1}`, parts);
    }).join('')}
  </table>

  <div class="section-title">Foundation & Systems</div>
  <table>
    ${row('Primary ERP', data.erp1)}
    ${row('Secondary ERP', data.erp2)}
    ${row('ERP Instances', data.erpInstances)}
    ${row('Business Segments', data.businessSegments)}
    ${row('Migrations', data.currentMigrations)}
    ${row('Migration Details', data.migrationsDetails)}
    ${row('Countries', data.countriesInScope)}
    ${row('Primary Currency', data.primaryCurrency)}
    ${row('Multi-entity', data.multiEntity)}
    ${row('HR System', data.hrSystem)}
    ${row('Banking Partner', data.bankingPartner)}
    ${row('B2B Card Program', data.b2bCardProgram)}
    ${row('Card Issuer', data.cardIssuer)}
    ${row('Other Systems', data.otherSystems)}
    ${row('IT Familiarity', data.itFamiliarity)}
    ${row('Security', data.securityRequirements)}
    ${row('Eval Timeline', data.evalTimeline)}
    ${row('Budget Status', data.budgetStatus)}
    ${row('Decision Process', data.decisionProcess)}
    ${row('Notes', data.baselineNotes)}
  </table>

  <div class="section-title">Travel & Expense</div>
  <table>
    ${row('Total Employees', data.totalEmployees)}
    ${row('Submitters', data.numSubmitters)}
    ${row('Reports / Month', data.reportsPerMonth)}
    ${row('Countries', data.travelCountries)}
    ${row('GDPR', data.gdprRequired)}
    ${row('Monthly Spend', data.monthlySpend)}
    ${row('Travel Program', data.travelProgram)}
    ${row('Incumbent T&E', data.incumbentTE)}
    ${row('Renewal Date', data.renewalDate)}
    ${row('Challenges', data.teChallenges)}
    ${row('Turnaround', data.reimbursementTurnaround)}
    ${row('Corp Card', data.corpCardType)}
    ${row('Policy Compliance', data.policyCompliance)}
    ${row('Mobile Required', data.mobileRequired)}
    ${row('VAT', data.vatRequirements)}
    ${row('Notes', data.travelNotes)}
  </table>

  <div class="section-title">Accounts Payable</div>
  <table>
    ${row('Invoices / Month', data.invoicesPerMonth)}
    ${row('AP Spend', data.apSpend)}
    ${row('Intake Channels', data.invoiceChannels)}
    ${row('Supplier Count', data.supplierCount)}
    ${row('A/P Portals', data.apPortals)}
    ${row('Incumbent AP', data.incumbentAP)}
    ${row('B2B Card (AP)', data.apB2bCard)}
    ${row('Virtual Card Rebate', data.virtualCardRebate)}
    ${row('Matching', data.matchingCriteria)}
    ${row('Approval Levels', data.approvalLevels)}
    ${row('Processing Time', data.processingTime)}
    ${row('Payment Methods', data.paymentMethods)}
    ${row('Early-Pay', data.earlyPayProgram)}
    ${row('Fraud Incidents', data.fraudIncidents)}
    ${row('Challenges', data.apChallenges)}
    ${row('Desired Outcomes', data.desiredOutcomes)}
    ${row('Notes', data.apNotes)}
  </table>

  ${data.salesNotes ? `
    <div class="section-title">Additional Sales Notes</div>
    <div class="notes-box">${data.salesNotes}</div>
  ` : ''}
</body>
</html>`;
};

// ---- Main App -------------------------------------------------------------
const emptyData = {
  // Company
  companyName: '', companyUrl: '', industry: '', annualRevenue: '',
  employeeCount: '', hqLocation: '',
  contacts: [],
  // Baseline
  erp1: { selection: '', other: '' }, erp2: { selection: '', other: '' },
  erpInstances: '', businessSegments: '',
  currentMigrations: '', migrationsDetails: '',
  countriesInScope: [], primaryCurrency: '', multiEntity: '',
  hrSystem: { selection: '', other: '' },
  bankingPartner: { selection: '', other: '' },
  b2bCardProgram: '', cardIssuer: '',
  otherSystems: '', itFamiliarity: '', securityRequirements: '',
  evalTimeline: '', budgetStatus: '', decisionProcess: '',
  baselineNotes: '',
  // Travel
  totalEmployees: '', numSubmitters: '', reportsPerMonth: '',
  travelCountries: [], gdprRequired: '', monthlySpend: '',
  travelProgram: { selection: '', other: '' },
  incumbentTE: { selection: '', other: '' },
  renewalDate: '', teChallenges: '',
  reimbursementTurnaround: '', corpCardType: '', policyCompliance: '',
  mobileRequired: '', vatRequirements: '', travelNotes: '',
  // AP
  invoicesPerMonth: '', apSpend: '', invoiceChannels: [], supplierCount: '',
  apPortals: [],
  incumbentAP: { selection: '', other: '' },
  apB2bCard: '', virtualCardRebate: '',
  matchingCriteria: '', approvalLevels: '', processingTime: '',
  paymentMethods: [], earlyPayProgram: '', fraudIncidents: '',
  apChallenges: '', desiredOutcomes: '', apNotes: '',
  // Review
  salesNotes: '',
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentSection, setCurrentSection] = useState('welcome');
  const [data, setData] = useState(emptyData);

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const hasFilledContact = (data.contacts || []).some(
    (c) => c && (c.name || c.title || c.email || c.role)
  );

  const completionMap = {
    welcome: true, // informational only
    company: Boolean(data.companyName && data.industry && hasFilledContact),
    baseline: Boolean(data.erp1?.selection && data.countriesInScope?.length > 0),
    travel: Boolean(data.totalEmployees && data.teChallenges),
    ap: Boolean(data.invoicesPerMonth && data.matchingCriteria && data.apChallenges),
    review: false,
  };

  const go = (section) => {
    setCurrentSection(section);
    // Scroll content area to top
    const main = document.getElementById('discovery-main');
    if (main) main.scrollTop = 0;
  };

  const handleReset = () => {
    if (window.confirm('Reset the discovery? This will clear all entered data.')) {
      setData(emptyData);
      setCurrentSection('welcome');
    }
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f4f6fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a2b4a',
    }}>
      <Sidebar
        currentSection={currentSection}
        onNavigate={go}
        user={user}
        completionMap={completionMap}
        onLogout={() => { setUser(null); setData(emptyData); setCurrentSection('welcome'); }}
      />

      <div id="discovery-main" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 48px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          }}>
            {currentSection === 'welcome' && (
              <WelcomeSection user={user} onNext={() => go('company')} />
            )}
            {currentSection === 'company' && (
              <CompanySection data={data} update={update} onBack={() => go('welcome')} onNext={() => go('baseline')} />
            )}
            {currentSection === 'baseline' && (
              <BaselineSection data={data} update={update} onBack={() => go('company')} onNext={() => go('travel')} />
            )}
            {currentSection === 'travel' && (
              <TravelSection data={data} update={update} onBack={() => go('baseline')} onNext={() => go('ap')} />
            )}
            {currentSection === 'ap' && (
              <APSection data={data} update={update} onBack={() => go('travel')} onNext={() => go('review')} />
            )}
            {currentSection === 'review' && (
              <ReviewSection data={data} update={update} user={user} onBack={() => go('ap')} onSubmit={handleReset} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}