import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import BottomSheet, { BottomSheetOption } from '../../components/ui/BottomSheet';
import SelectField from '../../components/ui/SelectField';
import Button from '../../components/ui/Button';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import DotsMenuButton from './components/DotsMenuButton';
import {
  deptosPorTorre, penthousesOpciones, tiposNumeracion, cocherasVisitasOpciones,
  cocherasPrivadasOpciones, almacenesPrivadosOpciones, entradasOpciones, opcionesSiNo,
} from '../../data/mockData';

const CAMPOS_VACIOS = {
  depto: '', penthouse: '', tipo: '', cocherasVisitas: '',
  mascotas: '', ninos: '', cocherasPrivadas: '', almacenPrivados: '',
  entradasPeatonales: '', entradasVehiculares: '',
};

const labelStyle = {
  display: 'block',
  fontSize: theme.fonts.sizes.sm,
  color: theme.colors.textSecondary,
  marginBottom: '6px',
  fontWeight: theme.fonts.weights.medium,
};

const CAMPOS_INFO = [
  ['depto', 'Depto. por torre', deptosPorTorre],
  ['penthouse', 'Penthouse', penthousesOpciones],
  ['tipo', 'Tipo', tiposNumeracion],
  ['cocherasVisitas', 'Cocheras de visitas', cocherasVisitasOpciones],
  ['mascotas', 'Acepta mascotas', opcionesSiNo],
  ['ninos', 'Acepta niños', opcionesSiNo],
  ['cocherasPrivadas', 'Cocheras privadas', cocherasPrivadasOpciones],
  ['almacenPrivados', 'Almacén privados', almacenesPrivadosOpciones],
  ['entradasPeatonales', 'Entradas peatonales', entradasOpciones],
  ['entradasVehiculares', 'Entradas vehiculares', entradasOpciones],
];

