import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

export default function Edit({ auth, session, title, subtitle, costCenter }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};
    const { showConfirm } = useSweetAlert();

    const { data, setData, errors, processing } = useForm({ 
        name: costCenter.name || '', 
        status: costCenter.status === 1 ? 1 : 0 
    });

    function handleSubmit(e){
        e.preventDefault();
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('status', data.status);
        router.post(route('cost-centers.update', costCenter.id), formData, { forceFormData: true, preserveScroll: true });
    }

    const handleDelete = () => {
        showConfirm({
            title: __('eliminar'),
            text: __('registro_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => { router.delete(route('cost-centers.destroy', costCenter.id)); }
        });
    };

    const actions = [];
    if (permissions?.['cost-centers.index']) { actions.push({ text: __('centros_coste_volver'), icon: 'la-angle-left', url: 'cost-centers.index', modal: false }); }
    if (permissions?.['cost-centers.destroy']) { actions.push({ text: __('eliminar'), icon: 'la-trash', method: 'delete', url: 'cost-centers.destroy', params: [costCenter.id], title: __('centro_coste_eliminar'), message: __('centro_coste_eliminar_confirm'), modal: false }); }

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />
            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12"><h2>{__('centro_coste')} <u>{costCenter.name}</u></h2></div>
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">{__('creado')}: <strong>{costCenter.formatted_created_at}</strong></span>
                        <span className="text-muted me-5">{__('actualizado')}: <strong>{costCenter.formatted_updated_at}</strong></span>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        <div className="col-lg-6">
                            <label className="form-label">{__('nombre')}*</label>
                            <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={150} required />
                            <InputError message={errors.name} />
                        </div>
                        <div className="col-lg-2 text-center">
                            <label className="form-label">{__('estado')}</label>
                            <div className='pt-1 position-relative'>
                                <Checkbox className="xl" name="status" checked={data.status === 1} onChange={(e) => setData('status', e.target.checked ? 1 : 0)} />
                            </div>
                            <InputError message={errors.status} />
                        </div>
                        <div className='mt-4 text-end'>
                            <PrimaryButton disabled={processing} className='btn btn-rdn'>{processing ? __('procesando')+'...':__('guardar')}</PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}
