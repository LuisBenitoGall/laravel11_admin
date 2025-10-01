import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { Container } from "react-bootstrap";
import Header from '../Pages/Frontend/Partials/Header';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Guest({ children }) {
    const __ = useTranslation();
    
    return (
        // <div id="app">
            <div className="layout-wrapper landing">
                {/* Header */}
                <Header />

                {/* Main Content */}
                {children}
            </div>
        // </div>
    );
}
