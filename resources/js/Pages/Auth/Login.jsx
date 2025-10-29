import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

//Components:
import AuthLeftColumn from '@/Components/AuthLeftColumn';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
//import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Login({ status, canResetPassword }) {
    const { APP_NAME } = usePage().props;
    const { APP_FULL_NAME } = usePage().props;
    const __ = useTranslation();
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    useEffect(() => {
        if (status) {
            alert(status);
        }
    }, [status]);

    return (
        <GuestLayout>
            <Head title="Login" />

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
                                                <h5 className="text-primary text-bold">{ APP_NAME }</h5>
                                                {/* <p className="text-muted">Enter your password to unlock the screen!</p> */}
                                            </div>

                                            <form onSubmit={submit}>
                                                <div>
                                                    <InputLabel htmlFor="email" value="Email" />

                                                    <TextInput
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        value={data.email}
                                                        className="mt-1 block w-full"
                                                        autoComplete="username"
                                                        isFocused={true}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                    />

                                                    <InputError message={errors.email} className="mt-2" />
                                                </div>

                                                <div className="mt-4">
                                                    <InputLabel htmlFor="password" value="Password" />

                                                    <TextInput
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        value={data.password}
                                                        className="mt-1 block w-full"
                                                        autoComplete="current-password"
                                                        onChange={(e) => setData('password', e.target.value)}
                                                    />

                                                    <InputError message={errors.password} className="mt-2" />
                                                </div>

                                                <div className="block mt-4">
                                                    <label className="flex items-center">
                                                        <Checkbox
                                                            name="remember"
                                                            checked={data.remember}
                                                            onChange={(e) => setData('remember', e.target.checked)}
                                                        />
                                                        <span className="ms-2 text-sm text-gray-600">{ __('recordarme') }</span>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-end mt-4">
                                                    {canResetPassword && (
                                                        <Link
                                                            href={route('password.request')}
                                                            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            { __('contrasena_olvidada') }
                                                        </Link>
                                                    )}

                                                    <SecondaryButton
                                                        type="submit"
                                                        className="ms-4"
                                                        disabled={processing}
                                                    >
                                                        { __('login') }
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
