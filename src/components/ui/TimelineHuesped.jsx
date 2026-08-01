import theme from '../../config/theme';

const STEPS = [
  { key: 'preregistroEnviado', label: 'Link de preregistro enviado', icon: '🔗' },
  { key: 'documentacionCompleta', label: 'Documentación completada', icon: '📄' },
  { key: 'terminosAceptados', label: 'Términos y Condiciones aceptados', icon: '📝' },
  { key: 'verificacionPasada', label: 'Verificación superada', icon: '🛡️' },
  { key: 'trasideEntrada', label: 'Ingreso al edificio (TRA/SIRE entrada)', icon: '🟢' },
  { key: 'trasideSalida', label: 'Salida del edificio (TRA/SIRE salida)', icon: '🔴' },
];

// Línea de tiempo vertical tipo "delivery" (Rappi) para un huésped.
// Reutiliza la misma lógica de estados e íconos que la Card del Huésped.
export default function TimelineHuesped({ timeline = {}, compact = false }) {
  const t = timeline || {};

  const stepStatus = (key) => {
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
  };

  return (
    <div>
      {STEPS.map((step, i) => {
        const st = stepStatus(step.key);
        const isCompleted = st === true || st === 'aprobado-manual' || st === 'aprobada';
        const isRejected = st === false && step.key === 'terminosAceptados';
        const icon = isCompleted ? '✅' : (isRejected ? '❌' : '⏳');
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'stretch', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    width: '2px',
                    background: isCompleted ? theme.colors.success : theme.colors.borderLight,
                    margin: '2px 0',
                  }}
                />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: isLast ? 0 : '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isCompleted
                    ? (st === 'aprobado-manual' ? theme.colors.secondary : theme.colors.success)
                    : theme.colors.border,
                  flexShrink: 0,
                }}
              />
              {!compact && (
                <span
                  style={{
                    fontSize: theme.fonts.sizes.xs,
                    color: isCompleted ? theme.colors.text : theme.colors.textSecondary,
                  }}
                >
                  {step.label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
