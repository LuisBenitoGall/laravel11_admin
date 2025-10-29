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

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales }){
	const __ = useTranslation();
	const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
	const permissions = props.permissions || {};

	// Set formulario:
	const {data, setData, post, reset, errors, processing} = useForm({
		name: '',
		tradename: '',
		nif: '',
		auto_link: false
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
		post(route('crm-accounts.store'), {
			onSuccess: () => reset()
		})
	}

	//Acciones:
	const actions = [];
    if (permissions?.['crm-accounts.index']) {
		actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
			url: 'crm-accounts.index',
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
						{/* Razón social */}
						<div className="col-lg-6">
							<div>
								<label htmlFor="name" className="form-label">{ __('razon_social') }*</label>
								<TextInput 
									className="" 
									type="text"
									placeholder={__('empresa_nombre')} 
									value={data.name} 
									onChange={(e) => setData('name', e.target.value)}
									maxLength={100}
								/>

								<InputError message={errors.name} />
							</div>
						</div>

						{/* Nombre comercial */}
						<div className="col-lg-6">
							<div>
								<label htmlFor="tradename" className="form-label">{ __('nombre_comercial') }*</label>
								<TextInput 
									className="" 
									type="text"
									placeholder={__('nombre_comercial')} 
									value={data.tradename} 
									onChange={(e) => setData('tradename', e.target.value)}
									maxLength={100}
								/>
								
								<InputError message={errors.tradename} />
							</div>
						</div>

						{/* NIF */}
						<div className="col-lg-3">
							<div className='position-relative'>
    							<label htmlFor="nif" className="form-label">{ __('nif') }*</label>
    							<TextInput 
									className="" 
									type="text"
									placeholder={__('nif')} 
									value={data.nif} 
									onChange={(e) => setData('nif', e.target.value)}
									maxLength={15}
								/>
								<InfoPopover code="company-nif" />

								<InputError message={errors.nif} />
							</div>
						</div>

						{/* UTE */}
						<div className="col-lg-1 text-center">
							<div className="position-relative">
								<label htmlFor="is_ute" className="form-label">{ __('ute') }</label>
								<div className='pt-1 position-relative'>
									<Checkbox 
										className="xl"
										name="is_ute"
										checked={data.is_ute}
										onChange={(e) => setData('is_ute', e.target.checked)}
									/>

									<InfoPopover code="company-ute" style={{ left: 'calc(50% + 13px)', top: '8px' }}/>
								</div>
							</div>
                        </div>

						{/* Auto-vincularse a empresa */}
						<div className="col-lg-2 text-center">
							<div>
								<label htmlFor="auto_link" className="form-label">{ __('vincularse') }</label>
								<div className='pt-1 position-relative'>
									<Checkbox 
										className="xl"
										name="auto_link"
										checked={data.auto_link}
										onChange={(e) => setData('auto_link', e.target.checked)}
									/>
								</div>
								<InfoPopover code="company-auto-link" style={{ left: 'calc(50% + 13px)', top: '8px' }}/>
							</div>	
						</div>

						{/* Logo */}
						<div className="col-lg-6">
							<div>
    							<label htmlFor="logo" className="form-label">{ __('logo') }</label>
								<FileInput 
									name="logo"
									accept="image/*"
    								onChange={handleChange}
    								error={errors.logo} 
								/>
							</div>
							<p className='pt-1 text-warning small'>
								<span className='me-5'>{ __('imagen_formato') }</span>
								<span className='me-5'>{ __('imagen_peso_max') }: 1MB</span>
								{ __('imagen_medidas_recomendadas') }: 400x400px
							</p>
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