import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Container } from "react-bootstrap";

import Header from '../../Pages/Admin/Partials/Header';
import Sidebar from '../../Pages/Admin/Partials/Sidebar';

//Components:
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashMessage from '@/Components/FlashMessage';
import ModalCompaniesSession from '@/Components/modals/ModalCompaniesSession';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function AdminAuthenticated({ 
    user, 
    title, 
    subtitle, 
    actions, 
    header, 
    children 
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const sessionData = props.sessionData || {};

    const currentCompany = sessionData?.currentCompany || false; 
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showModalCompaniesSession, setShowModalCompaniesSession] = useState(!currentCompany);
    //const [selectedCompany, setSelectedCompany] = useState([null]);
    const [selectedId, setSelectedId] = useState(null);

    const companySettings = sessionData?.companySettings || false;
    const companies = sessionData?.companies || [];
    const companyModules = sessionData?.companyModules || false;

    //Hook de formulario con `useForm`:
    const { data, setData, post, processing } = useForm({
        selectedCompany: null,
    });         
    const { showAlert, showConfirm } = useSweetAlert();

    //Modal selector empresas:
    useEffect(() => {
        if (!currentCompany) {
            // Anticipamos CSRF + sesión (ya lo tienes en bootstrap.js)
            setTimeout(() => setShowModalCompaniesSession(true), 200);
        }
    }, [currentCompany]);

    //Seleccionar empresa:
    const handleCheckboxChange = (companyId) => {
        setData("selectedCompany", companyId);
    };

    //Mostrar modal:
    const handleShowModal = () => {
        setShowModalCompaniesSession(true);
    };

    //Cerrar modal:
    const handleCloseModal = () => {
        setShowModalCompaniesSession(false);
    };

    //Envío formulario selección empresa:
    const swal_text = __('empresa_selec_aviso');
	const selectCompanySubmit = async (e) => {
        e.preventDefault();        

        if (!selectedId) {
            showAlert("Error", swal_text, "error");
            return;
        }

        try {
            await axios.post(route('companies.select'), { selectedCompany: selectedId });
            setShowModalCompaniesSession(false);
            router.reload({ preserveState: false, preserveScroll: true });
        } catch (err) {
            showAlert('Error', __('empresa_selec_aviso'), 'error');
        }
    };

    return (
        // <div id="app">
            // <StrictMode>
                <div id="layout-wrapper">
                    {/* Header */}
                    <Header 
                        title={title} 
                        subtitle={subtitle} 
                        user={user} 
                        actions={actions} 
                        companies={companies} 
                        current_company={currentCompany} 
                    />

                    {/* Sidebar */}
                    <Sidebar/>
                    
                    {/* Main Content */}
                    <div className="main-content">
                        <div className="page-content">

                            {/* <pre>{JSON.stringify(currentCompany, null, 2)}</pre>

                            <pre>{JSON.stringify(companySettings, null, 2)}</pre>

                            <pre>{JSON.stringify(companies, null, 2)}</pre> */}

                            <main>
                                {/* Mensajes */}
                                <FlashMessage type="success" message={props.msg} />
                                <FlashMessage type="danger" message={props.alert} />
                                
                                {children}
                            </main>
                        </div>
                    </div>

                    {/* Modals */}
                    {/* Modal company session */}
                    
                </div>
            // </StrictMode>
        // </div>
    );
}