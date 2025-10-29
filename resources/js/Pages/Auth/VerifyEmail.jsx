import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

//Components:
import AuthLeftColumn from '@/Components/AuthLeftColumn';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
//import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function VerifyEmail({ status }) {
    const __ = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={__('email_verificacion')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {__('email_verificacion_enviado')}
                </div>
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
                                                <h5 className="text-primary text-bold">{__('email_verificacion_texto')}</h5>
                                            </div>

                                            <form onSubmit={submit}>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <SecondaryButton 
                                                        type='submit'
                                                        disabled={processing}
                                                    >
                                                        {__('email_verificacion_reenviar')}
                                                    </SecondaryButton>

                                                    <Link
                                                        href={route('logout')}
                                                        method="post"
                                                        as="button"
                                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Log Out
                                                    </Link>
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
