import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Components
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXTENSIONS = ['.xls', '.xlsx'];

export default function Import({ auth, title, permissions = {}, templateUrl, import_result }) {
    const __ = useTranslation();
    const { props } = usePage();
    const serverErrors = props?.errors || {};
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [validationError, setValidationError] = useState('');

    const actions = [
        { text: __('contactos_volver'), icon: 'la-angle-left', url: 'crm-contacts.index', modal: false },
    ];

    const validateFile = (f) => {
        if (!f) {
            setValidationError(__('import_archivo_requerido'));
            return false;
        }
        const name = (f.name || '').toLowerCase();
        const ok = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
        if (!ok) {
            setValidationError(__('import_formato_invalido'));
            return false;
        }
        if (f.size > MAX_SIZE_BYTES) {
            setValidationError(__('import_tamano_maximo'));
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        setFile(f || null);
        setValidationError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateFile(file)) return;
        setProcessing(true);
        router.post(route('crm-contacts.import.store'), { file }, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminAuthenticatedLayout user={auth?.user} title={title} subtitle={__('contactos_importar')} actions={actions}>
            <Head title={title} />

            <div className="contents">
                <p className="text-muted mb-4">
                    {__('import_condiciones_texto')}
                </p>

                <div className="mb-4 d-flex flex-wrap gap-2">
                    {/* Template .xls */}
                    <a href={templateUrl} className="btn btn-outline-primary" download>
                        <i className="la la-download me-1" />
                        {__('import_descargar_plantilla')}
                    </a>

                    {/* <a href={route('crm-contacts.import.sample')} className="btn btn-outline-secondary" download>
                        <i className="la la-file-excel me-1" />
                        {__('import_descargar_muestra')}
                    </a> */}
                </div>

                <form onSubmit={handleSubmit} className="card card-body mb-4">
                    <div className="mb-3">
                        <label className="form-label">{__('import_seleccionar_archivo')}</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".xls,.xlsx"
                            onChange={handleFileChange}
                            disabled={processing}
                        />
                        <InputError message={validationError || serverErrors?.file} />
                    </div>
                    <PrimaryButton type="submit" disabled={processing || !file}>
                        {processing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                {__('import_procesando')}
                            </>
                        ) : (
                            __('import_subir')
                        )}
                    </PrimaryButton>
                </form>

                {import_result && (
                    <div className={`alert ${import_result.success ? 'alert-success' : 'alert-warning'}`}>
                        <h6 className="alert-heading">
                            {import_result.success ? __('import_resultado_exito') : __('import_resultado_parcial')}
                        </h6>
                        <p className="mb-0">
                            {__('import_total_procesados')}: <strong>{import_result.total_processed}</strong>
                            {import_result.total_failed > 0 && (
                                <> · {__('import_total_no_procesados')}: <strong>{import_result.total_failed}</strong></>
                            )}
                        </p>
                    </div>
                )}

                {import_result?.failed_rows?.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                            {__('import_filas_no_procesadas')}
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-sm table-striped mb-0">
                                    <thead>
                                        <tr>
                                            <th>{__('import_fila')}</th>
                                            <th>{__('import_motivo')}</th>
                                            <th>{__('import_datos')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {import_result.failed_rows.map((fr, idx) => (
                                            <tr key={idx}>
                                                <td>{fr.row}</td>
                                                <td>{fr.reason}</td>
                                                <td>
                                                    <small className="text-muted">
                                                        {typeof fr.data === 'object' ? JSON.stringify(fr.data) : String(fr.data)}
                                                    </small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminAuthenticatedLayout>
    );
}
