import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button, Card, Col, Form, Modal, Row, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

// Helpers
const formatPretty = (e164) => {
  // Bonificado simple: +34 600 111 222 o +XX xxx xxx xxx
  if (!e164 || typeof e164 !== 'string') return '—';
  const clean = e164.replace(/\s+/g, '');
  const m = clean.match(/^\+(\d{1,3})(\d+)$/);
  if (!m) return e164;

  const cc = `+${m[1]}`;
  const rest = m[2];

  // Agrupado 3-3-3 por defecto
  const groups = rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  return `${cc} ${groups}`.trim();
};

const telHref = (e164, ext) => {
  if (!e164) return '#';
  return ext ? `tel:${e164};ext=${encodeURIComponent(ext)}` : `tel:${e164}`;
};

const waHref = (e164, message = '') => {
  if (!e164) return '#';
  const num = e164.replace(/^\+/, ''); // wa.me no admite '+'
  const params = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${num}${params}`;
};

const sortPhones = (arr) =>
  [...(arr || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.id ?? 0) - (b.id ?? 0);
  });

export default function ManagePhones({
    phoneableType,      // 'User' | 'Company' | 'CrmContact'  (nombre de modelo según tu ruta)
    phoneableId,        // id numérico del owner
    defaultWaMessage = 'Hola', // se traducirá abajo con __()
}) {
    const __ = useTranslation();
    const { showConfirm } = useSweetAlert();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // objeto teléfono o null para alta
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [promotingId, setPromotingId] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);

    const waDefaultText = __(defaultWaMessage) || defaultWaMessage;

    const fetchData = async () => {
        if (!phoneableType || !phoneableId) return;
        setLoading(true);
        setError(null);
        try {
        const url = route('phones.get', { id: phoneableId, model: phoneableType });
        const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        } catch (e) {
        setError(e.message || 'Error');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phoneableType, phoneableId]);

    const sorted = useMemo(() => sortPhones(items), [items]);

    // Modal helpers
    const openCreate = () => {
        setEditing({
            id: null,
            number: '',      // input libre, backend normaliza a E.164
            type: '',
            label: '',
            ext: '',
            is_whatsapp: false,
            is_primary: false,
            notes: '',
        });
        setShowModal(true);
    };

    const openEdit = (ph) => {
        setEditing({
            id: ph.id,
            number: ph.e164, // mostramos e164; el backend igualmente re-normaliza
            type: ph.type || 'mobile',
            label: ph.label || '',
            ext: ph.ext || '',
            is_whatsapp: !!ph.is_whatsapp,
            is_primary: !!ph.is_primary,
            notes: ph.notes || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditing(null);
    };

    const handleChange = (field, value) => {
        setEditing(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e) => {
        e?.preventDefault?.();
        if (!editing) return;

        setSaving(true);
        setError(null);

        const payload = {
            phoneable_type: phoneableType,
            phoneable_id: phoneableId,
            number: editing.number,            // el backend normaliza a E.164 (ES por defecto)
            type: editing.type,
            label: editing.label || null,
            ext: editing.ext || null,
            is_whatsapp: editing.is_whatsapp ? 1 : 0,
            is_primary: editing.is_primary ? 1 : 0,
            notes: editing.notes || null,
        };

        const common = {
            preserveScroll: true,
            onSuccess: () => { fetchData(); closeModal(); },
            onError: (errors) => {
            // Si tu backend devuelve errores de validación, Inertia los pasa aquí
            // Puedes mostrar el primero o mapearlos a tu UI
            const first = errors && Object.values(errors)[0];
            setError(first || __('error_generic'));
            },
            onFinish: () => setSaving(false),
        };

        if (editing.id) {
            router.put(route('phones.update', editing.id), payload, common);
        } else {
            router.post(route('phones.store'), payload, common);
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;

        // Ask for confirmation with SweetAlert. If confirmed, perform the delete and
        // use deletingId to show progress / disable the button while the request runs.
        showConfirm({
            title: __('telefono_eliminar'),
            text: __('telefono_eliminar_confirm'),
            icon: 'warning',
            onConfirm: async () => {
                setDeletingId(id);
                router.delete(route('phones.destroy', id), {
                preserveScroll: true,
                onSuccess: () => fetchData(),
                onError: () => setError(__('error_generic')),
                onFinish: () => setDeletingId(null),
                });
            },
        });
    }

    const handlePrimary = (id) => {
        if (!id) return;

        setPromotingId(id);
        setError(null);

        router.post(
            route('phones.primary'),
            {
                phone_id: id,
                phoneable_type: phoneableType,
                phoneable_id: phoneableId,
            },
            {
                preserveScroll: true,
                onSuccess: () => { fetchData(); },
                onError: (errors) => {
                    const first = errors && (typeof errors === 'string'
                    ? errors
                    : Object.values(errors)[0]);
                    setError(first || __('error_generic'));
                },
                onFinish: () => setPromotingId(null),
            }
        );
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // no hacemos drama si el navegador lo bloquea
        }
    };

    const handleVerify = (id) => {
        if (!id) return;

        showConfirm({
            title: __('telefono_verificar'),
            text: __('telefono_verificar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                setVerifyingId(id);
                setError(null);

                router.post(
                    route('phones.verify'),
                    { phone_id: id }, // el backend ya sabe a quién pertenece por el id
                    {
                        preserveScroll: true,
                        onSuccess: () => { fetchData(); },
                        onError: (errors) => {
                            const first = errors && (typeof errors === 'string' ? errors : Object.values(errors)[0]);
                            setError(first || __('error_generic'));
                        },
                        onFinish: () => setVerifyingId(null),
                    }
                );
            }
        });
    };

    return (
        <div className="position-relative mt-5">
            <hr/>
            <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                <h5 className="mb-0">{__('telefonos')}</h5>
                <Button variant="primary" size="sm" onClick={openCreate}>
                    <i className="la la-plus me-1" />
                    {__('telefono')}
                </Button>
            </div>

            {loading && (
                <div className="text-center py-4">
                <Spinner animation="border" size="sm" className="me-2" />
                {__('cargando')}
                </div>
            )}

            {!loading && error && (
                <div className="alert alert-danger mx-0 mb-3">{__('error_generico')}</div>
            )}

            {!loading && !error && sorted.length === 0 && (
                <div className="text-muted">{__('telefonos_sin')}</div>
            )}

            <Row xs={1} md={2} lg={3} className="g-3">
                {sorted.map(ph => (
                <Col key={ph.id}>
                    <Card className={`h-100 ${ph.is_primary ? 'border-primary' : ''}`}>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="fw-semibold">
                                    {formatPretty(ph.e164)}
                                    {ph.is_primary && <span className="badge bg-primary ms-2">{__('primario')}</span>}
                                    {ph.is_whatsapp && <i className="la la-whatsapp ms-2" aria-label="WhatsApp" />}
                                </div>
                                {ph.ext && (
                                <div className="text-muted small">
                                    {__('extension')}: {ph.ext}
                                </div>
                                )}
                            </div>

                            {/* <OverlayTrigger
                                placement="left"
                                overlay={<Tooltip className="ttp-top">{ph.is_verified ? __('verificado') : __('verificado_no')}</Tooltip>}
                            > */}
                                <span className={`badge ${ph.is_verified ? 'bg-success' : 'bg-secondary'}`}>
                                {ph.is_verified ? __('verificado') : __('verificado_no')}
                                </span>
                            {/* </OverlayTrigger> */}
                        </div>

                        {(ph.label || ph.type || ph.notes) && (
                            <div className="mt-2">
                                <div className="text-muted small">
                                    {ph.label ? <><strong>{__('etiqueta')}:</strong> {ph.label}<br /></> : null}
                                    {ph.type ? <><strong>{__('tipo')}:</strong> {__(`${ph.type}`)}<br /></> : null}
                                    {ph.notes ? <><strong>{__('notas')}:</strong> {ph.notes}</> : null}
                                </div>
                            </div>
                        )}
                    </Card.Body>

                    <Card.Footer className="d-flex justify-content-between">
                        <div className="btn-group" role="group">
                            <OverlayTrigger placement="top" overlay={<Tooltip>{__('llamar')}</Tooltip>}>
                                <a className="btn btn-sm btn-outline-secondary" href={telHref(ph.e164, ph.ext)}>
                                <i className="la la-phone" />
                                </a>
                            </OverlayTrigger>

                            {/* Verificar si aún no lo está */}
                            {!ph.is_verified && (
                            <OverlayTrigger placement="top" overlay={<Tooltip>{__('verificar')}</Tooltip>}>
                                <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleVerify(ph.id)}
                                disabled={verifyingId === ph.id}
                                >
                                {verifyingId === ph.id ? <Spinner size="sm" animation="border" /> : <i className="la la-check-circle" />}
                                </button>
                            </OverlayTrigger>
                            )}

                            {ph.is_whatsapp && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>WhatsApp</Tooltip>}>
                                    <a
                                    className="btn btn-sm btn-outline-success"
                                    href={waHref(ph.e164, waDefaultText)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >
                                    <i className="la la-whatsapp" />
                                    </a>
                                </OverlayTrigger>
                            )}

                            <OverlayTrigger placement="top" overlay={<Tooltip>{__('copiar')}</Tooltip>}>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => copyToClipboard(ph.e164)}>
                                <i className="la la-copy" />
                                </button>
                            </OverlayTrigger>

                            {!ph.is_primary && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>{__('primario_marcar')}</Tooltip>}>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handlePrimary(ph.id)}
                                    disabled={promotingId === ph.id}
                                >
                                    {promotingId === ph.id ? <Spinner size="sm" animation="border" /> : <i className="la la-star" />}
                                </button>
                                </OverlayTrigger>
                            )}
                        </div>

                        <div className="btn-group" role="group">
                            <OverlayTrigger placement="top" overlay={<Tooltip>{__('editar')}</Tooltip>}>
                                <button className="btn btn-sm btn-info text-white" onClick={() => openEdit(ph)}>
                                <i className="la la-edit" />
                                </button>
                            </OverlayTrigger>

                            <OverlayTrigger placement="top" overlay={<Tooltip>{__('eliminar')}</Tooltip>}>
                                <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(ph.id)}
                                disabled={deletingId === ph.id}
                                >
                                {deletingId === ph.id ? <Spinner size="sm" animation="border" /> : <i className="la la-trash" />}
                                </button>
                            </OverlayTrigger>
                        </div>
                    </Card.Footer>
                    </Card>
                </Col>
                ))}
            </Row>

            {/* Modal alta/edición */}
            <Modal show={showModal} onHide={closeModal} backdrop="static">
                <Form onSubmit={handleSave}>
                <Modal.Header closeButton>
                    <Modal.Title>
                    {editing?.id ? __('telefono_editar') : __('telefono_nuevo')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{__('error_generico')}</div>}

                    <Row className="g-2">
                        <Col md={8}>
                            <Form.Label>{__('numero')}*</Form.Label>
                            <Form.Control
                            type="text"
                            value={editing?.number ?? ''}
                            onChange={(e) => handleChange('number', e.target.value)}
                            placeholder="+34600111222"
                            maxLength={14}
                            required
                            />
                            {/* <Form.Text className="text-muted">{__('numero_ayuda')}</Form.Text> */}
                        </Col>

                        <Col md={4}>
                            <Form.Label>{__('extension')}</Form.Label>
                            <Form.Control
                            type="text"
                            value={editing?.ext ?? ''}
                            onChange={(e) => handleChange('ext', e.target.value)}
                            placeholder="123"
                            maxLength={8}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>{__('tipo')}</Form.Label>
                            <Form.Select
                            value={editing?.type ?? ''}
                            onChange={(e) => handleChange('type', e.target.value)}
                            >
                                <option value="">{__('opcion_selec')}</option> 
                                <option value="mobile">{__('movil')}</option>
                                <option value="landline">{__('fijo')}</option>
                                <option value="other">{__('otro')}</option>
                            </Form.Select>
                        </Col>

                        <Col md={6}>
                            <Form.Label>{__('etiqueta')}</Form.Label>
                            <Form.Control
                            type="text"
                            value={editing?.label ?? ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                            placeholder={__('etiqueta_ej')}
                            maxLength={50}
                            />
                        </Col>

                        <Col xs={12}>
                            <Form.Label>{__('notas')}</Form.Label>
                            <Form.Control
                            as="textarea"
                            rows={2}
                            value={editing?.notes ?? ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            />
                        </Col>

                        <Col md={4} className="pt-2">
                            <Form.Check
                            type="switch"
                            id="chk-whatsapp"
                            label="WhatsApp"
                            checked={!!editing?.is_whatsapp}
                            onChange={(e) => handleChange('is_whatsapp', e.target.checked)}
                            />
                        </Col>

                        <Col md={4} className="pt-2">
                            <Form.Check
                            type="switch"
                            id="chk-primary"
                            label={__('primario')}
                            checked={!!editing?.is_primary}
                            onChange={(e) => handleChange('is_primary', e.target.checked)}
                            />
                        </Col>

                        {/* <Col md={4} className="pt-2">
                            <Form.Text className="text-muted">
                            {__('primario_ayuda')}
                            </Form.Text>
                        </Col> */}
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal} disabled={saving}>
                    {__('cancelar')}
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border" /> : __('guardar')}
                    </Button>
                </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
