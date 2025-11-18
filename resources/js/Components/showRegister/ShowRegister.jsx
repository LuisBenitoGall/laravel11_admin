// resources/js/Components/showRegister/ShowRegister.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ShowRegisterPanel from './ShowRegisterPanel';

export default function ShowRegister({
    id = null,
    routeName,
    title = '',
    ViewComponent,
    open = false,
    onClose,
}) {
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !id) {
            setRecord(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        axios
            .get(route(routeName, id), {
                headers: {
                    Accept: 'application/json',
                },
            })
            .then((response) => {
                const data = response.data?.data ?? response.data;

                // Por si acaso vuelve a venir HTML por algún motivo,
                // evitamos que rompa el componente:
                if (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE')) {
                    console.error('Respuesta HTML inesperada en ShowRegister:', data);
                    setError('Error al cargar el registro.');
                    setRecord(null);
                } else {
                    setRecord(data);
                }
            })
            .catch((e) => {
                console.error(e);
                setError('Error al cargar el registro.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, open, routeName]);

    return (
        <ShowRegisterPanel
            open={open}
            title={title}
            loading={loading}
            onClose={onClose}
        >
            {error && (
                <div className="alert alert-danger mb-3">
                    {error}
                </div>
            )}

            {record && !error && (
                <ViewComponent record={record} />
            )}
        </ShowRegisterPanel>
    );
}

ShowRegister.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    routeName: PropTypes.string.isRequired,
    title: PropTypes.string,
    ViewComponent: PropTypes.elementType.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
};
