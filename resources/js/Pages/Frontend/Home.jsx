import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

//Components:

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Home(){
    const __ = useTranslation();
    
    return(
        <GuestLayout>
            <Head title='Home' />

            <div className="container-fluid p-0">
                <div className="row g-0">
                    <div className="col-12">
                        <main className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', backgroundColor: '#2f3f4a' }}>
                            <div className="text-center text-white">
                                <h2 className="mb-4 text-white" style={{ letterSpacing: '2px', fontWeight: 400 }}>AMDT Admin Systems</h2>
                                <img src={'/img/logo-amdt.png'} alt="AMDT" className="img-fluid mb-4" style={{ maxWidth: '260px', objectFit: 'contain' }} />

                                
                                <div>
                                    <Link href={route('login')} className="btn btn-info btn-lg me-2">{__('login')}</Link>
                                    <Link href={route('register')} className="btn btn-outline-info btn-lg">{__('registro')}</Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

        </GuestLayout>
    );
}