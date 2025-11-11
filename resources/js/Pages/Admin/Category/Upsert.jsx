// resources/js/Pages/Admin/Category/Upsert.jsx
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, InputGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';

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
        axios
        .get(route('categories.tree', environment))
        .then(res => {
            const data = res.data?.nodes ?? [];
            setNodes(data);
            // Expande raíces al abrir
            const roots = data.filter(n => !n.parent_id).map(n => n.id);
            setExpanded(new Set(roots));
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
                <Modal.Title>{__('seleccionar_ubicacion')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup className="mb-3">
                <InputGroup.Text>
                    <i className="la la-search" />
                </InputGroup.Text>
                <Form.Control
                    placeholder={__('buscar_categoria_o_slug')}
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
      slug: payload.slug && payload.slug.length ? payload.slug : null,
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
                <Form onSubmit={(e) => onSubmit(e, false)}>
                    <div className="row gy-3">
                        <div className="col-lg-6">

                        {/* Nombre */}
                        <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">{__('categoria')}*</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={__('categoria')}
                            autoFocus
                        />
                        {errors.name && <div className="text-danger small mt-1">{errors.name}
                    </div>}
                </Form.Group>

                {/* Slug + preview */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">{__('slug')}</Form.Label>
                    <InputGroup>
                        <InputGroup.Text><i className="la la-link" /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder={__('slug_opcional')}
                            />
                    </InputGroup>
                    <div className="text-muted small mt-1">
                        {__('vista_previa_ruta')}: <code>{previewPath || '/'}</code>
                    </div>
                    {errors.slug && <div className="text-danger small mt-1">{errors.slug}</div>}
                </Form.Group>

            {/* Parent selector */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold d-block">{__('ubicacion_en_arbol')}</Form.Label>

              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-primary" type="button" onClick={() => setPickerOpen(true)}>
                  <i className="la la-sitemap me-1" />
                  {__('seleccionar_ubicacion')}
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
                    {__('quitar_padre')}
                  </Button>
                )}
              </div>

              {errors.parent_id && <div className="text-danger small mt-1">{errors.parent_id}</div>}
            </Form.Group>

            {/* Posición entre hermanos */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">{__('posicion')}</Form.Label>
              <div className="row g-2">
                <div className="col-md-4">
                  <Form.Select
                    value={data.positionMode}
                    onChange={(e) => setData('positionMode', e.target.value)}
                  >
                    <option value="start">{__('al_principio')}</option>
                    <option value="end">{__('al_final')}</option>
                    <option value="after">{__('despues_de')}</option>
                  </Form.Select>
                </div>

                <div className="col-md-8">
                  <Form.Select
                    value={data.afterSiblingId ?? ''}
                    onChange={(e) => setData('afterSiblingId', e.target.value ? parseInt(e.target.value, 10) : null)}
                    disabled={data.positionMode !== 'after'}
                  >
                    <option value="">{__('selecciona_hermano')}</option>
                    {siblings.map(sib => (
                      <option key={sib.id} value={sib.id}>{sib.name}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
              {(data.positionMode === 'after' && siblings.length === 0) && (
                <div className="text-muted small mt-1">{__('no_hay_hermanos_para_posicionar')}</div>
              )}
            </Form.Group>

            {/* Estado */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold me-2">{__('activo')}</Form.Label>
              <Form.Check
                type="switch"
                id="statusSwitch"
                checked={!!data.status}
                onChange={(e) => setData('status', e.target.checked ? 1 : 0)}
                inline
              />
              {errors.status && <div className="text-danger small mt-1">{errors.status}</div>}
            </Form.Group>

          </div>
          <div className="card-footer d-flex justify-content-between">
            

            <div className="d-flex gap-2">
              {mode === 'create' && (
                <Button
                  type="button"
                  variant="outline-primary"
                  disabled={processing}
                  onClick={(e) => onSubmit(e, true)}
                >
                  {__('guardar_y_crear_otra')}
                </Button>
              )}
                            <Button type="submit" variant="primary" disabled={processing}>
                                {__('guardar')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Form>

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
