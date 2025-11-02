import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useMemo, useState } from 'react';

//Components:
import Portal from '@/Components/Portal';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalIvaAccountCreate from '@/Components/modals/ModalIvaAccountCreate';

export default function IvaAccountsIndex({ auth, session, title, subtitle, ivaTypes = [], ivaAccounts = [], usages = [], availableLocales }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};
    const natureLabels = props.natureLabels || {};
    const { showConfirm } = useSweetAlert();

    //Confirmación de generación masiva:
    const handleBulkGenerate = () => {
        showConfirm({
            title: __('generacion_masiva'),
            text: __('generacion_masiva_iva_confirm'), 
            icon: 'warning',
            // confirmText: __('si_generar'),
            // cancelText: __('cancelar'),
            onConfirm: () => {
                router.post(route('accounting-accounts.iva-bulk-generate'), {}, {
                    preserveScroll: true,
                });
            },
        });
    };

    const actions = [];
    if (permissions?.['accounting-accounts.index']) {
        actions.push({ key: 'back', text: __('cuentas_volver'), icon: 'la-angle-left', url: 'accounting-accounts.index' });
    }
    if (permissions?.['accounting-accounts.create']) {
        actions.push({ key: 'bulk', text: __('generacion_masiva'), icon: 'la-plus', modal: true, onClick: handleBulkGenerate });
    }

    // Index rápidos
    const accountsById = useMemo(() => {
        const map = {};
        (ivaAccounts || []).forEach(a => { map[a.id] = a; });
        return map;
    }, [ivaAccounts]);

    const usageByIvaAndSide = useMemo(() => {
        const map = {};
        (usages || []).forEach(u => {
        if (!map[u.iva_type_id]) map[u.iva_type_id] = {};
        map[u.iva_type_id][u.side] = u;
        });
        return map;
    }, [usages]);

    // Estado general de intención
    const [intent, setIntent] = useState(null);
    const openIntent = (type, ivaType, side, usage = null) => setIntent({ type, ivaType, side, usage });
    const closeIntent = () => setIntent(null);

    // helper para porcentaje sano
    function safeRate(t) {
        const raw = t?.iva ?? t?.rate ?? 0;
        // Soporta "21", "21.00", "21,00"
        const num = Number.parseFloat(String(raw).replace(',', '.'));
        return Number.isFinite(num) ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0;
    }

    const SideCell = ({ ivaType, side }) => {
        const usage = usageByIvaAndSide?.[ivaType.id]?.[side];
        const account = usage ? accountsById[usage.account_id] : null;

        return (
            <>
            <td className="align-middle">
                {usage && account ? (
                    <div className="d-flex flex-column">
                    <span className="fw-semibold">
                        {/* {side === 'output' ? __('iva_ventas_repercutido') : __('iva_compras_soportado')}  */}
                        {account.name}
                        {/* {safeRate(ivaType)}%{account.code ? ` - ${account.code}` : ''} */}
                        {account.code ? ` - ${account.code}` : ''}
                    </span>
                    {/* <small className="text-muted">{account.name}</small> */}
                    </div>
                ) : (
                    <span className="text-muted">{__('sin_cuenta_asignada')}</span>
                )}
            </td>
            <td className="align-middle">
                {account ? (
                    <span className="badge bg-secondary">{natureLabels[account.nature] ?? '—'}</span>
                ) : (
                    <span className="text-muted">—</span>
                )}
            </td>
            <td className="align-middle">
                <div className="btn-group btn-group-sm text-end" role="group">
                    {!usage && (
                    <>
                        <button
                        type="button"
                        className="btn btn-info text-white"
                        data-tooltip-id="tips"
                        data-tooltip-content={__('cuenta_nueva')}
                        onClick={() => openIntent('create', ivaType, side)}
                        >
                        <i className="la la-plus" />
                        </button>

                        <button
                        type="button"
                        className="btn btn-secondary text-white"
                        data-tooltip-id="tips"
                        data-tooltip-content={__('cuenta_selec')}
                        onClick={() => openIntent('assign', ivaType, side)}
                        >
                        <i className="la la-gear" />
                        </button>
                    </>
                    )}

                    {usage && (
                    <>
                        <Link
                            href={route('accounting-accounts.edit', account.id)}
                            className="btn btn-info text-white"
                            data-tooltip-id="tips"
                            data-tooltip-content={__('cuenta_editar')}
                        >
                            <i className="la la-edit" />
                        </Link>

                        <button
                        type="button"
                        className="btn btn-danger"
                        data-tooltip-id="tips"
                        data-tooltip-content={__('vinculacion_eliminar')}
                        onClick={() => openIntent('delete', ivaType, side, usage)}
                        >
                        <i className="la la-trash" />
                        </button>
                    </>
                    )}
                </div>
            </td>
        </>
        );
    };

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents pb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted">
                        {__('cuentas_iva_texto')}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '20%' }}>IVA</th>
                                <th style={{ width: '22%' }}>{__('ventas_repercutido')}</th>
                                <th style={{ width: '8%' }}>{__('tipo')}</th>
                                <th style={{ width: '10%' }} className="text-center">{__('acciones')}</th>
                                <th style={{ width: '22%' }}>{__('compras_soportado')}</th>
                                <th style={{ width: '8%' }}>{__('tipo')}</th>
                                <th style={{ width: '10%' }} className="text-center">{__('acciones')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ivaTypes.map((t, idx) => (
                                <tr key={t?.id ?? `iva-${t?.iva ?? 'x'}-${idx}`}>
                                    <td className="fw-semibold">{`${t?.name ?? ''} - ${safeRate(t)}%`}</td>
                                    <SideCell ivaType={t} side="output" />
                                    <SideCell ivaType={t} side="input" />
                                </tr>
                            ))}
                            {ivaTypes.length === 0 && (
                                <tr>
                                <td colSpan={7} className="text-center text-muted py-4">
                                    {__('sin_registros')}
                                </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Tooltip id="tips" place="top" />

                <Portal>
                    {/* MODAL: Crear cuenta nueva y vincular */}
                    <ModalIvaAccountCreate
                        show={intent?.type === 'create'}
                        onClose={closeIntent}
                        ivaType={intent?.ivaType}
                        side={intent?.side}
                    />
                </Portal>
            </div>
        </AdminAuthenticatedLayout>
    );
}
