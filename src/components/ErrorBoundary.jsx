import React from 'react';

const TEXTS = {
  es: { title: 'Algo no cargó correctamente', hint: 'Recarga la página o vuelve a intentarlo.', retry: 'Reintentar' },
  en: { title: 'Something failed to load', hint: 'Reload the page or try again.', retry: 'Retry' },
  fr: { title: 'Une erreur est survenue', hint: 'Rechargez la page ou réessayez.', retry: 'Réessayer' },
  pt: { title: 'Algo não carregou corretamente', hint: 'Recarregue a página ou tente novamente.', retry: 'Tentar novamente' },
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const lang = this.props.lang || 'es';
      const T = TEXTS[lang] || TEXTS.es;
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12, textAlign: 'center', padding: 32,
          color: 'var(--padel-muted)', fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--padel-text)' }}>{T.title}</div>
          <div style={{ fontSize: 14 }}>{T.hint}</div>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'var(--padel-emerald)', color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {T.retry}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}