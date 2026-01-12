import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

// FullCalendar locales
import esLocale from '@fullcalendar/core/locales/es';
import caLocale from '@fullcalendar/core/locales/ca';
import enLocale from '@fullcalendar/core/locales/en-gb';

// Components
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import ReusableModal from '@/Components/modals/ModalTemplate';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';
import { useCompanySession } from '@/Hooks/useCompanySession';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

// Partials
import ScheduleFormModal from './Partials/ScheduleFormModal';
import AuthorizedUsersModal from './Partials/AuthorizedUsersModal';
import EventFormModal from './Partials/EventFormModal';

export default function Index({ 
    title, 
    subtitle, 
    module, 
    slug, 
    schedules = [],
    permissions = []
}) {
    const __ = useTranslation();
    const { currentCompany } = useCompanySession();
    const { showConfirm } = useSweetAlert();
    const page = usePage();
    const auth = page?.props?.auth || {};
    const userId = auth?.user?.id;
    const locale = page?.props?.locale || 'es';
    
    // Mapeo de locales para FullCalendar
    const calendarLocales = {
        'es': esLocale,
        'ca': caLocale,
        'en': enLocale,
    };
    const calendarLocale = calendarLocales[locale] || esLocale;

    // Estados
    const [selectedScheduleIds, setSelectedScheduleIds] = useState([]);
    const [events, setEvents] = useState([]);
    const [calendarApi, setCalendarApi] = useState(null);
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [loading, setLoading] = useState(false);
    const [currentDateRange, setCurrentDateRange] = useState({ start: null, end: null });

    // Modales
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showAuthorizedUsersModal, setShowAuthorizedUsersModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedScheduleForEvent, setSelectedScheduleForEvent] = useState(null);

    // Cargar selección guardada desde localStorage
    useEffect(() => {
        if (currentCompany?.id && userId) {
            const storageKey = `schedule_selection_${currentCompany.id}_${userId}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        setSelectedScheduleIds(parsed);
                    }
                } catch (e) {
                    console.error('Error parsing saved schedule selection:', e);
                }
            }
        }
    }, [currentCompany?.id, userId]);

    // Guardar selección en localStorage
    useEffect(() => {
        if (currentCompany?.id && userId && selectedScheduleIds.length >= 0) {
            const storageKey = `schedule_selection_${currentCompany.id}_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(selectedScheduleIds));
        }
    }, [selectedScheduleIds, currentCompany?.id, userId]);

    // Fetch eventos cuando cambia el rango o la selección
    const fetchEvents = useCallback(async (start, end) => {
        if (selectedScheduleIds.length === 0) {
            setEvents([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('/admin/schedule-events', {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                    schedule_ids: selectedScheduleIds,
                },
            });
            setEvents(response.data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [selectedScheduleIds]);

    // Callback cuando cambia el rango visible del calendario
    const handleDatesSet = useCallback((arg) => {
        setCurrentDateRange({ start: arg.start, end: arg.end });
        fetchEvents(arg.start, arg.end);
    }, [fetchEvents]);

    // Callback cuando cambia la selección de agendas
    useEffect(() => {
        if (calendarApi) {
            const view = calendarApi.view;
            fetchEvents(view.activeStart, view.activeEnd);
        }
    }, [selectedScheduleIds, calendarApi, fetchEvents]);

    // Toggle selección de agenda
    const toggleSchedule = (scheduleId) => {
        setSelectedScheduleIds(prev => {
            if (prev.includes(scheduleId)) {
                return prev.filter(id => id !== scheduleId);
            } else {
                return [...prev, scheduleId];
            }
        });
    };

    // --- Google Calendar Integration (modal + toggle) ---
    const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
    const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false);
    const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
    const [googleCalendarEmail, setGoogleCalendarEmail] = useState('');
    const [googleCalendarLastSync, setGoogleCalendarLastSync] = useState(null);

    const isGmailAddress = (email) => {
        if (!email) return false;
        const e = String(email).toLowerCase().trim();
        return e.endsWith('@gmail.com') || e.endsWith('@googlemail.com');
    };

    const getDefaultGoogleEmail = () => {
        const userEmail = auth?.user?.email || '';
        return isGmailAddress(userEmail) ? userEmail : '';
    };

    // Cargar estado de conexión (GET) - no recibe user_id (siempre el usuario en sesión)
    const fetchGoogleCalendarStatus = useCallback(async () => {
        setGoogleCalendarLoading(true);
        try {
            // Si ya tienes estos nombres de rutas, perfecto. Si no, ajusta.
            const url = (typeof route === 'function')
                ? route('admin.integrations.google.status')
                : '/admin/integrations/google/status';

            const res = await axios.get(url);
            const data = res?.data || {};

            setGoogleCalendarConnected(!!data.connected);
            setGoogleCalendarEmail(data.email || getDefaultGoogleEmail());
            setGoogleCalendarLastSync(data.last_synced_at || null);
        } catch (e) {
            // Si el endpoint no existe aún (404), asumimos "no conectado"
            setGoogleCalendarConnected(false);
            setGoogleCalendarEmail(getDefaultGoogleEmail());
            setGoogleCalendarLastSync(null);
        } finally {
            setGoogleCalendarLoading(false);
        }
    }, [auth?.user?.email]);

    useEffect(() => {
        fetchGoogleCalendarStatus();
    }, [fetchGoogleCalendarStatus, currentCompany?.id]);

    // Abrir modal de nueva agenda
    const handleNewSchedule = () => {
        setEditingSchedule(null);
        setShowScheduleModal(true);
    };

    // Abrir modal de editar agenda
    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setShowScheduleModal(true);
    };

    // Abrir modal de usuarios autorizados
    const handleManageUsers = (schedule) => {
        setEditingSchedule(schedule);
        setShowAuthorizedUsersModal(true);
    };

    // Abrir modal de nuevo evento
    const handleNewEvent = (arg) => {
        // Bloquear creación de eventos en fechas pasadas
        const start = arg?.start;
        if (start) {
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Resetear a medianoche para comparar solo fechas
            const startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);
            
            if (startDate < now) {
                showConfirm({
                    title: __('error'),
                    text: __('evento_no_puede_crearse_en_fecha_pasada') || __('no_se_pueden_crear_eventos_en_fechas_pasadas'),
                    icon: 'error',
                    onConfirm: () => {},
                });
                return;
            }
        }
        
        const end = arg?.end || (start ? new Date(start.getTime() + 60 * 60 * 1000) : null);
        
        // Si solo hay una agenda seleccionada, usarla; si no, pedir al usuario
        if (selectedScheduleIds.length === 1) {
            setSelectedScheduleForEvent(selectedScheduleIds[0]);
        } else {
            setSelectedScheduleForEvent(null);
        }

        setEditingEvent(null);
        setShowEventModal(true);
    };

    // Abrir modal de editar evento
    const handleEditEvent = (eventInfo) => {
        const event = eventInfo.event;
        setEditingEvent({
            id: event.id,
            title: event.title,
            description: event.extendedProps?.description || '',
            location: event.extendedProps?.location || '',
            starts_at: event.start,
            ends_at: event.end,
            all_day: event.allDay,
            schedule_id: event.extendedProps?.schedule_id,
        });
        setShowEventModal(true);
    };

    // Abrir modal de conexión a Google Calendar
    const handleConnectGoogleCalendar = async () => {
        setShowGoogleCalendarModal(true);
        await fetchGoogleCalendarStatus();
    };

    const closeGoogleCalendarModal = () => {
        setShowGoogleCalendarModal(false);
    };

    // Acción conectar: redirige al OAuth (sin params de usuario)
    const doGoogleConnect = () => {
        const url = (typeof route === 'function')
            ? route('admin.integrations.google.connect')
            : '/admin/integrations/google/connect';

        window.location.href = url;
    };

    // Acción desconectar: POST/DELETE (sin params de usuario)
    const doGoogleDisconnect = () => {
        showConfirm({
            title: __('google_desconectar') || 'Desconectar Google Calendar',
            text: __('google_desconectar_confirm') || 'Se desactivará la conexión de tu usuario con Google Calendar.',
            icon: 'warning',
            onConfirm: async () => {
                setGoogleCalendarLoading(true);
                try {
                    const url = (typeof route === 'function')
                        ? route('admin.integrations.google.disconnect')
                        : '/admin/integrations/google/disconnect';

                    // POST por compatibilidad CSRF y porque es “acción”
                    await axios.post(url);

                    setGoogleCalendarConnected(false);
                    setGoogleCalendarLastSync(null);
                } catch (e) {
                    console.error(e);
                } finally {
                    setGoogleCalendarLoading(false);
                }
            },
        });
    };

    // Toggle (lo usa tanto el modal como el botón del header)
    const toggleGoogleCalendarConnection = () => {
        if (googleCalendarConnected) {
            doGoogleDisconnect();
        } else {
            doGoogleConnect();
        }
    };

    // Cerrar modales
    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setEditingSchedule(null);
    };

    const closeAuthorizedUsersModal = () => {
        setShowAuthorizedUsersModal(false);
        setEditingSchedule(null);
    };

    const closeEventModal = () => {
        setShowEventModal(false);
        setEditingEvent(null);
        setSelectedScheduleForEvent(null);
    };

    // Callback después de guardar agenda
    const handleScheduleSaved = () => {
        closeScheduleModal();
        router.reload({ only: ['schedules'] });
    };

    // Eliminar agenda
    const handleDeleteSchedule = (schedule) => {
        showConfirm({
            title: __('agenda_eliminar') || __('agenda_eliminar'),
            text: __('agenda_eliminar_confirm') 
                ? __('agenda_eliminar_confirm', { name: schedule.name })
                : __('seguro_eliminar_agenda', { name: schedule.name }) || __('seguro_eliminar_agenda') || `${__('seguro_eliminar')} "${schedule.name}"?`,
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('schedules.destroy', schedule.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['schedules'] });
                    },
                });
            },
        });
    };

    // Callback después de guardar evento
    const handleEventSaved = () => {
        closeEventModal();
        if (calendarApi) {
            const view = calendarApi.view;
            setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
            fetchEvents(view.activeStart, view.activeEnd);
        }
    };

    // Formatear fecha según la vista actual
    const formatCurrentDate = () => {
        if (!currentDateRange.start || !currentDateRange.end) {
            return new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        const { start, end } = currentDateRange;
        const localeMap = {
            'es': 'es-ES',
            'ca': 'ca-ES',
            'en': 'en-GB',
        };
        const dateLocale = localeMap[locale] || 'es-ES';

        // Mes: mostrar "Enero 2026"
        if (currentView === 'dayGridMonth') {
            return start.toLocaleDateString(dateLocale, {
                month: 'long',
                year: 'numeric'
            });
        }

        // Día: mostrar "dd/mm/yyyy"
        if (currentView === 'timeGridDay') {
            return start.toLocaleDateString(dateLocale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        // Semana o Lista: mostrar "dd/mm - dd/mm/yyyy"
        if (currentView === 'timeGridWeek' || currentView === 'listWeek') {
            const startFormatted = start.toLocaleDateString(dateLocale, {
                day: '2-digit',
                month: '2-digit'
            });
            const endFormatted = end.toLocaleDateString(dateLocale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            return `${startFormatted} - ${endFormatted}`;
        }

        // Fallback: fecha actual
        return new Date().toLocaleDateString(dateLocale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const actions = [];
    if (permissions?.['schedules.create']) {
        actions.push({
            text: __('agenda_nueva'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleNewSchedule
        });
    }

    actions.push({
        text: googleCalendarConnected ? (__('google_desconectar') || 'Google: desconectar') : (__('google_conectar') || 'Google: conectar'),
        icon: googleCalendarConnected ? 'la-unlink' : 'la-google',
        url: '',
        modal: true,
        onClick: handleConnectGoogleCalendar
    });

    return (
        <AdminAuthenticatedLayout
            user={auth?.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            <div className="contents">
                <div className="row pt-2">
                    {/* Sidebar de agendas */}
                    <div className="col-md-3">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center" style={{ height: '41.85px' }}>
                                <h5 className="mb-0">{__('agendas')}</h5>
                            </div>

                            <div className="card-body">
                                {schedules.length === 0 ? (
                                    <p className="text-muted">{__('agendas_0')}</p>
                                ) : (
                                    <div className="list-group">
                                        {schedules.map((schedule) => (
                                            <div key={schedule.id} className="list-group-item">
                                                <div className="d-flex align-items-center mb-2">
                                                    <Checkbox
                                                        checked={selectedScheduleIds.includes(schedule.id)}
                                                        onChange={() => toggleSchedule(schedule.id)}
                                                        className="me-2"
                                                        size="lg"
                                                    />
                                                    <div
                                                        className="me-2 mt-1"
                                                        style={{
                                                            width: '16px',
                                                            height: '16px',
                                                            backgroundColor: schedule.color || '#3788d8',
                                                            borderRadius: '50%',
                                                        }}
                                                    />
                                                    <span className="flex-grow-1">{schedule.name}</span>
                                                </div>
                                                {/* Controles en línea: editar, usuarios, eliminar */}
                                                {(schedule.can?.update || 
                                                  (schedule.can?.manageAuthorizedUsers) || 
                                                  (permissions?.['schedules.destroy'] && schedule.owner_id === userId)) && (
                                                    <div className="d-flex gap-1 mt-2">
                                                        {schedule.can?.update && (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleEditSchedule(schedule)}
                                                                title={__('editar')}
                                                            >
                                                                <i className="la la-edit"></i>
                                                            </button>
                                                        )}
                                                        {schedule.can?.manageAuthorizedUsers && (
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => handleManageUsers(schedule)}
                                                                title={__('usuarios_autorizados')}
                                                            >
                                                                <i className="la la-users"></i>
                                                            </button>
                                                        )}
                                                        {permissions?.['schedules.destroy'] && 
                                                         schedule.owner_id === userId && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteSchedule(schedule)}
                                                                title={__('eliminar')}
                                                            >
                                                                <i className="la la-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedScheduleIds.length === 0 && (
                            <div className="alert alert-info mt-3 mx-0">
                                <i className="la la-info-circle"></i> {__('agenda_selec_texto')}
                            </div>
                        )}
                    </div>

                    {/* Calendario principal */}
                    <div className="col-md-9">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div className="btn-group" role="group">
                                    <button
                                        className={`btn btn-sm ${currentView === 'dayGridMonth' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => {
                                            calendarApi?.changeView('dayGridMonth');
                                            setCurrentView('dayGridMonth');
                                        }}
                                    >
                                        {__('mes')}
                                    </button>
                                    <button
                                        className={`btn btn-sm ${currentView === 'timeGridWeek' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => {
                                            calendarApi?.changeView('timeGridWeek');
                                            setCurrentView('timeGridWeek');
                                        }}
                                    >
                                        {__('semana')}
                                    </button>
                                    <button
                                        className={`btn btn-sm ${currentView === 'timeGridDay' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => {
                                            calendarApi?.changeView('timeGridDay');
                                            setCurrentView('timeGridDay');
                                        }}
                                    >
                                        {__('dia')}
                                    </button>
                                    <button
                                        className={`btn btn-sm ${currentView === 'listWeek' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => {
                                            calendarApi?.changeView('listWeek');
                                            setCurrentView('listWeek');
                                        }}
                                    >
                                        {__('lista')}
                                    </button>
                                </div>
                                <div className="flex-grow-1 text-center">
                                    <span className="fw-semibold">
                                        {formatCurrentDate()}
                                    </span>
                                </div>
                                <div className="d-flex gap-1">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            calendarApi?.prev();
                                            // Actualizar fecha después de navegar
                                            setTimeout(() => {
                                                if (calendarApi) {
                                                    const view = calendarApi.view;
                                                    setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
                                                }
                                            }, 100);
                                        }}
                                        title={__('anterior')}
                                    >
                                        <i className="la la-chevron-left"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary mx-2"
                                        onClick={() => {
                                            calendarApi?.today();
                                            // Actualizar fecha después de navegar
                                            setTimeout(() => {
                                                if (calendarApi) {
                                                    const view = calendarApi.view;
                                                    setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
                                                }
                                            }, 100);
                                        }}
                                    >
                                        {__('hoy')}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            calendarApi?.next();
                                            // Actualizar fecha después de navegar
                                            setTimeout(() => {
                                                if (calendarApi) {
                                                    const view = calendarApi.view;
                                                    setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
                                                }
                                            }, 100);
                                        }}
                                        title={__('siguiente') || __('siguiente')}
                                    >
                                        <i className="la la-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading && (
                                    <div className="text-center py-3">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">{__('cargando')}</span>
                                        </div>
                                    </div>
                                )}
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={false}
                                    height="auto"
                                    events={events}
                                    editable={false}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                    weekends={true}
                                    locale={calendarLocale}
                                    buttonText={{
                                        today: __('hoy'),
                                        month: __('mes'),
                                        week: __('semana'),
                                        day: __('dia'),
                                        list: __('lista'),
                                    }}
                                    select={handleNewEvent}
                                    eventClick={handleEditEvent}
                                    datesSet={handleDatesSet}
                                    ref={(ref) => {
                                        if (ref) {
                                            setCalendarApi(ref.getApi());
                                        }
                                    }}
                                    eventContent={(eventInfo) => {
                                        const color = eventInfo.event.extendedProps?.schedule_color || '#3788d8';
                                        return (
                                            <div style={{ backgroundColor: color, color: 'white', padding: '2px 4px', borderRadius: '3px' }}>
                                                {eventInfo.event.title}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <ScheduleFormModal
                show={showScheduleModal}
                onClose={closeScheduleModal}
                schedule={editingSchedule}
                onSaved={handleScheduleSaved}
            />

            <AuthorizedUsersModal
                show={showAuthorizedUsersModal}
                onClose={closeAuthorizedUsersModal}
                schedule={editingSchedule}
                onSaved={handleScheduleSaved}
            />

            <EventFormModal
                show={showEventModal}
                onClose={closeEventModal}
                event={editingEvent}
                scheduleId={selectedScheduleForEvent || editingEvent?.schedule_id}
                schedules={schedules}
                onSaved={handleEventSaved}
            />

            <ReusableModal
                show={showGoogleCalendarModal}
                onClose={closeGoogleCalendarModal}
                title={__('google_calendar') || 'Google Calendar'}
            >
                <div className="mb-3">
                    <div className={`alert ${googleCalendarConnected ? 'alert-success' : 'alert-secondary'} mb-2 mx-0`}>
                        <i className={`la ${googleCalendarConnected ? 'la-check-circle' : 'la-info-circle'}`}></i>{' '}
                        {googleCalendarConnected
                            ? (__('google_conectado') || 'Conectado con Google Calendar')
                            : (__('google_no_conectado') || 'No hay conexión activa con Google Calendar')}
                    </div>

                    {googleCalendarLastSync && (
                        <div className="text-muted small">
                            {__('ultima_sync') || 'Última sincronización'}: {googleCalendarLastSync}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">{__('email') || 'Email'}</label>
                    <input
                        type="email"
                        className="form-control"
                        value={googleCalendarEmail}
                        onChange={(e) => setGoogleCalendarEmail(e.target.value)}
                        placeholder={__('email_google_placeholder') || 'tuemail@gmail.com'}
                        // Si es el email del usuario y es Gmail, lo dejamos bloqueado por comodidad y coherencia.
                        // Si no es Gmail, permitimos escribir (solo informativo; Google OAuth mandará lo que el usuario use).
                        disabled={isGmailAddress(auth?.user?.email)}
                    />
                    <div className="form-text">
                        {isGmailAddress(auth?.user?.email)
                            ? (__('email_autocompletado_gmail') || 'Se usa el email Gmail de tu usuario.')
                            : (__('email_info_google') || 'Este campo es informativo: Google te pedirá iniciar sesión para autorizar la conexión.')}
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeGoogleCalendarModal}
                        disabled={googleCalendarLoading}
                    >
                        {__('cerrar') || 'Cerrar'}
                    </button>

                    <button
                        type="button"
                        className={`btn ${googleCalendarConnected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={toggleGoogleCalendarConnection}
                        disabled={googleCalendarLoading}
                    >
                        {googleCalendarLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {__('procesando') || 'Procesando'}
                            </>
                        ) : (
                            <>
                                <i className={`la ${googleCalendarConnected ? 'la-unlink' : 'la-google'} me-1`}></i>
                                {googleCalendarConnected
                                    ? (__('google_desconectar') || 'Desconectar')
                                    : (__('google_conectar') || 'Conectar')}
                            </>
                        )}
                    </button>
                </div>
            </ReusableModal>
        </AdminAuthenticatedLayout>
    );
}
