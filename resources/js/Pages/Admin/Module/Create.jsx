import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import ColorPicker from '@/Components/ColorPicker';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, levels, availableLocales }){
	const __ = useTranslation();
	const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

	const levelsArray = Object.entries(levels || {}).map(([key, value]) => ({
		value: key,
		label: value
	}));
	
	// Set formulario:
	const {data, setData, post, reset, errors, processing} = useForm({
		name: '',
		label: '',
		level: '',
		icon: '',
		color: '',
		status: true
	})

	const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files[0]);
        } else {
            setData(name, value);
        }
    };

	// Envío formulario:
	function handleSubmit(e){
		e.preventDefault()
		post(route('modules.store'), {
			onSuccess: () => reset()
		})
	}

	//Acciones:
    const actions = [];
    if (permissions?.['modules.index']) {
        actions.push({
            text: __('modulos_volver'),
            icon: 'la-angle-left',
            url: 'modules.index',
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
						{/* Nombre módulo */}
						<div className="col-lg-6">
							<div className="position-relative">
								<label htmlFor="name" className="form-label">{ __('modulo') }*</label>
								<TextInput 
									className="" 
									type="text"
									placeholder={__('nombre')} 
									value={data.name} 
									onChange={(e) => setData('name', e.target.value)}
									maxLength={100}
									required
								/>
								<InfoPopover code="module-name" />

								<InputError message={errors.name} />
							</div>
						</div>

						{/* Etiqueta */}
						<div className="col-lg-5">
							<div className="position-relative">
								<label htmlFor="label" className="form-label">{ __('etiqueta') }*</label>
								<TextInput 
									className="" 
									type="text"
									placeholder={__('etiqueta')} 
									value={data.label} 
									onChange={(e) => setData('label', e.target.value)}
									maxLength={100}
									required
								/>
								<InfoPopover code="module-label" />

								<InputError message={errors.name} />
							</div>
						</div>

						{/* Nivel */}
						<div className="col-lg-3">
							<div className="position-relative">
								<label htmlFor="level" className="form-label">{ __('nivel') }*</label>
								<SelectInput
									className="form-select"
									name="level"
									value={data.level}
									onChange={(e) => setData('level', e.target.value)}
									required
								>
									<option value="">{ __('opcion_selec') }</option>
									{levelsArray.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
                                </SelectInput>
								<InfoPopover code="module-level" />
							
								<InputError message={errors.level} />
							</div>
						</div>

						{/* Icono */}
						<div className="col-lg-3">
							<div className="position-relative">
    							<label htmlFor="icon" className="form-label">{ __('icono') }</label>
    							<TextInput 
									type="text"
									placeholder={__('icono')} 
									value={data.icon} 
									onChange={(e) => setData('icon', e.target.value)}
									maxLength={100}
								/>
								<InfoPopover code="module-icon" />

								<InputError message={errors.icon} />
							</div>
						</div>

						{/* Color */}
						<div className="col-lg-4">
							<div className="position-relative">
    							<label htmlFor="color" className="form-label">{ __('color') }</label>
								<ColorPicker
									color={data.color}
									onChange={(e) => setData('color', e.target.value)}
									name="color"
								/>
								<InfoPopover code="module-color" />

								<InputError message={errors.color} />
							</div>
						</div>

						{/* Estado */}
						<div className="col-lg-1 text-center">
							<div className="position-relative">
								<label htmlFor="status" className="form-label">{ __('estado') }</label>
								<div className='pt-1 position-relative'>
									<Checkbox 
										className="xl"
										name="status"
										checked={data.status}
										onChange={(e) => setData('status', e.target.checked)}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-4 text-end'>
						<PrimaryButton disabled={processing} className='btn btn-rdn'>
							{processing ? __('procesando')+'...':__('guardar')}
						</PrimaryButton>	
					</div>
				</form>
			</div>
		</AdminAuthenticatedLayout>
	);
}