import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Form, InputGroup, Spinner, ListGroup } from "react-bootstrap";
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
export {
  UserSearch as U
};
