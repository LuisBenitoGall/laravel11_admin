import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import CompanyFormCreate from '@/Components/CompanyFormCreate';
import CompanyFormSearch from '@/Components/CompanyFormSearch';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, side, other_companies, availableLocales }){
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
		is_ute: false,
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
		post(route('customers.store'), {
			onSuccess: () => reset()
		})
	}

	//Acciones:
	const actions = [];
    if (permissions?.['providers.index']) {
		actions.push({
            text: __('proveedores_volver'),
            icon: 'la-angle-left',
			url: 'providers.index',
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
                <p className="text-warning">{__('empresa_selec_texto')}</p>

                {/* Formulario seleccionar cliente */}
                <CompanyFormSearch 
                    side={side} 
                    options={other_companies.map(company => ({ value: company.id, label: company.name }))} 
                />

                <div className="py-3">
                    <hr />
                </div>
                <h5>{__('empresa_nueva')}</h5>

				{/* Formulario nuevo proveedor */}
				<CompanyFormCreate side={side} />
			</div>
		</AdminAuthenticatedLayout>
	);
}