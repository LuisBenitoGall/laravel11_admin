import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import RadioButton from '@/Components/RadioButton';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';


export default function Create({ auth, session, title, subtitle, availableLocales }){
	const __ = useTranslation();
	const props = usePage()?.props || {};
	const locale = props.locale || false;
	const languages = props.languages || [];
	const permissions = props.permissions || {};

	// Set formulario:
	const {data, setData, post, reset, errors, processing} = useForm({
		name: '',
		type: '', // 'product' o 'service', sin selección por defecto
		is_sale: false,
		status: true
	})

	// Opciones para tipo de producto
	const typeOptions = [
		{ value: 'p', label: __('producto') },
		{ value: 's', label: __('servicio') }
	];

	const handleChange = (e) => {
		const { name, type, checked, value } = e.target;
		if (type === 'checkbox') {
			setData(name, checked);
		} else {
			setData(name, value);
		}
	};

	// Envío formulario:
	function handleSubmit(e){
		e.preventDefault()
		post(route('products.store'), {
			onSuccess: () => reset()
		})
	}

	//Acciones:
	const actions = [];
	if (permissions?.['products.index']) {
		actions.push({
			text: __('productos_volver'),
			icon: 'la-angle-left',
			url: 'products.index',
			modal: false
		});
	}

	return (
		<AdminAuthenticatedLayout
			user={auth.user}
			title={title}
			subtitle={subtitle}
			actions={actions}
		>
			<Head title={title} />

			{/* Contenido */}
			<div className="contents pb-4">
				{/* Formulario */}
				<form onSubmit={handleSubmit}>
					<div className="row gy-3">
						{/* Nombre del producto */}
						<div className="col-lg-6">
							<div>
								<label htmlFor="name" className="form-label">{ __('producto_nombre') }*</label>
								<TextInput 
									className="" 
									type="text"
									placeholder={__('producto_nombre')} 
									value={data.name} 
									onChange={(e) => setData('name', e.target.value)}
									maxLength={150}
									required
								/>
								<InputError message={errors.name} />
							</div>
						</div>

						{/* Estado */}
						<div className="col-lg-2 text-center">
							<div>
								<label htmlFor="status" className="form-label">{ __('estado') }</label>
								<div className='pt-1 position-relative'>
									<Checkbox 
										className="xl"
										name="status"
										checked={data.status}
										onChange={handleChange}
									/>
								</div>
							</div>    
						</div>

						{/* Producto para venta */}
						<div className="col-lg-3 text-center">
							<div>
								<label htmlFor="is_sale" className="form-label">{__('producto_venta')}</label>
								<div className='pt-1 position-relative'>
									<Checkbox
										className="xl"
										name="is_sale"
										checked={data.is_sale}
										onChange={handleChange}
									/>
								</div>
							</div>
						</div>

						{/* Tipo: Producto o Servicio */}
						<div className="col-lg-4">
							<div>
								<label htmlFor="type" className="form-label">{__('tipo')}*</label>
								<RadioButton
									name="type"
									value={data.type}
									onChange={(e) => setData('type', e.target.value)}
									options={typeOptions}
									required
								/>
								<InputError message={errors.type} />
							</div>
						</div>

						<div className='mt-4 text-end'>
							<PrimaryButton disabled={processing} className='btn btn-rdn'>
								{processing ? __('procesando')+'...':__('guardar')}
							</PrimaryButton>    
						</div>
					</div>
				</form>
			</div>
		</AdminAuthenticatedLayout>
	);
}