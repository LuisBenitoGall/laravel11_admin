// resources/js/Components/CategoryAssigner.jsx
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal, InputGroup, Form } from 'react-bootstrap';
import axios from 'axios';

// Components
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

// Hooks
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

/**
 * CategoryAssigner
 * Selector en árbol con búsqueda, chips y creación inline de subcategorías.
 *
 * Props:
 * - environment: 'sectors' | 'customers' | 'providers' | 'crm'
 * - categorizable: { type: string, id: number } // p.ej. { type: 'App\\Models\\Company', id: 123 }
 * - endpoints: {
 *     list:   string, // GET  params: { environment, type, id }
 *     assign: string, // POST body:  { environment, type, id, category_ids: [] }
 *     unassign:string,// POST body:  { environment, type, id, category_ids: [] }
 *     tree:   string, // GET  params: { environment }
 *     create: string  // POST body:  { environment, name, parent_id? }
 *   }
 * - title?: string
 * - allowCreate?: boolean  // default true
 * - readOnly?: boolean     // default false
 */
export default function CategoryAssigner({
  environment,
  categorizable,
  endpoints,
  title,
  allowCreate = true,
  readOnly = false,
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();

  // Árbol y selección
  const [loadingTree, setLoadingTree] = useState(false);
  const [nodes, setNodes] = useState([]); // {id,parent_id,name,slug,path,depth,position,status}
  const [expandedUser, setExpandedUser] = useState(new Set()); // expansión manual del usuario

  // Búsqueda
  const [query, setQuery] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  // Asignadas en server
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assigned, setAssigned] = useState([]); // array de category_id

  // Crear subcategoría
  const [createModal, setCreateModal] = useState(false);
  const [createParent, setCreateParent] = useState(null); // nodo completo
  const [createName, setCreateName] = useState('');
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // --- helpers de búsqueda/normalización ---
  const normalize = (s = '') =>
    s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  // Cargar árbol
  useEffect(() => {
    let mounted = true;
    setLoadingTree(true);
    axios
      .get(endpoints.tree, { params: { environment } })
      .then(res => {
        const list = res?.data?.nodes || [];
        if (!mounted) return;
        setNodes(list);
        // expandir raíces
        const roots = list.filter(n => !n.parent_id).map(n => n.id);
        setExpandedUser(new Set(roots));
      })
      .finally(() => mounted && setLoadingTree(false));
    return () => { mounted = false; };
  }, [environment, endpoints.tree]);

  // Cargar asignadas
  useEffect(() => {
    if (!categorizable?.type || !categorizable?.id) return;
    let mounted = true;
    setLoadingAssigned(true);
    axios
      .get(endpoints.list, {
        params: {
          environment,
          type: categorizable.type,
          id: categorizable.id,
        }
      })
      .then(res => {
        if (!mounted) return;
        const ids = Array.isArray(res?.data?.category_ids) ? res.data.category_ids : [];
        setAssigned(ids);
      })
      .finally(() => mounted && setLoadingAssigned(false));
    return () => { mounted = false; };
  }, [environment, categorizable?.type, categorizable?.id, endpoints.list]);

  // Índices útiles
  const byId = useMemo(() => {
    const m = new Map();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  const byParent = useMemo(() => {
    const m = new Map();
    nodes.forEach(n => {
      const k = n.parent_id ?? 0;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(n);
    });
    // orden estable
    m.forEach(arr => arr.sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name)));
    return m;
  }, [nodes]);

  // Prepara strings normalizados para búsqueda
  const searchable = useMemo(() => {
    const map = new Map();
    nodes.forEach(n => {
      const nameN = normalize(n.name || '');
      const slugN = normalize(n.slug || '');
      const pathN = normalize((n.path || '').replace(/\//g, ' '));
      map.set(n.id, { nameN, slugN, pathN });
    });
    return map;
  }, [nodes]);

  // Mapa de parent por id para subir ancestros rápido
  const parentOf = useMemo(() => {
    const m = new Map();
    nodes.forEach(n => m.set(n.id, n.parent_id ?? 0));
    return m;
  }, [nodes]);

  const ancestorsOf = (id) => {
    const result = [];
    let cur = parentOf.get(id);
    while (cur && cur !== 0) {
      result.push(cur);
      cur = parentOf.get(cur);
    }
    if (cur === 0) result.push(0);
    return result;
  };

  // Cálculo de matches, auto-expansión y visibilidad con la búsqueda
  const { autoExpanded, visibleIds } = useMemo(() => {
    const q = normalize(qDebounced);
    if (!q) {
      // sin búsqueda: todo visible y solo se expande lo que el usuario decida
      return {
        autoExpanded: new Set(),
        visibleIds: new Set(nodes.map(n => n.id)),
      };
    }
    const autoExp = new Set();
    const visible = new Set();
    nodes.forEach(n => {
      const s = searchable.get(n.id) || { nameN: '', slugN: '', pathN: '' };
      const hit = s.nameN.includes(q) || s.slugN.includes(q) || s.pathN.includes(q);
      if (hit) {
        const anc = ancestorsOf(n.id);
        anc.forEach(a => visible.add(a));
        autoExp.add(n.id);
        visible.add(n.id);
      }
    });
    return { autoExpanded: autoExp, visibleIds: visible };
  }, [qDebounced, nodes, searchable]);

  const highlight = (text, q) => {
    if (!q) return text;
    const safe = normalize(text);
    const qn = normalize(q);
    const idx = safe.indexOf(qn);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const middle = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (<>{before}<mark>{middle}</mark>{after}</>);
  };

  // Utilidades
  const isLeaf = (nodeId) => {
    const children = byParent.get(nodeId) || [];
    return children.length === 0;
  };

  const breadcrumb = (node) => {
    if (!node?.path) return node?.name ?? '';
    const parts = node.path.split('/').filter(Boolean);
    const pretty = parts.map(s => {
      // busca por slug
      const match = nodes.find(n => n.slug === s);
      return match?.name || s;
    });
    return pretty.join(' / ');
  };

  const toggleExpand = (id) => {
    const c = new Set(expandedUser);
    c.has(id) ? c.delete(id) : c.add(id);
    setExpandedUser(c);
  };

  // Reglas: solo hojas asignables; si asignas hijo, no asignas padre.
  const canAssignNode = (node) => {
    if (!node) return false;
    if (node.status === 0) return false; // inactivo
    return isLeaf(node.id);               // solo hojas
  };

  const assign = async (categoryId) => {
    await axios.post(endpoints.assign, {
      environment,
      type: categorizable.type,
      id: categorizable.id,
      category_ids: [categoryId],
    });
  };

  const unassign = async (categoryId) => {
    await axios.post(endpoints.unassign, {
      environment,
      type: categorizable.type,
      id: categorizable.id,
      category_ids: [categoryId],
    });
  };

  // Strict persistence: cambiamos tras OK. Sin confirmación al desmarcar desde árbol.
  const onToggleCheck = async (node, checked) => {
    if (readOnly || !node) return;
    if (checked && !canAssignNode(node)) return;

    try {
      if (checked) {
        await assign(node.id);
        setAssigned(prev => (prev.includes(node.id) ? prev : [...prev, node.id]));
      } else {
        await unassign(node.id);
        setAssigned(prev => prev.filter(id => id !== node.id));
      }
    } catch (e) {
      /* opcional: notificación */
    }
  };

  // Chips
  const assignedNodes = useMemo(
    () =>
      assigned
        .map(id => byId.get(id))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [assigned, byId]
  );

  async function confirmRemove(bcText) {
    const ok = await showConfirm({
      title: __('confirmar_quitar_categoria'),
      text: bcText,
      confirmButtonText: __('aceptar'),
      cancelButtonText: __('cancelar'),
      icon: 'warning'
    });
    return !!ok;
  }

  // Render árbol
  const renderBranch = (parentId = 0) => {
    const list = byParent.get(parentId) || [];
    return (
      <ul className="list-unstyled ms-0">
        {list.map(node => {
          const children = byParent.get(node.id) || [];
          const hasChildren = children.length > 0;

          const searching = qDebounced.trim() !== '';
          const expandedHere = expandedUser.has(node.id) || (searching && (autoExpanded.has(node.id) || autoExpanded.has(parentId)));
          const showRow = !searching ? true : visibleIds.has(node.id);
          if (!showRow) return null;

          const disabled = node.status === 0;
          const checked = assigned.includes(node.id);
          const label = searching ? highlight(node.name, qDebounced) : node.name;

          return (
            <li key={node.id} className="my-1">
              <div className={`d-flex align-items-center gap-2 category-node ${disabled ? 'category-node-disabled' : ''}`}>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  style={{ width: 34 }}
                  onClick={() => hasChildren && toggleExpand(node.id)}
                  disabled={!hasChildren}
                  aria-label={hasChildren ? (expandedHere ? 'Collapse' : 'Expand') : 'Leaf'}
                >
                  {hasChildren ? (expandedHere ? '▾' : '▸') : '•'}
                </button>

                {/* Checkbox grande si es seleccionable; sustituto visual si no lo es */}
                {disabled || readOnly || !isLeaf(node.id) ? (
                  <span
                    className="category-check-disabled"
                    role="img"
                    aria-label={__('no_seleccionable_por_regla')}
                    title={__('no_seleccionable_por_regla')}
                  >
                    <i className="la la-ban"></i>
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    id={`cat-${node.id}`}
                    className="form-check-input category-check"
                    checked={checked}
                    onChange={(e) => onToggleCheck(node, e.target.checked)}
                  />
                )}

                <label htmlFor={`cat-${node.id}`} className="me-2 m-0">
                  {label}
                </label>

                {!isLeaf(node.id) && <span className="badge bg-light text-muted border">{__('nodo')}</span>}
                {disabled && <span className="badge bg-secondary">{__('inactivo')}</span>}

                {allowCreate && !readOnly && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => { setCreateParent(node); setCreateName(''); setCreateErrors({}); setCreateModal(true); }}
                  >
                    <i className="la la-plus me-1" /> {__('subcategoria')}
                  </Button>
                )}
              </div>

              {hasChildren && expandedHere && (
                <div className="ms-4">{renderBranch(node.id)}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

    return (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <strong>{title || __('categorias')}</strong>
            {!readOnly && allowCreate && (
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => { setCreateParent(null); setCreateName(''); setCreateErrors({}); setCreateModal(true); }}
              >
                <i className="la la-plus me-1" /> {__('categoria')}
              </Button>
            )}
          </div>

          <div className="card-body">
            {/* Búsqueda */}
            <InputGroup className="mb-3">
              <InputGroup.Text><i className="la la-search" /></InputGroup.Text>
              <TextInput
                placeholder={__('categoria_buscar')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setQuery('');
                    const roots = nodes.filter(n => !n.parent_id).map(n => n.id);
                    setExpandedUser(new Set(roots));
                  }}
                >
                  {__('limpiar')}
                </Button>
              )}
            </InputGroup>

            <div className="row g-3">
              {/* Árbol */}
              <div className="col-lg-7">
                {loadingTree
                  ? <div className="text-muted">{__('cargando')}…</div>
                  : renderBranch(0)
                }
              </div>

              {/* Seleccionadas */}
              <div className="col-lg-5">
                <div className="border rounded p-3 h-100">
                  <div className="fw-semibold mb-2">{__('seleccionadas')}</div>
                  {loadingAssigned
                    ? <div className="text-muted">{__('cargando')}…</div>
                    : (assignedNodes.length === 0
                      ? <div className="text-muted">{__('ninguna')}</div>
                      : (
                        <div className="d-flex flex-wrap gap-2">
                          {assignedNodes.map(node => (
                            <span key={node.id} className="badge bg-light border text-dark d-inline-flex align-items-center">
                              <span className="me-2">{breadcrumb(node)}</span>
                              {/* {!readOnly && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link p-0"
                                  title={__('quitar')}
                                  onClick={async () => {
                                    const ok = await confirmRemove(breadcrumb(node));
                                    if (!ok) return;
                                    await unassign(node.id);
                                    setAssigned(prev => prev.filter(id => id !== node.id));
                                  }}
                                >
                                  <i className="la la-times"></i>
                                </button>
                              )} */}
                            </span>
                          ))}
                        </div>
                      )
                    )
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Modal crear subcategoría */}
          <Modal show={createModal} onHide={() => setCreateModal(false)} backdrop="static">
            <Modal.Header closeButton>
              <Modal.Title>{createParent ? __('subcategoria_nueva') : __('categoria_nueva')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {createParent && (
                <div className="mb-2 text-muted small">
                  {__('padre')}: <strong>{breadcrumb(createParent)}</strong>
                </div>
              )}
              <label className="form-label">{__('nombre')}</label>
              <TextInput
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={__('nombre')}
                isFocused
              />
              <InputError message={createErrors?.name} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setCreateModal(false)} disabled={creating}>
                {__('cancelar')}
              </Button>
              <Button
                variant="primary"
                disabled={!createName?.trim() || creating}
                onClick={async () => {
                  setCreating(true);
                  setCreateErrors({});
                  try {
                    await axios.post(endpoints.create, {
                      environment,
                      name: createName.trim(),
                      parent_id: createParent?.id ?? null,
                      status: 1
                    });
                    // recargar árbol tras crear
                    const tree = await axios.get(endpoints.tree, { params: { environment } });
                    const list = tree?.data?.nodes || [];
                    setNodes(list);
                    // expandir padre para ver el nuevo
                    if (createParent?.id) {
                      const c = new Set(expandedUser);
                      c.add(createParent.id);
                      setExpandedUser(c);
                    }
                    setCreateModal(false);
                  } catch (e) {
                    if (e?.response?.status === 422) {
                      setCreateErrors(e.response.data.errors || {});
                    }
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? __('procesando') + '…' : __('crear')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Estilos locales para tamaño/estado de checkboxes y nodos */}
          <style>{`
            .category-check { transform: scale(1.35); margin-right: .5rem; }
            .category-check-disabled {
              display: inline-flex; width: 1.15rem; height: 1.15rem;
              align-items: center; justify-content: center;
              border-radius: .25rem; background: #f1f3f5; color: #9aa0a6; margin-right: .5rem;
            }
            .category-node-disabled { color: #9aa0a6 !important; cursor: not-allowed; opacity: .85; }
            .category-node { line-height: 1.9; }
          `}</style>
        </div>
    );
}
