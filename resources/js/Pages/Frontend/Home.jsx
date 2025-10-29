import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { usePage } from '@inertiajs/react';

//Components:

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Home(){
    const { APP_NAME } = usePage().props;
    const { APP_FULL_NAME } = usePage().props;
    const __ = useTranslation();
    
    return(
        <GuestLayout>
            <Head title="Home" />

            <div className="container-fluid p-0">
                <div className="row g-0">
                    <div className="col-12">
                        <main className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', backgroundColor: '#fff' }}>
                            <div className="text-center">
                                <h2 className="mb-4" style={{ color: '#646464', letterSpacing: '2px', fontSize: '1.8rem', fontWeight: 400 }}>{APP_NAME}</h2>

                                <img src={'/img/logo/logo-rft-portrait.jpg'} alt={APP_FULL_NAME} className="img-fluid mb-4" style={{ maxWidth: '300px', objectFit: 'contain' }} />
                                
                                <div>
                                    <Link href={route('login')} className="btn btn-secondary btn-lg me-2">{__('login')}</Link>
                                    <Link href={route('register')} className="btn btn-outline-secondary btn-lg">{__('registro')}</Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

        </GuestLayout>
    );
}