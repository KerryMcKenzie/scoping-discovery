// Site-wide password protection (runs on Netlify's servers, never in the browser).
//
// Every request is checked here BEFORE any page or file is sent. Visitors see the
// browser's built-in login box. The password lives only in a Netlify environment
// variable, so it never appears in this repo or in the files the browser downloads.
//
// Setup in Netlify: Site configuration → Environment variables → add
//   SITE_PASSWORD_2 = the password you give to people  (required)
//   SITE_USERNAME  = a username, e.g. "demo"            (optional; if unset, any username works)
// Make sure the variable's scopes include "Functions", then redeploy.

/* global Netlify */ // provided by Netlify's edge runtime

const REALM = 'Scoping & Discovery Tool';

// Compare two strings without leaking timing information about how much matched.
const safeEqual = async (a, b) => {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
};

const askForPassword = () =>
  new Response('Password required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
    },
  });

export default async (request, context) => {
  const expectedPassword = Netlify.env.get('SITE_PASSWORD_2');
  const expectedUser = Netlify.env.get('SITE_USERNAME');

  // Fail closed: if the password isn't configured, nobody gets in.
  if (!expectedPassword) {
    return new Response('Site password is not configured.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return askForPassword();

  let decoded;
  try {
    // Browser sends "username:password" encoded in base64
    decoded = new TextDecoder().decode(
      Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)),
    );
  } catch {
    return askForPassword();
  }

  const sep = decoded.indexOf(':');
  const user = sep >= 0 ? decoded.slice(0, sep) : '';
  const pass = sep >= 0 ? decoded.slice(sep + 1) : decoded;

  const passOk = await safeEqual(pass, expectedPassword);
  const userOk = expectedUser ? await safeEqual(user, expectedUser) : true;

  if (passOk && userOk) return context.next(); // correct → serve the site as normal
  return askForPassword();
};

// Protect every path on the site.
export const config = { path: '/*' };
