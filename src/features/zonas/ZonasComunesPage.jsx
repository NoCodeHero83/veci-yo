import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import { ModuloGate, ModuloHeaderInfo } from '../../components/ui/ModuloEstado';
import { zonasComunes } from '../../data/mockData';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import zonaIcons from '../../assets/icons/zonas';

export default function ZonasComunesPage() {
  const navigate = useNavigate();
  const { rolActivo, esResidente } = useApp();
  const accesoBloqueado = rolActivo === 'propietario' && !esResidente;
  const esHuesped = rolActivo === 'huesped-temporal';
  const [reglamentoZona, setReglamentoZona] = useState(null);

  const aceptarReglamento = (id) => {
    try { localStorage.setItem(`reglamento-aceptado-${id}`, '1'); } catch (e) { /* noop */ }
    setReglamentoZona(null);
  };

  return (
    <AppShell>
      {accesoBloqueado ? (
        <div style={{ padding: '16px', textAlign: 'center', color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.base, marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <p>No tienes acceso a Zonas Comunes. Solo los Residentes pueden usar esta función.</p>
        </div>
      ) : (<>
      <PageHeader title="Zonas Comunes" action={<ModuloHeaderInfo helpKey="zonas" />} />
      <ModuloGate helpKey="zonas">
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {zonasComunes.map(zona => {
            const zonaRestringida = esHuesped && zona.restringidaHuesped;
            return (
            <button
              key={zona.id}
              onClick={() => zonaRestringida ? null : navigate(`/zonas-comunes/${zona.id}`)}
              disabled={zonaRestringida}
              style={{
                background: theme.colors.bgCard,
                borderRadius: theme.radius.xl,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                boxShadow: theme.shadows.card,
                cursor: zonaRestringida ? 'not-allowed' : 'pointer',
                fontFamily: theme.fonts.family,
                border: 'none',
                position: 'relative',
                opacity: zonaRestringida ? 0.5 : 1,
                filter: zonaRestringida ? 'grayscale(1)' : 'none',
              }}
            >
              <img
                src={zonaIcons[zona.id]}
                alt={zona.nombre}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span
                style={{
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.semibold,
                  color: theme.colors.text,
                }}
              >
                {zona.nombre}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setReglamentoZona(zona); }}
                style={{
                  fontSize: theme.fonts.sizes['2xs'],
                  color: theme.colors.primary,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: theme.fonts.weights.semibold,
                  textDecoration: 'underline',
                  fontFamily: theme.fonts.family,
                }}
              >
                Reglamento
              </button>
            </button>
          ); })}
        </div>
      </div>
      </ModuloGate>
      </>)}

      <Modal isOpen={!!reglamentoZona} onClose={() => setReglamentoZona(null)} title={`Reglamento — ${reglamentoZona?.nombre || ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: theme.fonts.sizes.sm, color: theme.colors.text, lineHeight: 1.6 }}>
            {reglamentoZona?.reglamento}
          </p>
          <button
            type="button"
            onClick={() => aceptarReglamento(reglamentoZona.id)}
            style={{
              width: '100%', padding: '12px', borderRadius: theme.radius.full,
              background: theme.colors.primary, color: theme.colors.text,
              fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.md,
              border: 'none', cursor: 'pointer', fontFamily: theme.fonts.family,
            }}
          >
            Acepto el reglamento
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
