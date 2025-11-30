import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C2CuImek.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import { useState, useRef, useEffect } from "react";
import "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SelectSearch } from "./SelectSearch-Sk2tHjto.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import axios from "axios";
import { Form, InputGroup, Spinner, ListGroup } from "react-bootstrap";
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
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function UserSearch({
  label,
  name,
  value = null,
  // { id, name, email } inicial (opcional)
  onChange,
  // function(user|null)
  searchUrl,
  // '/admin/users/search'
  placeholder = "Search user...",
  disabled = false,
  autoFocus = false,
  minLength = 2,
  limit = 10,
  error = null,
  helpText = null
}) {
  const [query, setQuery] = useState(value ? value.name : "");
  const [selectedUser, setSelectedUser] = useState(value);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (value && value.id !== ((selectedUser == null ? void 0 : selectedUser.id) ?? null)) {
      setSelectedUser(value);
      setQuery(value.name);
    }
    if (!value && selectedUser) {
      setSelectedUser(null);
      setQuery("");
    }
  }, [value]);
  const fetchResults = (term) => {
    if (!searchUrl) return;
    if (term.length < minLength) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(searchUrl, {
      params: { q: term, limit }
    }).then((response) => {
      var _a;
      const data = ((_a = response.data) == null ? void 0 : _a.data) || [];
      setResults(data);
      setOpen(true);
      setHighlightIndex(data.length ? 0 : -1);
    }).catch(() => {
      setResults([]);
      setOpen(false);
    }).finally(() => {
      setLoading(false);
    });
  };
  const handleInputChange = (e) => {
    const term = e.target.value;
    setQuery(term);
    setSelectedUser(null);
    if (onChange) {
      onChange(null);
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchResults(term);
    }, 300);
  };
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setQuery(user.name);
    setResults([]);
    setOpen(false);
    setHighlightIndex(-1);
    if (onChange) {
      onChange(user);
    }
  };
  const handleKeyDown = (e) => {
    if (!open || !results.length) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(
        (prev) => prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => prev > 0 ? prev - 1 : prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        handleSelectUser(results[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "mb-3 position-relative", ref: containerRef, children: [
    label && /* @__PURE__ */ jsx(Form.Label, { className: "form-label", children: label }),
    /* @__PURE__ */ jsxs(InputGroup, { children: [
      /* @__PURE__ */ jsx(
        Form.Control,
        {
          type: "text",
          value: query,
          onChange: handleInputChange,
          onKeyDown: handleKeyDown,
          placeholder,
          disabled,
          autoFocus,
          autoComplete: "off",
          isInvalid: !!error
        }
      ),
      loading && /* @__PURE__ */ jsx(InputGroup.Text, { children: /* @__PURE__ */ jsx(
        Spinner,
        {
          animation: "border",
          size: "sm",
          role: "status",
          "aria-hidden": "true"
        }
      ) })
    ] }),
    name && /* @__PURE__ */ jsx(
      "input",
      {
        type: "hidden",
        name,
        value: selectedUser ? selectedUser.id : ""
      }
    ),
    helpText && !error && /* @__PURE__ */ jsx(Form.Text, { className: "text-muted", children: helpText }),
    error && /* @__PURE__ */ jsx("div", { className: "invalid-feedback d-block", children: error }),
    open && results.length > 0 && /* @__PURE__ */ jsx(
      ListGroup,
      {
        className: "position-absolute w-100 mt-1 shadow-sm",
        style: { zIndex: 1050, maxHeight: "250px", overflowY: "auto" },
        children: results.map((user, index) => /* @__PURE__ */ jsxs(
          ListGroup.Item,
          {
            action: true,
            onClick: () => handleSelectUser(user),
            active: index === highlightIndex,
            children: [
              /* @__PURE__ */ jsx("div", { className: "fw-semibold", children: user.name }),
              user.email && /* @__PURE__ */ jsx("div", { className: "small text-muted", children: user.email })
            ]
          },
          user.id
        ))
      }
    ),
    open && !loading && results.length === 0 && query.length >= minLength && /* @__PURE__ */ jsx(
      "div",
      {
        className: "position-absolute w-100 mt-1 bg-white border rounded p-2 small text-muted",
        style: { zIndex: 1050 },
        children: "No users found."
      }
    )
  ] });
}
function OpportunityStatusSelect({
  id = "status",
  name = "status",
  value,
  onChange,
  error,
  label,
  className = "form-select"
}) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const serverOptions = pageProps.crmOpportunityStatusOptions || null;
  const fallbackOptions = [
    { value: 1, label: __("oportunidad_nueva"), color: "#0d6efd" },
    // azul
    { value: 2, label: __("oportunidad_en_proceso"), color: "#0dcaf0" },
    // celeste
    { value: 3, label: __("oportunidad_negociacion"), color: "#ffc107" },
    // amarillo
    { value: 4, label: __("oportunidad_ganada"), color: "#198754" },
    // verde
    { value: 5, label: __("oportunidad_perdida"), color: "#dc3545" }
    // rojo
  ];
  const options = serverOptions && serverOptions.length ? serverOptions : fallbackOptions;
  return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsx("label", { htmlFor: id, className: "form-label", children: label ?? __("estado") }),
    /* @__PURE__ */ jsx(
      "select",
      {
        id,
        name,
        className,
        value,
        onChange,
        children: options.map((opt) => /* @__PURE__ */ jsxs(
          "option",
          {
            value: opt.value,
            style: { color: opt.color },
            children: [
              "⚑ ",
              opt.label
            ]
          },
          opt.value
        ))
      }
    ),
    error && /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
function Index({
  auth,
  session,
  title,
  subtitle,
  availableLocales,
  crmAccounts = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    user_id: null,
    observations: "",
    crm_account_id: null,
    status: 1
    // 1 = "oportunidad_nueva" (fallback)
  });
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "checkbox") {
      setData(name, checked);
    } else if (type === "file") {
      setData(name, files[0]);
    } else {
      setData(name, value);
    }
  };
  function handleSubmit(e) {
    e.preventDefault();
    post(route("crm-opportunities.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["crm-opportunities.index"]) {
    actions.push({
      text: __("oportunidades_volver"),
      icon: "la-angle-left",
      url: "crm-opportunities.index",
      modal: false
    });
  }
  const crmAccountOptions = (crmAccounts || []).map((acc) => ({
    value: acc.id,
    label: acc.name,
    meta: acc
  }));
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("titulo"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "text",
                name: "name",
                value: data.name ?? "",
                onChange: handleChange,
                maxLength: 255,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(
            OpportunityStatusSelect,
            {
              id: "status",
              name: "status",
              value: data.status,
              onChange: (e) => setData("status", e.target.value),
              error: errors.status,
              label: __("estado")
            }
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
          /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
            /* @__PURE__ */ jsx(
              UserSearch,
              {
                label: __("contacto"),
                name: "user_id",
                searchUrl: route("users.search"),
                value: null,
                onChange: (user) => setData("user_id", user ? user.id : null),
                placeholder: __("usuario_buscar"),
                error: errors.user_id
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.user_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cuenta_crm") }),
            /* @__PURE__ */ jsx(
              SelectSearch,
              {
                name: "crm_account_id",
                value: data.crm_account_id,
                options: crmAccountOptions,
                onChange: (opt) => setData("crm_account_id", opt ? opt.value : null),
                placeholder: __("oportunidad_cuenta_selec")
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.crm_account_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("observaciones") }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                name: "observations",
                value: data.observations || "",
                onChange: (e) => setData("observations", e.target.value),
                className: "form-control",
                rows: 4
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.observations })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? `${__("procesando")}...` : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Index as default
};
