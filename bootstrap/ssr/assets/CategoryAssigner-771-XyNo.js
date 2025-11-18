import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Button, InputGroup, Modal } from "react-bootstrap";
import axios from "axios";
import { I as InputError } from "./InputError-DME5vguS.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function CategoryAssigner({
  environment,
  categorizable,
  endpoints,
  title,
  allowCreate = true,
  readOnly = false
}) {
  const __ = useTranslation();
  useSweetAlert();
  const [loadingTree, setLoadingTree] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [expandedUser, setExpandedUser] = useState(/* @__PURE__ */ new Set());
  const [query, setQuery] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(query), 180);
    return () => clearTimeout(t);
  }, [query]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assigned, setAssigned] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [createParent, setCreateParent] = useState(null);
  const [createName, setCreateName] = useState("");
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const normalize = (s = "") => s.normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").toLowerCase();
  useEffect(() => {
    let mounted = true;
    setLoadingTree(true);
    axios.get(endpoints.tree, { params: { environment } }).then((res) => {
      var _a;
      const list = ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.nodes) || [];
      if (!mounted) return;
      setNodes(list);
      const roots = list.filter((n) => !n.parent_id).map((n) => n.id);
      setExpandedUser(new Set(roots));
    }).finally(() => mounted && setLoadingTree(false));
    return () => {
      mounted = false;
    };
  }, [environment, endpoints.tree]);
  useEffect(() => {
    if (!(categorizable == null ? void 0 : categorizable.type) || !(categorizable == null ? void 0 : categorizable.id)) return;
    let mounted = true;
    setLoadingAssigned(true);
    axios.get(endpoints.list, {
      params: {
        environment,
        type: categorizable.type,
        id: categorizable.id
      }
    }).then((res) => {
      var _a;
      if (!mounted) return;
      const ids = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.category_ids) ? res.data.category_ids : [];
      setAssigned(ids);
    }).finally(() => mounted && setLoadingAssigned(false));
    return () => {
      mounted = false;
    };
  }, [environment, categorizable == null ? void 0 : categorizable.type, categorizable == null ? void 0 : categorizable.id, endpoints.list]);
  const byId = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);
  const byParent = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      const k = n.parent_id ?? 0;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(n);
    });
    m.forEach((arr) => arr.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name)));
    return m;
  }, [nodes]);
  const searchable = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      const nameN = normalize(n.name || "");
      const slugN = normalize(n.slug || "");
      const pathN = normalize((n.path || "").replace(/\//g, " "));
      map.set(n.id, { nameN, slugN, pathN });
    });
    return map;
  }, [nodes]);
  const parentOf = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    nodes.forEach((n) => m.set(n.id, n.parent_id ?? 0));
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
  const { autoExpanded, visibleIds } = useMemo(() => {
    const q = normalize(qDebounced);
    if (!q) {
      return {
        autoExpanded: /* @__PURE__ */ new Set(),
        visibleIds: new Set(nodes.map((n) => n.id))
      };
    }
    const autoExp = /* @__PURE__ */ new Set();
    const visible = /* @__PURE__ */ new Set();
    nodes.forEach((n) => {
      const s = searchable.get(n.id) || { nameN: "", slugN: "", pathN: "" };
      const hit = s.nameN.includes(q) || s.slugN.includes(q) || s.pathN.includes(q);
      if (hit) {
        const anc = ancestorsOf(n.id);
        anc.forEach((a) => visible.add(a));
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
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      before,
      /* @__PURE__ */ jsx("mark", { children: middle }),
      after
    ] });
  };
  const isLeaf = (nodeId) => {
    const children = byParent.get(nodeId) || [];
    return children.length === 0;
  };
  const breadcrumb = (node) => {
    if (!(node == null ? void 0 : node.path)) return (node == null ? void 0 : node.name) ?? "";
    const parts = node.path.split("/").filter(Boolean);
    const pretty = parts.map((s) => {
      const match = nodes.find((n) => n.slug === s);
      return (match == null ? void 0 : match.name) || s;
    });
    return pretty.join(" / ");
  };
  const toggleExpand = (id) => {
    const c = new Set(expandedUser);
    c.has(id) ? c.delete(id) : c.add(id);
    setExpandedUser(c);
  };
  const canAssignNode = (node) => {
    if (!node) return false;
    if (node.status === 0) return false;
    return isLeaf(node.id);
  };
  const assign = async (categoryId) => {
    await axios.post(endpoints.assign, {
      environment,
      type: categorizable.type,
      id: categorizable.id,
      category_ids: [categoryId]
    });
  };
  const unassign = async (categoryId) => {
    await axios.post(endpoints.unassign, {
      environment,
      type: categorizable.type,
      id: categorizable.id,
      category_ids: [categoryId]
    });
  };
  const onToggleCheck = async (node, checked) => {
    if (readOnly || !node) return;
    if (checked && !canAssignNode(node)) return;
    try {
      if (checked) {
        await assign(node.id);
        setAssigned((prev) => prev.includes(node.id) ? prev : [...prev, node.id]);
      } else {
        await unassign(node.id);
        setAssigned((prev) => prev.filter((id) => id !== node.id));
      }
    } catch (e) {
    }
  };
  const assignedNodes = useMemo(
    () => assigned.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)),
    [assigned, byId]
  );
  const renderBranch = (parentId = 0) => {
    const list = byParent.get(parentId) || [];
    return /* @__PURE__ */ jsx("ul", { className: "list-unstyled ms-0", children: list.map((node) => {
      const children = byParent.get(node.id) || [];
      const hasChildren = children.length > 0;
      const searching = qDebounced.trim() !== "";
      const expandedHere = expandedUser.has(node.id) || searching && (autoExpanded.has(node.id) || autoExpanded.has(parentId));
      const showRow = !searching ? true : visibleIds.has(node.id);
      if (!showRow) return null;
      const disabled = node.status === 0;
      const checked = assigned.includes(node.id);
      const label = searching ? highlight(node.name, qDebounced) : node.name;
      return /* @__PURE__ */ jsxs("li", { className: "my-1", children: [
        /* @__PURE__ */ jsxs("div", { className: `d-flex align-items-center gap-2 category-node ${disabled ? "category-node-disabled" : ""}`, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-light",
              style: { width: 34 },
              onClick: () => hasChildren && toggleExpand(node.id),
              disabled: !hasChildren,
              "aria-label": hasChildren ? expandedHere ? "Collapse" : "Expand" : "Leaf",
              children: hasChildren ? expandedHere ? "▾" : "▸" : "•"
            }
          ),
          disabled || readOnly || !isLeaf(node.id) ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "category-check-disabled",
              role: "img",
              "aria-label": __("no_seleccionable_por_regla"),
              title: __("no_seleccionable_por_regla"),
              children: /* @__PURE__ */ jsx("i", { className: "la la-ban" })
            }
          ) : /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: `cat-${node.id}`,
              className: "form-check-input category-check",
              checked,
              onChange: (e) => onToggleCheck(node, e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: `cat-${node.id}`, className: "me-2 m-0", children: label }),
          !isLeaf(node.id) && /* @__PURE__ */ jsx("span", { className: "badge bg-light text-muted border", children: __("nodo") }),
          disabled && /* @__PURE__ */ jsx("span", { className: "badge bg-secondary", children: __("inactivo") }),
          allowCreate && !readOnly && /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: "outline-primary",
              onClick: () => {
                setCreateParent(node);
                setCreateName("");
                setCreateErrors({});
                setCreateModal(true);
              },
              children: [
                /* @__PURE__ */ jsx("i", { className: "la la-plus me-1" }),
                " ",
                __("subcategoria")
              ]
            }
          )
        ] }),
        hasChildren && expandedHere && /* @__PURE__ */ jsx("div", { className: "ms-4", children: renderBranch(node.id) })
      ] }, node.id);
    }) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxs("div", { className: "card-header d-flex align-items-center justify-content-between", children: [
      /* @__PURE__ */ jsx("strong", { children: title || __("categorias") }),
      !readOnly && allowCreate && /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          variant: "outline-primary",
          onClick: () => {
            setCreateParent(null);
            setCreateName("");
            setCreateErrors({});
            setCreateModal(true);
          },
          children: [
            /* @__PURE__ */ jsx("i", { className: "la la-plus me-1" }),
            " ",
            __("categoria")
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
      /* @__PURE__ */ jsxs(InputGroup, { className: "mb-3", children: [
        /* @__PURE__ */ jsx(InputGroup.Text, { children: /* @__PURE__ */ jsx("i", { className: "la la-search" }) }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            placeholder: __("categoria_buscar"),
            value: query,
            onChange: (e) => setQuery(e.target.value)
          }
        ),
        query && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline-secondary",
            onClick: () => {
              setQuery("");
              const roots = nodes.filter((n) => !n.parent_id).map((n) => n.id);
              setExpandedUser(new Set(roots));
            },
            children: __("limpiar")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "row g-3", children: [
        /* @__PURE__ */ jsx("div", { className: "col-lg-7", children: loadingTree ? /* @__PURE__ */ jsxs("div", { className: "text-muted", children: [
          __("cargando"),
          "…"
        ] }) : renderBranch(0) }),
        /* @__PURE__ */ jsx("div", { className: "col-lg-5", children: /* @__PURE__ */ jsxs("div", { className: "border rounded p-3 h-100", children: [
          /* @__PURE__ */ jsx("div", { className: "fw-semibold mb-2", children: __("seleccionadas") }),
          loadingAssigned ? /* @__PURE__ */ jsxs("div", { className: "text-muted", children: [
            __("cargando"),
            "…"
          ] }) : assignedNodes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-muted", children: __("ninguna") }) : /* @__PURE__ */ jsx("div", { className: "d-flex flex-wrap gap-2", children: assignedNodes.map((node) => /* @__PURE__ */ jsx("span", { className: "badge bg-light border text-dark d-inline-flex align-items-center", children: /* @__PURE__ */ jsx("span", { className: "me-2", children: breadcrumb(node) }) }, node.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { show: createModal, onHide: () => setCreateModal(false), backdrop: "static", children: [
      /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: createParent ? __("subcategoria_nueva") : __("categoria_nueva") }) }),
      /* @__PURE__ */ jsxs(Modal.Body, { children: [
        createParent && /* @__PURE__ */ jsxs("div", { className: "mb-2 text-muted small", children: [
          __("padre"),
          ": ",
          /* @__PURE__ */ jsx("strong", { children: breadcrumb(createParent) })
        ] }),
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("nombre") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            value: createName,
            onChange: (e) => setCreateName(e.target.value),
            placeholder: __("nombre"),
            isFocused: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: createErrors == null ? void 0 : createErrors.name })
      ] }),
      /* @__PURE__ */ jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setCreateModal(false), disabled: creating, children: __("cancelar") }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            disabled: !(createName == null ? void 0 : createName.trim()) || creating,
            onClick: async () => {
              var _a, _b;
              setCreating(true);
              setCreateErrors({});
              try {
                await axios.post(endpoints.create, {
                  environment,
                  name: createName.trim(),
                  parent_id: (createParent == null ? void 0 : createParent.id) ?? null,
                  status: 1
                });
                const tree = await axios.get(endpoints.tree, { params: { environment } });
                const list = ((_a = tree == null ? void 0 : tree.data) == null ? void 0 : _a.nodes) || [];
                setNodes(list);
                if (createParent == null ? void 0 : createParent.id) {
                  const c = new Set(expandedUser);
                  c.add(createParent.id);
                  setExpandedUser(c);
                }
                setCreateModal(false);
              } catch (e) {
                if (((_b = e == null ? void 0 : e.response) == null ? void 0 : _b.status) === 422) {
                  setCreateErrors(e.response.data.errors || {});
                }
              } finally {
                setCreating(false);
              }
            },
            children: creating ? __("procesando") + "…" : __("crear")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
            .category-check { transform: scale(1.35); margin-right: .5rem; }
            .category-check-disabled {
              display: inline-flex; width: 1.15rem; height: 1.15rem;
              align-items: center; justify-content: center;
              border-radius: .25rem; background: #f1f3f5; color: #9aa0a6; margin-right: .5rem;
            }
            .category-node-disabled { color: #9aa0a6 !important; cursor: not-allowed; opacity: .85; }
            .category-node { line-height: 1.9; }
          ` })
  ] });
}
export {
  CategoryAssigner as C
};
