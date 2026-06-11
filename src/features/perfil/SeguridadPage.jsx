import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import InputField from '../../components/ui/InputField';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';

const cardStyle = {
  background: theme.colors.bgCard,
  borderRadius: theme.radius.xl,
  boxShadow: theme.shadows.card,
  padding: '16px',
};

const TOGGLES = [
  { key: 'faceId', label: 'Face ID' },
  { key: 'huellaDactilar', label: 'Huella Dactilar' },
  { key: 'f2a', label: 'Factor F2A' },
  { key: 'pausarCuenta', label: 'Pausar cuenta' },
];

export default function SeguridadPage() {
  const { seguridad, actualizarSeguridad, pausarCuenta } = useApp();
  const [showCambiarPass, setShowCambiarPass] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);

  const confirmarEliminar = () => {
    pausarCuenta();
    setShowEliminar(false);
  };

  return (
    <AppShell>
      <PageHeader title="Seguridad" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Información Contacto */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginBottom: '14px' }}>
            Información Contacto
          </h3>
          <InputField
            label="Correo de respaldo"
            value={seguridad.correoRespaldo}
            onChange={v => actualizarSeguridad({ correoRespaldo: v })}
          />
        </div>

        {/* Usabilidad */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', marginBottom: '4px' }}>
            Usabilidad
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
              <Toggle value={seguridad[t.key]} onChange={v => actualizarSeguridad({ [t.key]: v })} />
            </div>
          ))}
        </div>

        <Button variant="primary" fullWidth onClick={() => setShowCambiarPass(true)}>
          Cambiar Contraseña
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setShowEliminar(true)}>
          Eliminar Cuenta
        </Button>
      </div>

      {/* Cambiar Contraseña */}
      <Modal isOpen={showCambiarPass} onClose={() => setShowCambiarPass(false)} title="Cambiar contraseña">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold, color: theme.colors.text }}>
            Revisa su correo!
          </h3>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.textSecondary, lineHeight: theme.fonts.lineHeights.relaxed }}>
            Se envió el enlace de restablecimiento de contraseña a su correo tiene vigencia 15 minutos y vence!
          </p>
          <Button variant="primary" fullWidth onClick={() => setShowCambiarPass(false)}>Aceptar</Button>
        </div>
      </Modal>

      {/* Eliminar Cuenta */}
      <Modal isOpen={showEliminar} onClose={() => setShowEliminar(false)} title="Eliminar cuenta">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold, color: theme.colors.text }}>
            ¿Está seguro de pausar la cuenta?
          </h3>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.textSecondary, lineHeight: theme.fonts.lineHeights.relaxed }}>
            Al iniciar sesión nuevamente se reactivará la cuenta
          </p>
          <Button variant="primary" fullWidth onClick={confirmarEliminar}>Eliminar</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
