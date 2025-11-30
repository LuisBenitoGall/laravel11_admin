import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C2CuImek.js";
import { useForm, Head, router } from "@inertiajs/react";
import { useMemo, useState, useEffect } from "react";
import { Button, Modal, InputGroup } from "react-bootstrap";
import axios from "axios";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { S as SelectSearch } from "./SelectSearch-Sk2tHjto.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-B9HfKdRc.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-select";
function CategoryTreePicker({ environment, show, onClose, onSelect, selectedId = null }) {
  const __ = useTranslation();
  const [nodes, setNodes] = useState([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!show) return;
    setLoading(true);
    try {
      route("categories.tree", environment);
    } catch (e) {
      console.warn("[CategoryTreePicker] Ruta categories.tree no disponible aún:", e);
      setNodes([]);
      setLoading(false);
      return;
    }
    axios.get(route("categories.tree", environment)).then((res) => {
      var _a;
      const data = ((_a = res.data) == null ? void 0 : _a.nodes) ?? [];
      setNodes(data);
      const roots = data.filter((n) => !n.parent_id).map((n) => n.id);
      setExpanded(new Set(roots));
    }).catch((err) => {
      console.error("[CategoryTreePicker] Error cargando árbol:", err);
      setNodes([]);
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
    /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: __("ubicacion_selec") }) }),
    /* @__PURE__ */ jsxs(Modal.Body, { children: [
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
  const [siblingOptions, setSiblingOptions] = useState([]);
  const [siblingsLoading, setSiblingsLoading] = useState(false);
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
  async function fetchSiblingOptions(q = "") {
    var _a;
    if (!data.parent_id) {
      setSiblingOptions([]);
      return;
    }
    setSiblingsLoading(true);
    try {
      const params = {
        parent_id: data.parent_id
      };
      if (q) params.q = q;
      if (mode === "edit" && (category == null ? void 0 : category.id)) params.exclude = category.id;
      const res = await axios.get(route("categories.siblings", environment), { params });
      const nodes = ((_a = res.data) == null ? void 0 : _a.nodes) ?? res.data ?? [];
      const opts = nodes.map((n) => ({ value: n.id, label: n.name }));
      setSiblingOptions(opts);
    } catch (e) {
      setSiblingOptions([]);
    } finally {
      setSiblingsLoading(false);
    }
  }
  useEffect(() => {
    if (!data.parent_id) {
      setSiblingOptions([]);
      return;
    }
    fetchSiblingOptions("");
  }, [data.parent_id]);
  useMemo(() => {
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
      afterSiblingId: payload.positionMode === "after" ? payload.afterSiblingId : null
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
    /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: (e) => onSubmit(e, false), children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
          __("categoria"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            type: "text",
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            placeholder: __("categoria"),
            isFocused: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "form-label", children: __("estado") }),
        /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            className: "xl",
            name: "status",
            checked: !!data.status,
            onChange: (e) => setData("status", e.target.checked ? 1 : 0)
          }
        ) }),
        /* @__PURE__ */ jsx(InputError, { message: errors.status })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "form-label", children: __("ubicacion_arbol") }),
        /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline-primary", type: "button", onClick: () => setPickerOpen(true), children: [
            /* @__PURE__ */ jsx("i", { className: "la la-sitemap me-1" }),
            __("ubicacion_selec")
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
              children: __("padre_quitar")
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.parent_id })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "form-label", children: __("posicion") }),
        /* @__PURE__ */ jsxs("div", { className: "row g-2", children: [
          /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsx(
            SelectSearch,
            {
              options: [
                { value: "start", label: __("al_principio") },
                { value: "end", label: __("al_final") },
                { value: "after", label: __("despues_de") }
              ],
              value: data.positionMode,
              onChange: (opt) => setData("positionMode", opt ? opt.value : ""),
              isClearable: false,
              placeholder: __("posicion")
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-8", children: /* @__PURE__ */ jsx(
            SelectSearch,
            {
              options: siblingOptions,
              value: data.afterSiblingId ?? "",
              onChange: (opt) => setData("afterSiblingId", opt && opt.value ? parseInt(opt.value, 10) : null),
              isDisabled: data.positionMode !== "after",
              isLoading: siblingsLoading,
              onSearchChange: (q) => fetchSiblingOptions(q),
              onMenuOpen: () => {
                if (!siblingOptions || siblingOptions.length === 0) fetchSiblingOptions("");
              },
              placeholder: __("hermano_selec")
            }
          ) })
        ] }),
        data.positionMode === "after" && siblings.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-muted small mt-1", children: __("no_hay_hermanos_para_posicionar") })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-end", children: [
        mode === "create" && /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline-primary",
            disabled: processing,
            onClick: (e) => onSubmit(e, true),
            children: __("guardar_anadir")
          }
        ),
        /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing, className: "btn btn-rdn ms-3", children: processing ? __("procesando") + "..." : __("guardar") })
      ] })
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
