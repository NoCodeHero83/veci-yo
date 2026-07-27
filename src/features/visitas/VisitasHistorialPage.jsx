import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Tabs from '../../components/ui/Tabs';
import StatusTabs from '../../components/ui/StatusTabs';
import Badge from '../../components/ui/Badge';
import BottomSheet, { BottomSheetOption } from '../../components/ui/BottomSheet';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import SelectField from '../../components/ui/SelectField';
import Toggle from '../../components/ui/Toggle';
import { ModuloGate, ModuloHeaderInfo } from '../../components/ui/ModuloEstado';
import { useApp } from '../../context/AppContext';
import theme from '../../config/theme';
import tipoVisitaIcons from '../../assets/icons/visitas';
import { torres, departamentos } from '../../data/mockData';

const TABS = ['Todas'];

const GUARDIA_TABS = ['Todas'];
const HUESPEDES_TABS = ['Todas', 'Pendiente', 'Aceptado', 'Ingresado'];
const TIPO_TABS_BASE = [
  { value: 'visitas', label: 'Visitas' },
  { value: 'huespedes', label: 'Huéspedes' },
  { value: 'calendario', label: 'Calendario' },
];
const TIPOS = ['Todos', 'Amigos Familiares', 'Profesional Temporal', 'Profesional Permanente'];

const TIMELINE_STEPS = [
  { key: 'preregistroEnviado', label: 'Link de preregistro enviado' },
  { key: 'documentacionCompleta', label: 'Documentación completada' },
  { key: 'terminosAceptados', label: 'Términos y Condiciones aceptados' },
  { key: 'verificacionPasada', label: 'Verificación superada' },
  { key: 'trasideEntrada', label: 'Ingreso al edificio (TRASIDE entrada)' },
  { key: 'trasideSalida', label: 'Salida del edificio (TRASIDE salida)' },
];

const TIPO_LABELS = {
  amigos: 'Amigos Familiares',
  temporal: 'Profesional Temporal',
  permanente: 'Profesional Permanente',
  'huesped-temporal': 'Huésped Temporal',
};

