import React, { useRef, useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

export default function DropzoneGallery({
    existingImages = [],
    imagePath = null,
    uploadUrl,
    deleteUrl = null,
    // URL or function to set an image as featured (default false hides the button)
    setFeaturedUrl = false,
    uploadParamName = 'file',
    maxFiles = 20,
    maxFileSize = 3 * 1024 * 1024, // 3MB
    acceptedTypes = ['image/jpeg','image/png','image/gif','image/webp'],
    onChange = () => {},
    autoUpload = true,
    showProgress = false,
    className = '',
    // id of the related entity (user/company/whatever) to include in the request
    entityId = null,
    // form field name to send the entity id as (defaults to entity_id)
    entityParamName = 'entity_id',
}) {
    const __ = useTranslation();
    const { showConfirm } = useSweetAlert();
    const inputRef = useRef(null);
    // Helper to resolve Ziggy named routes if available in global scope.
    const resolveUrl = (u, params = {}) => {
        try {
            if (typeof u === 'string' && typeof route === 'function') {
                // If u looks like a named route (contains a dot) try generating it
                try {
                    return route(u, params);
                } catch (e) {
                    // fallthrough to return original string
                }
            }
        } catch (e) {
            // route not available or error generating — ignore
        }
        return u;
    };
    const [images, setImages] = useState(Array.isArray(existingImages) ? existingImages.slice() : []);
    const [uploadingMap, setUploadingMap] = useState({}); // tempId -> { progress }
    const [error, setError] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerSrc, setViewerSrc] = useState(null);
    const [viewerAlt, setViewerAlt] = useState('');

    const totalCount = images.length + Object.keys(uploadingMap).length;

    // Helper to build a public URL from a bare filename or image value
    const buildPublicUrl = (val) => {
        if (!val) return '';
        if (typeof val !== 'string') return '';
        if (val.startsWith('http') || val.startsWith('/') || val.startsWith('data:') || val.includes('/')) return val;
        const prefix = imagePath ? `/storage/${imagePath.replace(/\/$/, '')}/` : '/storage/';
        return `${prefix}${val}`;
    };

    const normalizeImage = (raw) => {
        // raw can be a string (filename), or an object
        if (!raw) return null;
        if (typeof raw === 'string') {
            return { image: raw, url: buildPublicUrl(raw), __key: `tmp_${raw}_${Date.now()}` };
        }
        // copy to avoid mutating original
        const obj = { ...raw };
        // prefer url/path/preview fields
        if (!obj.url) {
            if (obj.path) obj.url = obj.path;
            else if (obj.preview) obj.url = obj.preview;
            else if (obj.file && obj.file.url) obj.url = obj.file.url;
            else if (obj.filename) obj.url = buildPublicUrl(obj.filename);
            else if (obj.image) obj.url = buildPublicUrl(obj.image);
        }
        // ensure a stable key for React lists
        if (!obj.__key) obj.__key = obj.id ? `id_${obj.id}` : `tmp_${Math.random().toString(36).slice(2,8)}_${Date.now()}`;
        return obj;
    };

    // Keep local images state normalized when existingImages prop changes
    useEffect(() => {
        if (!Array.isArray(existingImages)) return;
        const next = existingImages.map(i => normalizeImage(i)).filter(Boolean);
        setImages(next);
    }, [existingImages, imagePath]);

    const isAcceptable = (file) => {
        if (!acceptedTypes.includes(file.type)) return false;
        if (file.size > maxFileSize) return false;
        return true;
    };

    const handleFiles = (filesList) => {
        setError(null);
        const files = Array.from(filesList || []);
        if (totalCount + files.length > maxFiles) {
            setError(`Máximo ${maxFiles} imágenes permitidas.`);
            return;
        }

        const valid = files.filter(f => isAcceptable(f));
        const invalid = files.length - valid.length;
        if (invalid) setError(`Algunos archivos no válidos (tipo/tamaño).`);

        valid.forEach(f => uploadOne(f));
    };

    const uploadOne = async (file) => {
        // create temp id
        const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        setUploadingMap(prev => ({ ...prev, [tempId]: { progress: 0, file } }));

            if (!autoUpload || !uploadUrl) {
            // If not auto-upload, just add as a local preview object
            const localObj = { __tmp: tempId, __key: `tmp_${tempId}`, name: file.name, url: URL.createObjectURL(file), file };
            setImages(prev => { const next = prev.concat(localObj); onChange(next); return next; });
            setUploadingMap(prev => { const copy = { ...prev }; delete copy[tempId]; return copy; });
            return;
        }

        try {
            const form = new FormData();
            form.append(uploadParamName, file);
            // include entity id so server can associate the image with the correct record
            if (entityId !== null && entityId !== undefined) {
                form.append(entityParamName, entityId);
            }

            const target = resolveUrl(uploadUrl, entityId || {});
            const res = await axios.post(target, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
                    setUploadingMap(prev => ({ ...prev, [tempId]: { progress: percent, file } }));
                }
            });

            // TEMP DEBUG removed

            // Try to normalize response to an array of image objects
            let added = [];
            if (!res || !res.data) {
                added = [];
            } else if (Array.isArray(res.data)) {
                added = res.data;
            } else if (Array.isArray(res.data.images)) {
                added = res.data.images;
            } else if (res.data.image) {
                added = Array.isArray(res.data.image) ? res.data.image : [res.data.image];
            } else if (res.data.data && Array.isArray(res.data.data)) {
                added = res.data.data;
            } else {
                // fallback: if object with id and url
                const maybe = res.data;
                if (maybe && (maybe.id || maybe.url)) added = [maybe];
            }

            setImages(prev => {
                const normalized = added.map(a => normalizeImage(a)).filter(Boolean);
                const next = prev.concat(normalized);
                onChange(next);
                return next;
            });
        } catch (err) {
            console.error('Upload error', err);
            setError('Error subiendo archivo');
        } finally {
            setUploadingMap(prev => { const copy = { ...prev }; delete copy[tempId]; return copy; });
        }
    };

    const handleDelete = async (img) => {
        // Ask for confirmation before deleting
        showConfirm({
            title: __('imagen_eliminar') ?? 'Eliminar imagen',
            text: __('imagen_eliminar_confirm') ?? '¿Quieres eliminar esta imagen?',
            icon: 'warning',
            onConfirm: async () => {
                // debug logs removed
                // If it's a temporary local file (not uploaded), just remove
                if (img.__tmp) {
                    setImages(prev => {
                        const next = prev.filter(i => i.__tmp !== img.__tmp);
                        onChange(next);
                        return next;
                    });
                    return;
                }

                // allow deletion even if img.id is missing — deleteUrl resolver should handle filename fallback

                if (!deleteUrl) {
                    // just remove locally
                    setImages(prev => {
                        const next = prev.filter(i => i.id !== img.id);
                        onChange(next);
                        return next;
                    });
                    return;
                }

                // compute url — ensure we pass img.id when resolving named routes
                let url = null;
                if (typeof deleteUrl === 'function') {
                    // Call the function in a try/catch because Ziggy.route(...) may throw if params are missing.
                    try {
                        url = deleteUrl(img);
                    } catch (e) {
                        console.error('Error resolviendo deleteUrl function', e);
                        setError('No se pudo resolver la ruta de borrado. Comprueba que la imagen tiene id.');
                        return;
                    }
                } else if (typeof deleteUrl === 'string') {
                    // allow explicit :id placeholder
                    if (deleteUrl.includes(':id')) {
                        url = deleteUrl.replace(':id', img.id);
                    } else {
                        // Try resolving via Ziggy with different param styles:
                        // 1) as array [id]
                        // 2) as scalar id
                        // 3) fallback to appending /id
                        let maybe = resolveUrl(deleteUrl, [img.id]);
                        if (!maybe || maybe === deleteUrl) maybe = resolveUrl(deleteUrl, img.id);
                        if (maybe && typeof maybe === 'string' && maybe !== deleteUrl) url = maybe;
                        else url = `${deleteUrl.replace(/\/$/, '')}/${img.id}`;
                    }
                }

                try {
                    // If url couldn't be resolved, try a last attempt with Ziggy
                    if (!url) {
                        try {
                            const maybe = resolveUrl(deleteUrl, [img.id]);
                            if (maybe && typeof maybe === 'string' && maybe !== deleteUrl) url = maybe;
                        } catch (e) {
                            // ignore
                        }
                    }

                    if (!url) {
                        console.error('Could not resolve deleteUrl for image', { deleteUrl, img });
                        setError('Url de borrado inválida');
                        return;
                    }

                    // debug logs removed

                    await axios.delete(url, { data: {} });
                    setImages(prev => {
                        const next = prev.filter(i => {
                            if (img.id) return i.id !== img.id;
                            // fallback: compare filename, url or temporary key
                            return (i.image && i.image !== img.image) && (i.url && i.url !== img.url) && (i.__key && i.__key !== img.__key);
                        });
                        onChange(next);
                        return next;
                    });
                } catch (err) {
                    console.error('Delete error', err);
                    // Fallback: some servers/routers don't accept raw DELETE from XHR — try method override via POST
                    const status = err?.response?.status;
                    if (status === 405 || status === 404) {
                        try {
                            // send form data to allow Laravel method spoofing
                            const form = new FormData();
                            form.append('_method', 'DELETE');
                            const res2 = await axios.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } });
                            // if success, remove locally
                            if (res2 && (res2.status === 200 || res2.status === 204 || res2.status === 202)) {
                                setImages(prev => {
                                    const next = prev.filter(i => {
                                        if (img.id) return i.id !== img.id;
                                        return (i.image && i.image !== img.image) && (i.url && i.url !== img.url) && (i.__key && i.__key !== img.__key);
                                    });
                                    onChange(next);
                                    return next;
                                });
                                return;
                            }
                        } catch (err2) {
                            console.error('Fallback delete error', err2);
                        }
                    }
                    setError('Error borrando imagen');
                }
            }
        });
    };

    const handleSetFeatured = async (img) => {
        if (!setFeaturedUrl) return;

        // Resolve URL similarly to deleteUrl: accept function or string (Ziggy)
        let url = null;
        if (typeof setFeaturedUrl === 'function') {
            try {
                url = setFeaturedUrl(img);
            } catch (e) {
                console.error('Error resolviendo setFeaturedUrl function', e);
                setError('No se pudo resolver la ruta para establecer como principal');
                return;
            }
        } else if (typeof setFeaturedUrl === 'string') {
            // try generating via Ziggy with a named param 'image'
            try {
                url = resolveUrl(setFeaturedUrl, { image: img.id ?? img.image });
            } catch (e) {
                // fallback to raw string
                url = setFeaturedUrl;
            }
        }

        if (!url) {
            setError('Url para marcar como principal inválida');
            return;
        }

        try {
            const payload = img.id ? { id: img.id } : { image: img.image };
            const res = await axios.post(url, payload);

            // Update local state: set featured true for this image, false for others
            setImages(prev => {
                const next = prev.map(i => {
                    if (img.id && i.id === img.id) return { ...i, featured: true };
                    if (!img.id && i.image && img.image && i.image === img.image) return { ...i, featured: true };
                    return { ...i, featured: false };
                });
                onChange(next);
                return next;
            });
        } catch (err) {
            console.error('Set featured error', err);
            setError('Error marcando imagen principal');
        }
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && viewerOpen) setViewerOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [viewerOpen]);

    const openViewer = (src, alt = '') => {
        setViewerSrc(src);
        setViewerAlt(alt);
        setViewerOpen(true);
    };

    const closeViewer = () => setViewerOpen(false);

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dt = e.dataTransfer;
        if (dt && dt.files) handleFiles(dt.files);
    };

    const onDragOver = (e) => { e.preventDefault(); };

    const openFilePicker = () => inputRef.current && inputRef.current.click();

    return (
        <div className={`dropzone-gallery ${className}`}>
            <div
                className="p-3 mb-3 border rounded text-center"
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={openFilePicker}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.map(t => t).join(',')}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="mb-2 pt-3">
                    <strong>{__('imagenes_anadir')}</strong>
                    <br />

                    <i className="la la-image fs-1 my-4"></i>
                </div>
                <div className="small text-muted pb-4">{__('imagenes_arrastrar_click')} (máx {maxFiles} archivos)</div>
            </div>

            {error && <div className="alert alert-danger small mx-0 mb-3">{error}</div>}

            <div className="row g-2">
                {images.map((img) => {
                    // Resolve image src robustly: prefer explicit url/path/preview, fall back to image or filename.
                    let src = null;
                    if (img.url) src = img.url;
                    else if (img.path) src = img.path;
                    else if (img.preview) src = img.preview;
                    else if (img.file && img.file.url) src = img.file.url;
                    else if (img.filename) src = img.filename;
                    else if (img.image) {
                        // If `image` looks like a full path or URL, use it directly
                        const val = img.image;
                        if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('/') || val.startsWith('data:') || val.includes('/'))) {
                            src = val;
                        } else if (imagePath) {
                            src = `/storage/${imagePath.replace(/\/$/, '')}/${val}`;
                        } else {
                            // Last resort: use the value as-is
                            src = val;
                        }
                    }
                    src = src || '';

                    // If src is a bare filename (no slash, not a data or absolute URL),
                    // try to prefix with /storage/ (and imagePath if provided) so it resolves.
                    if (src && typeof src === 'string' && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:') && !src.includes('/')) {
                        const prefix = imagePath ? `/storage/${imagePath.replace(/\/$/, '')}/` : '/storage/';
                        src = `${prefix}${src}`;
                    }
                    return (
                        <div key={img.id ?? img.__tmp ?? img.url ?? img.image} className="col-6 col-sm-4 col-md-3">
                            <div className="position-relative border rounded overflow-hidden" style={{ minHeight: 80 }}>
                                <img
                                    src={src}
                                    alt={img.name ?? ''}
                                    style={{ width: '100%', height: 120, objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => openViewer(src, img.name ?? '')}
                                />
                                <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <OverlayTrigger
                                        placement="left"
                                        overlay={
                                            <Tooltip id={`tooltip-delete-${img.__key ?? img.id}`}>
                                                {__('imagen_eliminar') ?? 'Eliminar imagen'}
                                            </Tooltip>
                                        }
                                    >
                                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(img)}>
                                            <i className="la la-trash"></i>
                                        </button>
                                    </OverlayTrigger>

                                    {setFeaturedUrl && (
                                        <OverlayTrigger
                                            placement="left"
                                            overlay={
                                                <Tooltip id={`tooltip-featured-${img.__key ?? img.id}`}>
                                                    {img.featured ? (__('imagen_destacada') ?? 'Principal') : (__('imagen_destacada_marcar') ?? 'Marcar principal')}
                                                </Tooltip>
                                            }
                                        >
                                            <button type="button"
                                                className={`btn btn-sm ${img.featured ? 'btn-warning' : 'btn-light'}`}
                                                onClick={() => handleSetFeatured(img)}
                                            >
                                                <i className="la la-star" style={{ color: img.featured ? '#fff' : '#333' }}></i>
                                            </button>
                                        </OverlayTrigger>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {Object.keys(uploadingMap).map(tmpId => (
                    <div key={tmpId} className="col-6 col-sm-4 col-md-3">
                        <div className="position-relative border rounded d-flex align-items-center justify-content-center" style={{ minHeight: 120 }}>
                            <div className="text-center small">
                                <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">{__('cargando')}</span></div>
                                <div className="mt-2">{__('subiendo')}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Image viewer modal (simple overlay) */}
            {viewerOpen && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
                        onClick={closeViewer}
                    />

                    <div
                        className="image-viewer-overlay d-flex align-items-center justify-content-center"
                        style={{ position: 'fixed', inset: 0, zIndex: 1060, pointerEvents: 'none' }}
                    >
                        <div style={{ pointerEvents: 'auto', maxWidth: '95%', maxHeight: '95%', position: 'relative' }}>
                            <button type="button" className="btn btn-sm btn-light position-absolute" style={{ top: -12, right: -12, zIndex: 1070 }} onClick={closeViewer}>
                                <i className="la la-close"></i>
                            </button>
                            <img src={viewerSrc} alt={viewerAlt} style={{ display: 'block', maxWidth: '100%', maxHeight: '80vh', borderRadius: 6 }} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
