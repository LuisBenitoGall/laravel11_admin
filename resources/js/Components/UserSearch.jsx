import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Form, InputGroup, ListGroup, Spinner } from 'react-bootstrap';

export default function UserSearch({
    label,
    name,
    value = null,                // { id, name, email } inicial (opcional)
    onChange,                    // function(user|null)
    searchUrl,                   // '/admin/users/search'
    placeholder = 'Search user...',
    disabled = false,
    autoFocus = false,
    minLength = 2,
    limit = 10,
    error = null,
    helpText = null,
}) {
    const [query, setQuery] = useState(value ? value.name : '');
    const [selectedUser, setSelectedUser] = useState(value);
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    // sync external value -> internal state
    useEffect(() => {
        if (value && value.id !== (selectedUser?.id ?? null)) {
            setSelectedUser(value);
            setQuery(value.name);
        }
        if (!value && selectedUser) {
            setSelectedUser(null);
            setQuery('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        axios
            .get(searchUrl, {
                params: { q: term, limit },
            })
            .then((response) => {
                const data = response.data?.data || [];
                setResults(data);
                setOpen(true);
                setHighlightIndex(data.length ? 0 : -1);
            })
            .catch(() => {
                setResults([]);
                setOpen(false);
            })
            .finally(() => {
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

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < results.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIndex >= 0 && highlightIndex < results.length) {
                handleSelectUser(results[highlightIndex]);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            setHighlightIndex(-1);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
                setHighlightIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="mb-3 position-relative" ref={containerRef}>
            {label && (
                <Form.Label className="form-label">
                    {label}
                </Form.Label>
            )}

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
                {loading && (
                    <InputGroup.Text>
                        <Spinner
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    </InputGroup.Text>
                )}
            </InputGroup>

            {/* Hidden input to send selected id in forms */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={selectedUser ? selectedUser.id : ''}
                />
            )}

            {helpText && !error && (
                <Form.Text className="text-muted">
                    {helpText}
                </Form.Text>
            )}

            {error && (
                <div className="invalid-feedback d-block">
                    {error}
                </div>
            )}

            {open && results.length > 0 && (
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
                            {user.email && (
                                <div className="small text-muted">
                                    {user.email}
                                </div>
                            )}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {open && !loading && results.length === 0 && query.length >= minLength && (
                <div
                    className="position-absolute w-100 mt-1 bg-white border rounded p-2 small text-muted"
                    style={{ zIndex: 1050 }}
                >
                    No users found.
                </div>
            )}
        </div>
    );
}
