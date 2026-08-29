import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Calendar from '../../components/ui/Calendar';
import SelectField from '../../components/ui/SelectField';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import theme from '../../config/theme';
import { torres, departamentos } from '../../data/mockData';
import tipoVisitaIcons from '../../assets/icons/visitas';

const TIPOS_BASE = [
  { id: 'amigos',    label: 'Amigos Familiares' },
  { id: 'temporal',  label: 'Profesional Temporal' },
  { id: 'permanente',label: 'Profesional Permanente' },
];

const TIPO_HUESPED_TEMPORAL = { id: 'huesped-temporal', label: 'Huésped Temporal' };

const TIPO_LABELS = {
  amigos: 'Amigos Familiares',
  temporal: 'Profesional Temporal',
  permanente: 'Profesional Permanente',
  'huesped-temporal': 'Huésped Temporal',
};

const PROFESIONES = {
  permanente: ['Cuidado de menores', 'Profesional de la salud', 'Limpieza y servicios generales', 'Atencion a mascotas', 'Conductor', 'Jardinero', 'Otros'],
  temporal: ['Domiciliario', 'Pintor', 'carpintero', 'electricista', 'Profesional de la salud', 'Limpieza y servicios generales', 'atención a mascotas', 'Cuidado de menores', 'Peluquero o maquillador', 'Fontanero', 'otros'],
};

const esProfesional = (tipo) => tipo === 'temporal' || tipo === 'permanente';
const profesionOtra = (tipo, valor) =>
  (tipo === 'permanente' && valor === 'Otros') || (tipo === 'temporal' && valor === 'otros');

const inputStyle = {
  width: '100%',
  background: theme.colors.bgMuted,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.border}`,
  outline: 'none',
  fontSize: theme.fonts.sizes.sm,
  fontFamily: theme.fonts.family,
  color: theme.colors.text,
  padding: '10px 14px',
  boxSizing: 'border-box',
};

function formatTimeRange(start, end) {
  if (!start && !end) return '';
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} – ${end}`;
}

