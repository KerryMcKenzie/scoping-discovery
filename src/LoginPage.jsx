import { useState, useEffect } from 'react';
import { Field, TextInput } from './ui.jsx';
import { BRAND_BLUE } from './theme.js';
import { login } from './auth.js';

// ---- Legal content (Privacy Policy / Terms of Use) --------------------------
const LEGAL_UPDATED = 'November 6, 2026';

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Demo environment',
        body: 'This Discovery Tool is a demonstration application. It is provided for testing and evaluation purposes only.',
      },
      {
        heading: 'No personal information is collected or stored',
        body: 'We do not capture, save, or transmit any Personally Identifiable Information (PII), such as your name or email address. Anything you type into this site stays in your browser only while the page is open and is cleared when you sign out, refresh, or close the tab. Nothing is sent to a server, database, or third party.',
      },
      {
        heading: 'Use test details only',
        body: 'Please do not enter real personal or company information. For demo testing, sign in with:',
        demo: true,
      },
      {
        heading: 'Cookies and tracking',
        body: 'This site does not use cookies, analytics, or tracking technologies.',
      },
      {
        heading: 'Exports',
        body: 'If you export a PDF or JSON file, it is created locally in your browser and saved only to your own device.',
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    sections: [
      {
        heading: 'Demo purposes only',
        body: 'This Discovery Tool is a demonstration application for testing and evaluation. It is not a production service.',
      },
      {
        heading: 'Provided "as is"',
        body: 'The site is provided "as is" without warranties of any kind. Features such as SSO sign-in and Salesforce attachment are simulated and do not connect to real systems.',
      },
      {
        heading: 'Acceptable use',
        body: 'Use only fictional or test data. Do not enter confidential, sensitive, or personal information.',
      },
      {
        heading: 'No liability',
        body: 'We are not liable for any loss or damage arising from your use of this demo, including any decisions made based on its output.',
      },
      {
        heading: 'Changes',
        body: 'These terms may be updated at any time. Continued use of the site means you accept the current version.',
      },
    ],
  },
};

const LegalModal = ({ type, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const content = LEGAL_CONTENT[type];
  if (!content) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,31,74,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 100,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '28px 28px 24px',
          boxShadow: '0 20px 60px rgba(26,43,74,0.25)',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h2 id="legal-title" style={{ fontSize: '19px', fontWeight: 700, color: '#1a2b4a', margin: 0 }}>
            {content.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              lineHeight: 1,
              color: '#8a97b3',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#8a97b3', margin: '0 0 18px' }}>
          Last updated {LEGAL_UPDATED}
        </p>

        {content.sections.map((s) => (
          <div key={s.heading} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a2b4a', margin: '0 0 4px' }}>
              {s.heading}
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#4a5878', margin: 0 }}>
              {s.body}
            </p>
            {s.demo && (
              <div style={{
                marginTop: '8px',
                background: '#f4f6fb',
                border: '1px solid #e0e8f7',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#1a2b4a',
              }}>
                <div><strong>Email:</strong> test@company.com</div>
                <div><strong>Password:</strong>12345</div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '10px',
            background: BRAND_BLUE,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const legalLinkStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: '#4364F7',
  fontSize: '12px',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontFamily: 'inherit',
};

// Turn "test@company.com" into "User Test" for greetings and reports
const nameFromEmail = (email) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

// ---- Login Page -----------------------------------------------------------
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [legal, setLegal] = useState(null); // 'privacy' | 'terms' | null
  const canSubmit = username.trim().length >= 1 && password.length > 0;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    const u = username.trim();
    // The user name and password are checked on Netlify's server (never in the browser)
    const result = await login(u, password);
    if (!result.ok) {
      setLoading(false);
      setPassword('');
      setError(result.error);
      return;
    }
    // "demo" → name "Demo"; "user.test@company.com" → name "User Test" + email
    try {
      await onLogin({ name: nameFromEmail(u), email: u.includes('@') ? u : '' });
    } catch {
      setLoading(false);
      setError('Signed in, but the app could not load. Please refresh and try again.');
    }
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
          { 
            /* -- creates the div box for logo -- 
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: BRAND_BLUE,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 700,
          }}>

          </div> */}
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0c0677',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Scoping{' '}
            <span style={{ color: BRAND_BLUE, fontWeight: 600 }}>&amp;</span>{' '}
            Discovery{' '}
            <span style={{ fontWeight: 400, color: '#4a5878' }}>Tool</span>
          </h1>
          {/* Short accent bar under the title */}
          <div style={{
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            background: BRAND_BLUE,
            margin: '0 auto 20px',
          }} />
          <p style={{ fontSize: '14px', color: '#6b7a99', margin: 0 }}>
            Sign in with the user name and password provided.
          </p>
          <p style={{ fontSize: '14px', color: '#6b7a99', margin: 0 }}>
            {/* This is a simulated SSO login */}
          </p>
        </div>

        {/* A real <form> so pressing Enter signs in */}
        <form onSubmit={handleSubmit}>
          <Field label="User Name" required>
            <TextInput value={username} onChange={setUsername} placeholder="User name" type="text" />
          </Field>

          <Field label="Password" required>
            <TextInput value={password} onChange={setPassword} placeholder="••••••••" type="password" />
          </Field>

          {error && (
            <div role="alert" style={{
              margin: '-4px 0 12px',
              padding: '10px 12px',
              background: '#fdecea',
              border: '1px solid #f5c2bd',
              borderRadius: '6px',
              color: '#a3261b',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              background: canSubmit
                ? '#2E8CFF'
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
            {loading ? 'Authenticating…' : 'Sign in'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #eef1f8',
          fontSize: '12px',
          color: '#8a97b3',
          textAlign: 'center',
        }}>
          Secured by Netlify · Demo Environment
          <div style={{ marginTop: '10px' }}>
            <button type="button" style={legalLinkStyle} onClick={() => setLegal('privacy')}>
              Privacy Policy
            </button>
            <span style={{ margin: '0 8px' }}>·</span>
            <button type="button" style={legalLinkStyle} onClick={() => setLegal('terms')}>
              Terms of Use
            </button>
          </div>
        </div>
      </div>

      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}
    </div>
  );
};
export default LoginPage;