function CamposArquitectura({ form, setField }) {
  const filas = [];
  for (let i = 0; i < CAMPOS_INFO.length; i += 2) filas.push(CAMPOS_INFO.slice(i, i + 2));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {filas.map((fila, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {fila.map(([key, label, options]) => (
            <div key={key}>
              <span style={labelStyle}>{label}</span>
              <SelectField value={form[key]} options={options} onChange={setField(key)} placeholder="Seleccionar" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CampoRow({ label, value }) {
  return (
    <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, lineHeight: 1.5 }}>
      {label}: <span style={{ color: theme.colors.text, fontWeight: theme.fonts.weights.medium }}>{value || '—'}</span>
    </div>
  );
}

function CheckRow({ label, value }) {
  const isSi = value === 'Sí' || value === 'Si' || value === 'sí';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, lineHeight: 1.5 }}>
      <span style={{
        width: '16px', height: '16px', borderRadius: '50%',
        background: isSi ? theme.colors.success : theme.colors.danger,
        color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontWeight: theme.fonts.weights.bold,
      }}>
        {isSi ? '✓' : '✗'}
      </span>
      {label}
    </div>
  );
}

export default function AdministradorArquitecturaPage() {
  const { torres, agregarTorre, actualizarTorre, eliminarTorre } = useApp();

  const [showNueva, setShowNueva] = useState(false);
  const [editTorre, setEditTorre] = useState(null);
  const [deleteTorre, setDeleteTorre] = useState(null);
  const [menuTorre, setMenuTorre] = useState(null);
  const [form, setForm] = useState(CAMPOS_VACIOS);

  const setField = (key) => (value) => setForm(prev => ({ ...prev, [key]: value }));

  const abrirNueva = () => { setForm(CAMPOS_VACIOS); setShowNueva(true); };
  const cerrarNueva = () => setShowNueva(false);

  const abrirEditar = (torre) => {
    setMenuTorre(null);
    setForm({ ...CAMPOS_VACIOS, ...torre });
    setEditTorre(torre);
  };
  const cerrarEditar = () => setEditTorre(null);

  const confirmarNueva = () => { agregarTorre(form); cerrarNueva(); };
  const confirmarEditar = () => { actualizarTorre({ ...editTorre, ...form }); cerrarEditar(); };

  const confirmarEliminar = () => { eliminarTorre(deleteTorre); setDeleteTorre(null); };

  return (
    <AppShell>
      <PageHeader
        title="Editar arquitectura"
        action={
          <button
            onClick={abrirNueva}
            style={{
              width: '36px', height: '36px', borderRadius: theme.radius.md,
              background: theme.colors.primary, color: '#fff', fontSize: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            +
          </button>
        }
      />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {torres.map(torre => (
          <div
            key={torre.id}
            style={{
              background: theme.colors.bgCard,
              borderRadius: theme.radius.xl,
              border: `1.5px solid ${theme.colors.success}`,
              boxShadow: theme.shadows.card,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto' }}>
              {/* Columna izquierda */}
              <div style={{ padding: '12px 14px', borderRight: `1px solid ${theme.colors.borderLight}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <CampoRow label="Depto" value={torre.depto} />
                <CampoRow label="Penthouse" value={torre.penthouse} />
                <CampoRow label="Cocheras V." value={torre.cocherasVisitas} />
                <CampoRow label="Coch. priv." value={torre.cocherasPrivadas} />
                <CampoRow label="Almacén" value={torre.almacenPrivados} />
                <CampoRow label="Ent. veh." value={torre.entradasVehiculares} />
              </div>

              {/* Columna media */}
              <div style={{ padding: '12px 14px', borderRight: `1px solid ${theme.colors.borderLight}`, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                <CampoRow label="Ent. peat." value={torre.entradasPeatonales} />
                <CheckRow label="Niños" value={torre.ninos} />
                <CheckRow label="Mascotas" value={torre.mascotas} />
              </div>

              {/* Columna derecha — nombre + menú */}
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: '72px' }}>
                <span style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.bold, color: theme.colors.text, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  Torre{'\n'}N°{torre.numero}
                </span>
                <DotsMenuButton onClick={() => setMenuTorre(torre)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Menú "..." */}
      <BottomSheet isOpen={!!menuTorre} onClose={() => setMenuTorre(null)}>
        <BottomSheetOption label="Editar" onPress={() => abrirEditar(menuTorre)} />
        <BottomSheetOption label="Eliminar" variant="danger" onPress={() => { setDeleteTorre(menuTorre); setMenuTorre(null); }} />
      </BottomSheet>

      {/* Nueva arquitectura */}
      <Modal isOpen={showNueva} onClose={cerrarNueva} title="Nueva Arquitectura">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ textAlign: 'center', fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, fontWeight: theme.fonts.weights.medium }}>
            Número de Torre N°: {torres.length ? Math.max(...torres.map(t => t.numero)) + 1 : 1}
          </p>
          <CamposArquitectura form={form} setField={setField} />
          <Button variant="primary" fullWidth onClick={confirmarNueva}>Aceptar</Button>
        </div>
      </Modal>

      {/* Editar arquitectura */}
      <Modal isOpen={!!editTorre} onClose={cerrarEditar} title="Editar Arquitectura">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ textAlign: 'center', fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, fontWeight: theme.fonts.weights.medium }}>
            Torre N°: {editTorre?.numero}
          </p>
          <CamposArquitectura form={form} setField={setField} />
          <Button variant="primary" fullWidth onClick={confirmarEditar}>Aceptar</Button>
        </div>
      </Modal>

      {/* Eliminar arquitectura */}
      <Modal isOpen={!!deleteTorre} onClose={() => setDeleteTorre(null)} title="Eliminar arquitectura">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: theme.fonts.sizes.base, textAlign: 'center', color: theme.colors.text }}>
            ¿Seguro que deseas eliminar esta arquitectura?
          </p>
          {deleteTorre && (
            <div style={{ border: `1.5px solid ${theme.colors.primary}`, borderRadius: theme.radius.xl, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.md }}>
                Torre N° {deleteTorre.numero}
              </div>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                Depto. por torre: {deleteTorre.depto} · Penthouse: {deleteTorre.penthouse}
              </div>
            </div>
          )}
          <Button variant="danger" fullWidth onClick={confirmarEliminar}>Eliminar</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
