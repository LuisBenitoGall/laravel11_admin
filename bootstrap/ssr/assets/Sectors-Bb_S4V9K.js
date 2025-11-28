import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CXi9lJ8D.js";
import { Head } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { InputGroup, Button } from "react-bootstrap";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-KWaSAYKU.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function CategoryTree({ nodes, onSelect, selectedId }) {
  useTranslation();
  const [expanded, setExpanded] = useState(/* @__PURE__ */ new Set());
  const byParent = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      const k = n.parent_id ?? 0;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(n);
    });
    m.forEach(
      (arr) => arr.sort(
        (a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }) || (a.position ?? 0) - (b.position ?? 0)
      )
    );
    return m;
  }, [nodes]);
  useEffect(() => {
    const roots = nodes.filter((n) => !n.parent_id).map((n) => n.id);
    setExpanded(new Set(roots));
  }, [nodes]);
  const hasChildren = (id) => (byParent.get(id) || []).length > 0;
  const toggle = (id) => {
    const c = new Set(expanded);
    c.has(id) ? c.delete(id) : c.add(id);
    setExpanded(c);
  };
  const render = (parentId = 0) => /* @__PURE__ */ jsx("ul", { className: "tree", children: (byParent.get(parentId) || []).map((n) => {
    const open = expanded.has(n.id);
    const active = selectedId === n.id;
    return /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `tree-node ${active ? "is-active" : ""}`,
          onClick: () => onSelect(n),
          children: [
            hasChildren(n.id) ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tree-caret",
                "aria-label": "toggle",
                onClick: (e) => {
                  e.stopPropagation();
                  toggle(n.id);
                },
                children: open ? "▾" : "▸"
              }
            ) : /* @__PURE__ */ jsx("span", { className: "tree-dot", children: "•" }),
            /* @__PURE__ */ jsx("i", { className: `la ${open ? "la-folder-open" : "la-folder"} tree-folder` }),
            /* @__PURE__ */ jsx("span", { className: "tree-label", children: n.name })
          ]
        }
      ),
      hasChildren(n.id) && open && /* @__PURE__ */ jsx("div", { className: "tree-children", children: render(n.id) })
    ] }, n.id);
  }) });
  return render(0);
}
function Card({ item }) {
  return /* @__PURE__ */ jsx("a", { href: item.url, className: "text-decoration-none", children: /* @__PURE__ */ jsxs("div", { className: "p-3 mb-3 border rounded bg-light h-100", children: [
    /* @__PURE__ */ jsx("div", { className: "fw-semibold text-primary", children: item.name }),
    item.nif ? /* @__PURE__ */ jsxs("div", { className: "text-muted small mt-1", children: [
      "NIF: ",
      item.nif
    ] }) : null
  ] }) });
}
function Sectors({ auth, title, subtitle }) {
  const __ = useTranslation();
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [loadingTree, setLoadingTree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [crm, setCrm] = useState([]);
  useEffect(() => {
    let mounted = true;
    setLoadingTree(true);
    axios.get(route("categories.tree", "sectors")).then((res) => {
      var _a;
      if (!mounted) return;
      setTree(((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.nodes) || []);
    }).finally(() => mounted && setLoadingTree(false));
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!selected) return;
    let cancel = false;
    setLoading(true);
    axios.get(route("companies.sectors.search"), {
      params: {
        category_id: selected.id,
        q: query || ""
      }
    }).then((res) => {
      var _a, _b;
      if (cancel) return;
      const c = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.companies) ? res.data.companies : [];
      const a = Array.isArray((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.crm) ? res.data.crm : [];
      c.sort((x, y) => x.name.localeCompare(y.name, "es", { sensitivity: "base" }));
      a.sort((x, y) => x.name.localeCompare(y.name, "es", { sensitivity: "base" }));
      setCompanies(c);
      setCrm(a);
    }).finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [selected == null ? void 0 : selected.id, query]);
  const breadcrumb = useMemo(() => {
    if (!(selected == null ? void 0 : selected.path)) return "";
    const parts = selected.path.split("/").filter(Boolean);
    return parts.join(" / ");
  }, [selected]);
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions: [],
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents", children: /* @__PURE__ */ jsxs("div", { className: "row pt-2", id: "companySectors", children: [
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsx("div", { className: "card-header fw-semibold py-3", children: __("sectores_indice") }),
            /* @__PURE__ */ jsx("div", { className: "card-body", style: { maxHeight: 520, overflowY: "auto" }, children: loadingTree ? /* @__PURE__ */ jsx("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status" }) }) : /* @__PURE__ */ jsx(
              CategoryTree,
              {
                nodes: tree,
                selectedId: (selected == null ? void 0 : selected.id) ?? null,
                onSelect: (node) => {
                  setSelected(node);
                  setQuery("");
                }
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-9", children: /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsxs("div", { className: "card-header d-flex align-items-center justify-content-between", children: [
              /* @__PURE__ */ jsx("div", { className: "fw-semibold", children: selected ? /* @__PURE__ */ jsxs(Fragment, { children: [
                __("resultados_para"),
                ": ",
                /* @__PURE__ */ jsx("span", { className: "text-primary", children: breadcrumb })
              ] }) : __("categoria_selec") }),
              selected && (companies.length > 0 || crm.length > 0) && /* @__PURE__ */ jsx("div", { style: { minWidth: 320 }, children: /* @__PURE__ */ jsxs(InputGroup, { children: [
                /* @__PURE__ */ jsx(InputGroup.Text, { children: /* @__PURE__ */ jsx("i", { className: "la la-search" }) }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: __("filtrar_por_nombre_nif")
                  }
                ),
                query && /* @__PURE__ */ jsx(Button, { variant: "outline-secondary", onClick: () => setQuery(""), children: __("limpiar") })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
              !selected && /* @__PURE__ */ jsx("div", { className: "text-muted py-5 text-center", children: __("categoria_selec_para_empresas") }),
              selected && loading && /* @__PURE__ */ jsx("div", { className: "text-center py-5", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status" }) }),
              selected && !loading && companies.length === 0 && crm.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-muted py-5 text-center", children: __("sin_resultados") }),
              selected && !loading && (companies.length > 0 || crm.length > 0) && /* @__PURE__ */ jsxs(Fragment, { children: [
                companies.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "fw-semibold mb-2", children: __("empresas") }),
                  /* @__PURE__ */ jsx("div", { className: "row row-cols-1 row-cols-md-2 row-cols-xl-3", children: companies.map((item) => /* @__PURE__ */ jsx("div", { className: "col mb-3", children: /* @__PURE__ */ jsx(Card, { item }) }, `c-${item.id}`)) }),
                  /* @__PURE__ */ jsx("hr", { className: "my-4" })
                ] }),
                crm.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "fw-semibold mb-2", children: __("cuentas_crm") }),
                  /* @__PURE__ */ jsx("div", { className: "row row-cols-1 row-cols-md-2 row-cols-xl-3", children: crm.map((item) => /* @__PURE__ */ jsx("div", { className: "col", children: /* @__PURE__ */ jsx(Card, { item }) }, `a-${item.id}`)) })
                ] })
              ] })
            ] })
          ] }) })
        ] }) })
      ]
    }
  );
}
export {
  Sectors as default
};
