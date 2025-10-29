import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

//Components:
import AuthLeftColumn from '@/Components/AuthLeftColumn';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
//import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ConfirmPassword() {
    const __ = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={__('contrasena_confirmar')} />

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
                                                <h5 className="text-primary text-bold">{__('contrasena_confirmar_texto')}</h5>
                                            </div>

                                            <form onSubmit={submit}>
                                                <div className="mt-4">
                                                    <InputLabel htmlFor="password" value={__('contrasena')} />

                                                    <TextInput
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        value={data.password}
                                                        className="mt-1 block w-full"
                                                        isFocused={true}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                    />

                                                    <InputError message={errors.password} className="mt-2" />
                                                </div>

                                                <div className="flex items-center justify-end mt-4">
                                                    <SecondaryButton
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        { __('confirmar') }
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
            