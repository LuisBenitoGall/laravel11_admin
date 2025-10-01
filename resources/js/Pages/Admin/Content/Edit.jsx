import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { addYears, format } from 'date-fns';
import * as locales from 'date-fns/locale';

//Components:
import Checkbox from '@/Components/Checkbox';
import Copyable from '@/Components/Copyable';
import DatePickerToForm from '@/Components/DatePickerToForm';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import Tabs from '@/Components/Tabs';
import TabsLocale from '@/Components/TabsLocale';
import TagSelect from '@/Components/TagSelect';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, availableLocales, content_, titles, tags, excerpts, contents }) {
    //Set formulario:
    const localizedDefaults = Object.fromEntries(
        availableLocales.flatMap(code => {
            // PARSEAR title/excerpt/content como antes:
            const t0 = titles?.[code]   ?? '';
            const e0 = excerpts?.[code] ?? '';
            const c0 = contents?.[code] ?? '';

            // PARA TAGS, parsea JSON o array nativo:
            let parsedTags = [];
            const raw = tags?.[code];
            if (Array.isArray(raw)) {
                parsedTags = raw;
            } else if (typeof raw === 'string') {
                try {
                    parsedTags = JSON.parse(raw);
                } catch (err) {
                    parsedTags = [];
                    console.warn(`No pude parsear tags_${code} =`, raw);
                }
            }

            return [
                [`title_${code}`,   t0],
                [`tags_${code}`,    parsedTags],
                [`excerpt_${code}`, e0],
                [`content_${code}`, c0]
            ];
        })
    );

    const { data, setData, errors, processing, post } = useForm({
        name: content_.name || '',
        status: content_.status,
        published_at: content_.published_at || null,
        published_end: content_.published_end || null,
        observations: content_.observations || '',
        ...localizedDefaults
    });

    const publishedAt = data.published_at
    ? new Date(data.published_at)
    : null;
    const publishedEnd = data.published_end
    ? new Date(data.published_end)
    : null;

    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};
    const datepickerFormat = props.languages?.[locale]?.[6] || 'dd/MM/yyyy';

    //Validación fechas de publicación:
    const localErrors = {};
    if(publishedAt){
        if (!publishedEnd) localErrors.published_end = 'Fecha fin obligatoria';
        else if (publishedEnd < publishedAt)
        localErrors.published_end = 'Fecha fin anterior a inicio';
    }

    const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files.length ? files[0] : null);
        } else {
            setData(name, value);
        }
    };

    //Confirmación de eliminación:
    const { handleDelete } = useHandleDelete('contenido', 'contents.destroy', [content_.id]);

    // Envío formulario:
	function handleSubmit(e) {
        e.preventDefault();

        //Si hay errores en las fechas, no se envía el formulario:
        if(localErrors.published_end){
            return;
        }

        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'logo' && value instanceof File) {
                formData.append(key, value);
            } 
            else if (value instanceof Date) {
                // Envía la fecha como ISO (sin comillas extra)
                formData.append(key, value.toISOString());
            }
            else if (value === null) {
                // publicados a null → enviamos cadena vacía para que llegue al back
                formData.append(key, '');
            }
            else if (typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            }
            else {
                formData.append(key, value);
            }
        });

        router.post(route('contents.update', content_.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Contenido actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['contents.index']) {
        actions.push({
            text: __('contenidos_volver'),
            icon: 'la-angle-left',
            url: 'contents.index',
            modal: false
        }); 
    }

    if (permissions?.['contents.create']) { 
        actions.push({
            text: __('contenido_nuevo'),
            icon: 'la-plus',
            url: 'contents.create',
            modal: false
        });
    }

    if (permissions?.['contents.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'contents.destroy',
            params: [content_.id],
            title: __('contenido_eliminar'),
            message: __('contenido_eliminar_confirm'),
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
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('contenido')} <u>{ content_.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{content_.formatted_created_at}</strong> 
                        </span>

                        {content_.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{content_.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{content_.formatted_updated_at}</strong>
                        </span>

                        {content_.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{content_.updated_by_name}</strong>
                            </span>
                        )}
                    </div>
                </div>

				{/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Código */}
                        <div className="col-lg-4">
                            <div>
                                <label htmlFor="code" className="form-label">{ __('codigo') }</label>
                                {/* <div className="wrap-copy">{content_.code}</div> */}
                                <Copyable code={content_.code} />
                            </div>
                        </div>

                        {/* Nombre */}
                        <div className="col-lg-8">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('nombre') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('contenido_nombre')} 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={100}
                                />

                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Inicio publicación */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="published_at" className="form-label">{ __('fecha_publicacion') }</label>
                                <DatePickerToForm
                                    id="published_at"
                                    name="published_at"
                                    selected={data.published_at ? new Date(data.published_at) : null}
                                    onChange={(name, date) => {
                                        setData(name, date);
                                        if (!date) {
                                            setData('published_end', null);
                                        }
                                    }}
                                    dateFormat={datepickerFormat}
                                />   

                                <InputError message={errors.published_at} />             
                            </div>
                        </div>

                        {/* Fin publicación */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="published_end" className="form-label">{ __('publicacion_fin') }</label>
                                <DatePickerToForm
                                    id="published_end"
                                    name="published_end"
                                    selected={data.published_end ? new Date(data.published_end) : null}
                                    onChange={setData}
                                    minDate={data.published_at ? new Date(data.published_at) : null}
                                    dateFormat={datepickerFormat}
                                />    

                                {/* <InputError message={errors.published_end} /> */}
                                <InputError message={localErrors.published_end || errors.published_end} />
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="col-lg-2 text-center">
                            <div className="position-relative">
                                <label htmlFor="status" className="form-label">{ __('contenido_activo') }</label>
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

                        {/* Observaciones */}
                        <div className="col-12 mt-4">
                            <div>
                                <label htmlFor="observations" className="form-label">{ __('observaciones') }</label>
                                <Textarea
                                    id="observations"
                                    name="observations"
                                    value={data.observations}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                                
                                <InputError message={errors.observations} />
                            </div>
                        </div>           

                        {/* Contenidos multiidioma */}
                        <div className="col-12 mt-4">
                            <TabsLocale availableLocales={availableLocales} languages={languages}>
                                {locale => {
                                    const humanName = Array.isArray(languages[locale])
                                        ? languages[locale][3]
                                        : locale;

                                    const fieldTitle = `title_${locale}`;
                                    const fieldTags = `tags_${locale}`;
                                    const fieldExcerpt = `excerpt_${locale}`;
                                    const fieldContent = `content_${locale}`;
                                
                                return (
                                    <div key={locale} className="row">
                                        {/* Título: */}
                                        <div className="col-12 mb-3">
                                            <label
                                            htmlFor={fieldTitle}
                                            className="form-label"
                                            >
                                                {__('titulo')} {humanName}
                                            </label>
                                            <TextInput 
                                                id={fieldTitle}
                                                name={fieldTitle}
                                                className="" 
                                                type="text"
                                                value={data[fieldTitle] || ''} 
                                                onChange={(e) => setData(fieldTitle, e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                                maxLength={150}
                                            />
                                        </div>

                                        {/* Tags */}
                                        <div className="col-12 mb-3">
                                            <label
                                            htmlFor={fieldTags}
                                            className="form-label"
                                            >
                                                {__('tags')} {humanName}
                                            </label>
                                            <TagSelect
                                                value={Array.isArray(data[fieldTags]) ? data[fieldTags] : []}
                                                onChange={(tags) => setData(fieldTags, tags)}
                                            />
                                            <InputError message={errors.tags_es} />
                                        </div>

                                        {/* Destacado */}
                                        <div className="col-12 mb-3">
                                            <label
                                            htmlFor={fieldExcerpt}
                                            className="form-label"
                                            >
                                                {__('destacado')} {humanName}
                                            </label>
                                            <Textarea
                                                id={fieldExcerpt}
                                                name={fieldExcerpt}
                                                value={data[fieldExcerpt] || ''}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>

                                        {/* Contenido: */}
                                        <div className="col-12 mb-3">   
                                            <label
                                            htmlFor={fieldContent}
                                            className="form-label"
                                            >
                                            {__('contenido')} {humanName}
                                            </label>
                                            <Textarea
                                                //key={fieldContent}
                                                id={fieldContent}
                                                name={fieldContent}
                                                value={data[fieldContent] ?? ''}
                                                wysiwyg = {true}
                                                onChange={(e) => setData(fieldContent, e.target.value)}
                                                className=""
                                            />
                                            <InputError
                                            message={errors[fieldContent]}
                                            />
                                        </div>
                                    </div>
                                )}}
                            </TabsLocale>
                        </div>
                    </div>

                    <div className='mt-4 text-end'>
                        <PrimaryButton 
                            disabled={processing || Boolean(localErrors.published_end)}
                            className='btn btn-rdn'>
                            {processing ? __('procesando')+'...':__('guardar')}
                        </PrimaryButton>	
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}