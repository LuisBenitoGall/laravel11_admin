import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

// Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

export default function MarketingListInfoTab({ list, updateRoute = 'marketing-lists.update', updateParams = null }) {
    const __ = useTranslation();
    const { showAlert } = useSweetAlert();

    const params = updateParams ?? [list?.id];

    const { data, setData, post, processing, errors } = useForm({
        owner_id: list?.owner_id ?? '',
        name: list?.name ?? '',
        slug: list?.slug ?? '',
        type: list?.type ?? '',
        is_dynamic: list?.is_dynamic ?? false,
        status: list?.status ?? 1,
        observations: list?.observations ?? '',
        _method: 'PUT',
    });

    // Ensure form is populated if list prop changes
    useEffect(() => {
        setData({
            owner_id: list?.owner_id ?? '',
            name: list?.name ?? '',
            slug: list?.slug ?? '',
            type: list?.type ?? '',
            is_dynamic: list?.is_dynamic ?? false,
            status: list?.status ?? 1,
            observations: list?.observations ?? '',
            _method: 'PUT',
        });
    }, [list]);

    // Si el tipo es "dynamic", marcamos automáticamente is_dynamic
    useEffect(() => {
        if (data.type === 'dynamic' || data.type === 'dinamica') {
            if (!data.is_dynamic) {
                setData('is_dynamic', true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route(updateRoute, params), {
            preserveScroll: true,
            onSuccess: () => {
                showAlert(__('Éxito'), __('La lista de marketing se ha actualizado correctamente.'), 'success');
            },
            onError: () => {
                showAlert(__('Error'), __('Se ha producido un error al actualizar la lista de marketing.'), 'error');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row gy-3">
                {/* Nombre lista */}
                <div className="col-lg-6">
                    <div>
                        <label htmlFor="name" className="form-label">
                            {__('nombre')}*
                        </label>
                        <TextInput
                            id="name"
                            type="text"
                            placeholder={__('nombre')}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={255}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                </div>

                <div className="col-lg-2 text-center">
                    <div>
                        <label htmlFor="status" className="form-label">
                            {__('estado')}
                        </label>
                        <div className="pt-1 position-relative">
                            <Checkbox
                                className="xl"
                                name="status"
                                checked={data.status}
                                onChange={(e) => setData('status', e.target.checked)}
                            />
                        </div>
                    </div>
                </div>

                {/* Observaciones */}
                <div className="col-12">
                    <div>
                        <label htmlFor="observations" className="form-label">
                            {__('Observaciones')}
                        </label>
                        <textarea
                            id="observations"
                            name="observations"
                            className="form-control"
                            rows={4}
                            value={data.observations || ''}
                            onChange={(e) => setData('observations', e.target.value)}
                        />
                        <InputError message={errors.observations} className="mt-1" />
                    </div>
                </div>

                <div className="mt-4 text-end">
                    <PrimaryButton disabled={processing} className="btn btn-rdn">
                        {processing ? __('procesando') + '...' : __('guardar')}
                    </PrimaryButton>
                </div>
            </div>
        </form>
    );
}