export default function VisitasNuevoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agregarVisita, rolActivo, suscripcionActiva, activarSuscripcion, ubicacionActiva, addToast, unidades, configHuespedesTemporales, actualizarConfigHuespedTemporal, permisos, esResidente, usuario } = useApp();
  const TIPOS = rolActivo === 'guardia'
    ? TIPOS_BASE.filter(t => t.id !== 'permanente')
    : rolActivo === 'huesped-temporal'
    ? TIPOS_BASE.filter(t => t.id === 'amigos' || t.id === 'temporal')
    : rolActivo === 'administrador'
    ? TIPOS_BASE
    : [...TIPOS_BASE, TIPO_HUESPED_TEMPORAL];

  const tipoPreseleccionado = location.state?.tipoPreseleccionado;
  const tipoInicial = (tipoPreseleccionado && TIPOS.some(t => t.id === tipoPreseleccionado)
    && (tipoPreseleccionado !== 'huesped-temporal' || suscripcionActiva))
    ? tipoPreseleccionado
    : null;
  const [tipoSeleccionado, setTipoSeleccionado] = useState(tipoInicial);
  const [torre, setTorre] = useState('');
  const [depto, setDepto] = useState('');
  const [personas, setPersonas] = useState('5');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nombre, setNombre] = useState('Mariano Lazarto');
  const [tipoId, setTipoId] = useState('Cedula');
  const [identificacion, setIdentificacion] = useState('122652268562');
  const [email, setEmail] = useState('mlazarto@gmail.com');
  const [telefono, setTelefono] = useState('+5965165136546');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [horaSalidaInicio, setHoraSalidaInicio] = useState('');
  const [horaSalidaFin, setHoraSalidaFin] = useState('');
  const [acompanantes, setAcompanantes] = useState([]);
  const [cantidadMenores, setCantidadMenores] = useState(0);
  const [mostrarAvisoMenores, setMostrarAvisoMenores] = useState(false);
  const [avisoMenoresOpen, setAvisoMenoresOpen] = useState(false);
  const [estacionamientosSeleccionados, setEstacionamientosSeleccionados] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [tieneVehiculoToggle, setTieneVehiculoToggle] = useState(false);
  const [cantidadVehiculos, setCantidadVehiculos] = useState(1);
  const [showWarningRegistro, setShowWarningRegistro] = useState(false);
  const [showSuscripcionModal, setShowSuscripcionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [numeroReserva, setNumeroReserva] = useState('');
  const [paraAdministracion, setParaAdministracion] = useState(false);
  const [profesion, setProfesion] = useState('');
  const [profesionOtro, setProfesionOtro] = useState('');

  const horaEstimada = formatTimeRange(horaInicio, horaFin);
  const horaEstimadaSalida = formatTimeRange(horaSalidaInicio, horaSalidaFin);
  const torreNum = parseInt(torre.replace('Torre ', ''), 10);
  const unidadActual = unidades.find(u => u.codigo === depto && u.torreNumero === torreNum);
  const estacionamientosDisponibles = (unidadActual && torre && depto) ? (unidadActual.estacionamientos || 0) : 0;

  useEffect(() => {
    if (tipoSeleccionado === 'huesped-temporal') {
      setHoraInicio('15:00');
      setHoraFin('16:00');
      setHoraSalidaInicio('10:00');
      setHoraSalidaFin('11:00');
    }
  }, [tipoSeleccionado]);

  useEffect(() => {
    if (tipoSeleccionado === 'permanente') {
      setPersonas('1');
      setCantidadMenores(0);
    }
    setProfesion('');
    setProfesionOtro('');
  }, [tipoSeleccionado]);

  useEffect(() => {
    setEstacionamientosSeleccionados(0);
    setVehiculos([]);
  }, [torre, depto]);

  useEffect(() => {
    const target = tieneVehiculoToggle ? cantidadVehiculos : 0;
    setVehiculos(prev => {
      const updated = [...prev];
      while (updated.length < target) {
        updated.push({ placa: '', tipo: 'auto' });
      }
      while (updated.length > target) {
        updated.pop();
      }
      return updated;
    });
  }, [cantidadVehiculos, tieneVehiculoToggle]);

  useEffect(() => {
    const num = parseInt(personas) || 1;
    const compCount = Math.max(0, num - 1);
    setAcompanantes(prev => {
      const updated = [...prev];
      while (updated.length < compCount) {
        updated.push({ nombre: '', ci: '', esMenor: false });
      }
      while (updated.length > compCount) {
        updated.pop();
      }
      return updated;
    });
  }, [personas]);

  // P11: la cantidad de menores marca automáticamente los primeros N acompañantes como menores de edad
  useEffect(() => {
    const n = Math.max(0, Math.min(parseInt(cantidadMenores) || 0, acompanantes.length));
    setAcompanantes(prev => prev.map((a, i) => ({ ...a, esMenor: i < n })));
  }, [personas, cantidadMenores]);

  // Si se llega con "Huésped Temporal" preseleccionado pero sin suscripción,
  // abrimos el flujo de suscripción. Esto evita la pantalla en blanco que
  // ocurría antes (el selector de tipo se ocultaba y no se seleccionaba ninguno).
  const llegoComoHuespedPre = tipoPreseleccionado === 'huesped-temporal' && !suscripcionActiva;
  useEffect(() => {
    if (llegoComoHuespedPre) {
      setShowSuscripcionModal(true);
    }
  }, []);

  const handleCardNumberInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentForm(p => ({ ...p, cardNumber: formatted }));
  };

  const handleCardExpiryInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    setPaymentForm(p => ({ ...p, cardExpiry: formatted }));
  };

  const handleCardCvvInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPaymentForm(p => ({ ...p, cardCvv: digits }));
  };

  const handleSubscribeAndPay = () => {
    if (!paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.cardExpiry || !paymentForm.cardCvv) {
      return;
    }
    setPaymentLoading(true);
    setTimeout(() => {
      if (ubicacionActiva) {
        activarSuscripcion(ubicacionActiva.id);
      }
      setPaymentLoading(false);
      setShowPaymentModal(false);
      setShowSuscripcionModal(false);
      setPaymentForm({ cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' });
      setTipoSeleccionado('huesped-temporal');
    }, 1500);
  };

  const [tipoNotificacion, setTipoNotificacion] = useState('notificar-y-anunciar');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedTipo = TIPOS.find(t => t.id === tipoSeleccionado);

  const generarCodigoAcceso = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleAceptar = () => {
    if (rolActivo === 'huesped-temporal') {
      setShowWarningRegistro(true);
      return;
    }
    handleAceptarContinuar();
  };

  const handleAceptarContinuar = () => {
    if (!identificacion.trim()) {
      addToast('La identificación es obligatoria', 'error');
      return;
    }
    const invitados = acompanantes
      .filter(a => a.nombre.trim())
      .map(a => ({ nombre: a.nombre, ci: a.ci || '', esMenor: !!a.esMenor, llego: false }));
    const tieneVehiculo = tieneVehiculoToggle && vehiculos.some(v => v.placa.trim());
    const vehiculosValidos = tieneVehiculoToggle ? vehiculos.filter(v => v.placa.trim()).map(v => ({ placa: v.placa, tipo: v.tipo || 'auto' })) : [];
    const num = Math.floor(Math.random() * 900000 + 100000);
    const cod = generarCodigoAcceso();
    setNumeroReserva(num);
    setCodigoAcceso(cod);
    const visita = {
      tipo: tipoSeleccionado,
      nombre,
      ci: identificacion,
      email,
      telefono,
      estado: 'Pendiente',
      instruccionDocumento: tipoSeleccionado === 'amigos' ? 'no-verificar' : 'verificar',
      tipoNotificacion,
      tieneVehiculo,
      instruccionesCumplidas: {},
      fechaDesde: selectedDate.toLocaleDateString('es-AR'),
      fechaHasta: selectedDate.toLocaleDateString('es-AR'),
      invitados,
      reserva: `N°: ${num}`,
      codigoAcceso: cod,
      qrUrl: `wwww.veciyolink/reserva-${num}`,
      torre,
      depto,
      paraAdministracion,
      personas: parseInt(personas),
      horaEstimadaLlegada: horaEstimada,
      horaEstimadaSalida: horaEstimadaSalida || undefined,
      vehiculos: vehiculosValidos,
      profesion: esProfesional(tipoSeleccionado) ? profesion : undefined,
      profesionOtro: esProfesional(tipoSeleccionado) && profesionOtra(tipoSeleccionado, profesion) ? profesionOtro : undefined,
      registradoPor: usuario?.nombre || usuario?.correo || 'Usuario',
      anotacionesIngreso: '',
      fotosIngreso: [],
      anotacionesSalida: '',
      fotosSalida: [],
    };
    agregarVisita(visita);
    setShowSuccess(true);
  };

  return (
    <AppShell>
      <PageHeader title="Visitas" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Type selector — hidden when pre-selected from option 2 */}
        {!tipoPreseleccionado && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {TIPOS.map(tipo => {
            const isActive = tipoSeleccionado === tipo.id;
            const isHuesped = tipo.id === 'huesped-temporal';
            const sinSuscripcion = isHuesped && !suscripcionActiva;
            const isDisabled = sinSuscripcion;
            return (
              <button
                key={tipo.id}
                onClick={() => {
                  if (isDisabled) {
                    setShowSuscripcionModal(true);
                    return;
                  }
                  setTipoSeleccionado(tipo.id);
                }}
                style={{
                  background: isActive ? theme.colors.primary : theme.colors.bgCard,
                  borderRadius: theme.radius.xl,
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  border: `2px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontFamily: theme.fonts.family,
                  boxShadow: theme.shadows.card,
                  gridColumn: tipo.id === 'permanente' ? '1' : 'auto',
                  opacity: isDisabled ? 0.45 : 1,
                  filter: isDisabled ? 'grayscale(0.6)' : 'none',
                }}
              >
                <img
                  src={tipoVisitaIcons[tipo.id]}
                  alt={tipo.label}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.medium,
                  color: isDisabled ? theme.colors.textMuted : (isActive ? theme.colors.text : theme.colors.textSecondary),
                  textAlign: 'center',
                }}>
                  {tipo.label}
                </span>

              </button>
            );
          })}
        </div>
        )}

        {tipoSeleccionado && (
          <>
            {/* Guest count */}
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: theme.fonts.weights.semibold, textAlign: 'center', fontSize: theme.fonts.sizes.base }}>
                Cantidad de invitados
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <SelectField label="Torre:" value={torre} options={torres} onChange={setTorre} />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectField label="Depto:" value={depto} options={departamentos} onChange={setDepto} />
                </div>
              </div>
              {rolActivo === 'administrador' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: theme.fonts.family, userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={paraAdministracion}
                    onChange={e => setParaAdministracion(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: theme.colors.primary }}
                  />
                  <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>Visita para administración</span>
                </label>
              )}
              {tipoSeleccionado !== 'permanente' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={personas}
                  onChange={e => setPersonas(e.target.value)}
                  min="1"
                  style={{ ...inputStyle, width: '60px', flex: '0 0 auto', textAlign: 'center' }}
                />
                <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>personas</span>
                <span style={{ margin: '0 2px', color: theme.colors.textMuted }}>·</span>
                <input
                  type="number"
                  value={cantidadMenores}
                  onChange={e => setCantidadMenores(Math.max(0, Math.min(parseInt(e.target.value) || 0, Math.max(0, parseInt(personas) - 1))))}
                  min="0"
                  style={{ ...inputStyle, width: '60px', flex: '0 0 auto', textAlign: 'center' }}
                />
                <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>👶 menores</span>
              </div>
              )}
            </div>

            {tipoSeleccionado === 'permanente' && (
              <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                El profesional permanente se registra de a uno. Podés registrar visitas adicionales creando una nueva visita.
              </div>
            )}

            {/* Calendar */}
            <Calendar selected={selectedDate} onSelect={setSelectedDate} />

            {/* Person info — todos los campos editables */}
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: theme.fonts.weights.semibold }}>Nombre y Apellido</div>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={inputStyle}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Tipo</div>
                  <select value={tipoId} onChange={e => setTipoId(e.target.value)} style={{ ...inputStyle }}>
                    <option>Cedula</option>
                    <option>Pasaporte</option>
                    <option>DNI</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Identificación <span style={{ color: theme.colors.danger }}>*</span></div>
                  <input
                    type="text"
                    value={identificacion}
                    onChange={e => setIdentificacion(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '10px 12px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                Recuerda indicar a tu invitado que debe presentar su documento (cédula, pasaporte o DNI) en portería al ingresar al edificio.
              </div>

              <div>
                <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Correo electrónico (opcional)</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Teléfono (opcional)</div>
                <input
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {esProfesional(tipoSeleccionado) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Profesión</div>
                  <SelectField
                    label=""
                    value={profesion}
                    options={PROFESIONES[tipoSeleccionado] || []}
                    onChange={setProfesion}
                    placeholder="Seleccione profesión"
                  />
                  {profesionOtra(tipoSeleccionado, profesion) && (
                    <input
                      type="text"
                      value={profesionOtro}
                      onChange={e => setProfesionOtro(e.target.value)}
                      placeholder="Especifique la profesión"
                      style={inputStyle}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Acompañantes */}
            {acompanantes.length > 0 && acompanantes.map((acc, idx) => (
              <div key={idx} style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.sm }}>Acompañante {idx + 1}</div>
                <input
                  type="text"
                  value={acc.nombre}
                  onChange={e => {
                    const updated = [...acompanantes];
                    updated[idx] = { ...updated[idx], nombre: e.target.value };
                    setAcompanantes(updated);
                  }}
                  placeholder="Nombre y Apellido"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={acc.ci}
                  onChange={e => {
                    const updated = [...acompanantes];
                    updated[idx] = { ...updated[idx], ci: e.target.value };
                    setAcompanantes(updated);
                  }}
                  placeholder="Identificación (opcional)"
                  style={inputStyle}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>Menor de edad</span>
                  <Toggle
                    value={!!acc.esMenor}
                    onChange={(v) => {
                      const updated = [...acompanantes];
                      updated[idx] = { ...updated[idx], esMenor: v };
                      setAcompanantes(updated);
                      setMostrarAvisoMenores(true);
                      if (v) setAvisoMenoresOpen(true);
                    }}
                  />
                </div>
              </div>
            ))}

            {(acompanantes.some(a => a.esMenor) || mostrarAvisoMenores) && (
              <div style={{ background: '#FEF3C7', borderRadius: theme.radius.lg, padding: '12px 14px', fontSize: theme.fonts.sizes.xs, color: '#92400E', lineHeight: 1.5 }}>
                Advertencia legal: Si el invitado es menor de edad, debe ingresar con su padre/madre/tutor legal con la documentación respectiva. Este edificio está comprometido con la prevención del abuso sexual de menores y la trata de personas.
              </div>
            )}

            {/* Hora estimada de llegada */}
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Hora estimada de llegada</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flex: 1 }}
                />
                <span style={{ color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.sm }}>a</span>
                <input
                  type="time"
                  value={horaFin}
                  onChange={e => setHoraFin(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flex: 1 }}
                />
              </div>
            </div>

            {tipoSeleccionado === 'huesped-temporal' && (
              <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary, marginBottom: '4px' }}>Hora estimada de salida</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="time"
                    value={horaSalidaInicio}
                    onChange={e => setHoraSalidaInicio(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', flex: 1 }}
                  />
                  <span style={{ color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.sm }}>a</span>
                  <input
                    type="time"
                    value={horaSalidaFin}
                    onChange={e => setHoraSalidaFin(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', flex: 1 }}
                  />
                </div>
              </div>
            )}

            {/* Vehículo — toggle sí/no + cantidad + tipo + placa */}
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.text }}>¿Traes vehículos?</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: theme.fonts.family, userSelect: 'none' }}>
                  <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>No</span>
                  <div onClick={() => setTieneVehiculoToggle(!tieneVehiculoToggle)} style={{
                    width: '40px', height: '22px', borderRadius: '11px',
                    background: tieneVehiculoToggle ? theme.colors.primary : theme.colors.bgMuted,
                    border: `1.5px solid ${tieneVehiculoToggle ? theme.colors.primary : theme.colors.border}`,
                    position: 'relative', cursor: 'pointer', transition: 'all 200ms', flexShrink: 0,
                  }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: '#fff', position: 'absolute', top: '2px',
                      left: tieneVehiculoToggle ? '21px' : '2px',
                      transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>Sí</span>
                </label>
              </div>
              {tieneVehiculoToggle && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, whiteSpace: 'nowrap' }}>Cantidad</span>
                    <input type="number" min="1" value={cantidadVehiculos} onChange={e => setCantidadVehiculos(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ ...inputStyle, width: '80px' }} />
                  </div>
                  {vehiculos.map((v, idx) => (
                    <div key={idx} style={{ padding: '10px', background: theme.colors.bgMuted, borderRadius: theme.radius.lg, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.semibold, color: theme.colors.textSecondary }}>Vehículo {idx + 1}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select value={v.tipo || 'auto'} onChange={e => {
                          const updated = [...vehiculos];
                          updated[idx] = { ...updated[idx], tipo: e.target.value };
                          setVehiculos(updated);
                        }} style={{ ...inputStyle, width: '100px', flexShrink: 0 }}>
                          <option value="auto">Auto</option>
                          <option value="camioneta">Camioneta</option>
                          <option value="van">Van</option>
                          <option value="bus">Bus</option>
                          <option value="moto">Moto</option>
                        </select>
                        <input type="text" value={v.placa} onChange={e => {
                          const updated = [...vehiculos];
                          updated[idx] = { ...updated[idx], placa: e.target.value.toUpperCase() };
                          setVehiculos(updated);
                        }} placeholder="Placa" style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Notification type selector */}
            <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: '14px 16px', boxShadow: theme.shadows.card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: theme.fonts.weights.semibold, textAlign: 'center', fontSize: theme.fonts.sizes.base }}>
                Tipo de notificación
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'solo-notificar', label: 'Solo notificar' },
                  { id: 'notificar-y-anunciar', label: 'Notificar y anunciar' },
                ].map(op => (
                  <button
                    key={op.id}
                    onClick={() => setTipoNotificacion(op.id)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: theme.radius.lg,
                      background: tipoNotificacion === op.id ? theme.colors.primary : theme.colors.bgMuted,
                      border: `1.5px solid ${tipoNotificacion === op.id ? theme.colors.primary : theme.colors.border}`,
                      color: tipoNotificacion === op.id ? '#fff' : theme.colors.text,
                      cursor: 'pointer',
                      fontFamily: theme.fonts.family,
                      fontSize: theme.fonts.sizes.sm,
                      fontWeight: tipoNotificacion === op.id ? theme.fonts.weights.semibold : theme.fonts.weights.normal,
                      textAlign: 'center',
                      transition: 'all 200ms',
                    }}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={handleAceptar}>Aceptar</Button>
          </>
        )}

        <div style={{ height: '16px' }} />
      </div>

      {/* Modal suscripcion — Huesped Temporal sin suscripcion */}
      <Modal isOpen={showSuscripcionModal} onClose={() => {
        if (llegoComoHuespedPre && !suscripcionActiva) {
          navigate('/visitas');
        } else {
          setShowSuscripcionModal(false);
        }
      }} title="VeciYo Huesped Temporal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: theme.radius.xl, background: theme.colors.bgMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
            ▶️
          </div>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, lineHeight: theme.fonts.lineHeights.relaxed, margin: 0 }}>
            Los primeros 30 dias son gratuitos. Suscribete y disfruta de todos los beneficios!
          </p>
          <Button variant="primary" fullWidth onClick={() => { setShowSuscripcionModal(false); setShowPaymentModal(true); }}>
            Suscribirse
          </Button>
        </div>
      </Modal>

      {/* Modal pago — datos de tarjeta */}
      <Modal isOpen={showPaymentModal} onClose={() => { if (!paymentLoading) setShowPaymentModal(false); }} title="Pago de suscripcion">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
            <div style={{ fontSize: theme.fonts.sizes.xl, fontWeight: theme.fonts.weights.bold, color: theme.colors.text }}>$15.00</div>
            <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>por mes - Huesped Temporal</div>
          </div>
          <InputField label="Nombre del titular" value={paymentForm.cardName} onChange={v => setPaymentForm(p => ({ ...p, cardName: v }))} placeholder="Como figura en la tarjeta" disabled={paymentLoading} />
          <InputField label="Numero de tarjeta" value={paymentForm.cardNumber} onChange={handleCardNumberInput} placeholder="1234 5678 9012 3456" disabled={paymentLoading} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InputField label="Vencimiento" value={paymentForm.cardExpiry} onChange={handleCardExpiryInput} placeholder="MM/AA" disabled={paymentLoading} />
            <InputField label="CVV" value={paymentForm.cardCvv} onChange={handleCardCvvInput} placeholder="123" disabled={paymentLoading} />
          </div>
          <div style={{ background: theme.colors.secondaryLight, borderRadius: theme.radius.lg, padding: '10px 14px', fontSize: theme.fonts.sizes.xs, color: theme.colors.secondary, lineHeight: 1.5 }}>
            Pago 100% simulado. No se realizara ningun cobro real.
          </div>
          <Button variant="primary" fullWidth onClick={handleSubscribeAndPay} disabled={paymentLoading}>
            {paymentLoading ? 'Procesando pago...' : 'Pagar $15.00 y suscribirse'}
          </Button>
        </div>
      </Modal>

      {/* Success modal */}
      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); navigate('/visitas'); }} title={TIPO_LABELS[tipoSeleccionado] || 'Visita'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.semibold }}>Visita cargada con exito</p>
          <div style={{ border: `1.5px solid ${theme.colors.primary}`, borderRadius: theme.radius.xl, padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={tipoVisitaIcons[tipoSeleccionado]} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontWeight: theme.fonts.weights.bold }}>{nombre}</span>
            </div>
            <div style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>CI:{identificacion}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge status="Aceptado" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                <span>🕐</span>
                <span>{selectedDate.toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          </div>
          {tipoSeleccionado === 'permanente' && (
            <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.lg, padding: '10px 12px', fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, lineHeight: 1.5, textAlign: 'left' }}>
              Recuerda indicar a tu invitado que debe presentar su documento (cédula, pasaporte o DNI) en portería al ingresar al edificio.
            </div>
          )}
          {tipoSeleccionado === 'huesped-temporal' && (
            <div style={{ background: theme.colors.bgMuted, borderRadius: theme.radius.xl, padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.semibold, color: theme.colors.text }}>
                Mensaje para compartir:
              </div>
              <div style={{
                background: theme.colors.bgCard,
                borderRadius: theme.radius.lg,
                padding: '12px',
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
                fontStyle: 'italic',
                border: `1px solid ${theme.colors.border}`,
              }}>
                "Este es el enlace de tu reservación wwww.veciyolink/reserva-{numeroReserva}. Tu código de acceso es {codigoAcceso}. Bienvenido"
              </div>
              <button
                onClick={() => {
                  const enlace = `wwww.veciyolink/reserva-${numeroReserva}`;
                  const mensaje = `Este es el enlace de tu reservación ${enlace}. Tu código de acceso es ${codigoAcceso}. Bienvenido`;
                  navigator.clipboard?.writeText(mensaje);
                  addToast('Mensaje copiado al portapapeles');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: theme.radius.full,
                  background: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: theme.fonts.family,
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.semibold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copiar mensaje para WhatsApp
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Warning modal for HT registration */}
      <Modal isOpen={showWarningRegistro} onClose={() => setShowWarningRegistro(false)} title="Aviso importante">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, lineHeight: 1.5, margin: 0 }}>
            Al registrar la visita, ingresa el número de documento del invitado en el sistema. El invitado debe traer su documento físico (cédula, pasaporte o DNI) al ingresar al edificio. Si el invitado es menor de edad, debe ingresar con su padre/madre/tutor legal con la documentación respectiva. Este edificio está comprometido con la prevención del abuso sexual de menores y la trata de personas.
          </p>
          <Button variant="primary" fullWidth onClick={() => { setShowWarningRegistro(false); handleAceptarContinuar(); }}>Entendido, continuar</Button>
          <Button variant="ghost" fullWidth onClick={() => setShowWarningRegistro(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* Aviso legal al marcar un acompañante como menor de edad (P12) */}
      <Modal isOpen={avisoMenoresOpen} onClose={() => setAvisoMenoresOpen(false)} title="Aviso legal — menores de edad">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>👶⚠️</div>
          <p style={{ fontSize: theme.fonts.sizes.base, color: theme.colors.text, lineHeight: 1.5, margin: 0 }}>
            Si el invitado es menor de edad, debe ingresar con su padre/madre/tutor legal con la documentación respectiva. Este edificio está comprometido con la prevención del abuso sexual de menores y la trata de personas.
          </p>
          <Button variant="primary" fullWidth onClick={() => setAvisoMenoresOpen(false)}>Entendido</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
