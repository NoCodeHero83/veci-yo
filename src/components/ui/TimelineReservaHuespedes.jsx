import theme from '../../config/theme';

// Línea de tiempo HORIZONTAL tipo "delivery" para la Card de Reserva.
// Una sola fila de íconos (referencia visual) sobre la primera línea de puntos;
// cada huésped tiene su propia línea horizontal de puntos con su estado.
// Reutiliza los íconos y la lógica de estados existentes (no se altera la lógica).
const STEPS = [
  { key: 'preregistroEnviado', icon: '🔗' },
  { key: 'documentacionCompleta', icon: '📄' },
  { key: 'terminosAceptados', icon: '📝' },
  { key: 'verificacionPasada', icon: '🛡️' },
  { key: 'trasideEntrada', icon: '🟢' },
  { key: 'trasideSalida', icon: '🔴' },
];

function stepStatus(t, key) {
  if (key === 'terminosAceptados') {
    if (t.terminosAceptados === true) return t.terminosAprobadoPor === 'anfitrion' ? 'aprobado-manual' : true;
    if (t.terminosAceptados === false) return false;
    return null;
  }
  if (key === 'verificacionPasada') {
    if (t.verificacionAprobada === true) return 'aprobada';
    return !!t[key];
  }
  return !!t[key];
}

export default function TimelineReservaHuespedes({ invitados = [] }) {
  if (!invitados.length) return null;

  return (
    <div>
      {/* Íconos referenciales: una sola vez, sobre la primera línea de puntos */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {STEPS.map(s => (
          <div key={s.key} style={{ flex: 1, textAlign: 'center', fontSize: '14px', lineHeight: 1 }}>
            {s.icon}
          </div>
        ))}
      </div>

      {invitados.map((inv, idx) => {
        const t = inv.timeline || {};
        return (
          <div key={idx} style={{ marginTop: idx === 0 ? 0 : '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontWeight: theme.fonts.weights.medium, fontSize: theme.fonts.sizes.xs, color: theme.colors.text }}>{inv.nombre}</span>
              {inv.esMenor && (
                <span style={{ fontSize: theme.fonts.sizes['2xs'], fontWeight: theme.fonts.weights.bold, color: '#92400E', background: '#FEF3C7', padding: '2px 7px', borderRadius: theme.radius.full, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  👶 Menor
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {STEPS.map(s => {
                const st = stepStatus(t, s.key);
                const isCompleted = st === true || st === 'aprobado-manual' || st === 'aprobada';
                const isSpecial = st === 'aprobado-manual';
                return (
                  <div key={s.key} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isCompleted ? (isSpecial ? theme.colors.secondary : theme.colors.success) : theme.colors.border,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
