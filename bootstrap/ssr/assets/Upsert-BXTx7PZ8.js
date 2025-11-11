import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { useForm, Head, router } from "@inertiajs/react";
import { useMemo, useState, useEffect } from "react";
import { Form, InputGroup, Button, Modal } from "react-bootstrap";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import axios from "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
function CategoryTreePicker({ environment, show, onClose, onSelect, selectedId = null }) {
  const __ = useTranslation();
  const [nodes, setNodes] = useState([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!show) return;
    setLoading(true);
    axios.get(route("categories.tree", environment)).then((res) => {
      var _a;
      const data = ((_a = res.data) == null ? void 0 : _a.nodes) ?? [];
      setNodes(data);
      const roots = data.filter((n) => !n.parent_id).map((n) => n.id);
      setExpanded(new Set(roots));
    }).finally(() => setLoading(false));
  }, [show, environment]);
  const byParent = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      const k = n.parent_id ?? 0;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(n);
    });
    map.forEach((arr) => arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name)));
    return map;
  }, [nodes]);
  useMemo(() => {
    const idx = /* @__PURE__ */ new Map();
    nodes.forEach((n) => idx.set(n.id, n));
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
    return /* @__PURE__ */ jsx("ul", { className: "list-unstyled ms-0", children: list.map((node) => {
      const hasChildren = (byParent.get(node.id) || []).length > 0;
      const isExpanded = expanded.has(node.id);
      const matches = query.trim() === "" || node.name.toLowerCase().includes(query.toLowerCase()) || (node.slug || "").toLowerCase().includes(query.toLowerCase());
      const showRow = matches || isExpanded;
      if (!showRow && query.trim() !== "" && !hasChildren) {
        return null;
      }
      return /* @__PURE__ */ jsxs("li", { className: "my-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-light me-2",
              onClick: () => hasChildren && toggle(node.id),
              disabled: !hasChildren,
              "aria-label": hasChildren ? isExpanded ? "Collapse" : "Expand" : "Leaf",
              style: { width: 32 },
              children: hasChildren ? isExpanded ? "▾" : "▸" : "•"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `btn btn-sm ${selectedId === node.id ? "btn-primary" : "btn-outline-primary"}`,
              onClick: () => onSelect(node),
              children: node.name
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "ms-2 text-muted small", children: node.slug }),
          node.status === 0 && /* @__PURE__ */ jsx("span", { className: "badge bg-secondary ms-2", children: __("inactivo") })
        ] }),
        hasChildren && isExpanded && /* @__PURE__ */ jsx("div", { className: "ms-4", children: renderBranch(node.id, depth + 1) })
      ] }, node.id);
    }) });
  }
  return /* @__PURE__ */ jsxs(Modal, { show, onHide: onClose, size: "lg", backdrop: "static", children: [
    /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: __("seleccionar_ubicacion") }) }),
    /* @__PURE__ */ jsxs(Modal.Body, { children: [
      /* @__PURE__ */ jsxs(InputGroup, { className: "mb-3", children: [
        /* @__PURE__ */ jsx(InputGroup.Text, { children: /* @__PURE__ */ jsx("i", { className: "la la-search" }) }),
        /* @__PURE__ */ jsx(
          Form.Control,
          {
            placeholder: __("buscar_categoria_o_slug"),
            value: query,
            onChange: (e) => setQuery(e.target.value)
          }
        ),
        /* @__PURE__ */ jsx(Button, { variant: "outline-secondary", onClick: () => setQuery(""), children: __("limpiar") })
      ] }),
      loading ? /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
        __("cargando"),
        "…"
      ] }) : nodes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center text-muted py-4", children: __("sin_resultados") }) : /* @__PURE__ */ jsx("div", { style: { maxHeight: 420, overflowY: "auto" }, children: renderBranch(0, 0) })
    ] }),
    /* @__PURE__ */ jsx(Modal.Footer, { children: /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onClose, children: __("cerrar") }) })
  ] });
}
function Upsert({ auth, environment, mode = "create", category = null, defaults = null, title, subtitle }) {
  const __ = useTranslation();
  const initial = useMemo(() => {
    const base = {
      name: "",
      slug: "",
      parent_id: null,
      parent_path: "",
      positionMode: "end",
      // start | end | after
      afterSiblingId: null,
      status: 1
    };
    if (mode === "edit" && category) {
      return {
        ...base,
        name: category.name ?? "",
        slug: category.slug ?? "",
        parent_id: category.parent_id ?? null,
        parent_path: category.path ? category.path.split("/").slice(0, -1).join(" / ") : "",
        status: category.status ?? 1
        // posición se gestiona aparte al mover
      };
    }
    if (defaults) return { ...base, ...defaults };
    return base;
  }, [mode, category, defaults]);
  const { data, setData, post, put, processing, errors, transform, reset } = useForm(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [siblings, setSiblings] = useState([]);
  const [parentNode, setParentNode] = useState(null);
  useEffect(() => {
    if (!data.parent_id) {
      setSiblings([]);
      setParentNode(null);
      setData("afterSiblingId", null);
      return;
    }
    axios.get(route("categories.tree", environment)).then((res) => {
      var _a;
      const nodes = ((_a = res.data) == null ? void 0 : _a.nodes) ?? [];
      const map = new Map(nodes.map((n) => [n.id, n]));
      const parent = map.get(data.parent_id);
      setParentNode(parent || null);
      const siblingsList = nodes.filter((n) => (n.parent_id ?? 0) === ((parent == null ? void 0 : parent.id) ?? 0));
      const filtered = siblingsList.filter((n) => mode !== "edit" || n.id !== (category == null ? void 0 : category.id));
      filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name));
      setSiblings(filtered);
    }).catch(() => setSiblings([]));
  }, [data.parent_id, environment, mode, category == null ? void 0 : category.id, setData]);
  const previewPath = useMemo(() => {
    const parentPath = (parentNode == null ? void 0 : parentNode.path) || "";
    const slug = (data.slug || (data.name || "").trim().toLowerCase().replace(/\s+/g, "-")).replace(/[^a-z0-9\-_/]/g, "");
    return [parentPath, slug].filter(Boolean).join("/");
  }, [data.name, data.slug, parentNode]);
  function onSubmit(e, createAnother = false) {
    e.preventDefault();
    transform((payload) => ({
      ...payload,
      // normaliza
      parent_id: payload.parent_id || null,
      afterSiblingId: payload.positionMode === "after" ? payload.afterSiblingId : null,
      slug: payload.slug && payload.slug.length ? payload.slug : null
    }));
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        if (createAnother) {
          const keepParent = data.parent_id;
          reset("name", "slug", "positionMode", "afterSiblingId");
          setData("positionMode", "end");
          setData("parent_id", keepParent);
        } else {
          router.visit(route("categories.index", environment), { preserveState: true });
        }
      }
    };
    if (mode === "edit" && category) {
      put(route("categories.update", [environment, category.id]), options);
    } else {
      post(route("categories.store", environment), options);
    }
  }
  const parentBreadcrumb = useMemo(() => {
    if (!(parentNode == null ? void 0 : parentNode.path)) return __("raiz");
    const parts = parentNode.path.split("/");
    return parts.join(" › ");
  }, [parentNode]);
  const actions = [];
  actions.push({
    text: __("categorias_volver"),
    icon: "la-angle-left",
    url: "categories.index",
    modal: false,
    params: [environment]
  });
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title: title ?? __("categorias"), subtitle: subtitle ?? (mode === "edit" ? __("editar") : __("nuevo")), actions, children: [
    /* @__PURE__ */ jsx(Head, { title: title ?? __("categorias") }),
    /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx(Form, { onSubmit: (e) => onSubmit(e, false), children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
        /* @__PURE__ */ jsxs(Form.Group, { className: "mb-3", children: [
          /* @__PURE__ */ jsxs(Form.Label, { className: "fw-semibold", children: [
            __("categoria"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            Form.Control,
            {
              type: "text",
              value: data.name,
              onChange: (e) => setData("name", e.target.value),
              placeholder: __("categoria"),
              autoFocus: true
            }
          ),
          errors.name && /* @__PURE__ */ jsx("div", { className: "text-danger small mt-1", children: errors.name })
        ] }),
        /* @__PURE__ */ jsxs(Form.Group, { className: "mb-3", children: [
          /* @__PURE__ */ jsx(Form.Label, { className: "fw-semibold", children: __("slug") }),
          /* @__PURE__ */ jsxs(InputGroup, { children: [
            /* @__PURE__ */ jsx(InputGroup.Text, { children: /* @__PURE__ */ jsx("i", { className: "la la-link" }) }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "text",
                value: data.slug,
                onChange: (e) => setData("slug", e.target.value),
                placeholder: __("slug_opcional")
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-muted small mt-1", children: [
            __("vista_previa_ruta"),
            ": ",
            /* @__PURE__ */ jsx("code", { children: previewPath || "/" })
          ] }),
          errors.slug && /* @__PURE__ */ jsx("div", { className: "text-danger small mt-1", children: errors.slug })
        ] }),
        /* @__PURE__ */ jsxs(Form.Group, { className: "mb-3", children: [
          /* @__PURE__ */ jsx(Form.Label, { className: "fw-semibold d-block", children: __("ubicacion_en_arbol") }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "outline-primary", type: "button", onClick: () => setPickerOpen(true), children: [
              /* @__PURE__ */ jsx("i", { className: "la la-sitemap me-1" }),
              __("seleccionar_ubicacion")
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-muted small", children: [
              __("padre"),
              ": ",
              /* @__PURE__ */ jsx("strong", { children: parentBreadcrumb })
            ] }),
            data.parent_id && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline-secondary",
                size: "sm",
                type: "button",
                onClick: () => setData("parent_id", null),
                children: __("quitar_padre")
              }
            )
          ] }),
          errors.parent_id && /* @__PURE__ */ jsx("div", { className: "text-danger small mt-1", children: errors.parent_id })
        ] }),
        /* @__PURE__ */ jsxs(Form.Group, { className: "mb-3", children: [
          /* @__PURE__ */ jsx(Form.Label, { className: "fw-semibold", children: __("posicion") }),
          /* @__PURE__ */ jsxs("div", { className: "row g-2", children: [
            /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs(
              Form.Select,
              {
                value: data.positionMode,
                onChange: (e) => setData("positionMode", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "start", children: __("al_principio") }),
                  /* @__PURE__ */ jsx("option", { value: "end", children: __("al_final") }),
                  /* @__PURE__ */ jsx("option", { value: "after", children: __("despues_de") })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-md-8", children: /* @__PURE__ */ jsxs(
              Form.Select,
              {
                value: data.afterSiblingId ?? "",
                onChange: (e) => setData("afterSiblingId", e.target.value ? parseInt(e.target.value, 10) : null),
                disabled: data.positionMode !== "after",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("selecciona_hermano") }),
                  siblings.map((sib) => /* @__PURE__ */ jsx("option", { value: sib.id, children: sib.name }, sib.id))
                ]
              }
            ) })
          ] }),
          data.positionMode === "after" && siblings.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-muted small mt-1", children: __("no_hay_hermanos_para_posicionar") })
        ] }),
        /* @__PURE__ */ jsxs(Form.Group, { className: "mb-3", children: [
          /* @__PURE__ */ jsx(Form.Label, { className: "fw-semibold me-2", children: __("activo") }),
          /* @__PURE__ */ jsx(
            Form.Check,
            {
              type: "switch",
              id: "statusSwitch",
              checked: !!data.status,
              onChange: (e) => setData("status", e.target.checked ? 1 : 0),
              inline: true
            }
          ),
          errors.status && /* @__PURE__ */ jsx("div", { className: "text-danger small mt-1", children: errors.status })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "card-footer d-flex justify-content-between", children: /* @__PURE__ */ jsxs("div", { className: "d-flex gap-2", children: [
        mode === "create" && /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline-primary",
            disabled: processing,
            onClick: (e) => onSubmit(e, true),
            children: __("guardar_y_crear_otra")
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", disabled: processing, children: __("guardar") })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(
      CategoryTreePicker,
      {
        environment,
        show: pickerOpen,
        onClose: () => setPickerOpen(false),
        onSelect: (node) => {
          setData("parent_id", (node == null ? void 0 : node.id) ?? null);
          setPickerOpen(false);
        },
        selectedId: data.parent_id
      }
    )
  ] });
}
export {
  Upsert as default
};
