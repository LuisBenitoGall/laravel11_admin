import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { Form, InputGroup, Button, Spinner, ListGroup } from "react-bootstrap";
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
  helpText = null,
  extraParams = {},
  allowClear = true
}) {
  const [query, setQuery] = useState(value ? value.name ?? "" : "");
  const [selectedUser, setSelectedUser] = useState(value);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const seqRef = useRef(0);
  useEffect(() => {
    const incomingId = (value == null ? void 0 : value.id) ?? null;
    const currentId = (selectedUser == null ? void 0 : selectedUser.id) ?? null;
    if (incomingId !== currentId) {
      setSelectedUser(value);
      setQuery(value ? value.name ?? "" : "");
    }
  }, [value]);
  const safeClose = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);
  const fetchResults = useCallback(async (term) => {
    var _a;
    if (!searchUrl) return;
    const t = (term ?? "").trim();
    if (t.length < minLength) {
      setResults([]);
      safeClose();
      setLoading(false);
      return;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const mySeq = ++seqRef.current;
    setLoading(true);
    try {
      const response = await axios.get(searchUrl, {
        params: {
          q: t,
          limit,
          ...extraParams && typeof extraParams === "object" ? extraParams : {}
        },
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      if (mySeq !== seqRef.current) return;
      const data = ((_a = response.data) == null ? void 0 : _a.data) || [];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
      setHighlightIndex(data.length ? 0 : -1);
    } catch (e) {
      if ((e == null ? void 0 : e.name) === "CanceledError" || (e == null ? void 0 : e.code) === "ERR_CANCELED") return;
      setResults([]);
      safeClose();
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  }, [searchUrl, minLength, limit, extraParams, safeClose]);
  const handleInputChange = (e) => {
    const term = e.target.value;
    setQuery(term);
    setSelectedUser(null);
    onChange == null ? void 0 : onChange(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(term);
    }, 300);
  };
  const handleSelectUser = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setQuery(user.name ?? "");
    setResults([]);
    safeClose();
    onChange == null ? void 0 : onChange(user);
  };
  const handleClear = () => {
    setQuery("");
    setSelectedUser(null);
    setResults([]);
    safeClose();
    onChange == null ? void 0 : onChange(null);
  };
  const handleKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => prev < results.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => prev > 0 ? prev - 1 : prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        handleSelectUser(results[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      safeClose();
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        safeClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [safeClose]);
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "mb-3 position-relative", ref: containerRef, children: [
    label ? /* @__PURE__ */ jsx(Form.Label, { className: "form-label", children: label }) : null,
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
      allowClear && !disabled && ((query == null ? void 0 : query.length) > 0 || selectedUser) ? /* @__PURE__ */ jsx(Button, { variant: "outline-secondary", onClick: handleClear, title: "Clear", children: /* @__PURE__ */ jsx("i", { className: "la la-times" }) }) : null,
      loading ? /* @__PURE__ */ jsx(InputGroup.Text, { children: /* @__PURE__ */ jsx(Spinner, { animation: "border", size: "sm", role: "status", "aria-hidden": "true" }) }) : null
    ] }),
    name ? /* @__PURE__ */ jsx("input", { type: "hidden", name, value: selectedUser ? selectedUser.id : "" }) : null,
    helpText && !error ? /* @__PURE__ */ jsx(Form.Text, { className: "text-muted", children: helpText }) : null,
    error ? /* @__PURE__ */ jsx("div", { className: "invalid-feedback d-block", children: error }) : null,
    open && results.length > 0 ? /* @__PURE__ */ jsx(
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
              user.email ? /* @__PURE__ */ jsx("div", { className: "small text-muted", children: user.email }) : null
            ]
          },
          user.id
        ))
      }
    ) : null,
    open && !loading && results.length === 0 && query.trim().length >= minLength ? /* @__PURE__ */ jsx(
      "div",
      {
        className: "position-absolute w-100 mt-1 bg-white border rounded p-2 small text-muted",
        style: { zIndex: 1050 },
        children: "No users found."
      }
    ) : null
  ] });
}
export {
  UserSearch as U
};
