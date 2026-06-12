import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import InputField from '../../components/ui/InputField';
import Toggle from '../../components/ui/Toggle';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';

const cardStyle = {
  background: theme.colors.bgCard,
  borderRadius: theme.radius.xl,
  boxShadow: theme.shadows.card,
  padding: '16px',
};

const TOGGLES = [
  { key: 'modoDaltonico', label: 'Modo daltónico' },
  { key: 'fuenteAumentada', label: 'Fuente aumentada' },
  { key: 'modoOscuro', label: 'Modo Oscuro' },
];

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CampoBloqueado({ label, value, isLast }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: isLast ? 'none' : `1px solid ${theme.colors.borderLight}` }}>
      <span style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>{label}: {value}</span>
      <LockIcon />
    </div>
  );
}

export default function ConfiguracionPage() {
  const { usuario, configuracionApp, actualizarConfiguracionApp } = useApp();

  const nombre = usuario?.nombre || 'Guillermo';
  const apellido = usuario?.apellido || 'Coradir';
  const documento = '1632278423';

  return (
    <AppShell>
      <PageHeader title="Configuración" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Información Personal */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginBottom: '4px' }}>
            Informacion Personal
          </h3>
          <CampoBloqueado label="Nombre" value={nombre} />
          <CampoBloqueado label="Apellido" value={apellido} />
          <CampoBloqueado label="Documento" value={documento} isLast />
        </div>

        {/* Información Contacto */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginBottom: '14px' }}>
            Información Contacto
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <InputField
              label="Código del País"
              value={configuracionApp.codigoPais}
              onChange={v => actualizarConfiguracionApp({ codigoPais: v })}
            />
            <InputField
              label="Numero de Telefono"
              value={configuracionApp.telefono}
              onChange={v => actualizarConfiguracionApp({ telefono: v })}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InputField
              label="Correo electrónico"
              value={usuario?.correo || configuracionApp.correo}
              onChange={v => actualizarConfiguracionApp({ correo: v })}
              type="email"
            />
            <InputField
              label="Alias"
              value={configuracionApp.alias}
              onChange={v => actualizarConfiguracionApp({ alias: v })}
            />
          </div>
        </div>

        {/* Configuración de App */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginBottom: '4px' }}>
            Configuración de App
          </h3>
          {TOGGLES.map((t, i) => (
            <div
              key={t.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: i === TOGGLES.length - 1 ? 'none' : `1px solid ${theme.colors.borderLight}`,
              }}
            >
              <span style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>{t.label}</span>
              <Toggle value={configuracionApp[t.key]} onChange={v => actualizarConfiguracionApp({ [t.key]: v })} />
            </div>
          ))}
        </div>

        <div style={{ height: '8px' }} />
      </div>
    </AppShell>
  );
}
