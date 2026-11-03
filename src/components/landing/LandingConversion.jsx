import React from 'react';

export const RoiSection = ({ T, roi, setRoi, roiTotal, onDemo }) => (
  <section style={{ padding: '70px 0', background: 'var(--padel-card-bg)', borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.roiTitle}</h2>
      <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>{T.roiSubtitle}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--padel-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '24px' }}>
          {['courts', 'events', 'price'].map((key) => {
            const min = key === 'courts' ? 1 : key === 'events' ? 0 : 5;
            const max = key === 'courts' ? 20 : key === 'events' ? 30 : 50;
            return (
              <div key={key} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--padel-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  <span>{T.roiInputs[key]}</span>
                  <span style={{ color: 'var(--padel-lime)', fontWeight: 800 }}>{key === 'price' ? `${roi[key]} €` : roi[key]}</span>
                </label>
                <input type="range" min={min} max={max} value={roi[key]} onChange={(e) => setRoi({ ...roi, [key]: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--padel-emerald)' }} />
              </div>
            );
          })}
        </div>
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid var(--padel-emerald)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--padel-muted)', fontWeight: 600, marginBottom: '8px' }}>{T.roiOutput}</div>
          <div style={{ fontSize: '52px', fontWeight: 900, color: 'var(--padel-lime)', lineHeight: 1.1 }}>{roiTotal} €<span style={{ fontSize: '18px' }}>/mes</span></div>
          <div style={{ fontSize: '13px', color: 'var(--padel-text)', marginTop: '10px' }}>{T.roiOutputSub}</div>
          <button onClick={onDemo} style={{ background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-emerald-dark))', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginTop: '18px' }}>
            {T.ctaDemoStrong}
          </button>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--padel-muted)', textAlign: 'center', marginTop: '16px' }}>{T.roiGrace}</p>
    </div>
  </section>
);

export const EcosystemSection = ({ T }) => (
  <section style={{ padding: '70px 0' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.ecosystemTitle}</h2>
      <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '40px' }}>{T.ecosystemSubtitle}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
        {T.ecosystem.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ fontSize: '28px', lineHeight: 1 }}>{e.icon}</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 6px' }}>{e.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--padel-muted)', lineHeight: 1.55, margin: 0 }}>{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const AudienceSection = ({ T }) => (
  <section style={{ padding: '80px 0', background: 'var(--padel-card-bg)', borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.audienceTitle}</h2>
      <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '36px' }}>{T.audienceSubtitle}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '40px' }}>
        {T.audience.map((a, i) => (
          <div key={i} style={{ background: 'var(--padel-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '34px', marginBottom: '12px' }}>{a.icon}</div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 6px' }}>{a.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--padel-muted)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', maxWidth: '980px', margin: '0 auto' }}>
        <img src="/images/padel-perfil-clientes.png" alt={T.audienceTitle} style={{ width: '100%', display: 'block' }} loading="lazy" />
      </div>
    </div>
  </section>
);

export const ComparisonSection = ({ T }) => (
  <section style={{ padding: '70px 0', background: 'var(--padel-card-bg)', borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '36px' }}>
        {T.comparisonTitle}
        {T.comparisonScore && (
          <span style={{ display: 'inline-block', marginLeft: '14px', verticalAlign: 'middle', background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-lime))', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '20px' }}>
            🏆 {T.comparisonScore}
          </span>
        )}
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
          <thead>
            <tr>
              {T.comparisonCols.map((c, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '14px', fontSize: '13px', fontWeight: 800, color: 'var(--padel-lime)', borderBottom: '1px solid var(--padel-border)', background: 'rgba(16,185,129,0.06)' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {T.comparison.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--padel-border)' }}>
                <td style={{ padding: '14px', fontSize: '14px', fontWeight: 600, color: 'var(--padel-text)' }}>{row[0]}</td>
                {row.slice(1).map((cell, j) => (
                  <td key={j} style={{ padding: '14px', fontSize: '14px', color: cell === '✓' ? '#34d399' : cell === '✗' ? '#f87171' : 'var(--padel-muted)', fontWeight: 800, textAlign: 'center' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export const PricingSection = ({ T, onBuyPro, onBuyClub, onBuyFree }) => (
  <section style={{ padding: '80px 0' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.pricingTitle}</h2>
      <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '44px' }}>{T.pricingSubtitle}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {T.pricing.map((p, i) => (
          <div key={i} style={{ background: i === 1 ? 'rgba(16,185,129,0.08)' : 'var(--padel-card-bg)', border: i === 1 ? '2px solid var(--padel-emerald)' : '1px solid var(--padel-border)', borderRadius: '16px', padding: '28px', position: 'relative' }}>
            {i === 1 && (
              <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-lime))', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '12px' }}>★</span>
            )}
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--padel-text)', marginBottom: '10px' }}>{p.name}</h3>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-lime)' }}>{p.price}</span>
              <span style={{ fontSize: '14px', color: 'var(--padel-muted)' }}>{p.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {p.features.map((f, j) => (
                <li key={j} style={{ fontSize: '14px', color: 'var(--padel-muted)', padding: '6px 0', borderBottom: '1px dashed var(--padel-border)' }}>✓ {f}</li>
              ))}
            </ul>
            <button onClick={() => (i === 1 ? onBuyPro() : i === 2 ? onBuyClub() : onBuyFree())} style={{ marginTop: '18px', width: '100%', padding: '12px', borderRadius: '10px', border: i === 1 ? 'none' : '1px solid var(--padel-border)', background: i === 1 ? 'linear-gradient(135deg, var(--padel-emerald), #059669)' : 'var(--padel-card-bg)', color: i === 1 ? '#fff' : 'var(--padel-text)', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
              {i === 1 ? 'Probar 90 días gratis' : i === 2 ? 'Ver reservas' : 'Empezar gratis'}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
