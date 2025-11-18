// resources/js/Pages/Admin/Category/Upsert.jsx
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, InputGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';

//Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectSearch from '@/Components/SelectSearch';

//Hooks
import { useTranslation } from '@/Hooks/useTranslation';

/**
 * CategoryTreePicker
 * Modal de selección de padre con búsqueda simple.
 * Props:
 *  - environment: string
 *  - show: boolean
 *  - onClose: () => void
 *  - onSelect: (node) => void
 *  - selectedId: number|null (preselección)
 */
function CategoryTreePicker({ environment, show, onClose, onSelect, selectedId = null }) {
    const __ = useTranslation();
    const [nodes, setNodes] = useState([]);
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!show) return;

        setLoading(true);

        // 1) Si Ziggy aún no tiene la ruta, no dispares nada y evita pantallazo
        try {
            // esto explota si la ruta no existe en Ziggy
            route('categories.tree', environment);
        } catch (e) {
            console.warn('[CategoryTreePicker] Ruta categories.tree no disponible aún:', e);
            setNodes([]);        // deja el modal vacío pero estable
            setLoading(false);
            return;
        }

        // 2) Fetch normal con catch para no romper el render
        axios
        .get(route('categories.tree', environment))
        .then(res => {
            const data = res.data?.nodes ?? [];
            setNodes(data);

            // Expande raíces al abrir
            const roots = data.filter(n => !n.parent_id).map(n => n.id);
            setExpanded(new Set(roots));
        })
        .catch(err => {
            console.error('[CategoryTreePicker] Error cargando árbol:', err);
            setNodes([]);      // fallback: modal vacío pero sin romper la UI
            })
        .finally(() => setLoading(false));
    }, [show, environment]);

    const byParent = useMemo(() => {
        const map = new Map();
        nodes.forEach(n => {
        const k = n.parent_id ?? 0;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(n);
        });
        map.forEach(arr => arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name)));
        return map;
    }, [nodes]);

    const flatIndex = useMemo(() => {
        const idx = new Map();
        nodes.forEach(n => idx.set(n.id, n));
        return idx;
    }, [nodes]);

    function toggle(id) {
        const c = new Set(expanded);
        if (c.has(id)) c.delete(id);
        else c.add(id);
        setExpanded(c);
    }

    function renderBranch(parentId = 0, depth = 0) {
        const list = byParent.get(parentId) || [];
        return (
            <ul className="list-unstyled ms-0">
                {list.map(node => {
                const hasChildren = (byParent.get(node.id) || []).length > 0;
                const isExpanded = expanded.has(node.id);
                const matches =
                    query.trim() === '' ||
                    node.name.toLowerCase().includes(query.toLowerCase()) ||
                    (node.slug || '').toLowerCase().includes(query.toLowerCase());

                // Oculta ramas que no matchean y no tienen descendencia abierta
                const showRow = matches || isExpanded;
                if (!showRow && query.trim() !== '' && !hasChildren) {
                    return null;
                }

                return (
                    <li key={node.id} className="my-1">
                        <div className="d-flex align-items-center">
                            <button
                            type="button"
                            className="btn btn-sm btn-light me-2"
                            onClick={() => hasChildren && toggle(node.id)}
                            disabled={!hasChildren}
                            aria-label={hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : 'Leaf'}
                            style={{ width: 32 }}
                            >
                            {hasChildren ? (isExpanded ? '▾' : '▸') : '•'}
                            </button>

                            <button
                            type="button"
                            className={`btn btn-sm ${selectedId === node.id ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => onSelect(node)}
                            >
                            {node.name}
                            </button>

                            <span className="ms-2 text-muted small">{node.slug}</span>
                            {node.status === 0 && <span className="badge bg-secondary ms-2">{__('inactivo')}</span>}
                        </div>

                        {hasChildren && isExpanded && (
                            <div className="ms-4">{renderBranch(node.id, depth + 1)}</div>
                        )}
                    </li>
                );
                })}
            </ul>
        );
    }

    return (
        <Modal show={show} onHide={onClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{__('ubicacion_selec')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <i className="la la-search" />
                    </InputGroup.Text>
                    
                    <TextInput
                        placeholder={__('categoria_buscar')}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                
                    <Button variant="outline-secondary" onClick={() => setQuery('')}>
                        {__('limpiar')}
                    </Button>
                </InputGroup>

                {loading ? (
                    <div className="text-center py-4">{__('cargando')}…</div>
                ) : nodes.length === 0 ? (
                    <div className="text-center text-muted py-4">{__('sin_resultados')}</div>
                ) : (
                    <div style={{ maxHeight: 420, overflowY: 'auto' }}>{renderBranch(0, 0)}</div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>{__('cerrar')}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default function Upsert({ auth, environment, mode = 'create', category = null, defaults = null, title, subtitle }) {
  const __ = useTranslation();

  const initial = useMemo(() => {
    const base = {
      name: '',
      slug: '',
      parent_id: null,
      parent_path: '',
      positionMode: 'end', // start | end | after
      afterSiblingId: null,
      status: 1,
    };
    if (mode === 'edit' && category) {
      return {
        ...base,
        name: category.name ?? '',
        slug: category.slug ?? '',
        parent_id: category.parent_id ?? null,
        parent_path: category.path ? category.path.split('/').slice(0, -1).join(' / ') : '',
        status: category.status ?? 1,
        // posición se gestiona aparte al mover
      };
    }
        if (defaults) return { ...base, ...defaults };
        return base;
    }, [mode, category, defaults]);

    const { data, setData, post, put, processing, errors, transform, reset } = useForm(initial);

    // Estado del picker
    const [pickerOpen, setPickerOpen] = useState(false);
    const [siblings, setSiblings] = useState([]); // hermanos del padre para "after"
    const [parentNode, setParentNode] = useState(null); // objeto seleccionado como padre
    // opciones para el SelectSearch asincrónico de hermanos
    const [siblingOptions, setSiblingOptions] = useState([]);
    const [siblingsLoading, setSiblingsLoading] = useState(false);

    // Cargar hermanos cuando cambia el parent_id
    useEffect(() => {
        if (!data.parent_id) {
            setSiblings([]);
            setParentNode(null);
            setData('afterSiblingId', null);
            return;
        }
        axios
        .get(route('categories.tree', environment))
        .then(res => {
            const nodes = res.data?.nodes ?? [];
            const map = new Map(nodes.map(n => [n.id, n]));
            const parent = map.get(data.parent_id);
            setParentNode(parent || null);
            // hermanos = hijos del mismo parent
            const siblingsList = nodes.filter(n => (n.parent_id ?? 0) === (parent?.id ?? 0));
            // quitar el propio (si edit)
            const filtered = siblingsList.filter(n => mode !== 'edit' || n.id !== category?.id);
            filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name));
            setSiblings(filtered);
        })
        .catch(() => setSiblings([]));
    }, [data.parent_id, environment, mode, category?.id, setData]);

    // Fetch sibling options via AJAX (used by SelectSearch)
    async function fetchSiblingOptions(q = '') {
        if (!data.parent_id) {
            setSiblingOptions([]);
            return;
        }
        setSiblingsLoading(true);
        try {
            const params = {
                parent_id: data.parent_id,
            };
            if (q) params.q = q;
            if (mode === 'edit' && category?.id) params.exclude = category.id;
            const res = await axios.get(route('categories.siblings', environment), { params });
            // Expecting an array of nodes: [{ id, name }]
            const nodes = res.data?.nodes ?? res.data ?? [];
            const opts = nodes.map(n => ({ value: n.id, label: n.name }));
            setSiblingOptions(opts);
        } catch (e) {
            setSiblingOptions([]);
        } finally {
            setSiblingsLoading(false);
        }
    }

    // Load initial sibling options when parent changes (and when editing to prefill)
    useEffect(() => {
        if (!data.parent_id) {
            setSiblingOptions([]);
            return;
        }
        // initial load without query
        fetchSiblingOptions('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.parent_id]);

    // Vista previa de path en tiempo real
    const previewPath = useMemo(() => {
        const parentPath = parentNode?.path || '';
        const slug = (data.slug || (data.name || '').trim().toLowerCase().replace(/\s+/g, '-')).replace(/[^a-z0-9\-_/]/g, '');
        return [parentPath, slug].filter(Boolean).join('/');
    }, [data.name, data.slug, parentNode]);

    // Guardar
    function onSubmit(e, createAnother = false) {
        e.preventDefault();

        transform((payload) => ({
            ...payload,
            // normaliza
            parent_id: payload.parent_id || null,
            afterSiblingId: payload.positionMode === 'after' ? payload.afterSiblingId : null,
        }));

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (createAnother) {
                  // limpiar pero conservar parent
                  const keepParent = data.parent_id;
                  reset('name', 'slug', 'positionMode', 'afterSiblingId');
                  setData('positionMode', 'end');
                  setData('parent_id', keepParent);
                } else {
                    router.visit(route('categories.index', environment), { preserveState: true });
                }
            },
        };

        if (mode === 'edit' && category) {
            put(route('categories.update', [environment, category.id]), options);
        } else {
            post(route('categories.store', environment), options);
        }
    }

    // Breadcrumb corto del padre
    const parentBreadcrumb = useMemo(() => {
        if (!parentNode?.path) return __('raiz');
        const parts = parentNode.path.split('/');
        return parts.join(' › ');
    }, [parentNode]);

    // Acciones header
    const actions = [];
    actions.push({
        text: __('categorias_volver'),
        icon: 'la-angle-left',
        url: 'categories.index',
        modal: false,
        params: [environment]
    });

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title ?? __('categorias')} subtitle={subtitle ?? (mode === 'edit' ? __('editar') : __('nuevo'))} actions={actions}>
            <Head title={title ?? __('categorias')} />

            <div className="contents pb-4">
                <form onSubmit={(e) => onSubmit(e, false)}>
                    <div className="row gy-3">
                        {/* Nombre */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('categoria') }*</label>
                                <TextInput            
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={__('categoria')}
                                    isFocused={true}
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('estado') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox
                                      className="xl"
                                      name="status"
                                      checked={!!data.status}
                                      onChange={(e) => setData('status', e.target.checked ? 1 : 0)}
                                    />
                                </div>
                                <InputError message={errors.status} />
                            </div>
                        </div>

                        {/* Parent selector */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('ubicacion_arbol') }</label>
                                <div className="d-flex align-items-center gap-2 pt-1">
                                    <Button variant="outline-primary" type="button" onClick={() => setPickerOpen(true)}>
                                      <i className="la la-sitemap me-1" />
                                      {__('ubicacion_selec')}
                                    </Button>

                                    <div className="text-muted small">
                                      {__('padre')}: <strong>{parentBreadcrumb}</strong>
                                    </div>

                                    {data.parent_id && (
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        type="button"
                                        onClick={() => setData('parent_id', null)}
                                      >
                                        {__('padre_quitar')}
                                      </Button>
                                    )}
                                </div>
                                <InputError message={errors.parent_id} />
                            </div>
                        </div>

                        {/* Posición entre hermanos */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('posicion') }</label>
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <SelectSearch
                                            options={[
                                              { value: 'start', label: __('al_principio') },
                                              { value: 'end', label: __('al_final') },
                                              { value: 'after', label: __('despues_de') },
                                            ]}
                                            value={data.positionMode}
                                            onChange={(opt) => setData('positionMode', opt ? opt.value : '')}
                                            isClearable={false}
                                            placeholder={__('posicion')}
                                        />
                                    </div>

                                    <div className="col-md-8">
                                        <SelectSearch
                                            options={siblingOptions}
                                            value={data.afterSiblingId ?? ''}
                                            onChange={(opt) => setData('afterSiblingId', opt && opt.value ? parseInt(opt.value, 10) : null)}
                                            isDisabled={data.positionMode !== 'after'}
                                            isLoading={siblingsLoading}
                                            onSearchChange={(q) => fetchSiblingOptions(q)}
                                            onMenuOpen={() => {
                                              // ensure options are loaded when user opens the menu
                                              if (!siblingOptions || siblingOptions.length === 0) fetchSiblingOptions('');
                                            }}
                                            placeholder={__('hermano_selec')}
                                        />
                                    </div>
                                </div>
                                {(data.positionMode === 'after' && siblings.length === 0) && (
                                    <div className="text-muted small mt-1">{__('no_hay_hermanos_para_posicionar')}</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-4 text-end">
                            {mode === 'create' && (
                                <Button
                                  type="button"
                                  variant="outline-primary"
                                  disabled={processing}
                                  onClick={(e) => onSubmit(e, true)}
                                >
                                  {__('guardar_anadir')}
                                </Button>
                            )}

                            <PrimaryButton type="submit" disabled={processing} className="btn btn-rdn ms-3">
                                {processing ? __('procesando') + '...' : __('guardar')}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>

            {/* Picker modal */}
            <CategoryTreePicker
                environment={environment}
                show={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(node) => {
                    setData('parent_id', node?.id ?? null);
                    setPickerOpen(false);
                }}
                selectedId={data.parent_id}
            />
        </AdminAuthenticatedLayout>
    );
}
