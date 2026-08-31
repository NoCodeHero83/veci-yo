import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import BottomSheet, { BottomSheetOption } from '../../components/ui/BottomSheet';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import DotsMenuButton from './components/DotsMenuButton';

const cardStyle = {
  background: theme.colors.bgCard,
  borderRadius: theme.radius.xl,
  boxShadow: theme.shadows.card,
  padding: '16px',
};

const FORM_VACIO = { nombre: '', apellido: '', correo: '', celular: '' };

export default function CoadministradoresPage() {
  const { coadministradores, agregarCoadministrador, actualizarCoadministrador, eliminarCoadministrador, addToast } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [modoForm, setModoForm] = useState('agregar');
  const [form, setForm] = useState(FORM_VACIO);
  const [editItem, setEditItem] = useState(null);
  const [menuCoadmin, setMenuCoadmin] = useState(null);
  const [deleteCoadmin, setDeleteCoadmin] = useState(null);

  const abrirAgregar = () => {
    setModoForm('agregar');
    setForm(FORM_VACIO);
    setEditItem(null);
    setShowForm(true);
  };

  const abrirEditar = (item) => {
    setMenuCoadmin(null);
    setModoForm('editar');
    setForm({ nombre: item.nombre || '', apellido: item.apellido || '', correo: item.correo || '', celular: item.celular || '' });
    setEditItem(item);
    setShowForm(true);
  };

  const cerrarForm = () => { setShowForm(false); setEditItem(null); };

  const guardar = () => {
    if (!form.nombre.trim() || !form.correo.trim()) {
      addToast('Nombre y correo son obligatorios', 'error');
      return;
    }
    if (modoForm === 'agregar') {
      agregarCoadministrador({ ...form });
      addToast('Coadministrador agregado correctamente', 'success');
    } else {
      actualizarCoadministrador({ ...editItem, ...form });
      addToast('Coadministrador actualizado', 'success');
    }
    cerrarForm();
  };

  const handleEliminar = () => {
    eliminarCoadministrador(deleteCoadmin.id);
    setDeleteCoadmin(null);
    addToast('Coadministrador eliminado', 'success');
  };

  return (
    <AppShell>
      <PageHeader title="Coadministradores" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header info */}
        <div style={{ ...cardStyle, padding: '14px 16px' }}>
          <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
            Los coadministradores heredan todos los privilegios de administración del condominio.
          </p>
        </div>

        {/* Add button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={abrirAgregar}>+ Agregar</Button>
        </div>

        {/* List */}
        {coadministradores.length === 0 ? (
          <div style={{ ...cardStyle, padding: '32px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>👤</span>
            <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, margin: 0 }}>
              No hay coadministradores registrados.
            </p>
          </div>
        ) : (
          coadministradores.map(item => (
            <div key={item.id} style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Avatar */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: theme.colors.primaryLight || '#EFF6FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '18px', fontWeight: theme.fonts.weights.bold,
                color: theme.colors.primary,
              }}>
                {item.nombre?.[0]}{item.apellido?.[0]}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
                  {item.nombre} {item.apellido}
                </div>
                <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginTop: '2px', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ opacity: 0.6 }}>📧</span>
                    <span>{item.correo}</span>
                  </div>
                  {item.celular && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ opacity: 0.6 }}>📱</span>
                      <span>{item.celular}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Menu */}
              <div onClick={() => setMenuCoadmin(item)}>
                <DotsMenuButton />
              </div>
            </div>
          ))
        )}

        <div style={{ height: '8px' }} />
      </div>

      {/* Bottom Sheet menu */}
      <BottomSheet isOpen={!!menuCoadmin} onClose={() => setMenuCoadmin(null)}>
        <BottomSheetOption label="Editar" onPress={() => abrirEditar(menuCoadmin)} />
        <BottomSheetOption label="Eliminar" variant="danger" onPress={() => { setDeleteCoadmin(menuCoadmin); setMenuCoadmin(null); }} />
      </BottomSheet>

      {/* Add / Edit Form Modal */}
      <Modal isOpen={showForm} onClose={cerrarForm} title={modoForm === 'agregar' ? 'Agregar coadministrador' : 'Editar coadministrador'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
          <InputField label="Nombre *" value={form.nombre} onChange={v => setForm(p => ({ ...p, nombre: v }))} placeholder="Nombre" />
          <InputField label="Apellido" value={form.apellido} onChange={v => setForm(p => ({ ...p, apellido: v }))} placeholder="Apellido" />
          <InputField label="Correo electrónico *" value={form.correo} onChange={v => setForm(p => ({ ...p, correo: v }))} placeholder="correo@ejemplo.com" type="email" />
          <InputField label="Celular" value={form.celular} onChange={v => setForm(p => ({ ...p, celular: v }))} placeholder="+593 999999999" />
          <Button variant="primary" fullWidth onClick={guardar}>
            {modoForm === 'agregar' ? 'Agregar coadministrador' : 'Guardar cambios'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteCoadmin} onClose={() => setDeleteCoadmin(null)} title="Eliminar coadministrador">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
            ¿Eliminar a <strong>{deleteCoadmin?.nombre} {deleteCoadmin?.apellido}</strong>?
          </p>
          <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginTop: '-8px' }}>
            Perderá todos los privilegios de administración.
          </p>
          <Button variant="danger" fullWidth onClick={handleEliminar}>Eliminar</Button>
          <Button variant="ghost" fullWidth onClick={() => setDeleteCoadmin(null)}>Cancelar</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
