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

export default function MarketingCampaignInfoTab({ 
    campaign, 
    updateRoute = 'marketing-campaigns.update', 
    updateParams = null 
}) {
    const __ = useTranslation();
    const { showAlert } = useSweetAlert();

    const params = updateParams ?? [campaign?.id];

    const { data, setData, post, processing, errors } = useForm({
        owner_id: campaign?.owner_id ?? '',
        name: campaign?.name ?? '',
        slug: campaign?.slug ?? '',
        type: campaign?.type ?? '',
        is_dynamic: campaign?.is_dynamic ?? false,
        status: campaign?.status ?? 1,
        observations: campaign?.observations ?? '',
        _method: 'PUT',
    });

    useEffect(() => {
        setData({
            owner_id: campaign?.owner_id ?? '',
            name: campaign?.name ?? '',
            slug: campaign?.slug ?? '',
            type: campaign?.type ?? '',
            is_dynamic: campaign?.is_dynamic ?? false,
            status: campaign?.status ?? 1,
            observations: campaign?.observations ?? '',
            _method: 'PUT',
        });
    }, [campaign]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route(updateRoute, params), {
            preserveScroll: true,
            onSuccess: () => {
                showAlert(__('Éxito'), __('La campaña se ha actualizado correctamente.'), 'success');
            },
            onError: () => {
                showAlert(__('Error'), __('Se ha producido un error al actualizar la campaña.'), 'error');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row gy-3">
                {/* Nombre campaña */}
                <div className="col-lg-6">


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