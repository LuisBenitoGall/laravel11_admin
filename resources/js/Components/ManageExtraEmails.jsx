import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button, Card, Col, Form, Modal, Row, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';

// Hooks
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

const mailHref = (email) => {
  if (!email) return '#';
  return `mailto:${encodeURIComponent(email)}`;
};

export default function ManageExtraEmails({
  userId,
  titleKey = 'emails_adicionales',   // clave i18n del título
  addNewEmail = true,
  rowXs = 1,
  rowMd = 2,
  rowLg = 3,
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const url = route('user-emails.get', { user: userId });
      const res = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

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
  }, [userId]);

  // Modal helpers
  const openCreate = () => {
    setFormErrors({});
    setError(null);
    setEditing({
      id: null,
      email: '',
      observations: '',
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setFormErrors({});
    setError(null);
    setEditing({
      id: item.id,
      email: item.email || '',
      observations: item.observations || '',
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
    if (!editing || !userId) return;

    setSaving(true);
    setError(null);

    const payload = {
      user_id: userId,
      email: editing.email,
      observations: editing.observations || null,
    };

    const common = {
      preserveScroll: true,
      onSuccess: () => {
        setFormErrors({});
        setError(null);
        fetchData();
        closeModal();
      },
      onError: (errors) => {
        setFormErrors(errors || {});
        const first = errors && Object.values(errors)[0];
        setError(first || null);
      },
      onFinish: () => setSaving(false),
    };

    if (editing.id) {
      router.put(route('user-emails.update', editing.id), payload, common);
    } else {
      router.post(route('user-emails.store'), payload, common);
    }
  };

  const handleDelete = (id) => {
    if (!id) return;

    showConfirm({
      title: __('email_eliminar'),
      text: __('email_eliminar_confirm'),
      icon: 'warning',
      onConfirm: () => {
        setDeletingId(id);
        router.delete(route('user-emails.destroy', id), {
          preserveScroll: true,
          onSuccess: () => fetchData(),
          onError: () => setError(__('error_generico')),
          onFinish: () => setDeletingId(null),
        });
      },
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // si el navegador decide que no, pues no
    }
  };

  return (
    <div className="position-relative mt-3">
      <hr />

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">{__(titleKey)}</h5>

        {addNewEmail && (
          <Button
            variant="primary"
            size="sm"
            onClick={openCreate}
            disabled={!userId}
          >
            <i className="la la-plus me-1" />
            {__('email')}
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          {__('cargando')}
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger mx-0 mb-3">
          {__('error_generico')}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-muted">
          {__('emails_sin')}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <Row xs={rowXs} md={rowMd} lg={rowLg} className="g-3">
          {items.map(item => (
            <Col key={item.id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="w-100">
                      <div className="fw-semibold">
                        {item.email || '—'}
                      </div>

                      {item.observations && (
                        <div className="text-muted small mt-2">
                          <strong>{__('observaciones')}:</strong>{' '}
                          {item.observations}
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-between">
                  <div className="btn-group" role="group">
                    <OverlayTrigger placement="top" overlay={<Tooltip>{__('email_enviar')}</Tooltip>}>
                      <a className="btn btn-sm btn-outline-secondary" href={mailHref(item.email)}>
                        <i className="la la-envelope" />
                      </a>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip>{__('copiar')}</Tooltip>}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => copyToClipboard(item.email)}
                        disabled={!item.email}
                      >
                        <i className="la la-copy" />
                      </button>
                    </OverlayTrigger>
                  </div>

                  <div className="btn-group" role="group">
                    <OverlayTrigger placement="top" overlay={<Tooltip>{__('editar')}</Tooltip>}>
                      <button
                        type="button"
                        className="btn btn-sm btn-info text-white"
                        onClick={() => openEdit(item)}
                      >
                        <i className="la la-edit" />
                      </button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip>{__('eliminar')}</Tooltip>}>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id
                          ? <Spinner size="sm" animation="border" />
                          : <i className="la la-trash" />
                        }
                      </button>
                    </OverlayTrigger>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal alta/edición */}
      <Modal show={showModal} onHide={closeModal} backdrop="static">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editing?.id ? __('email_editar') : __('email_nuevo')}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}

            <Row className="g-2">
              <Col xs={12}>
                <Form.Label>{__('email')}*</Form.Label>
                <Form.Control
                  type="email"
                  value={editing?.email ?? ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="usuario@example.com"
                  required
                  maxLength={255}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Col>

              <Col xs={12}>
                <Form.Label>{__('observaciones')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editing?.observations ?? ''}
                  onChange={(e) => handleChange('observations', e.target.value)}
                  maxLength={2000}
                  isInvalid={!!formErrors.observations}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.observations}
                </Form.Control.Feedback>
              </Col>
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
