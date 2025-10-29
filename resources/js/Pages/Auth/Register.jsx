import { Head, Link, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

//Components:
import AuthLeftColumn from '@/Components/AuthLeftColumn';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
//import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Register({ status }) {
    const __ = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={__('registro')} />

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
                                                <h5 className="text-primary text-bold mb-4">{__('registrate_texto')}</h5>
                                            </div>

                                            <form onSubmit={submit}>
                                                <div>
                                                    <InputLabel htmlFor="name" value={__('nombre')} />

                                                    <TextInput
                                                        id="name"
                                                        name="name"
                                                        value={data.name}
                                                        className="mt-1 block w-full"
                                                        autoComplete="name"
                                                        isFocused={true}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        required
                                                    />

                                                    <InputError message={errors.name} className="mt-2" />
                                                </div>

                                                <div className="mt-4">
                                                    <InputLabel htmlFor="email" value={__('email')} />

                                                    <TextInput
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        value={data.email}
                                                        className="mt-1 block w-full"
                                                        autoComplete="username"
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        required
                                                    />

                                                    <InputError message={errors.email} className="mt-2" />
                                                </div>

                                                <div className="mt-4">
                                                    <InputLabel htmlFor="password" value={__('contrasena')} />

                                                    <TextInput
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        value={data.password}
                                                        className="mt-1 block w-full"
                                                        autoComplete="new-password"
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        required
                                                    />

                                                    <InputError message={errors.password} className="mt-2" />
                                                </div>

                                                <div className="mt-4">
                                                    <InputLabel htmlFor="password_confirmation" value={__('contrasena_confirmar')} />

                                                    <TextInput
                                                        id="password_confirmation"
                                                        type="password"
                                                        name="password_confirmation"
                                                        value={data.password_confirmation}
                                                        className="mt-1 block w-full"
                                                        autoComplete="new-password"
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        required
                                                    />

                                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                                </div>

                                                <div className="flex items-center justify-end mt-4 mb-4">
                                                    <Link
                                                        href={route('login')}
                                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        {__('tengo_cuenta')}
                                                    </Link>

                                                    <SecondaryButton 
                                                        type='submit'
                                                        className="ms-4" 
                                                        disabled={processing}
                                                    >
                                                        {__('registro')}
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
