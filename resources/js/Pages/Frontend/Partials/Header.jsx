import React from 'react';
import { Link } from '@inertiajs/react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Header() {
    const __ = useTranslation();
    
    return (
        <nav className="navbar navbar-expand-lg navbar-landing fixed-top job-navbar" id="navbar">
            <div className="container-fluid custom-container">
                {/* Logo */}
                <Link href="/" className="navbar-brand">
                    {/* <img src="/images/logo-dark.png" className="card-logo card-logo-dark" alt="logo dark" height="17"> */}
                    {/* <img src="/images/logo-light.png" className="card-logo card-logo-light" alt="logo light" height="17"></img> */}
                </Link>    
                
                {/* Responsive menu */}
                {/* <button className="navbar-toggler py-0 fs-20 text-body" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <i className="mdi mdi-menu"></i>
                </button> */}

                {/* Menu */}
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    {/* <ul className="navbar-nav mx-auto mt-2 mt-lg-0" id="navbar-example">
                        <li className="nav-item">
                            <Link href="/" className="nav-link active">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/" className="nav-link">{ __('sobre_nosotros') }</Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/" className="nav-link">{ __('contacta') }</Link>
                        </li>
                    </ul> */}

                    {/* Login & Register */}
                    {/* <div className="">
                        <Link href={route('login')} className="btn btn-soft-primary">
                            <i className="ri-user-3-line align-bottom me-1"></i> Login & Register
                        </Link>
                    </div> */}
                </div>
            </div>        
        </nav>
    );
}