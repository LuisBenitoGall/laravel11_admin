// resources/js/Pages/Admin/Company/Sectors.jsx
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button, InputGroup } from 'react-bootstrap';

//Components:
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

function CategoryTree({ nodes, onSelect, selectedId }) {
  const __ = useTranslation();
  const [expanded, setExpanded] = useState(new Set());

  // Agrupar por parent y ORDENAR alfabéticamente (ES) y por position como desempate
  const byParent = useMemo(() => {
    const m = new Map();
    nodes.forEach(n => {
      const k = n.parent_id ?? 0;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(n);
    });
    m.forEach(arr =>
      arr.sort(
        (a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }) ||
          (a.position ?? 0) - (b.position ?? 0)
      )
    );
    return m;
  }, [nodes]);

  useEffect(() => {
    const roots = nodes.filter(n => !n.parent_id).map(n => n.id);
    setExpanded(new Set(roots));
  }, [nodes]);

  const hasChildren = id => (byParent.get(id) || []).length > 0;

  const toggle = id => {
    const c = new Set(expanded);
    c.has(id) ? c.delete(id) : c.add(id);
    setExpanded(c);
  };

  const render = (parentId = 0) => (
    <ul className="tree">
      {(byParent.get(parentId) || []).map(n => {
        const open = expanded.has(n.id);
        const active = selectedId === n.id;
        return (
          <li key={n.id}>
            <div
              className={`tree-node ${active ? 'is-active' : ''}`}
              onClick={() => onSelect(n)}
            >
              {hasChildren(n.id) ? (
                <button
                  type="button"
                  className="tree-caret"
                  aria-label="toggle"
                  onClick={e => {
                    e.stopPropagation();
                    toggle(n.id);
                  }}
                >
                  {open ? '▾' : '▸'}
                </button>
              ) : (
                <span className="tree-dot">•</span>
              )}

              <i className={`la ${open ? 'la-folder-open' : 'la-folder'} tree-folder`} />
              <span className="tree-label">{n.name}</span>
            </div>

            {hasChildren(n.id) && open && (
              <div className="tree-children">{render(n.id)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return render(0);
}

function Card({ item }) {
  return (
    <a href={item.url} className="text-decoration-none">
      <div className="p-3 mb-3 border rounded bg-light h-100">
        <div className="fw-semibold text-primary">{item.name}</div>
        {item.nif ? <div className="text-muted small mt-1">NIF: {item.nif}</div> : null}
      </div>
    </a>
  );
}

export default function Sectors({ auth, title, subtitle }) {
  const __ = useTranslation();

  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [loadingTree, setLoadingTree] = useState(false);

  // resultados
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [crm, setCrm] = useState([]);

  // cargar árbol de categorías (sectors)
  useEffect(() => {
    let mounted = true;
    setLoadingTree(true);
    axios
      .get(route('categories.tree', 'sectors'))
      .then(res => {
        if (!mounted) return;
        setTree(res?.data?.nodes || []);
      })
      .finally(() => mounted && setLoadingTree(false));
    return () => {
      mounted = false;
    };
  }, []);

  // buscar resultados al cambiar categoría o query
  useEffect(() => {
    if (!selected) return;
    let cancel = false;
    setLoading(true);
    axios
      .get(route('companies.sectors.search'), {
        params: {
          category_id: selected.id,
          q: query || ''
        }
      })
      .then(res => {
        if (cancel) return;
        const c = Array.isArray(res?.data?.companies) ? res.data.companies : [];
        const a = Array.isArray(res?.data?.crm) ? res.data.crm : [];
        // orden alfabético por nombre en resultados por si acaso
        c.sort((x, y) => x.name.localeCompare(y.name, 'es', { sensitivity: 'base' }));
        a.sort((x, y) => x.name.localeCompare(y.name, 'es', { sensitivity: 'base' }));
        setCompanies(c);
        setCrm(a);
      })
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [selected?.id, query]);

  const breadcrumb = useMemo(() => {
    if (!selected?.path) return '';
    const parts = selected.path.split('/').filter(Boolean);
    return parts.join(' / ');
  }, [selected]);

    return (
        <AdminAuthenticatedLayout
        user={auth.user}
        title={title}
        subtitle={subtitle}
        actions={[]} // evita el crash del Header si no hay acciones
        >
            <Head title={title} />

            <div className="contents">
                <div className="row pt-2" id="companySectors">
                    {/* Árbol de categorías */}
                    <div className="col-lg-3">
                        <div className="card">
                            <div className="card-header fw-semibold py-3">{__('sectores_indice')}</div>

                            <div className="card-body" style={{ maxHeight: 520, overflowY: 'auto' }}>
                                {loadingTree ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" role="status" />
                                    </div>
                                    ) : (
                                    <CategoryTree
                                        nodes={tree}
                                        selectedId={selected?.id ?? null}
                                        onSelect={node => {
                                            setSelected(node);
                                            setQuery('');
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="col-lg-9">
                        <div className="card">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <div className="fw-semibold">
                                    {selected ? (
                                        <>
                                        {__('resultados_para')}: <span className="text-primary">{breadcrumb}</span>
                                        </>
                                    ) : (
                                        __('categoria_selec')
                                    )}
                                </div>

                                {selected && (companies.length > 0 || crm.length > 0) && (
                                    <div style={{ minWidth: 320 }}>
                                        <InputGroup>
                                            <InputGroup.Text>
                                            <i className="la la-search" />
                                            </InputGroup.Text>
                                            <TextInput
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder={__('filtrar_por_nombre_nif')}
                                            />
                                            {query && (
                                            <Button variant="outline-secondary" onClick={() => setQuery('')}>
                                                {__('limpiar')}
                                            </Button>
                                            )}
                                        </InputGroup>
                                    </div>
                                )}
                            </div>

                            <div className="card-body">
                                {!selected && (
                                <div className="text-muted py-5 text-center">
                                    {__('categoria_selec_para_empresas')}
                                </div>
                                )}

                                {selected && loading && (
                                <div className="text-center py-5">
                                    <div className="spinner-border" role="status" />
                                </div>
                                )}

                                {selected && !loading && companies.length === 0 && crm.length === 0 && (
                                <div className="text-muted py-5 text-center">
                                    {__('sin_resultados')}
                                </div>
                                )}

                                {selected && !loading && (companies.length > 0 || crm.length > 0) && (
                                <>
                                    {companies.length > 0 && (
                                    <>
                                        <div className="fw-semibold mb-2">{__('empresas')}</div>
                                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3">
                                        {companies.map(item => (
                                            <div className="col mb-3" key={`c-${item.id}`}>
                                                <Card item={item} />
                                            </div>
                                        ))}
                                        </div>
                                        <hr className="my-4" />
                                    </>
                                    )}

                                    {crm.length > 0 && (
                                    <>
                                        <div className="fw-semibold mb-2">{__('cuentas_crm')}</div>
                                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3">
                                        {crm.map(item => (
                                            <div className="col" key={`a-${item.id}`}>
                                            <Card item={item} />
                                            </div>
                                        ))}
                                        </div>
                                    </>
                                    )}
                                </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminAuthenticatedLayout>
    );
}
