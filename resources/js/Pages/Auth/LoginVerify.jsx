import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function LoginVerify({ email, status }) {
    const __ = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login.verify.store'));
    };

    return (
        <GuestLayout>
            <Head title={__('verificar_acceso')} />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h1 className="h4 mb-3 text-center">
                                    Verificación de acceso
                                </h1>

                                {email && (
                                    <p className="text-muted small text-center mb-3">
                                        Hemos enviado un código a <strong>{email}</strong>.
                                    </p>
                                )}

                                {status && (
                                    <div className="alert alert-info py-2 small">
                                        {status}
                                    </div>
                                )}

                                {errors.code && (
                                    <div className="alert alert-danger py-2 small">
                                        {errors.code}
                                    </div>
                                )}

                                <form onSubmit={submit}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Código de verificación
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            autoFocus
                                            autoComplete="one-time-code"
                                        />
                                        <div className="form-text">
                                            Introduce el código de 6 dígitos que te hemos enviado por email.
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={processing}
                                    >
                                        {processing ? 'Verificando…' : 'Acceder'}
                                    </button>
                                </form>

                                <p className="mt-3 mb-0 text-center">
                                    <a href={route('login')} className="small">
                                        Volver al inicio de sesión
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
