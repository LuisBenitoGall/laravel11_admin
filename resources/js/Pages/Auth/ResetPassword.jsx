import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

//Components:
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
//import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ResetPassword({ token, email }) {
    const __ = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={__('contrasena_recuperar')} />

            <div className="auth-page-content overflow-hidden pt-lg-5" id="auth-page">
                <div className="container">
                    <div className="row mt-5 mt-lg-0">
                        <div className="col-lg-12">
                            <div className="card overflow-hidden galaxy-border-none card-bg-fill">
                                <div className="row justify-content-center g-0">
                                    {/* Left column */}
                                    <div className="col-lg-6 left-column">
                                        <div className="p-lg-5 p-4 auth-one-bg h-100">
                                            <div className="bg-overlay"></div>
                                            <div className="position-relative h-100 d-flex flex-column"></div>
                                        </div>
                                    </div>

                                    {/* Right column */}
                                    <div className="col-lg-6">
                                        <div className="p-lg-5 p-4">
                                            <div>
                                                <h5 className="text-primary text-bold">{__('contrasena_recuperar')}</h5>
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
                                                        autoComplete="new-password"
                                                        isFocused={true}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                    />

                                                    <InputError message={errors.password} className="mt-2" />
                                                </div>

                                                <div className="mt-4">
                                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />

                                                    <TextInput
                                                        type="password"
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        value={data.password_confirmation}
                                                        className="mt-1 block w-full"
                                                        autoComplete="new-password"
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    />

                                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                                </div>

                                                <div className="flex items-center justify-end mt-4">
                                                    <SecondaryButton                  type="submit"
                                                        className="ms-4"
                                                        disabled={processing}
                                                    >
                                                        { __('enviar') }
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
