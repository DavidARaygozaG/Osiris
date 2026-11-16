'use client';

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--color-base-100)',
        color: 'var(--color-base-content)',
      }}
    >
      <span style={{ fontSize: '4rem' }}>📡</span>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Sin conexión</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-content)', margin: 0, maxWidth: 280 }}>
        No hay internet. Los datos que captures se guardarán y se sincronizarán en cuanto vuelva la señal.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 2rem',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.9rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
