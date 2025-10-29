import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

//Components:
import AuthLeftColumn from '@/Components/AuthLeftColumn';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
//import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ForgotPassword({ status }) {
    const __ = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title={__('contrasena_recuperar')} />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
            {errors && errors.length > 0 && (
                <div className="mb-4 font-medium text-sm text-red-600">{errors[0]}</div>
            )}

            <div className="auth-page-content overflow-hidden pt-lg-5" id="auth-page">
                <div className="container">
                    <div className="row mt-5 mt-lg-0">
                        <div className="col-lg-12">
                            <div className="card overflow-hidden galaxy-border-none card-bg-fill">
                                <div className="row justify-content-center g-0">
                                    {/* Left column */}
                                    <AuthLeftColumn />

                                    {/* Right column */}
                                    <div className="col-lg-6">
                                        <div className="p-lg-5 p-4">
                                            <div>
                                                <h5 className="text-primary text-bold">{__('contrasena_olvidada_texto')}</h5>
                                            </div>    

                                            <form onSubmit={submit}>
                                                <div>
                                                    <InputLabel htmlFor="email" value={__('email')} />

                                                    <TextInput
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        value={data.email}
                                                        className="mt-1 block w-full"
                                                        isFocused={true}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                    />

                                                    <InputError message={errors.email} className="mt-2" />
                                                </div>

                                                <div className="flex items-center justify-end mt-4">
                                                    <Link
                                                        href={route('login')}
                                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        { __('login_volver') }
                                                    </Link>

                                                    <SecondaryButton
                                                        type="submit"
                                                        className="ms-4"
                                                        disabled={processing}
                                                    >
                                                        { __('contrasena_recuperar') }
                                                    </SecondaryButton>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
