import React from 'react';
import { FeatureIcon } from './LandingCore';

export const SocialProofSection = ({ T }) => (
  <section style={{ padding: '70px 0' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span style={{ display: 'inline-block', background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.3)', color: '#a3e635', padding: '5px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px' }}>{T.socialProofBadge}</span>
        <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--padel-text)', margin: '16px 0 6px' }}>{T.socialProofTitle}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', flexWrap: 'wrap', marginTop: '22px' }}>
          {T.socialMetrics.map(([n, l], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--padel-lime)' }}>{n}</div>
              <div style={{ fontSize: '12px', color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {T.testimonials.map((t, i) => (
          <div key={i} style={{ background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ fontSize: '30px', lineHeight: 1, marginBottom: '10px', color: 'var(--padel-lime)' }}>“</div>
            <p style={{ fontSize: '14px', color: 'var(--padel-text)', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 14px' }}>{t.quote}</p>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--padel-lime)' }}>{t.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--padel-muted)' }}>{t.role}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const FeaturesSection = ({ T }) => (
  <section style={{ padding: '80px 0' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.featuresTitle}</h2>
      <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '44px' }}>{T.featuresSubtitle}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {T.features.map((f, i) => (
          <div key={i} style={{ background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '26px', cursor: 'help' }} title={f.tooltip}>
            <div style={{ fontSize: '32px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {FeatureIcon({ name: f.icon, size: 36, color: 'var(--padel-lime)' })}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--padel-text)', marginBottom: '8px' }}>{f.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--padel-muted)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
