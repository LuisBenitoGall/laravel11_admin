import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, session, title, subtitle, company, availableLocales }){
	const __ = useTranslation();
	const props = usePage()?.props || {};
	const permissions = props.permissions || {};

	const { data, setData, post, reset, errors, processing } = useForm({ name: '', status: 1 });

	const handleChange = (e) => {
		const { name, type, checked, value } = e.target;
		if (type === 'checkbox') {
			setData(name, checked ? 1 : 0);
		} else {
			setData(name, value);
		}
	};

	function handleSubmit(e){
		e.preventDefault();
		post(route('business-areas.store'), { onSuccess: () => reset() });
	}

	const actions = [];
	if (permissions?.['business-areas.index']) {
		actions.push({ text: __('areas_negocio_volver'), icon: 'la-angle-left', url: 'business-areas.index', modal: false });
	}

	return (
		<AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
			<Head title={title} />
			<div className="contents pb-4">
				<div className="row">
					<div className="col-12"><h2>{__('area_nueva')} <u>{company?.name}</u></h2></div>
				</div>
				<form onSubmit={handleSubmit}>
					<div className="row gy-3">
						<div className="col-lg-6">
							<label htmlFor="name" className="form-label">{ __('nombre') }*</label>
							<TextInput className="" type="text" placeholder={__('nombre')} value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={150} required />
							<InputError message={errors.name} />
						</div>
						<div className="col-lg-2 text-center">
							<label htmlFor="status" className="form-label">{ __('estado') }</label>
							<div className='pt-1 position-relative'>
								<Checkbox className="xl" name="status" checked={!!data.status} onChange={handleChange} />
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
