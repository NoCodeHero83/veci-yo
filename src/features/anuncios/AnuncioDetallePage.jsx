import { useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import { anuncios } from '../../data/mockData';

const cardStyle = {
  background: theme.colors.bgCard,
  borderRadius: theme.radius.xl,
  boxShadow: theme.shadows.card,
  padding: '16px',
};

const labelStyle = {
  fontSize: theme.fonts.sizes.sm,
  fontWeight: theme.fonts.weights.bold,
  color: theme.colors.text,
  textDecoration: 'underline',
  marginBottom: '6px',
};

const pillStyle = {
  background: theme.colors.bgMuted,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.full,
  padding: '6px 4px',
  fontSize: theme.fonts.sizes['2xs'],
  fontWeight: theme.fonts.weights.semibold,
  color: theme.colors.text,
  textAlign: 'center',
};

export default function AnuncioDetallePage() {
  const { id } = useParams();
  const { addToast } = useApp();
  const anuncio = anuncios.find(a => String(a.id) === id);

  if (!anuncio) {
    return (
      <AppShell>
        <PageHeader title="Anuncio" />
        <div style={{ padding: '16px', textAlign: 'center', color: theme.colors.textSecondary }}>
          No se encontró el anuncio.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`Anuncio N°: ${anuncio.id}`}
        action={
          <button
            type="button"
            onClick={() => addToast('Funcionalidad en desarrollo')}
            aria-label="Enviar por correo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: theme.colors.bgMuted,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.text,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </button>
        }
      />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.bold, color: theme.colors.text }}>Fecha publicada</div>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{anuncio.fechaPublicada}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.bold, color: theme.colors.text }}>Fecha Finalización</div>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{anuncio.fechaFinalizacion}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div style={labelStyle}>Titulo:</div>
            <p style={{ fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, margin: 0 }}>
              {anuncio.titulo}
            </p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div style={labelStyle}>Descripción:</div>
            <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, margin: 0 }}>
              {anuncio.descripcion}
            </p>
          </div>

          <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{anuncio.categoria}</span>
        </div>

        {anuncio.votacion && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginTop: 0, marginBottom: '14px' }}>
              Porcentaje de avance
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ flex: 1, height: '18px', borderRadius: theme.radius.full, background: theme.colors.secondaryLight, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${anuncio.progreso}%`, borderRadius: theme.radius.full, background: theme.colors.secondary, display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                  <span style={{ fontSize: theme.fonts.sizes['2xs'], fontWeight: theme.fonts.weights.bold, color: '#fff', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                    Progreso
                  </span>
                </div>
              </div>
              <span style={{ fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.semibold, color: theme.colors.text, flexShrink: 0 }}>
                {anuncio.progreso}%
              </span>
            </div>
            <div style={{ textAlign: 'right', fontSize: theme.fonts.sizes.sm, color: theme.colors.text, marginBottom: '16px' }}>
              {anuncio.umbral}% <span style={{ textDecoration: 'underline', fontWeight: theme.fonts.weights.bold }}>Umbral</span>
            </div>

            <h3 style={{ fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginTop: 0, marginBottom: '12px' }}>
              Votar
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <Button variant="primary" fullWidth onClick={() => addToast('Voto "Sí" registrado')} style={{ background: theme.colors.success, color: '#fff' }}>
                Sí
              </Button>
              <Button variant="danger" fullWidth onClick={() => addToast('Voto "No" registrado')}>
                No
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: theme.colors.border }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {anuncio.votosSi.map((apto, i) => (
                  <span key={`si-${apto}-${i}`} style={pillStyle}>{apto}</span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {anuncio.votosNo.map((apto, i) => (
                  <span key={`no-${apto}-${i}`} style={pillStyle}>{apto}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: '24px' }} />
      </div>
    </AppShell>
  );
}
