import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import CompanyFormCreate from '@/Components/CompanyFormCreate';

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
		post(route('companies.store'), {
			onSuccess: () => reset()
		})
	}

	//Acciones:
	const actions = [];
    if (permissions?.['companies.index']) {
		actions.push({
            text: __('empresas_volver'),
            icon: 'la-angle-left',
			url: 'companies.index',
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
				<CompanyFormCreate />
			</div>
		</AdminAuthenticatedLayout>
	);
}