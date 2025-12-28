import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Form, InputGroup, ListGroup, Spinner, Button } from 'react-bootstrap';

export default function UserSearch({
    label,
    name,
    value = null,                 // { id, name, email } inicial (opcional)
    onChange,                     // function(user|null)
    searchUrl,                    // '/admin/users/search'
    placeholder = 'Search user...',
    disabled = false,
    autoFocus = false,
    minLength = 2,
    limit = 10,
    error = null,
    helpText = null,
    extraParams = {},
    allowClear = true,
}) {
    const [query, setQuery] = useState(value ? (value.name ?? '') : '');
    const [selectedUser, setSelectedUser] = useState(value);
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    // Control de peticiones
    const abortRef = useRef(null);
    const seqRef = useRef(0);

    // sync external value -> internal state
    useEffect(() => {
        const incomingId = value?.id ?? null;
        const currentId = selectedUser?.id ?? null;

        if (incomingId !== currentId) {
          setSelectedUser(value);
          setQuery(value ? (value.name ?? '') : '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const safeClose = useCallback(() => {
        setOpen(false);
        setHighlightIndex(-1);
    }, []);

    const fetchResults = useCallback(async (term) => {
        if (!searchUrl) return;

        const t = (term ?? '').trim();

        if (t.length < minLength) {
        setResults([]);
        safeClose();
        setLoading(false);
        return;
        }

        // abort anterior
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
            ...(extraParams && typeof extraParams === 'object' ? extraParams : {}),
            },
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        });

        // Si llegó tarde, ignoramos
        if (mySeq !== seqRef.current) return;

        const data = response.data?.data || [];
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
        setHighlightIndex(data.length ? 0 : -1);
        } catch (e) {
        // abort = silencio elegante
        if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;

        setResults([]);
        safeClose();
        } finally {
        // Solo el último request apaga loading
        if (mySeq === seqRef.current) setLoading(false);
        }
    }, [searchUrl, minLength, limit, extraParams, safeClose]);

    const handleInputChange = (e) => {
        const term = e.target.value;
        setQuery(term);
        setSelectedUser(null);
        onChange?.(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
        fetchResults(term);
        }, 300);
    };

    const handleSelectUser = (user) => {
        if (!user) return;

        setSelectedUser(user);
        setQuery(user.name ?? '');
        setResults([]);
        safeClose();
        onChange?.(user);
    };

    const handleClear = () => {
        setQuery('');
        setSelectedUser(null);
        setResults([]);
        safeClose();
        onChange?.(null);
    };

    const handleKeyDown = (e) => {
        if (!open || !results.length) return;

        if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < results.length) {
            handleSelectUser(results[highlightIndex]);
        }
        } else if (e.key === 'Escape') {
        safeClose();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            safeClose();
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [safeClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return (
        <div className="mb-3 position-relative" ref={containerRef}>
        {label ? <Form.Label className="form-label">{label}</Form.Label> : null}

        <InputGroup>
            <Form.Control
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete="off"
            isInvalid={!!error}
            />

            {allowClear && !disabled && (query?.length > 0 || selectedUser) ? (
            <Button variant="outline-secondary" onClick={handleClear} title="Clear">
                <i className="la la-times" />
            </Button>
            ) : null}

            {loading ? (
            <InputGroup.Text>
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
            </InputGroup.Text>
            ) : null}
        </InputGroup>

        {/* Hidden input to send selected id in classic forms */}
        {name ? (
            <input type="hidden" name={name} value={selectedUser ? selectedUser.id : ''} />
        ) : null}

        {helpText && !error ? <Form.Text className="text-muted">{helpText}</Form.Text> : null}
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}

        {open && results.length > 0 ? (
            <ListGroup
            className="position-absolute w-100 mt-1 shadow-sm"
            style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}
            >
            {results.map((user, index) => (
                <ListGroup.Item
                key={user.id}
                action
                onClick={() => handleSelectUser(user)}
                active={index === highlightIndex}
                >
                <div className="fw-semibold">{user.name}</div>
                {user.email ? <div className="small text-muted">{user.email}</div> : null}
                </ListGroup.Item>
            ))}
            </ListGroup>
        ) : null}

        {open && !loading && results.length === 0 && query.trim().length >= minLength ? (
            <div
            className="position-absolute w-100 mt-1 bg-white border rounded p-2 small text-muted"
            style={{ zIndex: 1050 }}
            >
            No users found.
            </div>
        ) : null}
        </div>
    );
}
