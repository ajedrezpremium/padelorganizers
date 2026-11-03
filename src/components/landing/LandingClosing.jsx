import React from 'react';
import LogoPadel from '../LogoPadel';
import NewsletterSignup from '../NewsletterSignup';

const socialIcon = (hover) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: 'rgba(16,185,129,0.08)',
  border: '1px solid var(--padel-border)',
  color: 'var(--padel-lime)',
  opacity: 0.9,
  transition: 'opacity 0.2s, background 0.2s',
});

export const CtaFinalSection = ({ T, onDemo }) => (
  <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, rgba(234,179,8,0.14) 0%, rgba(16,185,129,0.12) 100%)', borderTop: '1px solid var(--padel-border)' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <LogoPadel size={52} tagline="COURTMANAGER® AI" />
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--padel-text)', marginBottom: '12px' }}>{T.ctaSectionTitle}</h2>
      <p style={{ fontSize: '16px', color: 'var(--padel-muted)', maxWidth: '560px', margin: '0 auto 28px' }}>{T.ctaSectionDesc}</p>
      <button onClick={onDemo} className="pulse-glow" style={{ background: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)', color: '#fff', border: 'none', padding: '16px 34px', borderRadius: '12px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,179,8,0.35)' }}>
        {T.ctaDemoStrong}
      </button>
      <p style={{ fontSize: '13px', color: 'var(--padel-muted)', marginTop: '14px', fontWeight: 600 }}>{T.ctaDemoSub}</p>
    </div>
  </section>
);

export const LandingFooter = ({ T, lang }) => (
  <footer style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--padel-muted)', borderTop: '1px solid var(--padel-border)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto 24px' }}>
      <NewsletterSignup lang={lang} variant="card" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
      <a href="https://www.instagram.com/padelorganizers/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style={socialIcon('#E1306C')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>
      <a href="https://www.linkedin.com/in/padel-organizers-pro-77bb0442a/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" style={socialIcon('#0A66C2')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2.5A6 6 0 0 1 16 8z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
        </svg>
      </a>
    </div>
    <div style={{ fontSize: 13, fontWeight: 600 }}>
      © 2026 {T.footer} ·{' '}
      <a href="/legal" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Aviso legal / Cookies</a>
    </div>
  </footer>
);