export default function VisitasHistorialPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromHome = location.state?.fromHome || false;
  const { visitas, actualizarEstadoVisita, eliminarVisita, toggleLlegoInvitado, toggleFavoritoInvitado, aprobarInvitado, rolActivo, addToast, verificaciones, actualizarVerificacion, actualizarHoraIngreso, actualizarHoraSalida, setLlegoInvitado, marcarLlegadaConVerificacion, toggleInstruccionCumplida, estacionamientosVisitantes, configHuespedesTemporales, ubicacionActiva, reportarTraSire, usuario, actualizarConfigHuespedTemporal, esResidente, actualizarTimeline, aprobarTerminosManual, aprobarVerificacion } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Todas');
  const [tipoTab, setTipoTab] = useState('visitas');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [fechaDesdeFilter, setFechaDesdeFilter] = useState('');
  const [fechaHastaFilter, setFechaHastaFilter] = useState('');
  const [deptoFilter, setDeptoFilter] = useState('');
  const [torreFilter, setTorreFilter] = useState('');
  const [menuItem, setMenuItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [detalleItem, setDetalleItem] = useState(null);
  const [detalleGuardia, setDetalleGuardia] = useState(null);
  const [verificandoInvitado, setVerificandoInvitado] = useState(null);
  const [capturaStep, setCapturaStep] = useState(null);
  const [verifResultado, setVerifResultado] = useState(null);
  const [verificandoPersona, setVerificandoPersona] = useState(null);
  const [ciInput, setCiInput] = useState('');
  const [ciError, setCiError] = useState('');
  const [traSireModal, setTraSireModal] = useState(null);
  const [guardiaStep1, setGuardiaStep1] = useState(null);
  const [guardiaStep2, setGuardiaStep2] = useState(null);
  const [detallePersonaIdx, setDetallePersonaIdx] = useState(null);
  const [hallazgosPopup, setHallazgosPopup] = useState(null);
  const [documentacionDetail, setDocumentacionDetail] = useState(null);
  const [selectedTraSire, setSelectedTraSire] = useState([]);
  const [showAsignarEstacionamiento, setShowAsignarEstacionamiento] = useState(false);
  const [parkingSpot, setParkingSpot] = useState('');
  const [reservaDetail, setReservaDetail] = useState(null);
  const [accionGuest, setAccionGuest] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarioMonth, setCalendarioMonth] = useState(new Date());

  const algunFiltroActivo = search || fechaDesdeFilter || fechaHastaFilter || torreFilter || deptoFilter || tipoFilter !== 'Todos';

  const TIPO_TABS = useMemo(() => {
    if (rolActivo === 'huesped-temporal') return [{ value: 'visitas', label: 'Visitas' }];
    return [
      { value: 'visitas', label: 'Visitas' },
      { value: 'huespedes', label: 'Huéspedes' },
    ];
  }, [rolActivo]);

  const diasRestantes = (fechaStr) => {
    if (!fechaStr) return Infinity;
    const [day, month, year] = fechaStr.split('/');
    const fecha = new Date(+year, +month - 1, +day);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
  };

  const colorReserva = (reserva) => {
    if (!reserva.invitados || reserva.invitados.length === 0) return theme.colors.textMuted;
    const todosCompletos = reserva.invitados.every(inv => {
      const t = inv.timeline || {};
      const step4 = t.verificacionAprobada === true || t.verificacionPasada;
      return t.preregistroEnviado && t.documentacionCompleta && t.terminosAceptados && step4 && t.trasideEntrada && t.trasideSalida;
    });
    if (todosCompletos) return theme.colors.success;
    const dias = diasRestantes(reserva.fechaDesde);
    if (dias < 3) return theme.colors.danger;
    return '#F59E0B';
  };

  const btnStyle = (bg, color = '#fff') => ({
    padding: '4px 10px', borderRadius: theme.radius.full,
    background: bg, color, border: 'none',
    cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
    fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
    whiteSpace: 'nowrap',
  });

  const progresoInvitado = (inv) => {
    const t = inv.timeline || {};
    const step4 = t.verificacionAprobada === true || t.verificacionPasada;
    const pasos = [t.preregistroEnviado, t.documentacionCompleta, t.terminosAceptados, step4, t.trasideEntrada, t.trasideSalida];
    return pasos.filter(Boolean).length;
  };

  const detalleActual = detalleItem ? visitas.find(v => v.id === detalleItem.id) || null : null;

  const statusForGuardia = (estado) => rolActivo === 'guardia' && estado === 'Rechazado' ? 'Pendiente' : estado;

  const filtered = visitas.filter(v => {
    const estadoVis = statusForGuardia(v.estado);
    const matchTipoGrupo = tipoTab === 'huespedes' ? v.tipo === 'huesped-temporal' : v.tipo !== 'huesped-temporal';
    const matchSearch = !search || v.nombre.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'Todas' || estadoVis === activeTab;
    const matchTipo = tipoFilter === 'Todos' || TIPO_LABELS[v.tipo] === tipoFilter;
    const matchFechaDesde = !fechaDesdeFilter || (v.fechaDesde && v.fechaDesde >= fechaDesdeFilter);
    const matchFechaHasta = !fechaHastaFilter || (v.fechaHasta && v.fechaHasta <= fechaHastaFilter);
    const matchTorre = !torreFilter || v.torre === torreFilter;
    const matchDepto = !deptoFilter || v.depto === deptoFilter;
    const matchGuest = rolActivo !== 'huesped-temporal' || (usuario?.nombre && v.nombre?.toLowerCase().includes(usuario.nombre.toLowerCase().split(' ')[0]));
    return matchTipoGrupo && matchSearch && matchTab && matchTipo && matchFechaDesde && matchFechaHasta && matchTorre && matchDepto && matchGuest;
  });

  const statusTabsForTipo = tipoTab === 'huespedes' ? HUESPEDES_TABS : (rolActivo === 'guardia' ? GUARDIA_TABS : TABS);

  const accesoBloqueado = rolActivo === 'propietario' && !esResidente;

  const handleTipoTabChange = (value) => {
    setTipoTab(value);
    setActiveTab('Todas');
  };

  const handleEstado = (estado) => {
    actualizarEstadoVisita(menuItem.id, estado);
    if (estado === 'Aceptado' && menuItem) {

    }
    setMenuItem(null);
  };

  const handleEliminar = () => {
    eliminarVisita(deleteItem.id);
    setDeleteItem(null);
  };

  return (
    <AppShell>
      {accesoBloqueado ? (
        <div style={{ padding: '16px', textAlign: 'center', color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.base, marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <p>No tienes acceso a Visitas. Solo los Residentes pueden usar esta función.</p>
          <p style={{ fontSize: theme.fonts.sizes.sm, marginTop: '8px' }}>Si eres Propietario, declárate como Residente desde Configuración.</p>
        </div>
      ) : (<>
      <PageHeader
        title="Visitas"
        onBack={fromHome ? () => navigate('/', { replace: true }) : undefined}
        action={
          <ModuloHeaderInfo
            helpKey="visitas"
            action={
              <button
                onClick={() => navigate('/visitas/nuevo')}
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
        }
      />

      <ModuloGate helpKey="visitas">
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Type tabs: Visitas / Huéspedes */}
        <Tabs tabs={TIPO_TABS} active={tipoTab} onChange={handleTipoTabChange} centered />
        {/* Filter card */}
        <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '12px', boxShadow: theme.shadows.card }}>
          <SearchBar value={search} onChange={setSearch} />
          {tipoTab === 'huespedes' && (
            <div style={{ marginTop: '10px' }}>
              <StatusTabs
                tabs={statusTabsForTipo}
                active={activeTab}
                onChange={tab => setActiveTab(tab || 'Todas')}
                centered
              />
            </div>
          )}
          {tipoTab === 'huespedes' && (rolActivo === 'propietario' || rolActivo === 'inquilino-lider' || rolActivo === 'administrador') && (
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <button
                onClick={() => setShowCalendar(o => !o)}
                style={{
                  padding: '6px 16px', borderRadius: theme.radius.full,
                  background: showCalendar ? theme.colors.primary : theme.colors.bgMuted,
                  color: showCalendar ? '#fff' : theme.colors.primary,
                  border: `1px solid ${showCalendar ? theme.colors.primary : theme.colors.border}`,
                  cursor: 'pointer', fontFamily: theme.fonts.family,
                  fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                }}
              >
                {showCalendar ? 'Ver lista de huéspedes' : 'Ver calendario'}
              </button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <button
              onClick={() => setFilterOpen(o => !o)}
              style={{
                background: theme.colors.bgMuted,
                border: 'none',
                cursor: 'pointer',
                color: theme.colors.textSecondary,
                fontSize: '24px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: filterOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms, background 200ms',
              }}
              aria-label={filterOpen ? 'Cerrar filtros' : 'Abrir filtros'}
            >
              ▾
            </button>
          </div>

          {filterOpen && (
            <div style={{ animation: 'slideDown 200ms ease', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tipoTab !== 'huespedes' && (
                <SelectField label="Categoría" value={tipoFilter === 'Todos' ? '' : tipoFilter} options={TIPOS} onChange={setTipoFilter} />
              )}
              {/* Date filters stacked */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginBottom: '4px' }}>Fecha desde</div>
                  <div style={{ width: '100%', overflow: 'hidden', borderRadius: theme.radius['2xl'], border: `1.5px solid ${theme.colors.border}`, background: theme.colors.bgCard }}>
                    <input
                      type="date"
                      value={fechaDesdeFilter}
                      onChange={e => setFechaDesdeFilter(e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        padding: '11px 14px',
                        border: 'none',
                        fontSize: theme.fonts.sizes.sm,
                        fontFamily: theme.fonts.family,
                        color: theme.colors.text,
                        background: 'transparent',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginBottom: '4px' }}>Fecha hasta</div>
                  <div style={{ width: '100%', overflow: 'hidden', borderRadius: theme.radius['2xl'], border: `1.5px solid ${theme.colors.border}`, background: theme.colors.bgCard }}>
                    <input
                      type="date"
                      value={fechaHastaFilter}
                      onChange={e => setFechaHastaFilter(e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        padding: '11px 14px',
                        border: 'none',
                        fontSize: theme.fonts.sizes.sm,
                        fontFamily: theme.fonts.family,
                        color: theme.colors.text,
                        background: 'transparent',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Direction fields side by side */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginBottom: '4px' }}>Torre</div>
                  <SelectField value={torreFilter} options={['', ...torres]} onChange={setTorreFilter} placeholder="Torre" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginBottom: '4px' }}>Departamento</div>
                  <SelectField value={deptoFilter} options={['', ...departamentos]} onChange={setDeptoFilter} placeholder="Depto" />
                </div>
              </div>
            </div>
          )}
          {algunFiltroActivo && (
            <button
              onClick={() => { setSearch(''); setFechaDesdeFilter(''); setFechaHastaFilter(''); setTorreFilter(''); setDeptoFilter(''); setTipoFilter('Todos'); }}
              style={{
                background: theme.colors.bgMuted,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.full,
                padding: '8px 16px',
                fontSize: theme.fonts.sizes.xs,
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                fontFamily: theme.fonts.family,
                alignSelf: 'center',
                marginTop: '8px',
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Calendar tab — acceso desde Huéspedes, barras estilo Airbnb */}
        {tipoTab === 'huespedes' && showCalendar && (() => {
          const hoy = new Date(calendarioMonth);
          const año = hoy.getFullYear();
          const mes = hoy.getMonth();
          const primerDia = new Date(año, mes, 1).getDay();
          const diasEnMes = new Date(año, mes + 1, 0).getDate();
          const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          const htReservas = visitas.filter(v => v.tipo === 'huesped-temporal');
          const reservasEnMes = htReservas.filter(v => {
            if (!v.fechaDesde) return false;
            const [d, m, y] = v.fechaDesde.split('/');
            const fecha = new Date(+y, +m - 1, +d);
            return fecha.getMonth() === mes && fecha.getFullYear() === año;
          });
          const CELL_HEIGHT = 80;
          return (
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, boxShadow: theme.shadows.card, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                <button onClick={() => setCalendarioMonth(new Date(año, mes - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: theme.colors.text }}>‹</button>
                <span style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base }}>{hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCalendarioMonth(new Date(año, mes + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: theme.colors.text }}>›</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: theme.colors.borderLight, padding: '0 8px 8px' }}>
                {/* Day headers — row 1 */}
                {diasSemana.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textMuted, padding: '6px 0', fontWeight: theme.fonts.weights.semibold }}>{d}</div>
                ))}
                {/* Empty cells before day 1 — fixed height */}
                {Array.from({ length: primerDia }, (_, i) => (
                  <div key={`empty-${i}`} style={{ height: `${CELL_HEIGHT}px`, padding: '4px', border: 'none' }} />
                ))}
                {/* Day cells — fixed height (no deformation) */}
                {Array.from({ length: diasEnMes }, (_, i) => (
                  <div key={i + 1} style={{ height: `${CELL_HEIGHT}px`, padding: '4px', border: 'none' }}>
                    <div style={{ fontSize: theme.fonts.sizes['2xs'], color: theme.colors.text, fontWeight: theme.fonts.weights.medium }}>{i + 1}</div>
                  </div>
                ))}
                {/* Reservation bars — overlaid on same grid, explicit positioning */}
                {reservasEnMes.map(r => {
                  if (!r.fechaDesde) return null;
                  const [d1] = r.fechaDesde.split('/');
                  const startDay = parseInt(d1);
                  const cellIdx = startDay - 1;
                  const gridCol = (cellIdx + primerDia) % 7 + 1;
                  const gridRow = Math.floor((cellIdx + primerDia) / 7) + 2;
                  let span = 1;
                  if (r.fechaHasta) {
                    const [d2] = r.fechaHasta.split('/');
                    const endDay = Math.min(parseInt(d2), diasEnMes);
                    const endCellIdx = endDay - 1;
                    const endGridCol = (endCellIdx + primerDia) % 7 + 1;
                    const sameRow = Math.floor((endCellIdx + primerDia) / 7) === Math.floor((cellIdx + primerDia) / 7);
                    span = sameRow ? Math.min(endGridCol - gridCol + 1, 7 - gridCol + 1) : (7 - gridCol + 1);
                  }
                  const color = colorReserva(r);
                  return (
                    <div
                      key={r.id}
                      onClick={() => setReservaDetail(r)}
                      style={{
                        gridRow, gridColumn: `${gridCol} / span ${span}`,
                        background: color, borderRadius: '999px',
                        height: '22px', marginTop: '22px', padding: '0 8px',
                        display: 'flex', alignItems: 'center', zIndex: 1,
                        cursor: 'pointer', pointerEvents: 'auto', marginLeft: '2px', marginRight: '2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontSize: theme.fonts.sizes['2xs'], color: '#fff', fontWeight: theme.fonts.weights.medium,
                      }}
                      title={r.nombre}
                    >
                      {r.nombre}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* List — guardia: compact person cards */}
        {!showCalendar && rolActivo === 'guardia' && filtered.flatMap(item => {
          const persons = item.invitados && item.invitados.length > 0
            ? item.invitados.map((inv, idx) => ({ base: item, persona: inv, idx }))
            : [{ base: item, persona: { nombre: item.nombre, llego: false, horaIngreso: '', horaSalida: '' }, idx: -1 }];
          return persons.map((p, pi) => (
            <div
              key={`${item.id}-${pi}`}
              style={{
                background: theme.colors.bgCard,
                borderRadius: theme.radius.xl,
                overflow: 'hidden',
                boxShadow: theme.shadows.card,
              }}
            >
              <div style={{ padding: '14px 16px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <img
                    src={tipoVisitaIcons[p.base.tipo]}
                    alt={TIPO_LABELS[p.base.tipo]}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
                        {p.persona.nombre}
                      </span>
{p.base.tipo === 'huesped-temporal' && <Badge status={statusForGuardia(p.base.estado)} />}
                    </div>
                    <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.base.torre} - {p.base.depto} · {TIPO_LABELS[p.base.tipo] || p.base.tipo}
                    </div>
                  </div>
                </div>
                {p.base.tipo === 'huesped-temporal' && (
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textMuted, marginTop: '4px' }}>
                    Huésped responsable: {p.base.nombre}
                  </div>
                )}
                {/* Foto extraída del documento con marca de agua (solo Guardia, huésped-temporal) */}
                {p.base.tipo === 'huesped-temporal' && (
                  <div style={{
                    width: '100%', height: '90px', marginTop: '8px',
                    borderRadius: theme.radius.md,
                    background: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                    border: `1px solid ${theme.colors.border}`,
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <div style={{ fontSize: '8px', color: theme.colors.textSecondary, marginTop: '2px' }}>
                      Foto extraída del documento
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '3px', left: 0, right: 0, textAlign: 'center',
                      fontSize: '8px', color: theme.colors.textMuted, background: 'rgba(255,255,255,0.8)',
                      padding: '1px 3px', transform: 'rotate(-15deg)', letterSpacing: '1px',
                    }}>
                      {usuario?.nombre || 'Roberto Hornado'} · Portería
                    </div>
                  </div>
                )}
                <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textMuted, display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>📅 {p.base.fechaDesde}{p.base.fechaHasta ? ` a ${p.base.fechaHasta}` : ''}</span>
                  {p.persona.horaSalida && (
                    <span style={{
                      fontSize: '9px', padding: '1px 5px', borderRadius: theme.radius.full,
                      background: '#FEF3C7', color: '#92400E', fontWeight: theme.fonts.weights.semibold,
                      display: 'inline-flex', alignItems: 'center', gap: '2px',
                    }}>
                      ⚠ Salida
                    </span>
                  )}
                </div>
                {/* Campos Guardia — no-huésped-temporal */}
                {p.base.tipo !== 'huesped-temporal' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {/* Teléfono del residente solo si "Notificar y anunciar" */}
                    {p.base.tipoNotificacion === 'notificar-y-anunciar' && p.base.telefonoResidente && (
                      <a
                        href={`tel:${p.base.telefonoResidente}`}
                        onClick={e => e.stopPropagation()}
                        style={{ textDecoration: 'none', padding: '2px 8px', borderRadius: theme.radius.full, background: theme.colors.primaryLight, fontSize: theme.fonts.sizes['2xs'], color: theme.colors.primary, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        📞 {p.base.telefonoResidente}
                      </a>
                    )}
                    {/* Vehículo / placa */}
                    {p.base.tieneVehiculo && (
                      <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: theme.colors.bgMuted, fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        🚗 {p.base.vehiculos?.length > 0 ? p.base.vehiculos.map(v => v.placa).filter(Boolean).join(', ') : 'Con vehículo'}
                      </span>
                    )}
                    {/* DNI para Proveedor Temporal (nunca para amigos) */}
                    {p.base.tipo === 'temporal' && p.base.ci && (
                      <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: theme.colors.bgMuted, fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        🆔 DNI: {p.base.ci}
                      </span>
                    )}
                    {/* Aviso de estacionamiento */}
                    {estacionamientosVisitantes && estacionamientosVisitantes.total > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: estacionamientosVisitantes.ocupados < estacionamientosVisitantes.total ? '#F0FDF4' : '#FEF2F2', fontSize: theme.fonts.sizes['2xs'], color: estacionamientosVisitantes.ocupados < estacionamientosVisitantes.total ? '#166534' : '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        🅿️ {estacionamientosVisitantes.total - estacionamientosVisitantes.ocupados} libres
                      </span>
                    )}
                  </div>
                )}
                {/* Controles Guardia — huésped-temporal en misma línea */}
                {p.base.tipo === 'huesped-temporal' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${theme.colors.borderLight}`, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Toggle value={p.persona.llego} onChange={() => setLlegoInvitado(p.base.id, p.idx, !p.persona.llego)} />
                      <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>
                        {p.persona.llego ? 'Llegó' : 'No llegó'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>Ingreso</span>
                      <input
                        type="time"
                        value={p.persona.horaIngreso || ''}
                        onChange={e => actualizarHoraIngreso(p.base.id, p.idx, e.target.value)}
                        style={{ width: '120px', padding: '8px 10px', borderRadius: theme.radius.md, border: `1.5px solid ${theme.colors.border}`, fontSize: theme.fonts.sizes.sm, fontFamily: theme.fonts.family, color: theme.colors.text, background: theme.colors.bgCard, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>Salida</span>
                      <input
                        type="time"
                        value={p.persona.horaSalida || ''}
                        onChange={e => actualizarHoraSalida(p.base.id, p.idx, e.target.value)}
                        style={{ width: '120px', padding: '8px 10px', borderRadius: theme.radius.md, border: `1.5px solid ${theme.colors.border}`, fontSize: theme.fonts.sizes.sm, fontFamily: theme.fonts.family, color: theme.colors.text, background: theme.colors.bgCard, outline: 'none', boxSizing: 'border-box' }}
                      />
                      {p.persona.horaSalida && (
                        <span
                          onClick={e => { e.stopPropagation(); const nuevaHora = prompt('Ingrese la hora aproximada de salida:'); if (nuevaHora) actualizarHoraSalida(p.base.id, p.idx, nuevaHora); }}
                          style={{ fontSize: '10px', cursor: 'pointer', color: theme.colors.warning, fontWeight: theme.fonts.weights.bold, display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 4px', borderRadius: theme.radius.sm, background: '#FEF3C7' }}
                          title="Hora inexacta"
                        >
                          ⚠
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setDetalleGuardia(p)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: theme.colors.bgMuted,
                  border: 'none',
                  borderTop: `1px solid ${theme.colors.borderLight}`,
                  cursor: 'pointer',
                  fontFamily: theme.fonts.family,
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.semibold,
                  color: theme.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Ver detalles →
              </button>
            </div>
          ));
        })}

        {/* List — normal roles: card per reservation for huesped-temporal */}
        {!showCalendar && rolActivo !== 'guardia' && (reservaDetail ? (
          /* Vista detalle de reserva HT — reemplaza la lista */
          <div key="reserva-detail" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setReservaDetail(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: theme.fonts.family,
                fontSize: theme.fonts.sizes.sm, color: theme.colors.primary, fontWeight: theme.fonts.weights.semibold,
                alignSelf: 'flex-start',
              }}
            >
              ← Volver a visitas
            </button>
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={tipoVisitaIcons[reservaDetail.tipo]} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>Reserva de {reservaDetail.nombre}</div>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{reservaDetail.torre} - {reservaDetail.depto}</div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textMuted }}>{reservaDetail.fechaDesde} a {reservaDetail.fechaHasta} · {reservaDetail.invitados?.length || 0} huéspedes</div>
                </div>
              </div>
            </div>
            {reservaDetail.invitados?.map((inv, idx) => {
              const t = inv.timeline || {};
              const completados = progresoInvitado(inv);
              return (
                <div key={idx} style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card }}>
                  <div style={{ fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.base, color: theme.colors.text, marginBottom: '8px' }}>{inv.nombre}</div>
                  {/* Mini timeline dots */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                    {TIMELINE_STEPS.map((step, si) => {
                      const st = t[step.key];
                      const done = step.key === 'verificacionPasada' ? (t.verificacionAprobada === true || !!st) : !!st;
                      const isSpecial = step.key === 'terminosAceptados' && t.terminosAprobadoPor === 'anfitrion';
                      return (
                        <div key={step.key} title={`${step.label}${isSpecial ? ' (aprobado por anfitrión)' : ''}`} style={{ width: '14px', height: '14px', borderRadius: '50%', background: done ? (isSpecial ? theme.colors.secondary : theme.colors.success) : theme.colors.border, flexShrink: 0 }} />
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setAccionGuest({ inv, idx, item: reservaDetail })}
                    style={{
                      width: '100%', padding: '10px', borderRadius: theme.radius.full,
                      background: theme.colors.primary, color: '#fff', border: 'none',
                      cursor: 'pointer', fontFamily: theme.fonts.family,
                      fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.semibold,
                    }}
                  >
                    Ver detalles →
                  </button>
                </div>
              );
            })}
          </div>
        ) : filtered.flatMap(item => {
          if (item.tipo === 'huesped-temporal') {
            const color = colorReserva(item);
            return [(
              <div
                key={item.id}
                onClick={() => setReservaDetail(item)}
                style={{
                  background: theme.colors.bgCard,
                  borderRadius: theme.radius.xl,
                  padding: '14px 16px',
                  boxShadow: theme.shadows.card,
                  cursor: 'pointer',
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <img
                      src={tipoVisitaIcons[item.tipo]}
                      alt={TIPO_LABELS[item.tipo]}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
                        Reserva de {item.nombre}
                      </div>
                      <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginTop: '1px' }}>
                        {item.torre} - {item.depto} · {TIPO_LABELS[item.tipo]}
                      </div>
                      <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textMuted, marginTop: '2px' }}>
                        {item.fechaDesde} a {item.fechaHasta} · {item.invitados?.length || 0} huéspedes
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuItem(item); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary, fontSize: '20px', padding: '4px', flexShrink: 0 }}
                  >
                    ⋮
                  </button>
                </div>
                {/* Progress summary per group member */}
                {item.invitados && item.invitados.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${theme.colors.borderLight}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.invitados.map((inv, idx) => {
                        const completados = progresoInvitado(inv);
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                              {TIMELINE_STEPS.map((step, si) => {
                                const t = inv.timeline || {};
                                const done = si < 4 ? !!t[step.key] : !!t[step.key];
                                const isSpecial = step.key === 'terminosAceptados' && t.terminosAprobadoPor === 'anfitrion';
                                return (
                                  <div
                                    key={step.key}
                                    title={`${step.label}${isSpecial ? ' (aprobado por anfitrión)' : ''}`}
                                    style={{
                                      width: '14px', height: '14px', borderRadius: '50%',
                                      background: done ? (isSpecial ? theme.colors.secondary : theme.colors.success) : theme.colors.border,
                                      flexShrink: 0,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )];
          }
          return [(
            <div
              key={item.id}
              onClick={() => setDetalleItem(item)}
              style={{
                background: theme.colors.bgCard,
                borderRadius: theme.radius.xl,
                padding: '14px 16px',
                boxShadow: theme.shadows.card,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <img
                    src={tipoVisitaIcons[item.tipo]}
                    alt={TIPO_LABELS[item.tipo]}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
                      {item.esEvento ? item.nombreEvento : item.nombre}
                    </div>
                    <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginTop: '1px' }}>
                      {item.torre} - {item.depto} · {TIPO_LABELS[item.tipo]}
                    </div>
                    {/* DNI solo para Proveedor Temporal (lo ingresó él) */}
                    {item.tipo === 'temporal' && item.ci && (
                      <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginTop: '2px' }}>
                        DNI: {item.ci}
                      </div>
                    )}
                    {item.tipo === 'permanente' && (
                      <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textMuted, marginTop: '2px' }}>
                        Registro permanente · {item.diasLaborales || 'Lun – Vie'} · Vigencia: {item.fechaDesde}{item.fechaHasta ? ` a ${item.fechaHasta}` : ''}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setMenuItem(item); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary, fontSize: '20px', padding: '4px', flexShrink: 0 }}
                >
                  ⋮
                </button>
              </div>

              {/* Chips: notificación + vehículo/placa */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {item.tipoNotificacion && (
                  <span style={{
                    padding: '2px 8px', borderRadius: theme.radius.full,
                    background: '#F3F4F6', fontSize: theme.fonts.sizes['2xs'],
                    color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px',
                  }}>
                    🔔 {item.tipoNotificacion === 'notificar-y-anunciar' ? 'Notificar y anunciar' : 'Notificar'}
                  </span>
                )}
                {item.tieneVehiculo && (
                  <span style={{
                    padding: '2px 8px', borderRadius: theme.radius.full,
                    background: theme.colors.bgMuted, fontSize: theme.fonts.sizes['2xs'],
                    color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px',
                  }}>
                    🚗 {item.vehiculos?.length > 0 ? item.vehiculos.map(v => v.placa).filter(Boolean).join(', ') : 'Con vehículo'}
                  </span>
                )}
                <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: theme.colors.bgMuted, fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary }}>
                  📅 {item.fechaDesde}{item.fechaHasta ? ` a ${item.fechaHasta}` : ''}
                </span>
              </div>

              {/* Ingreso / Salida (cuando ocurran) */}
              {item.tipo !== 'permanente' && (item.invitados?.some(inv => inv.horaIngreso) || item.horaIngreso) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                  {item.invitados?.length > 0 ? (
                    item.invitados.map((inv, i) => inv.horaIngreso && (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {inv.nombre}: Ingreso {inv.horaIngreso}
                        {inv.horaSalida && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#92400E', background: '#FEF3C7', padding: '1px 5px', borderRadius: theme.radius.full }}>
                            ⚠ Salida {inv.horaSalida}
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    item.horaIngreso && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Ingreso {item.horaIngreso}
                        {item.horaSalida && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#92400E', background: '#FEF3C7', padding: '1px 5px', borderRadius: theme.radius.full }}>
                            ⚠ Salida {item.horaSalida}
                          </span>
                        )}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          )];
        }))}

        {/* Bulk TRA/SIRE action */}
        {tipoTab === 'huespedes' && selectedTraSire.length > 0 && (
          <div style={{
            background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '12px 16px',
            boxShadow: theme.shadows.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
              {selectedTraSire.length} seleccionado{selectedTraSire.length > 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedTraSire([])}
                style={{
                  padding: '6px 14px', borderRadius: theme.radius.full,
                  background: theme.colors.bgMuted, border: `1px solid ${theme.colors.border}`,
                  cursor: 'pointer', fontFamily: theme.fonts.family,
                  fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary,
                }}
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  selectedTraSire.forEach(key => {
                    const [visitaId, invitadoIdx] = key.split('-');
                    const idx = parseInt(invitadoIdx);
                    const visita = visitas.find(v => v.id === parseInt(visitaId));
                    if (visita && visita.invitados[idx] && !visita.invitados[idx].traSireReported) {
                      reportarTraSire(parseInt(visitaId), idx);
                    }
                  });
                  addToast(`Reporte TRA/SIRE enviado para ${selectedTraSire.length} huésped(es)`, 'success');
                  setSelectedTraSire([]);
                }}
                style={{
                  padding: '6px 14px', borderRadius: theme.radius.full,
                  background: theme.colors.secondary, color: '#fff', border: 'none',
                  cursor: 'pointer', fontFamily: theme.fonts.family,
                  fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                }}
              >
                Reportar TRA/SIRE
              </button>
            </div>
          </div>
        )}

        {/* Row counter */}
        {!showCalendar && (
          <div style={{ textAlign: 'center', fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, padding: '8px 0' }}>
            Mostrando {filtered.length} de {visitas.length} visitas
          </div>
        )}
      </div>
      </ModuloGate>

      {/* Edit bottom sheet — acciones según el rol */}
      <BottomSheet isOpen={!!menuItem} onClose={() => setMenuItem(null)}>
        {menuItem?.tipo === 'huesped-temporal' && (
          <BottomSheetOption label="Estado: Aceptado" onPress={() => handleEstado('Aceptado')} />
        )}
        {menuItem?.tipo === 'huesped-temporal' && rolActivo === 'administrador' && (
          <BottomSheetOption label="Estado: Rechazado" onPress={() => handleEstado('Rechazado')} />
        )}
        {menuItem?.tipo === 'huesped-temporal' && (rolActivo === 'propietario' || rolActivo === 'inquilino-lider') && (() => {
          const item = menuItem;
          const invitadosIngresados = item.invitados?.filter(inv => inv.llego)?.length > 0;
          const configLocal = ubicacionActiva ? configHuespedesTemporales[ubicacionActiva.id] : null;
          const rntCompleto = configLocal?.legal?.rnt?.trim()?.length > 0;
          const puedeReportar = invitadosIngresados && rntCompleto;
          return (
            <BottomSheetOption
              label={puedeReportar ? 'Reportar TRA/SIRE' : 'Reportar TRA/SIRE (completa tu RNT)'}
              variant="primary"
              disabled={!puedeReportar}
              onPress={() => {
                if (!puedeReportar) return;
                setMenuItem(null);
                setTraSireModal(item);
              }}
            />
          );
        })()}
        <BottomSheetOption label="Denunciar / Reportar" variant="primary" onPress={() => { setMenuItem(null); navigate('/perfil/soporte/reclamos/nuevo', { state: { categoriaPreseleccionada: menuItem?.tipo === 'huesped-temporal' ? 'Reporte de huésped' : 'Denuncia entre departamentos', titulo: `Denuncia: ${menuItem?.nombre || ''}`, descripcion: `Reporte desde visitas contra: ${menuItem?.nombre || ''} (CI: ${menuItem?.ci || ''})` } }); }} />
        <BottomSheetOption label="Eliminar" variant="danger" onPress={() => { setDeleteItem(menuItem); setMenuItem(null); }} />
      </BottomSheet>

      {/* Delete modal — mismo estilo que Correspondencia */}
      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Eliminar visita">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: theme.fonts.sizes.lg, textAlign: 'center', color: theme.colors.text }}>
            ¿ Seguro que desea eliminar ?
          </p>
          {deleteItem && (
            <div style={{ border: `1.5px solid ${theme.colors.primary}`, borderRadius: theme.radius.xl, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={tipoVisitaIcons[deleteItem.tipo]}
                  alt={TIPO_LABELS[deleteItem.tipo]}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base }}>
                    {deleteItem.esEvento ? deleteItem.nombreEvento : deleteItem.nombre}
                  </div>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>CI: {deleteItem.ci}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                {deleteItem.tipo === 'huesped-temporal' && <Badge status={deleteItem.estado} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                  <span>🕐</span>
                  <span>{deleteItem.fechaDesde}</span>
                </div>
              </div>
            </div>
          )}
          <Button variant="primary" fullWidth onClick={handleEliminar}>Eliminar</Button>
        </div>
      </Modal>

      {/* Detail modal — document verification enhanced */}
      <Modal
        isOpen={!!detalleItem}
        onClose={() => { setDetalleItem(null); setDetallePersonaIdx(null); }}
        title={detallePersonaIdx !== null && detallePersonaIdx >= 0 && detalleActual?.invitados[detallePersonaIdx] ? `Huésped: ${detalleActual.invitados[detallePersonaIdx].nombre}` : (detalleActual?.tipo === 'huesped-temporal' ? `Reserva: ${detalleActual?.reserva || ''}` : `Visita: ${detalleItem?.fechaDesde || ''}`)}
      >
        {detalleActual && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={tipoVisitaIcons[detalleActual.tipo]}
                  alt={TIPO_LABELS[detalleActual.tipo]}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base }}>
                    {detallePersonaIdx !== null && detallePersonaIdx >= 0 && detalleActual.invitados[detallePersonaIdx]
                      ? detalleActual.invitados[detallePersonaIdx].nombre
                      : detalleActual.nombre}
                  </div>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{detalleActual.torre} - {detalleActual.depto}</div>
                </div>
              </div>

              {/* Parking info */}
              {detalleActual.estacionamientosAsignados > 0 && (
                <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.semibold, color: theme.colors.text }}>
                    🚗 Estacionamientos asignados: {detalleActual.estacionamientosAsignados}
                  </div>
                  {detalleActual.vehiculos?.length > 0 && detalleActual.vehiculos.map((v, i) => (
                    <div key={i} style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🅿️ Vehículo {i + 1}:</span>
                      <span style={{ fontWeight: theme.fonts.weights.medium, color: theme.colors.text }}>{v.placa || 'Sin placa'}</span>
                    </div>
                  ))}
                </div>
              )}

            {/* Invitados list — solo para huésped-temporal (6 pasos) */}
            {detalleActual.tipo === 'huesped-temporal' && detalleActual.invitados.length > 0 && (
              <div>
                <p style={{ fontWeight: theme.fonts.weights.bold, textDecoration: 'underline', marginBottom: '10px' }}>Huéspedes:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detalleActual.invitados.map((inv, i) => {
                    const t = inv.timeline || {};
                    const esAdmin = rolActivo === 'administrador';
                    const esAnfitrion = rolActivo === 'propietario' || rolActivo === 'inquilino-lider';
                    const puedeAprobar = esAdmin || esAnfitrion;
                    const rntCompleto = ubicacionActiva ? configHuespedesTemporales[ubicacionActiva.id]?.legal?.rnt?.trim()?.length > 0 : false;
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
                    const esExcepcionTc = inv.terminosExcepcion === true && t.terminosAceptados !== true;
                    return (
                      <div key={i} style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px' }}>
                        <div style={{ fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.base, marginBottom: '10px' }}>
                          {inv.nombre}
                        </div>
                        {TIMELINE_STEPS.map((step, si) => {
                          const st = stepStatus(step.key);
                          const isCompleted = st === true || st === 'aprobado-manual' || st === 'aprobada';
                          const isPending = st === null;
                          const isRejected = st === false && step.key === 'terminosAceptados';
                          const isAprobadoManual = st === 'aprobado-manual';
                          const icon = isCompleted ? '✅' : (isPending ? '⏳' : (isRejected ? '❌' : '⏳'));
                          return (
                            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: theme.colors.bgCard, borderRadius: theme.radius.md, marginBottom: '4px' }}>
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                              <span style={{ flex: 1, fontSize: theme.fonts.sizes.xs, color: theme.colors.text }}>
                                {si + 1}. {step.label}
                                {isAprobadoManual && (
                                  <span style={{ color: theme.colors.secondary, fontWeight: theme.fonts.weights.semibold, marginLeft: '4px' }}>
                                    (aprobado por anfitrión)
                                  </span>
                                )}
                                {st === 'aprobada' && (
                                  <span style={{ color: theme.colors.success, fontWeight: theme.fonts.weights.semibold, marginLeft: '4px' }}>
                                    (aprobada)
                                  </span>
                                )}
                              </span>
                              {/* Step 2 — Ver documentación */}
                              {step.key === 'documentacionCompleta' && isCompleted && inv.documentos?.length > 0 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDocumentacionDetail({ invitado: inv, item: detalleActual }); }}
                                  style={{
                                    padding: '4px 10px', borderRadius: theme.radius.full,
                                    background: theme.colors.primary, color: '#fff', border: 'none',
                                    cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
                                    fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
                                  }}
                                >
                                  Ver documentación
                                </button>
                              )}
                              {/* Step 3 — Excepción T&C */}
                              {step.key === 'terminosAceptados' && esExcepcionTc && puedeAprobar && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '12px', color: theme.colors.warning, fontWeight: theme.fonts.weights.bold }}>⚠</span>
                                  <button
                                    onClick={() => { aprobarTerminosManual(detalleActual.id, i); addToast('Excepción T&C aceptada para ' + inv.nombre, 'success'); }}
                                    style={{
                                      padding: '4px 10px', borderRadius: theme.radius.full,
                                      background: theme.colors.secondary, color: '#fff', border: 'none',
                                      cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
                                      fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
                                    }}
                                  >
                                    Aceptar excepción
                                  </button>
                                </div>
                              )}
                              {/* Step 4 — Resultado de verificación + Aprobar */}
                              {step.key === 'verificacionPasada' && puedeAprobar && !t.verificacionAprobada && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  {t.verificacionHallazgos === true ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setHallazgosPopup({ persona: inv, idx: i, item: detalleActual }); }}
                                      style={{
                                        padding: '4px 10px', borderRadius: theme.radius.full,
                                        background: '#FEF3C7', color: '#92400E', border: 'none',
                                        cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
                                        fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
                                      }}
                                    >
                                      Ver resumen
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary }}>
                                      {t.verificacionHallazgos === false ? 'Sin hallazgos' : 'Sin resultados'}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => { aprobarVerificacion(detalleActual.id, i); addToast('Verificación aprobada para ' + inv.nombre, 'success'); }}
                                    style={{
                                      padding: '4px 10px', borderRadius: theme.radius.full,
                                      background: theme.colors.success, color: '#fff', border: 'none',
                                      cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
                                      fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
                                    }}
                                  >
                                    Aprobar
                                  </button>
                                </div>
                              )}
                              {/* Step 5 — Reportar TRA (solo si ingresó) */}
                              {step.key === 'trasideEntrada' && isCompleted && puedeAprobar && !inv.traSireReported && (
                                <button
                                  onClick={() => {
                                    if (!rntCompleto) { addToast('Completa tu RNT en la configuración de Huéspedes Temporales', 'warning'); return; }
                                    reportarTraSire(detalleActual.id, i);
                                    addToast('Reporte TRA enviado exitosamente', 'success');
                                  }}
                                  style={{
                                    padding: '4px 10px', borderRadius: theme.radius.full,
                                    background: theme.colors.secondary, color: '#fff', border: 'none',
                                    cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
                                    fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
                                  }}
                                >
                                  Reportar TRA
                                </button>
                              )}
                              {/* Step 6 — Reportar SIRE (solo si salió) */}
                              {step.key === 'trasideSalida' && isCompleted && puedeAprobar && !inv.traSireReported && (
                                <button
                                  onClick={() => {
                                    if (!rntCompleto) { addToast('Completa tu RNT en la configuración de Huéspedes Temporales', 'warning'); return; }
                                    reportarTraSire(detalleActual.id, i);
                                    addToast('Reporte SIRE enviado exitosamente', 'success');
                                  }}
                                  style={{
                                    padding: '4px 10px', borderRadius: theme.radius.full,
                                    background: theme.colors.secondary, color: '#fff', border: 'none',
                                    cursor: 'pointer', fontSize: theme.fonts.sizes['2xs'],
                                    fontFamily: theme.fonts.family, fontWeight: theme.fonts.weights.semibold,
                                  }}
                                >
                                  Reportar SIRE
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {/* TRA/SIRE — badge de estado (vista consolidada) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.colors.borderLight}` }}>
                          {inv.traSireReported ? (
                            <Badge status="Aceptado">TRA/SIRE reportado</Badge>
                          ) : (
                            <Badge status="Pendiente">TRA/SIRE pendiente</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cuerpo visitas normales (no-huésped-temporal) — vista Propietario/Anfitrión */}
            {detalleActual.tipo !== 'huesped-temporal' && (() => {
              const tipo = detalleActual.tipo;
              const notificacionLabel = detalleActual.tipoNotificacion === 'notificar-y-anunciar' ? 'Notificar y anunciar' : 'Notificar';
              const personas = detalleActual.invitados && detalleActual.invitados.length > 0
                ? detalleActual.invitados
                : [{ nombre: detalleActual.nombre, horaIngreso: detalleActual.horaIngreso, horaSalida: detalleActual.horaSalida }];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tipo === 'permanente' && (
                    <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary }}>Registro permanente</div>
                      <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>{detalleActual.diasLaborales || 'Sin días laborales asignados'}</div>
                    </div>
                  )}
                  {personas.map((inv, i) => (
                    <div key={i} style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px' }}>
                      <div style={{ fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.base }}>{inv.nombre}</div>
                      <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, marginTop: '2px' }}>
                        📅 {detalleActual.fechaDesde}{detalleActual.fechaHasta ? ` a ${detalleActual.fechaHasta}` : ''}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: '#F3F4F6', fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          🔔 {notificacionLabel}
                        </span>
                        {detalleActual.tieneVehiculo && (
                          <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: theme.colors.bgCard, fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            🚗 {detalleActual.vehiculos?.length > 0 ? detalleActual.vehiculos.map(v => v.placa).filter(Boolean).join(', ') : 'Con vehículo'}
                          </span>
                        )}
                        {/* DNI solo para Proveedor Temporal (lo ingresó él) */}
                        {tipo === 'temporal' && detalleActual.ci && (
                          <span style={{ padding: '2px 8px', borderRadius: theme.radius.full, background: theme.colors.bgCard, fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            🆔 DNI: {detalleActual.ci}
                          </span>
                        )}
                      </div>
                      {/* Ingreso / Salida — solo para amigos y temporal (no para permanente) */}
                      {tipo !== 'permanente' && inv.horaIngreso && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Ingreso: {inv.horaIngreso}
                          </span>
                          {inv.horaSalida && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#92400E', background: '#FEF3C7', padding: '1px 6px', borderRadius: theme.radius.full }}>
                              ⚠ Salida: {inv.horaSalida} (inexacta)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Tutela - solo para Admin y Guardia si es menor de edad */}
            {detalleActual.esMenor && detalleActual.tieneTutela && (rolActivo === 'administrador' || rolActivo === 'guardia') && (
              <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.xl, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>Documento de Tutela</span>
                </div>
                <button
                  type="button"
                  onClick={undefined}
                  style={{
                    padding: '6px 14px',
                    borderRadius: theme.radius.full,
                    background: theme.colors.secondary,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: theme.fonts.sizes.xs,
                    fontWeight: theme.fonts.weights.semibold,
                    fontFamily: theme.fonts.family,
                  }}
                >
                  Descargar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Documentación detail modal */}
      <Modal
        isOpen={!!documentacionDetail}
        onClose={() => setDocumentacionDetail(null)}
        title={`Documentación de ${documentacionDetail?.invitado?.nombre || ''}`}
      >
        {documentacionDetail && (() => {
          const inv = documentacionDetail.invitado;
          const item = documentacionDetail.item;
          const docLabels = {
            'cedula-anverso': 'Cédula (anverso)',
            'cedula-reverso': 'Cédula (reverso)',
            'pasaporte': 'Pasaporte',
            'tutela': 'Tutela',
          };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Tipo de documento */}
              <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px 14px' }}>
                <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary, marginBottom: '4px' }}>Tipo de documento</div>
                <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text, fontWeight: theme.fonts.weights.medium }}>{inv.tipoDocumento || 'No especificado'}</div>
              </div>
              {/* Imágenes subidas */}
              {inv.documentos?.length > 0 && (
                <div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary, marginBottom: '8px' }}>Imágenes del documento</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {inv.documentos.map((doc, di) => (
                      <div key={di} style={{
                        width: 'calc(50% - 4px)', minHeight: '100px',
                        borderRadius: theme.radius.md,
                        background: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${theme.colors.border}`,
                        padding: '8px',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <div style={{ fontSize: '9px', color: theme.colors.textSecondary, marginTop: '4px', textAlign: 'center' }}>{docLabels[doc] || doc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Datos extraídos automáticamente */}
              <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px 14px' }}>
                <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary, marginBottom: '8px' }}>Datos extraídos automáticamente</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>Nombre completo</span>
                    <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text, fontWeight: theme.fonts.weights.medium }}>{inv.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>Número de documento</span>
                    <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text, fontWeight: theme.fonts.weights.medium }}>{inv.documentoNumero || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>Fecha de nacimiento</span>
                    <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text, fontWeight: theme.fonts.weights.medium }}>{inv.fechaNacimiento || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="ghost" fullWidth onClick={() => setDocumentacionDetail(null)}>Cerrar</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Acciones por huésped — modal individual */}
      <Modal
        isOpen={!!accionGuest}
        onClose={() => setAccionGuest(null)}
        title={`Acciones: ${accionGuest?.inv?.nombre || ''}`}
      >
        {accionGuest && (() => {
          const { inv, idx, item } = accionGuest;
          const t = inv.timeline || {};
          const esAdmin = rolActivo === 'administrador';
          const esAnfitrion = rolActivo === 'propietario' || rolActivo === 'inquilino-lider';
          const puedeAprobar = esAdmin || esAnfitrion;
          const rntCompleto = ubicacionActiva ? configHuespedesTemporales[ubicacionActiva.id]?.legal?.rnt?.trim()?.length > 0 : false;
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
          const esExcepcionTc = inv.terminosExcepcion === true && t.terminosAceptados !== true;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={tipoVisitaIcons[item.tipo]} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>{inv.nombre}</div>
                  <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>{item.torre} - {item.depto} · {item.fechaDesde} a {item.fechaHasta}</div>
                </div>
              </div>
              {TIMELINE_STEPS.map((step, si) => {
                const st = stepStatus(step.key);
                const isCompleted = st === true || st === 'aprobado-manual' || st === 'aprobada';
                const isPending = st === null;
                const isRejected = st === false && step.key === 'terminosAceptados';
                const isAprobadoManual = st === 'aprobado-manual';
                const icon = isCompleted ? '✅' : (isPending ? '⏳' : (isRejected ? '❌' : '⏳'));
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: theme.colors.bgCard, borderRadius: theme.radius.md, marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                    <span style={{ flex: 1, fontSize: theme.fonts.sizes.xs, color: theme.colors.text }}>
                      {si + 1}. {step.label}
                      {isAprobadoManual && <span style={{ color: theme.colors.secondary, fontWeight: theme.fonts.weights.semibold, marginLeft: '4px' }}>(aprobado por anfitrión)</span>}
                      {st === 'aprobada' && <span style={{ color: theme.colors.success, fontWeight: theme.fonts.weights.semibold, marginLeft: '4px' }}>(aprobada)</span>}
                    </span>
                    {/* Step 2 — Ver documentación */}
                    {step.key === 'documentacionCompleta' && isCompleted && inv.documentos?.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDocumentacionDetail({ invitado: inv, item }); }}
                        style={btnStyle(theme.colors.primary)}
                      >
                        Ver documentación
                      </button>
                    )}
                    {/* Step 3 — Excepción T&C */}
                    {step.key === 'terminosAceptados' && esExcepcionTc && puedeAprobar && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: theme.colors.warning, fontWeight: theme.fonts.weights.bold }}>⚠</span>
                        <button
                          onClick={() => { aprobarTerminosManual(item.id, idx); addToast('Excepción T&C aceptada para ' + inv.nombre, 'success'); setAccionGuest(null); }}
                          style={btnStyle(theme.colors.secondary)}
                        >
                          Aceptar excepción
                        </button>
                      </div>
                    )}
                    {/* Step 4 — Resultado verificación + Aprobar */}
                    {step.key === 'verificacionPasada' && puedeAprobar && !t.verificacionAprobada && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {t.verificacionHallazgos === true ? (
                          <button onClick={(e) => { e.stopPropagation(); setHallazgosPopup({ persona: inv, idx, item }); }} style={btnStyle('#FEF3C7', '#92400E')}>Ver resumen</button>
                        ) : (
                          <span style={{ fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary }}>{t.verificacionHallazgos === false ? 'Sin hallazgos' : 'Sin resultados'}</span>
                        )}
                        <button
                          onClick={() => { aprobarVerificacion(item.id, idx); addToast('Verificación aprobada para ' + inv.nombre, 'success'); setAccionGuest(null); }}
                          style={btnStyle(theme.colors.success)}
                        >
                          Aprobar
                        </button>
                      </div>
                    )}
                    {/* Step 5 — Reportar TRA */}
                    {step.key === 'trasideEntrada' && isCompleted && puedeAprobar && !inv.traSireReported && (
                      <button
                        onClick={() => {
                          if (!rntCompleto) { addToast('Completa tu RNT en la configuración de Huéspedes Temporales', 'warning'); return; }
                          reportarTraSire(item.id, idx);
                          addToast('Reporte TRA enviado exitosamente', 'success');
                          setAccionGuest(null);
                        }}
                        style={btnStyle(theme.colors.secondary)}
                      >
                        Reportar TRA
                      </button>
                    )}
                    {/* Step 6 — Reportar SIRE */}
                    {step.key === 'trasideSalida' && isCompleted && puedeAprobar && !inv.traSireReported && (
                      <button
                        onClick={() => {
                          if (!rntCompleto) { addToast('Completa tu RNT en la configuración de Huéspedes Temporales', 'warning'); return; }
                          reportarTraSire(item.id, idx);
                          addToast('Reporte SIRE enviado exitosamente', 'success');
                          setAccionGuest(null);
                        }}
                        style={btnStyle(theme.colors.secondary)}
                      >
                        Reportar SIRE
                      </button>
                    )}
                  </div>
                );
              })}
              {/* TRA/SIRE badge consolidado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', paddingTop: '8px', borderTop: `1px solid ${theme.colors.borderLight}` }}>
                {inv.traSireReported ? <Badge status="Aceptado">TRA/SIRE reportado</Badge> : <Badge status="Pendiente">TRA/SIRE pendiente</Badge>}
              </div>
              <Button variant="ghost" fullWidth onClick={() => setAccionGuest(null)}>Cerrar</Button>
            </div>
          );
        })()}
      </Modal>

      {/* Verification camera modal — for Guardia (huesped-temporal) */}
      <Modal
        isOpen={!!verificandoInvitado && capturaStep === null}
        onClose={() => { setVerificandoInvitado(null); setCapturaStep(null); setVerifResultado(null); }}
        title="Verificar documento"
      >
        {verificandoInvitado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Saved document from database — reference for comparison */}
            {verificandoInvitado.documentos?.length > 0 && (
              <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '10px 12px' }}>
                <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary, marginBottom: '6px' }}>
                  Documento registrado en base de datos:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {verificandoInvitado.documentos.map((doc, di) => {
                    const docLabels = {
                      'cedula-anverso': 'Cédula (anv.)',
                      'cedula-reverso': 'Cédula (rev.)',
                      'pasaporte': 'Pasaporte',
                      'tutela': 'Tutela',
                    };
                    return (
                      <div key={di} style={{
                        padding: '6px 10px', borderRadius: theme.radius.md,
                        background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`,
                        fontSize: theme.fonts.sizes.xs, color: theme.colors.text,
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {docLabels[doc] || doc}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Camera capture area */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '140px', height: '140px', margin: '0 auto',
                borderRadius: theme.radius.xl,
                background: theme.colors.bgMuted,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                border: `2px dashed ${theme.colors.border}`,
                fontSize: '48px', color: theme.colors.textMuted,
              }}>
                📷
              </div>
              <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, lineHeight: 1.5, margin: '8px 0 0' }}>
                Capture una foto del documento presentado por <strong>{verificandoInvitado.nombre}</strong> para compararlo visualmente con el documento registrado
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setCapturaStep('capturando');
                  setTimeout(() => {
                    setCapturaStep('verificando');
                    setTimeout(() => {
                      const resultado = Math.random();
                      let estado, mensaje;
                      if (resultado > 0.6) {
                        estado = 'verificado';
                        mensaje = 'Documento verificado correctamente';
                      } else if (resultado > 0.3) {
                        estado = 'no-coincide';
                        mensaje = 'Documento no coincide';
                      } else {
                        estado = 'fallido';
                        mensaje = 'Verificación fallida';
                      }
                      setVerifResultado({ estado, mensaje });
                      actualizarVerificacion(verificandoInvitado.visitaId, verificandoInvitado.invitadoIdx, {
                        estado,
                        documentoTomado: '/mock/captured-doc.jpg',
                        fechaVerificacion: new Date().toLocaleDateString('es-AR'),
                        verificadoPor: 'Roberto Hornado',
                      });
                      setCapturaStep('resultado');
                    }, 1500);
                  }, 1000);
                }}
              >
                Capturar fotografía
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verification progress modal */}
      <Modal
        isOpen={capturaStep === 'capturando' || capturaStep === 'verificando'}
        onClose={() => { setVerificandoInvitado(null); setCapturaStep(null); setVerifResultado(null); }}
        title="Verificando documento"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', padding: '12px 0' }}>
          {capturaStep === 'capturando' && (
            <>
              <div style={{ fontSize: '48px', animation: 'pulse 1s infinite' }}>📸</div>
              <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>Capturando imagen...</p>
            </>
          )}
          {capturaStep === 'verificando' && (
            <>
              <div style={{ fontSize: '48px', animation: 'pulse 1s infinite' }}>🔄</div>
              <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>Comparando documento capturado con el registrado en base de datos...</p>
            </>
          )}
        </div>
      </Modal>

      {/* Verification result modal */}
      <Modal
        isOpen={capturaStep === 'resultado' && !!verifResultado}
        onClose={() => { setVerificandoInvitado(null); setCapturaStep(null); setVerifResultado(null); }}
        title="Resultado de verificación"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
          {verifResultado?.estado === 'verificado' && (
            <>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.success, fontWeight: theme.fonts.weights.semibold, margin: 0 }}>
                {verifResultado.mensaje}
              </p>
            </>
          )}
          {verifResultado?.estado === 'no-coincide' && (
            <>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.colors.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.colors.danger} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.danger, fontWeight: theme.fonts.weights.semibold, margin: 0 }}>
                {verifResultado.mensaje}
              </p>
            </>
          )}
          {verifResultado?.estado === 'fallido' && (
            <>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.colors.bgMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.colors.warning} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.warning, fontWeight: theme.fonts.weights.semibold, margin: 0 }}>
                {verifResultado.mensaje}
              </p>
            </>
          )}
          <Button variant="primary" fullWidth onClick={() => {
            if (verifResultado?.estado === 'verificado' && verificandoInvitado) {
              setGuardiaStep2(`${verificandoInvitado.visitaId}-${verificandoInvitado.invitadoIdx}`);
            }
            setVerificandoInvitado(null);
            setCapturaStep(null);
            setVerifResultado(null);
          }}>
            {verifResultado?.estado === 'verificado' ? 'Continuar' : 'Cerrar'}
          </Button>
        </div>
      </Modal>

      {/* Guardia detail modal */}
      <Modal
        isOpen={!!detalleGuardia}
        onClose={() => setDetalleGuardia(null)}
        title={detalleGuardia?.base?.nombre || ''}
      >
        {detalleGuardia && (() => {
          const p = detalleGuardia;
          const esVerificacionObligatoria = p.base.tipo !== 'amigos' || p.base.instruccionDocumento === 'verificar';
          const cumplidas = p.base.instruccionesCumplidas || {};
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={tipoVisitaIcons[p.base.tipo]}
                  alt={TIPO_LABELS[p.base.tipo]}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.base }}>{p.persona.nombre}</div>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{p.base.torre} - {p.base.depto} · {TIPO_LABELS[p.base.tipo]}</div>
                </div>
                {p.base.tipo === 'huesped-temporal' && <Badge status={statusForGuardia(p.base.estado)} />}
              </div>

              <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textMuted, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span>📅 {p.base.fechaDesde}{p.base.fechaHasta ? ` a ${p.base.fechaHasta}` : ''}</span>
              </div>

              {/* Compact block: instrucción, notificación, vehículo, estacionamiento — una línea cada uno */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 0' }}>
                {p.base.instruccionDocumento && (
                  <span style={{
                    padding: '2px 8px', borderRadius: theme.radius.full,
                    background: p.base.instruccionDocumento === 'verificar' ? '#FEF3C7' : '#DBEAFE',
                    fontSize: theme.fonts.sizes['2xs'], color: p.base.instruccionDocumento === 'verificar' ? '#92400E' : '#1E40AF',
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    whiteSpace: 'nowrap',
                  }}>
                    {p.base.instruccionDocumento === 'verificar' ? '🆔 Verificar' : '🔓 No verificar'}
                  </span>
                )}
                {p.base.tipoNotificacion && (
                  <span style={{
                    padding: '2px 8px', borderRadius: theme.radius.full,
                    background: '#F3F4F6',
                    fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary,
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    whiteSpace: 'nowrap',
                  }}>
                    🔔 {p.base.tipoNotificacion === 'notificar-y-anunciar' ? 'Anunciar' : 'Notificar'}
                  </span>
                )}
                <span style={{
                  padding: '2px 8px', borderRadius: theme.radius.full,
                  background: theme.colors.bgMuted,
                  fontSize: theme.fonts.sizes['2xs'], color: theme.colors.textSecondary,
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  whiteSpace: 'nowrap',
                }}>
                  🚗 {p.base.tieneVehiculo ? `Con vehículo${p.base.vehiculos?.length > 0 ? ` (${p.base.vehiculos.map(v => v.placa).filter(Boolean).join(',')})` : ''}` : 'Sin vehículo'}
                </span>
                {estacionamientosVisitantes && estacionamientosVisitantes.total > 0 && (
                  <span style={{
                    padding: '2px 8px', borderRadius: theme.radius.full,
                    background: estacionamientosVisitantes.ocupados < estacionamientosVisitantes.total ? '#F0FDF4' : '#FEF2F2',
                    fontSize: theme.fonts.sizes['2xs'],
                    color: estacionamientosVisitantes.ocupados < estacionamientosVisitantes.total ? '#166534' : '#991B1B',
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    whiteSpace: 'nowrap',
                  }}>
                    🅿️ {estacionamientosVisitantes.total - estacionamientosVisitantes.ocupados} libres
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '8px 0',
                borderTop: `1px solid ${theme.colors.borderLight}`,
              }}>
                {/* Verificación de cédula — automática al validar el documento (solo Proveedor Temporal) */}
                {p.base.tipo === 'temporal' && (
                  p.persona.ciVerificado ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.fonts.sizes.xs, color: theme.colors.success, fontWeight: theme.fonts.weights.semibold }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Cédula verificada
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setVerificandoPersona({ ...p, esObligatoria: esVerificacionObligatoria });
                        setCiInput('');
                        setCiError('');
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: theme.radius.full,
                        background: '#FEF3C7', color: '#92400E', border: 'none',
                        cursor: 'pointer', fontFamily: theme.fonts.family,
                        fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                      }}
                    >
                      🆔 Verificar cédula
                    </button>
                  )
                )}
                {/* Llamé / No lo anuncié — único checkbox manual del Guardia */}
                <label
                  onClick={() => toggleInstruccionCumplida(p.base.id, 'llamoAnuncie')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '4px 0',
                    fontSize: theme.fonts.sizes.xs,
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.family,
                    userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: `2px solid ${cumplidas.llamoAnuncie ? theme.colors.success : theme.colors.border}`,
                    background: cumplidas.llamoAnuncie ? theme.colors.success : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 150ms',
                  }}>
                    {cumplidas.llamoAnuncie && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  Llamé / No lo anuncié
                </label>
              </div>

              {/* 2-step flow for huesped-temporal (guardia) */}
              {p.base.tipo === 'huesped-temporal' && !p.persona.llego && (
                <div style={{
                  padding: '12px 0',
                  borderTop: `1px solid ${theme.colors.borderLight}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {/* Step 1: Physical appearance check */}
                  <div style={{
                    background: guardiaStep1 === `${p.base.id}-${p.idx}` ? '#F0FDF4' : theme.colors.bgMuted,
                    borderRadius: theme.radius.lg,
                    padding: '12px',
                    border: `1.5px solid ${guardiaStep1 === `${p.base.id}-${p.idx}` ? theme.colors.success : theme.colors.border}`,
                  }}>
                    <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary, marginBottom: '8px' }}>
                      Paso 1 — Verificar apariencia física
                    </div>
                    <div style={{
                      width: '100%', height: '120px',
                      borderRadius: theme.radius.md,
                      background: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      marginBottom: '4px',
                      border: `1px solid ${theme.colors.border}`,
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <div style={{ fontSize: '9px', color: theme.colors.textSecondary, marginTop: '2px' }}>
                        Foto extraída del documento
                      </div>
                      <div style={{
                        position: 'absolute', bottom: '4px', left: 0, right: 0,
                        textAlign: 'center',
                        fontSize: '9px',
                        color: theme.colors.textMuted,
                        background: 'rgba(255,255,255,0.8)',
                        padding: '2px 4px',
                        transform: 'rotate(-15deg)',
                        letterSpacing: '1px',
                      }}>
                        {usuario?.nombre || 'Roberto Hornado'} · Portería
                      </div>
                    </div>
                    {guardiaStep1 === `${p.base.id}-${p.idx}` ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.fonts.sizes.xs, color: theme.colors.success }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Coincide apariencia física
                      </div>
                    ) : (
                      <button
                        onClick={() => setGuardiaStep1(`${p.base.id}-${p.idx}`)}
                        style={{
                          width: '100%', padding: '8px', borderRadius: theme.radius.full,
                          background: theme.colors.primary, color: '#fff', border: 'none',
                          cursor: 'pointer', fontFamily: theme.fonts.family,
                          fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                        }}
                      >
                        Coincide apariencia física
                      </button>
                    )}
                  </div>

                  {/* Step 2: Document scan */}
                  <div style={{
                    background: guardiaStep2 === `${p.base.id}-${p.idx}` ? '#F0FDF4' : theme.colors.bgMuted,
                    borderRadius: theme.radius.lg,
                    padding: '12px',
                    border: `1.5px solid ${guardiaStep2 === `${p.base.id}-${p.idx}` ? theme.colors.success : theme.colors.border}`,
                    opacity: !guardiaStep1 ? 0.5 : 1,
                  }}>
                    <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary, marginBottom: '8px' }}>
                      Paso 2 — Escanear documento físico
                    </div>
                    {guardiaStep2 === `${p.base.id}-${p.idx}` ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.fonts.sizes.xs, color: theme.colors.success }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Documento verificado correctamente
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!guardiaStep1) return;
                          setVerificandoInvitado({ visitaId: p.base.id, invitadoIdx: p.idx, nombre: p.persona.nombre, documentos: p.persona.documentos || [] });
                        }}
                        disabled={!guardiaStep1}
                        style={{
                          width: '100%', padding: '8px', borderRadius: theme.radius.full,
                          background: guardiaStep1 ? theme.colors.secondary : theme.colors.bgMuted,
                          color: guardiaStep1 ? '#fff' : theme.colors.textMuted,
                          border: 'none', cursor: guardiaStep1 ? 'pointer' : 'not-allowed',
                          fontFamily: theme.fonts.family, fontSize: theme.fonts.sizes.xs,
                          fontWeight: theme.fonts.weights.semibold,
                        }}
                      >
                        📷 Escanear documento
                      </button>
                    )}
                  </div>

                  {/* Mark arrived — enabled only after both steps */}
                  {guardiaStep1 && guardiaStep2 && (
                    <button
                      onClick={() => {
                        setLlegoInvitado(p.base.id, p.idx, true);
                        actualizarHoraIngreso(p.base.id, p.idx, new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
                        setGuardiaStep1(null);
                        setGuardiaStep2(null);
                      }}
                      style={{
                        width: '100%', padding: '12px', borderRadius: theme.radius.full,
                        background: theme.colors.success, color: '#fff', border: 'none',
                        cursor: 'pointer', fontFamily: theme.fonts.family,
                        fontSize: theme.fonts.sizes.base, fontWeight: theme.fonts.weights.bold,
                      }}
                    >
                      Marcar ingreso — Llegó
                    </button>
                  )}
                </div>
              )}

              {/* Arrival toggle — always visible for guardia */}
              <div style={{
                padding: '8px 0',
                borderTop: `1px solid ${theme.colors.borderLight}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Toggle value={p.persona.llego}                     onChange={() => {
                      if (p.base.tipo === 'huesped-temporal') {
                        setLlegoInvitado(p.base.id, p.idx, !p.persona.llego);
                        } else if (!p.persona.llego && p.base.tipo === 'temporal' && !p.persona.ciVerificado) {
                          addToast('Debes verificar la cédula (validar el documento) antes de registrar el ingreso', 'warning');
                      } else if (!p.persona.llego && esVerificacionObligatoria && p.base.ci && !p.persona.ciVerificado) {
                        setVerificandoPersona({ ...p, esObligatoria: true });
                        setCiInput('');
                        setCiError('');
                      } else if (!p.persona.llego && !esVerificacionObligatoria && p.base.ci && !p.persona.ciVerificado) {
                        setVerificandoPersona({ ...p, esObligatoria: false });
                        setCiInput('');
                        setCiError('');
                      } else {
                        setLlegoInvitado(p.base.id, p.idx, !p.persona.llego);
                      }
                    }} />
                    <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>
                      {p.persona.llego ? 'Llegó' : 'No llegó'}
                    </span>
                  </div>
                  {p.base.ci && p.persona.llego && p.persona.ciVerificado && (
                    <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.success, display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                      ✓ Identidad verificada
                    </span>
                  )}
                  {p.base.tipo !== 'huesped-temporal' && p.base.tipo !== 'temporal' && p.base.ci && !p.persona.llego && (
                    <button
                      onClick={() => {
                        setVerificandoPersona({ ...p, esObligatoria: esVerificacionObligatoria });
                        setCiInput('');
                        setCiError('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.primary,
                        fontSize: theme.fonts.sizes.xs,
                        cursor: 'pointer',
                        fontFamily: theme.fonts.family,
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Verificar
                    </button>
                  )}
                  {p.base.tipo !== 'huesped-temporal' && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>Ingreso</span>
                      <input
                        type="time"
                        value={p.persona.horaIngreso || ''}
                        onChange={e => actualizarHoraIngreso(p.base.id, p.idx, e.target.value)}
                        style={{
                          width: '110px',
                          padding: '8px 10px',
                          borderRadius: theme.radius.md,
                          border: `1.5px solid ${theme.colors.border}`,
                          fontSize: theme.fonts.sizes.sm,
                          fontFamily: theme.fonts.family,
                          color: theme.colors.text,
                          background: theme.colors.bgMuted,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>Salida</span>
                      <input
                        type="time"
                        value={p.persona.horaSalida || ''}
                        onChange={e => actualizarHoraSalida(p.base.id, p.idx, e.target.value)}
                        style={{
                          width: '110px',
                          padding: '8px 10px',
                          borderRadius: theme.radius.md,
                          border: `1.5px solid ${theme.colors.border}`,
                          fontSize: theme.fonts.sizes.sm,
                          fontFamily: theme.fonts.family,
                          color: theme.colors.text,
                          background: theme.colors.bgMuted,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      {p.persona.horaSalida && (
                        <span
                          onClick={() => {
                            const nuevaHora = prompt('Ingrese la hora aproximada de salida:');
                            if (nuevaHora) actualizarHoraSalida(p.base.id, p.idx, nuevaHora);
                          }}
                          style={{
                            fontSize: '10px', cursor: 'pointer',
                            color: theme.colors.warning, fontWeight: theme.fonts.weights.bold,
                            display: 'inline-flex', alignItems: 'center', gap: '2px',
                            padding: '2px 4px', borderRadius: theme.radius.sm,
                            background: '#FEF3C7',
                          }}
                          title="Hora inexacta"
                        >
                          ⚠
                        </span>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>

              {/* Acciones Guardia — visitas normales (no-huésped-temporal) */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 0 0',
                borderTop: `1px solid ${theme.colors.borderLight}`,
              }}>
                {/* Salió */}
                <button
                  onClick={() => {
                    if (!p.persona.llego) {
                      addToast('El visitante aún no ingresó', 'warning');
                      return;
                    }
                    if (p.persona.horaSalida) {
                      addToast('La salida ya fue registrada', 'info');
                      return;
                    }
                    actualizarHoraSalida(p.base.id, p.idx, new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
                    addToast('Salida registrada (hora aproximada)', 'success');
                  }}
                  style={{
                    flex: '1 1 auto', minWidth: '120px', padding: '10px', borderRadius: theme.radius.full,
                    background: p.persona.horaSalida ? theme.colors.bgMuted : '#FEF3C7',
                    color: p.persona.horaSalida ? theme.colors.textMuted : '#92400E',
                    border: 'none', cursor: 'pointer', fontFamily: theme.fonts.family,
                    fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  🚪 {p.persona.horaSalida ? `Salió ${p.persona.horaSalida} (aprox.)` : 'Salió'}
                </button>
                {/* Asignar estacionamiento */}
                <button
                  onClick={() => { setParkingSpot(''); setShowAsignarEstacionamiento(true); }}
                  style={{
                    flex: '1 1 auto', minWidth: '120px', padding: '10px', borderRadius: theme.radius.full,
                    background: theme.colors.bgMuted, color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`, cursor: 'pointer', fontFamily: theme.fonts.family,
                    fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  🅿️ Asignar estacionamiento
                </button>
                {/* Llamar / Anunciar */}
                {p.base.tipoNotificacion === 'notificar-y-anunciar' && (
                  <button
                    onClick={() => {
                      if (p.base.telefonoResidente) {
                        window.location.href = `tel:${p.base.telefonoResidente}`;
                      }
                      addToast(`Anunciado: ${p.persona.nombre} en ${p.base.torre}-${p.base.depto}`, 'info');
                    }}
                    style={{
                      flex: '1 1 auto', minWidth: '120px', padding: '10px', borderRadius: theme.radius.full,
                      background: theme.colors.primary, color: '#fff', border: 'none',
                      cursor: 'pointer', fontFamily: theme.fonts.family,
                      fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    📞 Llamar / Anunciar
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Asignar estacionamiento modal — Guardia */}
      <Modal isOpen={showAsignarEstacionamiento} onClose={() => setShowAsignarEstacionamiento(false)} title="Asignar estacionamiento">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, textAlign: 'center' }}>
            Asigne un cupo disponible al visitante
          </div>
          <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
            Visitante: <strong>{detalleGuardia ? `${detalleGuardia.persona.nombre} (${detalleGuardia.base.torre}-${detalleGuardia.base.depto})` : ''}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
            {Array.from({ length: estacionamientosVisitantes?.total || 20 }, (_, i) => {
              const spot = `B${String(i + 1).padStart(2, '0')}`;
              const libre = estacionamientosVisitantes.ocupados < estacionamientosVisitantes.total;
              return (
                <button
                  key={spot}
                  onClick={() => setParkingSpot(spot)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: theme.radius.lg,
                    border: `2px solid ${parkingSpot === spot ? theme.colors.primary : theme.colors.border}`,
                    background: parkingSpot === spot ? theme.colors.primaryLight : theme.colors.bgMuted,
                    cursor: 'pointer', fontFamily: theme.fonts.family,
                    fontSize: theme.fonts.sizes.sm, color: theme.colors.text,
                  }}
                >
                  <span style={{ fontWeight: theme.fonts.weights.bold }}>{spot}</span>
                  <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                    {parkingSpot === spot ? 'Seleccionado' : (libre ? 'Disponible' : 'Sin cupos libres')}
                  </span>
                </button>
              );
            })}
          </div>
          <Button variant="primary" fullWidth disabled={!parkingSpot} onClick={() => {
            if (parkingSpot && estacionamientosVisitantes.ocupados < estacionamientosVisitantes.total) {
              actualizarEstacionamientosVisitantes({ ocupados: estacionamientosVisitantes.ocupados + 1 });
              addToast(`Estacionamiento ${parkingSpot} asignado a ${detalleGuardia?.persona.nombre}`, 'success');
            } else {
              addToast('No hay cupos libres', 'warning');
            }
            setShowAsignarEstacionamiento(false);
            setParkingSpot('');
          }}>
            Confirmar asignación
          </Button>
        </div>
      </Modal>

      {/* Identity verification modal — for guardia */}
      <Modal
        isOpen={!!verificandoPersona}
        onClose={() => setVerificandoPersona(null)}
        title="Verificar identidad"
      >
        {verificandoPersona && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.colors.bgMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
              🆔
            </div>
            <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, lineHeight: 1.5, margin: 0 }}>
              Ingrese el número de identificación de <strong>{verificandoPersona.persona.nombre}</strong>
            </p>
            <div style={{ width: '100%' }}>
              <input
                type="text"
                value={ciInput}
                onChange={e => { setCiInput(e.target.value); setCiError(''); }}
                placeholder="Número de identificación"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: theme.radius.lg,
                  border: `1.5px solid ${ciError ? theme.colors.danger : theme.colors.border}`,
                  fontSize: theme.fonts.sizes.base,
                  fontFamily: theme.fonts.family,
                  color: theme.colors.text,
                  background: theme.colors.bgCard,
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              />
              {ciError && (
                <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.danger, marginTop: '6px' }}>{ciError}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {!verificandoPersona.esObligatoria && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setLlegoInvitado(verificandoPersona.base.id, verificandoPersona.idx, true);
                    setVerificandoPersona(null);
                    setCiInput('');
                    setCiError('');
                  }}
                >
                  Saltar verificación
                </Button>
              )}
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (ciInput.trim() === verificandoPersona.base.ci) {
                    marcarLlegadaConVerificacion(verificandoPersona.base.id, verificandoPersona.idx);
                    setVerificandoPersona(null);
                    setCiInput('');
                    setCiError('');
                  } else {
                    setCiError('El número de identificación no coincide con el registrado');
                  }
                }}
              >
                Verificar
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* TRA/SIRE confirmation modal */}
      <Modal
        isOpen={!!traSireModal}
        onClose={() => setTraSireModal(null)}
        title="Reportar TRA/SIRE"
      >
        {traSireModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', fontSize: theme.fonts.sizes.base, color: theme.colors.text, lineHeight: 1.5 }}>
              Se reportarán los siguientes huéspedes a TRA y SIRE:
            </div>
            <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {traSireModal.invitados?.filter(inv => inv.llego).map((inv, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{inv.nombre}</span>
                  {inv.traSireReported && (
                    <Badge status="Aceptado" />
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 1.5, background: theme.colors.secondaryLight, borderRadius: theme.radius.lg, padding: '10px 14px' }}>
              Los datos se enviarán con la información ya registrada del huésped. No se requiere captura adicional. Sin costo adicional.
            </div>
            <Button variant="primary" fullWidth onClick={() => {
              if (traSireModal) {
                traSireModal.invitados?.forEach((inv, idx) => {
                  if (inv.llego && !inv.traSireReported) {
                    reportarTraSire(traSireModal.id, idx);
                  }
                });
                addToast('Reporte TRA/SIRE enviado exitosamente', 'success');
              }
              setTraSireModal(null);
            }}>
              Ejecutar
            </Button>
          </div>
        )}
      </Modal>

      {/* Hallazgos summary popup */}
      <Modal isOpen={!!hallazgosPopup} onClose={() => setHallazgosPopup(null)} title="Resumen de verificación">
        {hallazgosPopup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.base, color: theme.colors.text }}>
                {hallazgosPopup.persona.nombre}
              </span>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: theme.radius.lg, padding: '12px', fontSize: theme.fonts.sizes.sm, color: '#92400E', lineHeight: 1.5 }}>
              <strong>Hallazgos detectados:</strong> El documento no coincide con el registro en base de datos. Se recomienda verificar físicamente el documento presentado.
            </div>
            <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary }}>Detalles de la verificación</div>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
                Estado: No coincide
              </div>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
                Fecha: {verificaciones[hallazgosPopup.item.id]?.[hallazgosPopup.idx]?.fechaVerificacion || 'N/A'}
              </div>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>
                Verificado por: {verificaciones[hallazgosPopup.item.id]?.[hallazgosPopup.idx]?.verificadoPor || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      </>)}
    </AppShell>
  );
}
