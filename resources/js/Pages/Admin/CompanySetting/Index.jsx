import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

//Components:
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
//import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, companies, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Acciones:
    const actions = [];

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            <div className="contents">


            
            </div>
        </AdminAuthenticatedLayout>
    );
}