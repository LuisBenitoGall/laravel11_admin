import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import ColorPicker from '@/Components/ColorPicker';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Tabs from '@/Components/Tabs';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalFunctionalityCreate from '@/Components/modals/ModalFunctionalityCreate';

//Partials:
import ModuleTab from './Partials/ModuleTab';
import FunctionalitiesTab from './Partials/FunctionalitiesTab';

export default function Index({ auth, session, title, subtitle, module_data, tab, levels, functionalities, availableLocales }){
	const __ = useTranslation();
	const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};
	const [activeTab, setActiveTab] = useState(tab || 'module');

	const levelsArray = Object.entries(levels || {}).map(([key, value]) => ({
		value: key,
		label: value
	}));

	//Set formulario:
	const {data, setData, put, reset, errors, processing} = useForm({
		name: module_data.name || '',
		level: module_data.level || '',
		label: module_data.label || '',  
		icon: module_data.icon || '',
		color: module_data.color || '',
		status: module_data.status,
		explanation: module_data.explanation || '',
	});

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

	//Envío formulario:
	function handleSubmit(e){
		e.preventDefault();
		put(route('modules.update', module_data.id),
		{
			preserveScroll: true,
			onSuccess: () => console.log('Movimiento actualizado'),
		});
	}

	//Modals:
	const [showModalFunctionalityCreate, setShowModalFunctionalityCreate] = useState(false);
	const [showModalFunctionalityEdit, setShowModalFunctionalityEdit] = useState(false);
	const [functionalityToEdit, setFunctionalityToEdit] = useState(null);

	//Modal handlers:
	const handleOpenModalFunctionalityCreate = () => setShowModalFunctionalityCreate(true);
	const handleCloseModalFunctionalityCreate = () => setShowModalFunctionalityCreate(false);
	const handleCreateFunctionality = (newFunc) => {
		// Aquí puedes recargar lista o actualizar localmente
		handleCloseModalFunctionalityCreate();
	};

	const handleOpenModalFunctionalityEdit = (func) => {
		setFunctionalityToEdit(func);
		setShowModalFunctionalityEdit(true);
	};

	const handleCloseModalFunctionalityEdit = () => {
		setFunctionalityToEdit(null);
		setShowModalFunctionalityEdit(false);
	};

	const handleUpdateFunctionality = (updatedFunc) => {
		// Actualiza la tabla
		handleCloseModalFunctionalityEdit();
	};

	//Refresh de tabla de funcionalidades: 
	const [refreshKey, setRefreshKey] = useState(0);
	const refreshFunctionalitiesTable = () => setRefreshKey(prev => prev + 1);

	//Acciones:
    const actions = [];
    if(permissions?.['modules.index']){
        actions.push({
            text: __('modulos_volver'),
            icon: 'la-angle-left',
            url: 'modules.index',
            modal: false
        });
    }

    if(permissions?.['modules.create']){
        actions.push({
            text: __('modulo_nuevo'),
            icon: 'la-plus',
            url: 'modules.create',
            modal: false
        });
    }

	if(permissions?.['modules.edit']){
        actions.push({
            text: __('funcionalidad_nueva'),
            icon: 'la-plus',
            url: '',
            modal: true,
			onClick: handleOpenModalFunctionalityCreate
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
                <div className="row">
                    <div className="col-12">
                        <h2 className="d-flex align-items-center gap-2">
							{__('modulo')}

							{module_data.icon && (
            					<i className={`la la-${module_data.icon} text-muted`} style={{ fontSize: '1.2em' }}></i>
        					)}

							<u>{ __(module_data.label) }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{module_data.formatted_created_at}</strong> 
                        </span>

						{module_data.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{module_data.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{module_data.formatted_updated_at}</strong>
                        </span>

						{module_data.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{module_data.updated_by_name}</strong>
                            </span>
                        )}
                    </div>
                </div>

				{/* Tabs */}
				<Tabs 
					tabs={[
						{
							key: 'module',
							label: __('modulo'),
							content: (
								<form onSubmit={handleSubmit}>
									<ModuleTab
										data={data}
										setData={setData}
										errors={errors}
										levelsArray={levelsArray}
										processing={processing}
										handleSubmit={handleSubmit}
									/>
								</form>
							)
						},
						{
							key: 'functionalities',
							label: __('funcionalidades'),
							content: (
								<FunctionalitiesTab 
									key={refreshKey}
									module_data={module_data} 
									functionalities={functionalities} 
    								onCreated={refreshFunctionalitiesTable}
									onDeleted={refreshFunctionalitiesTable}
									refreshKey={refreshKey}
								/>
							)
						}
					]}
					defaultActive={tab}
				/>

				{/* Modals */}
				<ModalFunctionalityCreate
					show={showModalFunctionalityCreate}
					onClose={handleCloseModalFunctionalityCreate}
					onCreate={refreshFunctionalitiesTable}
					moduleId={module_data.id}
				/>
			</div>
		</AdminAuthenticatedLayout>
	);
}