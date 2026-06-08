import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import SelectField from '../../components/ui/SelectField';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import { opcionesSiNo, estanciasMinimas, horariosCheckin } from '../../data/mockData';

const labelStyle = {
  display: 'block',
  fontSize: theme.fonts.sizes.sm,
  color: theme.colors.textSecondary,
  marginBottom: '6px',
  fontWeight: theme.fonts.weights.medium,
};

const cardStyle = {
  background: theme.colors.bgCard,
  borderRadius: theme.radius.xl,
  boxShadow: theme.shadows.card,
};

const sectionTitleStyle = {
  fontSize: theme.fonts.sizes.md,
  fontWeight: theme.fonts.weights.bold,
  color: theme.colors.text,
};

const ESTANCIA_CAMPOS = [
  ['permiteVisitas', 'Permite visitas', opcionesSiNo],
  ['estanciaMinima', 'Estancia mínima', estanciasMinimas],
  ['permiteHuespedNinos', 'Permite huésped niños', opcionesSiNo],
  ['permiteMascotas', 'Permite mascotas', opcionesSiNo],
  ['permiteCocherasVisit', 'Permite cocheras de visit.', opcionesSiNo],
  ['horarioCheckin', 'Horario checkin', horariosCheckin],
];

// Reutilizado para "Estancia corta" y "Estancia larga": mismos seis campos,
// distinto bloque de datos. Cambiar un campo acá actualiza ambas secciones.
function EstanciaCampos({ titulo, valores, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={sectionTitleStyle}>{titulo}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 10px' }}>
        {ESTANCIA_CAMPOS.map(([key, label, options]) => (
          <div key={key}>
            <span style={labelStyle}>{label}</span>
            <SelectField value={valores[key]} options={options} onChange={(v) => onChange(key, v)} placeholder="Seleccionar" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdministradorPermisosPage() {
  const { permisos, actualizarPermisos } = useApp();
  const [form, setForm] = useState(permisos);
  const [showExito, setShowExito] = useState(false);

  const setEstancia = (bloque) => (key, value) => {
    setForm(prev => ({ ...prev, [bloque]: { ...prev[bloque], [key]: value } }));
  };

  const setFlag = (key) => (value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleGuardar = () => {
    actualizarPermisos(form);
    setShowExito(true);
  };

  return (
    <AppShell>
      <PageHeader title="Editar permisos viviendas" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Plan activo — informativo */}
        <div
          style={{
            ...cardStyle,
            border: `1.5px solid ${theme.colors.success}`,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.semibold, color: theme.colors.text, lineHeight: theme.fonts.lineHeights.snug }}>
            VeciYo Plus plan activo por condominio<br />Unidades 32 * $2 = $ 64
          </p>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', background: theme.colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px',
          }}>
            ⚙️
          </div>
        </div>

        {/* Correspondencia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={sectionTitleStyle}>Correspondencia</h3>
          <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: theme.fonts.sizes.base, fontWeight: theme.fonts.weights.semibold, color: theme.colors.text }}>Permitir entrega directa en vivienda</span>
            <Toggle value={form.entregaDirecta} onChange={setFlag('entregaDirecta')} />
          </div>
          <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: theme.fonts.sizes.base, fontWeight: theme.fonts.weights.semibold, color: theme.colors.text }}>Huéspedes temporales (BnB)</span>
            <Toggle value={form.huespedesTemporales} onChange={setFlag('huespedesTemporales')} />
          </div>
        </div>

        {/* Banner beneficios — informativo */}
        <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, fontWeight: theme.fonts.weights.medium }}>VeciYo Plus</div>
            <div style={{ fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold, color: theme.colors.secondary }}>BENEFICIOS</div>
          </div>
          <span style={{ fontSize: '20px' }}>▶️</span>
        </div>

        <EstanciaCampos titulo="Estancia corta" valores={form.estanciaCorta} onChange={setEstancia('estanciaCorta')} />
        <EstanciaCampos titulo="Estancia larga" valores={form.estanciaLarga} onChange={setEstancia('estanciaLarga')} />

        <Button variant="primary" fullWidth onClick={handleGuardar} style={{ marginTop: '4px' }}>
          Guardar
        </Button>
      </div>

      <Modal isOpen={showExito} onClose={() => setShowExito(false)} title="Editar Permisos">
        <p style={{ textAlign: 'center', fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
          Sus permisos se guardaron con éxito
        </p>
      </Modal>
    </AppShell>
  );
}
