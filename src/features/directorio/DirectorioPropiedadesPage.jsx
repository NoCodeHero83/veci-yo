import { useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import SelectField from '../../components/ui/SelectField';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import theme from '../../config/theme';
import { useApp } from '../../context/AppContext';
import { contactosDepartamento } from '../../data/mockData';
import DirectorioAdminPagos from './DirectorioAdminPagos';

export default function DirectorioPropiedadesPage() {
  const { unidades, tipologias, residentesPropietario, torres, bloques, estacionamientosVisitantes, rolActivo, pagosMantenimiento } = useApp();
  const esAdmin = rolActivo === 'administrador';
  const [tab, setTab] = useState('directorio');
  const [search, setSearch] = useState('');
  const [torreFiltro, setTorreFiltro] = useState('');
  const [detalle, setDetalle] = useState(null);

  const anfitrionPrimario = residentesPropietario.find(r => r.esAnfitrionPrimario);

  const contactosFor = (unidad) => {
    const anfitrion = anfitrionPrimario ? { nombre: anfitrionPrimario.nombre, telefono: anfitrionPrimario.telefono || contactosDepartamento.anfitrion.telefono } : contactosDepartamento.anfitrion;
    return {
      anfitrion,
      administrador: contactosDepartamento.administrador,
      propietario: unidad.propietarioAsignado ? { nombre: unidad.propietarioAsignado, telefono: unidad.propietarioEmail || contactosDepartamento.propietario.telefono } : contactosDepartamento.propietario,
    };
  };

  const filtered = useMemo(() => {
    return unidades.filter(u => {
      if (torreFiltro && String(u.torreNumero) !== torreFiltro.replace('Torre ','').trim() && String(u.torreNumero) !== torreFiltro) return false;
      if (search && !(`${u.codigo} ${u.propietarioAsignado || ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [unidades, torreFiltro, search]);

  const estPorTorre = (num) => unidades.filter(u => u.torreNumero === num).reduce((s,u)=>s+(u.estacionamientos||0),0);

  return (
    <AppShell>
      <PageHeader title="Directorio de Propiedades" />
      {esAdmin && (
        <div style={{ display:'flex', gap:'8px', padding:'12px 16px 0' }}>
          <button onClick={()=>setTab('directorio')} style={{ flex:1, padding:'8px', borderRadius: theme.radius.full, border:'none', background: tab==='directorio'?theme.colors.primary:theme.colors.bgMuted, color: tab==='directorio'?'#fff':theme.colors.textSecondary, fontWeight:600, cursor:'pointer' }}>Directorio</button>
          <button onClick={()=>setTab('pagos')} style={{ flex:1, padding:'8px', borderRadius: theme.radius.full, border:'none', background: tab==='pagos'?theme.colors.primary:theme.colors.bgMuted, color: tab==='pagos'?'#fff':theme.colors.textSecondary, fontWeight:600, cursor:'pointer' }}>Pagos / Comité</button>
        </div>
      )}
      {esAdmin && tab==='pagos' ? <div style={{ padding:'16px'}}><DirectorioAdminPagos/></div> : (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar torre, depto, propietario" />
        <SelectField value={torreFiltro} options={['', 'Torre 1','Torre 2','Torre 3']} onChange={setTorreFiltro} placeholder="Filtrar por torre" />
        <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, textAlign: 'center' }}>Solo consulta — la edición se hace en Arquitectura</div>

        {filtered.map(u => {
          const contactos = contactosFor(u);
          const tipologia = tipologias.find(t=>t.id===u.tipologiaId);
          return (
            <div key={u.id} onClick={()=>setDetalle({unidad:u, contactos})} style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: theme.fonts.weights.bold, color: theme.colors.text }}>Torre {u.torreNumero} → Depto {u.codigo} {tipologia ? `(${tipologia.nombre})` : ''}</div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>Piso {u.piso} · {u.estado}</div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>Propietario: {u.propietarioAsignado || '—'} {u.propietarioAsignado && anfitrionPrimario && u.propietarioAsignado===anfitrionPrimario.nombre ? <span style={{ background: theme.colors.primaryLight, color: theme.colors.primary, padding: '1px 6px', borderRadius: theme.radius.full, fontWeight: 700 }}>Primario</span> : null}</div>
                </div>
                <span style={{ fontSize: '18px' }}>›</span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: theme.fonts.sizes['2xs'], background: theme.colors.bgMuted, padding: '2px 8px', borderRadius: theme.radius.full }}>🏠 Estac: {u.estacionamientos}</span>
                <span style={{ fontSize: theme.fonts.sizes['2xs'], background: theme.colors.bgMuted, padding: '2px 8px', borderRadius: theme.radius.full }}>📦 Depósitos asociados al depto</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                Anfitrión primario: {contactos.anfitrion.nombre} · Admin: {contactos.administrador.nombre}
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <div style={{ textAlign:'center', color: theme.colors.textMuted, padding:'24px' }}>Sin resultados</div>}
      </div>
      )}

      <Modal isOpen={!!detalle} onClose={()=>setDetalle(null)} title={detalle ? `Depto ${detalle.unidad.codigo} — Torre ${detalle.unidad.torreNumero}` : ''}>
        {detalle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
              <div>Torre → Departamento → Propietario: <strong>{detalle.unidad.propietarioAsignado || 'Sin asignar'}</strong></div>
              <div>Estacionamiento → Depto {detalle.unidad.codigo} → {detalle.unidad.propietarioAsignado || '—'}</div>
              <div>Depósito → Depto {detalle.unidad.codigo} → {detalle.unidad.propietarioAsignado || '—'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button variant="ghost" fullWidth onClick={()=>{ window.location.href=`tel:${detalle.contactos.anfitrion.telefono}`;}}>📞 Llamar Anfitrión primario: {detalle.contactos.anfitrion.nombre}</Button>
              <Button variant="ghost" fullWidth onClick={()=>{ window.location.href=`tel:${detalle.contactos.administrador.telefono}`;}}>📞 Llamar Administrador: {detalle.contactos.administrador.nombre}</Button>
              <Button variant="ghost" fullWidth onClick={()=>{ window.location.href=`tel:${detalle.contactos.propietario.telefono}`;}}>📞 Llamar Propietario: {detalle.contactos.propietario.nombre}</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
