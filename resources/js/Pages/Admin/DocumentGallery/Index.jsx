import React, { useState, useCallback, useRef } from 'react';
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Form, InputGroup, Modal, Button, Card, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';

import { useTranslation } from '@/Hooks/useTranslation';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

const TYPE_OPTIONS = [
    { value: '', labelKey: 'todos' },
    { value: 'image', labelKey: 'imagenes' },
    { value: 'pdf', labelKey: 'pdf' },
    { value: 'office', labelKey: 'office' },
];

const SORT_OPTIONS = [
    { value: 'created_at', labelKey: 'fecha' },
    { value: 'original_name', labelKey: 'nombre' },
    { value: 'title', labelKey: 'titulo' },
];

export default function Index({ auth, title, documents, filters }) {
    const __ = useTranslation();
    const { showAlert, showConfirm } = useSweetAlert();
    const [selected, setSelected] = useState(new Set());
    const [previewDoc, setPreviewDoc] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [panelSaving, setPanelSaving] = useState(false);
    const [panelForm, setPanelForm] = useState({ title: '', alt_text: '', description: '' });
    const [imageToolsDoc, setImageToolsDoc] = useState(null);
    const [crop, setCrop] = useState(null);
    const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
    const [resizeMax, setResizeMax] = useState({ maxWidth: 1280, maxHeight: 1280 });
    const [resizeLockAspect, setResizeLockAspect] = useState(true);
    const [imageToolsApplying, setImageToolsApplying] = useState(false);
    const [urlCopyFeedback, setUrlCopyFeedback] = useState(false);
    const urlCopyFeedbackTimeoutRef = useRef(null);
    const detailRef = useRef(null);
    const galleryTopRef = useRef(null);
    const imgRef = useRef(null);

    const page = usePage();
    const permissions = page?.props?.auth?.permissions ?? [];
    const canCreate = permissions.includes('documents.create') || page?.props?.auth?.is_super_admin;
    const canUpdate = permissions.includes('documents.update') || page?.props?.auth?.is_super_admin;
    const canDestroy = permissions.includes('documents.destroy') || page?.props?.auth?.is_super_admin;

    const items = documents?.data ?? [];
    const selectedList = items.filter((d) => selected.has(d.uuid));
    const singleSelected = selectedList.length === 1 ? selectedList[0] : null;

    const applyFilters = (overrides = {}) => {
        router.get(route('documents.index'), {
            type: overrides.type ?? filters?.type ?? '',
            search: overrides.search ?? filters?.search ?? '',
            sort: overrides.sort ?? filters?.sort ?? 'created_at',
            dir: overrides.dir ?? filters?.dir ?? 'desc',
            page: overrides.page ?? 1,
        }, { preserveState: true });
    };

    const handleSearch = (e) => {
        const v = e.target.value;
        applyFilters({ search: v, page: 1 });
    };

    const handleTypeChange = (e) => {
        applyFilters({ type: e.target.value, page: 1 });
    };

    const handleSortChange = (e) => {
        const val = e.target.value;
        applyFilters({ sort: val, page: 1 });
    };

    const toggleSelect = (uuid, addOnly = false) => (e) => {
        if (addOnly && !e.ctrlKey && !e.metaKey) {
            setSelected(new Set([uuid]));
            return;
        }
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
    };

    const openPreview = (doc) => {
        setPreviewDoc(doc);
    };

    const closePreview = () => setPreviewDoc(null);

    const onImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImageNaturalSize({ width: naturalWidth, height: naturalHeight });
        setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
        setResizeMax({ maxWidth: naturalWidth, maxHeight: naturalHeight });
    };

    const applyImageTools = async () => {
        if (!imageToolsDoc || !canUpdate) return;
        const isFullCrop = crop && crop.unit === '%' && crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100;
        const hasCrop = crop && crop.width > 0 && crop.height > 0 && !isFullCrop;
        const hasResize = resizeMax.maxWidth > 0 && resizeMax.maxHeight > 0;
        if (!hasCrop && !hasResize) {
            showAlert(__('error') || 'Error', __('Indica recorte (crop) y/o redimensionado (resize).') || 'Indica recorte y/o redimensionado.', 'error');
            return;
        }
        setImageToolsApplying(true);
        try {
            const payload = {};
            // Send crop in percent so backend can apply to original image (preview may be resized)
            if (hasCrop && crop) {
                const pct = crop.unit === '%'
                    ? { unit: 'percent', x: crop.x, y: crop.y, width: crop.width, height: crop.height }
                    : {
                        unit: 'percent',
                        x: (crop.x / imageNaturalSize.width) * 100,
                        y: (crop.y / imageNaturalSize.height) * 100,
                        width: (crop.width / imageNaturalSize.width) * 100,
                        height: (crop.height / imageNaturalSize.height) * 100,
                    };
                if (pct.width < 0.01 || pct.height < 0.01) throw new Error('Recorte demasiado pequeño');
                payload.crop = pct;
            }
            if (hasResize) {
                payload.resize = { max_width: resizeMax.maxWidth, max_height: resizeMax.maxHeight };
            }
            await axios.patch(route('documents.image-tools', imageToolsDoc.uuid), payload);
            setImageToolsDoc(null);
            setCrop(null);
            applyFilters();
            showAlert(__('guardado_correctamente') || 'Guardado correctamente', '', 'success');
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.errors?.crop?.[0] || err?.message || 'Error al aplicar';
            showAlert(__('error') || 'Error', msg, 'error');
        } finally {
            setImageToolsApplying(false);
        }
    };

    const handleUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.xls,.xlsx,.docx';
        input.onchange = async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            setUploading(true);
            setUploadProgress(0);
            const form = new FormData();
            files.forEach((f, i) => form.append(`files[${i}]`, f));
            try {
                await axios.post(route('documents.store'), form, {
                    headers: { 'Content-Type': 'multipart/form-data', 'X-XSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
                    onUploadProgress: (p) => {
                        const percent = p.total ? Math.round((p.loaded * 100) / p.total) : 0;
                        setUploadProgress(percent);
                    },
                });
                applyFilters({ page: 1 });
                showAlert(__('guardado_correctamente') || 'Guardado correctamente', '', 'success');
            } catch (err) {
                const msg = err?.response?.data?.message || err?.response?.data?.errors?.files?.[0] || 'Error subiendo archivos';
                showAlert(__('error') || 'Error', msg, 'error');
            } finally {
                setUploading(false);
                setUploadProgress(0);
            }
        };
        input.click();
    }, [filters, showAlert, __]);

    const handleDeleteOne = (doc, e) => {
        if (e) e.stopPropagation();
        if (!canDestroy) return;
        showConfirm({
            title: __('eliminar'),
            text: __('documento_eliminar_confirm') || '¿Eliminar este documento?',
            icon: 'warning',
            onConfirm: async () => {
                try {
                    await axios.delete(route('documents.destroy', doc.uuid));
                    setSelected((prev) => { const next = new Set(prev); next.delete(doc.uuid); return next; });
                    applyFilters();
                    showAlert(__('eliminado_correctamente') || 'Eliminado correctamente', '', 'success');
                } catch (err) {
                    showAlert(__('error') || 'Error', err?.response?.data?.message || 'Error al eliminar', 'error');
                }
            },
        });
    };

    const handleDeleteSelected = () => {
        if (selectedList.length === 0) return;
        showConfirm({
            title: __('eliminar'),
            text: __('documento_eliminar_confirm') || `¿Eliminar ${selectedList.length} documento(s)?`,
            icon: 'warning',
            onConfirm: async () => {
                try {
                    for (const doc of selectedList) {
                        await axios.delete(route('documents.destroy', doc.uuid));
                    }
                    setSelected(new Set());
                    applyFilters({ page: 1 });
                    showAlert(__('eliminado_correctamente') || 'Eliminado correctamente', '', 'success');
                } catch (e) {
                    showAlert(__('error') || 'Error', e?.response?.data?.message || 'Error al eliminar', 'error');
                }
            },
        });
    };

    const updatePanelForm = (field, value) => {
        if (!singleSelected) return;
        setPanelForm((prev) => ({ ...prev, [field]: value }));
    };

    const savePanel = async () => {
        if (!singleSelected || !canUpdate) return;
        setPanelSaving(true);
        try {
            await axios.patch(route('documents.update', singleSelected.uuid), {
                title: panelForm.title,
                alt_text: panelForm.alt_text,
                description: panelForm.description,
            });
            applyFilters();
            showAlert(__('guardado_correctamente') || 'Guardado correctamente', '', 'success');
        } catch (e) {
            showAlert(__('error') || 'Error', e?.response?.data?.message || 'Error al guardar', 'error');
        } finally {
            setPanelSaving(false);
        }
    };

    React.useEffect(() => {
        if (singleSelected) {
            setPanelForm({
                title: singleSelected.title ?? '',
                alt_text: singleSelected.alt_text ?? '',
                description: singleSelected.description ?? '',
            });
            // Scroll so gallery top (toolbar + grid) is at viewport top; run after layout has updated
            const scrollToGalleryTop = () => {
                const el = galleryTopRef.current;
                if (!el) return;
                const top = el.getBoundingClientRect().top + (window.scrollY ?? window.pageYOffset);
                window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            };
            requestAnimationFrame(() => {
                setTimeout(scrollToGalleryTop, 80);
            });
        } else {
            setPanelForm({ title: '', alt_text: '', description: '' });
        }
        setUrlCopyFeedback(false);
        if (urlCopyFeedbackTimeoutRef.current) {
            clearTimeout(urlCopyFeedbackTimeoutRef.current);
            urlCopyFeedbackTimeoutRef.current = null;
        }
    }, [singleSelected?.uuid]);

    const isOffice = (mime) =>
        /spreadsheet|wordprocessing|ms-excel|openxmlformats-officedocument/.test(mime || '');

    const actions = [];
    if (canCreate) {
        actions.push({
            text: __('documentos_subir') || 'Subir documentos',
            icon: 'la-upload',
            modal: true,
            onClick: handleUpload,
        });
    }

    return (
        <AdminAuthenticatedLayout user={auth?.user} title={title} subtitle="" actions={actions}>
            <Head title={title} />

            <div className="contents pb-4" ref={galleryTopRef}>
                <div className="row">
                    <div className="col-12 pt-3">
                        <p>{ __('documentos_texto') }</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <InputGroup style={{ maxWidth: 280 }}>
                        <Form.Control
                            type="search"
                            placeholder={__('buscar') || 'Buscar'}
                            defaultValue={filters?.search}
                            onBlur={handleSearch}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                    </InputGroup>

                    <Form.Select
                        style={{ width: 'auto' }}
                        value={filters?.type ?? ''}
                        onChange={handleTypeChange}
                    >
                        {TYPE_OPTIONS.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>
                                {__(o.labelKey)}
                            </option>
                        ))}
                    </Form.Select>

                    <Form.Select
                        style={{ width: 'auto' }}
                        value={filters?.sort ?? 'created_at'}
                        onChange={handleSortChange}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {__(o.labelKey)}
                            </option>
                        ))}
                    </Form.Select>

                    {/* {canCreate && (
                        <Button variant="primary" onClick={handleUpload} disabled={uploading}>
                            {uploading ? <Spinner animation="border" size="sm" /> : <i className="la la-upload me-1" />}
                            {__('documentos_subir') || 'Subir documentos'}
                        </Button>
                    )} */}

                    {/* Eliminar seleccionados */}
                    {selectedList.length > 0 && canDestroy && (
                        <Button variant="outline-danger" size="sm" onClick={handleDeleteSelected}>
                            {__('eliminar')} ({selectedList.length})
                        </Button>
                    )}
                </div>

                {uploading && (
                    <div className="mb-2">
                        <div className="progress" style={{ height: 6 }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="row">
                    {/* Grid */}
                    <div className={singleSelected ? 'col-lg-8' : 'col-12'}>
                        <div className="row g-3">
                            {items.map((doc) => (
                                <div key={doc.uuid} className="col-6 col-md-4 col-lg-3">
                                    <Card
                                        className={`h-100 position-relative ${selected.has(doc.uuid) ? 'border-primary border-2' : ''}`}
                                        onClick={toggleSelect(doc.uuid, true)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card-body p-2 d-flex flex-column text-center" style={{ minHeight: 200 }}>
                                            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                                                {doc.is_image && doc.thumb_url ? (
                                                    <img
                                                        src={doc.thumb_url}
                                                        alt={doc.alt_text || doc.original_name}
                                                        className="img-fluid rounded"
                                                        style={{ maxHeight: 160, objectFit: 'cover' }}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center bg-light rounded py-4 w-100">
                                                        {doc.mime_type === 'application/pdf' ? (
                                                            <i className="la la-file-pdf la-3x text-danger" />
                                                        ) : isOffice(doc.mime_type) ? (
                                                            <i className="la la-file-excel la-3x text-success" />
                                                        ) : (
                                                            <i className="la la-file la-3x text-secondary" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="small text-truncate mt-1" title={doc.original_name}>
                                                {doc.title || doc.original_name}
                                            </div>
                                            <div className="mt-1 d-flex justify-content-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                {canDestroy && (
                                                    <OverlayTrigger placement="top" overlay={<Tooltip className="ttp-top">{__('eliminar')}</Tooltip>}>
                                                        <button type="button" className="btn btn-sm btn-light btn-shadow" onClick={(e) => handleDeleteOne(doc, e)}>
                                                            <i className="la la-trash text-danger" />
                                                        </button>
                                                    </OverlayTrigger>
                                                )}
                                                <OverlayTrigger placement="top" overlay={<Tooltip className="ttp-top">{__('vista_previa') || 'Ver ampliado'}</Tooltip>}>
                                                    <button type="button" className="btn btn-sm btn-light btn-shadow" onClick={(e) => { e.stopPropagation(); openPreview(doc); }}>
                                                        <i className="la la-expand" />
                                                    </button>
                                                </OverlayTrigger>
                                                {doc.is_image && (
                                                    <OverlayTrigger placement="top" overlay={<Tooltip className="ttp-top">{__('herramientas_imagen') || 'Herramientas de imagen'}</Tooltip>}>
                                                        <button type="button" className="btn btn-sm btn-light btn-shadow" onClick={(e) => { e.stopPropagation(); setImageToolsDoc(doc); }}>
                                                            <i className="la la-crop" />
                                                        </button>
                                                    </OverlayTrigger>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {documents?.links?.length > 1 && (
                            <nav className="mt-3 d-flex justify-content-center">
                                <ul className="pagination pagination-sm mb-0">
                                    {documents.links.map((link, i) => (
                                        <li
                                            key={i}
                                            className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                className="page-link"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </div>

                    {/* Side panel */}
                    {singleSelected && (
                        <div className="col-lg-4" ref={detailRef}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center py-2">
                                    <span>{__('detalle') || 'Detalle'}</span>
                                    <OverlayTrigger placement="left" overlay={<Tooltip className="ttp-top">{__('cerrar') || 'Cerrar panel'}</Tooltip>}>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-link text-secondary p-0"
                                            aria-label={__('cerrar') || 'Cerrar panel'}
                                            onClick={() => setSelected((prev) => { const next = new Set(prev); next.delete(singleSelected.uuid); return next; })}
                                        >
                                            <i className="la la-times" />
                                        </button>
                                    </OverlayTrigger>
                                </Card.Header>
                                <Card.Body>
                                    <div className="small text-muted mb-2">
                                        <div>UUID: {singleSelected.uuid}</div>
                                        <div>{__('nombre')}: {singleSelected.original_name}</div>
                                        <div>Ext: {singleSelected.extension} · {singleSelected.mime_type}</div>
                                        <div>{(singleSelected.size_bytes / 1024).toFixed(1)} KB</div>
                                        <div>{singleSelected.created_at}</div>
                                        <div className="mt-2 d-flex align-items-center gap-1">
                                            <Form.Control
                                                size="sm"
                                                readOnly
                                                className="font-monospace small"
                                                value={typeof window !== 'undefined' ? `${window.location.origin}${route('documents.preview', singleSelected.uuid)}` : route('documents.preview', singleSelected.uuid)}
                                            />
                                            <OverlayTrigger placement="top" overlay={<Tooltip className="ttp-top">{urlCopyFeedback ? (__('copiado') || 'Copiado') : (__('copiar') || 'Copiar URL')}</Tooltip>}>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => {
                                                        const url = typeof window !== 'undefined' ? `${window.location.origin}${route('documents.preview', singleSelected.uuid)}` : route('documents.preview', singleSelected.uuid);
                                                        navigator.clipboard?.writeText(url).then(() => {
                                                            if (urlCopyFeedbackTimeoutRef.current) clearTimeout(urlCopyFeedbackTimeoutRef.current);
                                                            setUrlCopyFeedback(true);
                                                            urlCopyFeedbackTimeoutRef.current = setTimeout(() => {
                                                                setUrlCopyFeedback(false);
                                                                urlCopyFeedbackTimeoutRef.current = null;
                                                            }, 3000);
                                                        });
                                                    }}
                                                >
                                                    <i className={urlCopyFeedback ? 'la la-check text-success' : 'la la-copy'} />
                                                </Button>
                                            </OverlayTrigger>
                                        </div>
                                    </div>
                                    {canUpdate && (
                                        <>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small">{__('titulo')}</Form.Label>
                                                <Form.Control
                                                    size="sm"
                                                    value={panelForm.title}
                                                    onChange={(e) => updatePanelForm('title', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small">{__('alt_text') || 'Alt text'}</Form.Label>
                                                <Form.Control
                                                    size="sm"
                                                    value={panelForm.alt_text}
                                                    onChange={(e) => updatePanelForm('alt_text', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small">{__('descripcion')}</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    size="sm"
                                                    value={panelForm.description}
                                                    onChange={(e) => updatePanelForm('description', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Button size="sm" variant="primary" onClick={savePanel} disabled={panelSaving}>
                                                {panelSaving ? <Spinner animation="border" size="sm" /> : __('guardar')}
                                            </Button>
                                        </>
                                    )}
                                    <div className="mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            className="me-1"
                                            onClick={() => openPreview(singleSelected)}
                                        >
                                            {__('vista_previa') || 'Vista previa'}
                                        </Button>
                                        <a
                                            href={route('documents.download', singleSelected.uuid)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            {__('descargar')}
                                        </a>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    {selectedList.length > 1 && !singleSelected && (
                        <div className="col-12">
                            <p className="text-muted small">
                                {selectedList.length} {__('seleccionados') || 'seleccionados'}. {__('documento_selecciona_uno') || 'Selecciona uno para editar.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Image tools modal: crop + resize */}
            <Modal show={!!imageToolsDoc} onHide={() => { setImageToolsDoc(null); setCrop(null); }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{__('herramientas_imagen') || 'Herramientas de imagen'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {imageToolsDoc && (
                        <>
                            <p className="text-muted small mb-3">
                                {imageToolsDoc.title || imageToolsDoc.original_name}
                            </p>
                            <div className="mb-3 d-flex justify-content-center bg-dark rounded p-2" style={{ minHeight: 280 }}>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    aspect={undefined}
                                    className="mw-100"
                                >
                                    <img
                                        ref={imgRef}
                                        src={route('documents.preview', imageToolsDoc.uuid)}
                                        alt={imageToolsDoc.original_name}
                                        style={{ maxHeight: 360, width: 'auto' }}
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            </div>
                            <div className="row g-2 mb-3 align-items-end">
                                <div className="col-md-4">
                                    <Form.Label className="small">{__('resize_max_width') || 'Ancho máx. (resize)'}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        max={4096}
                                        value={resizeMax.maxWidth}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value, 10) || 1280;
                                            const clamped = Math.max(1, Math.min(4096, v));
                                            if (resizeLockAspect && imageNaturalSize.width > 0 && imageNaturalSize.height > 0) {
                                                const aspect = imageNaturalSize.width / imageNaturalSize.height;
                                                const h = Math.max(1, Math.min(4096, Math.round(clamped / aspect)));
                                                setResizeMax((prev) => ({ ...prev, maxWidth: clamped, maxHeight: h }));
                                            } else {
                                                setResizeMax((prev) => ({ ...prev, maxWidth: clamped }));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-md-4 d-flex justify-content-center pb-2">
                                    <Form.Label className="small">{__('mantener_proporciones') || 'Mantener proporciones'}</Form.Label>
                                    <div>
                                        <Form.Check
                                            type="checkbox"
                                            id="resize-lock-aspect"
                                            checked={resizeLockAspect}
                                            onChange={(e) => setResizeLockAspect(e.target.checked)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <Form.Label className="small">{__('resize_max_height') || 'Alto máx. (resize)'}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        max={4096}
                                        value={resizeMax.maxHeight}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value, 10) || 1280;
                                            const clamped = Math.max(1, Math.min(4096, v));
                                            if (resizeLockAspect && imageNaturalSize.width > 0 && imageNaturalSize.height > 0) {
                                                const aspect = imageNaturalSize.width / imageNaturalSize.height;
                                                const w = Math.max(1, Math.min(4096, Math.round(clamped * aspect)));
                                                setResizeMax((prev) => ({ ...prev, maxWidth: w, maxHeight: clamped }));
                                            } else {
                                                setResizeMax((prev) => ({ ...prev, maxHeight: clamped }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => { setImageToolsDoc(null); setCrop(null); }}>
                                    {__('cancelar')}
                                </Button>
                                <Button variant="primary" onClick={applyImageTools} disabled={imageToolsApplying}>
                                    {imageToolsApplying ? <Spinner animation="border" size="sm" className="me-1" /> : null}
                                    {__('aplicar') || 'Aplicar'}
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* Preview modal */}
            <Modal show={!!previewDoc} onHide={closePreview} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{previewDoc?.title || previewDoc?.original_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {previewDoc?.is_image && (
                        <img
                            src={route('documents.preview', previewDoc.uuid)}
                            alt={previewDoc.alt_text || previewDoc.original_name}
                            className="img-fluid"
                            style={{ maxHeight: '70vh' }}
                        />
                    )}
                    {previewDoc?.mime_type === 'application/pdf' && (
                        <iframe
                            title="PDF preview"
                            src={route('documents.preview', previewDoc.uuid)}
                            className="w-100 border-0"
                            style={{ height: '70vh' }}
                        />
                    )}
                    {previewDoc && isOffice(previewDoc.mime_type) && (
                        <div>
                            <i className="la la-file-excel la-4x text-success mb-3" />
                            <p className="text-muted">{__('documento_descargar_office') || 'Documento Office. Usa descarga para abrir.'}</p>
                            <a
                                href={route('documents.download', previewDoc.uuid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                {__('descargar')}
                            </a>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </AdminAuthenticatedLayout>
    );
}
