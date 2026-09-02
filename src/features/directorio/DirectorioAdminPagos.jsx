import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import theme from '../../config/theme';
import Button from '../../components/ui/Button';

export default function DirectorioAdminPagos(){
  const { unidades, pagosMantenimiento, marcarPagoMantenimiento, cargarPagosExcel, comitePropietarios, toggleComite } = useApp();
  const [excelInput, setExcelInput] = useState('');
  const totalPagados = Object.values(pagosMantenimiento).filter(Boolean).length;
  const handleExcel = () => {
    const codigos = excelInput.split(/[\n,]+/).map(s=> s.trim()).filter(Boolean);
    cargarPagosExcel(codigos);
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding:'12px', fontSize: theme.fonts.sizes.sm }}>
        Pagados: {totalPagados} / {unidades.length} · No pagados: {unidades.length-totalPagados}
      </div>
      <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding:'12px', boxShadow: theme.shadows.card }}>
        <div style={{ fontSize: theme.fonts.sizes.sm, fontWeight: 600, marginBottom:'8px' }}>Carga masiva (Excel simulado: lista de deptos separados por coma o salto)</div>
        <textarea value={excelInput} onChange={e=>setExcelInput(e.target.value)} placeholder="101, 102, 201..." rows={3} style={{ width:'100%', padding:'8px', borderRadius: theme.radius.md, border:`1px solid ${theme.colors.border}` }} />
        <Button variant="primary" fullWidth onClick={handleExcel} style={{ marginTop:'8px' }}>Cargar y marcar pagados</Button>
      </div>
      {unidades.map(u=>(
        <div key={u.id} style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding:'12px', boxShadow: theme.shadows.card, display:'flex', flexDirection:'column', gap:'6px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:600 }}>{u.codigo} — {u.propietarioAsignado || 'Sin propietario'} {comitePropietarios[u.propietarioEmail] && <span style={{ background:'#DBEAFE', color:'#1E40AF', padding:'1px 6px', borderRadius: theme.radius.full, fontSize:'10px'}}>Comité de Propietarios</span>}</span>
            <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize: theme.fonts.sizes.xs }}>
              <input type="checkbox" checked={!!pagosMantenimiento[u.id]} onChange={e=>marcarPagoMantenimiento(u.id, e.target.checked)} /> Pagado
            </label>
          </div>
          <button onClick={()=> u.propietarioEmail && toggleComite(u.propietarioEmail)} style={{ fontSize: theme.fonts.sizes.xs, background:'none', border:`1px solid ${theme.colors.border}`, borderRadius: theme.radius.full, padding:'4px 10px', cursor:'pointer' }}>
            {comitePropietarios[u.propietarioEmail] ? 'Quitar de Comité' : 'Marcar Comité de Propietarios'}
          </button>
        </div>
      ))}
    </div>
  );
}
