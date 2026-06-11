import { useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import StatusTabs from '../../components/ui/StatusTabs';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import { estadosReclamo } from '../../data/mockData';

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

export default function ReclamoDetallePage() {
  const { id } = useParams();
  const { reclamos, actualizarEstadoReclamo } = useApp();
  const reclamo = reclamos.find(r => String(r.id) === id);

  if (!reclamo) {
    return (
      <AppShell>
        <PageHeader title="Reclamo" />
        <div style={{ padding: '16px', textAlign: 'center', color: theme.colors.textSecondary }}>
          No se encontró el reclamo.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title={`Reclamo N°: ${reclamo.numero}`} />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '10px' }}>
            Reclamo
          </div>

          <div style={labelStyle}>Título</div>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, marginTop: 0, marginBottom: '16px' }}>
            {reclamo.titulo}
          </p>

          <div style={labelStyle}>Descripción:</div>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, marginTop: 0, whiteSpace: 'pre-line' }}>
            {reclamo.descripcion}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textDecoration: 'underline' }}>
            ESTADO ▾
          </span>
          <StatusTabs
            tabs={estadosReclamo}
            active={reclamo.estado}
            onChange={estado => estado && actualizarEstadoReclamo(reclamo.id, estado)}
            centered
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
          <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{reclamo.fechaCreacion}</span>
          <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{reclamo.fechaRevision}</span>
        </div>
      </div>
    </AppShell>
  );
}
