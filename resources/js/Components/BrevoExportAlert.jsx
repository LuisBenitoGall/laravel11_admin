import SpinnerInline from '@/Components/SpinnerInline';

export default function BrevoExportAlert({ __, visible = false }) {
    if (!visible) {
        return null;
    }

    return (
        <div className="alert alert-info d-flex align-items-center mb-3" role="status">
            <SpinnerInline text={__('lista_export_brevo_en_proceso')} />
        </div>
    );
}
