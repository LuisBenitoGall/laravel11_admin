import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';

// Components:
import ActiveFiltersLegend from '@/Components/ActiveFiltersLegend';
import AdHocFiltersDropdown from '@/Components/AdHocFiltersDropdown';
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import { SortControl } from '@/Components/SortControl';
import SpinnerInline from '@/Components/SpinnerInline';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

// Hooks:
import { useInertiaLoading } from '@/Hooks/useInertiaLoading';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

// Partials:
import CrmAccountShowView from '@/Pages/Admin/CrmAccount/Partials/CrmAccountShowView';

// Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

export default function Index({
  auth,
  session,
  title,
  subtitle,
  accounts,
  queryParams: rawQueryParams = {},
  availableLocales,
}) {
  const __ = useTranslation();
  const { props } = usePage();

  const queryParams = (rawQueryParams && typeof rawQueryParams === 'object') ? rawQueryParams : EMPTY_OBJ;

  // 🔽 vienen del backend
  const adhocFilters = props.adhocFilters ?? EMPTY;
  const legendItems = props.activeFiltersLegend || [];
  const hasActiveFilters = legendItems.length > 0;

  const indexRouteName = 'crm-accounts.index';
  const indexRouteParams = {};

  const { loading } = useInertiaLoading();

  // Columna Show Register
  const [showId, setShowId] = useState(null);
  const [showPanelOpen, setShowPanelOpen] = useState(false);

  const handleShowRegister = (row) => {
    setShowId(row.id);
    setShowPanelOpen(true);
  };

  const handleCloseShowPanel = () => {
    setShowPanelOpen(false);
    setShowId(null);
  };

  // Columnas:
  const columns = [
    { key: 'name', label: __('razon_social'), sort: true, filter: 'text', type: 'link', link: 'crm-accounts.edit', class_th: '', class_td: '', placeholder: __('razon_social_filtrar') },
    { key: 'tradename', label: __('nombre_comercial'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_comercial_filtrar') },
    { key: 'owner', label: __('propietario'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('propietario_filtrar') },
    { key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
  ];

  const {
    permissions,
    sortParams,
    perPage,
    setPerPage,
    visibleColumns,
    toggleColumnVisibility,
    SearchFieldChanged,
    sortChanged,
    filteredData,
    handleDelete,
  } = useTableManagement({
    table: 'tblCrmAccounts',
    allColumnKeys: columns.map(col => col.key),

    // 👉 Puedes dejar entityName como quieras, pero para exportar necesitamos esto sí o sí:
    entityName: 'crm-accounts',

    indexRoute: 'crm-accounts.index',
    destroyRoute: 'crm-accounts.destroy',
    filteredDataRoute: 'crm-accounts.filtered-data',

    // ✅ CRÍTICO: tu endpoint devuelve { accounts: ... }
    filteredDataKey: 'accounts',

    labelName: 'cuenta',
    queryParams,
  });

  // Acciones:
  const actions = [];
  if (permissions?.['crm-accounts.create']) {
    actions.push({
      text: __('cuenta_nueva'),
      icon: 'la-plus',
      url: 'crm-accounts.create',
      modal: false,
    });
  }

  return (
    <AdminAuthenticatedLayout
      user={auth.user}
      title={title}
      subtitle={subtitle}
      actions={actions}
    >
      <Head title={title} />

      <div className="contents">
        {/* Controles */}
        <div className="row">
          <div className="controls d-flex align-items-center">
            <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />

            <AdHocFiltersDropdown
              filters={adhocFilters}
              routeName={indexRouteName}
              routeParams={indexRouteParams}
              queryParams={queryParams}
            />

            <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />

            <TableExporter filename={__('empresas')} columns={columns} fetchData={filteredData} />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center my-2">
          <ActiveFiltersLegend
            items={legendItems}
            routeName={indexRouteName}
            routeParams={indexRouteParams}
            queryParams={queryParams}
          />
          {hasActiveFilters && loading ? (
            <SpinnerInline text={__('cargando') ?? 'Cargando…'} />
          ) : null}
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <Table className="table table-nowrap table-striped align-middle mb-0" id="tblCrmAccounts">
            <thead>
              <tr>
                <th className="text-center first-column">&nbsp;</th>

                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                  >
                    {/* ✅ col.label ya viene traducido */}
                    {col.label}

                    {col.sort && (
                      <SortControl
                        name={col.key}
                        sortable={true}
                        sort_field={queryParams.sort_field}
                        sort_direction={queryParams.sort_direction}
                        sortChanged={sortChanged}
                      />
                    )}
                  </th>
                ))}

                <th className="text-center">{__('acciones')}</th>
              </tr>
            </thead>

            <FilterRow
              columns={columns}
              queryParams={queryParams}
              visibleColumns={visibleColumns}
              SearchFieldChanged={SearchFieldChanged}
              PrependColumns={1}
            />

            <tbody>
              {accounts.data.map((account) => (
                <tr key={`account-${account.id}`}>
                  <td className="text-center">
                    <ShowRegisterButton onClick={() => handleShowRegister(account)} />
                  </td>

                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                    >
                      {renderCellContent(account[col.key], col, account)}
                    </td>
                  ))}

                  <td className="text-end">
                    {permissions?.['crm-accounts.edit'] && (
                      <OverlayTrigger
                        key={`status-${account.id}`}
                        placement="top"
                        overlay={
                          <Tooltip className="ttp-top">
                            {account.status == 1 ? __('empresa_activa') : __('empresa_inactiva')}
                          </Tooltip>
                        }
                      >
                        <StatusButton
                          status={account.status}
                          id={account.id}
                          updateRoute="crm-accounts.status"
                          reloadUrl={route('crm-accounts.index')}
                          reloadResource="crm-accounts"
                        />
                      </OverlayTrigger>
                    )}

                    {permissions?.['crm-accounts.edit'] && (
                      <OverlayTrigger
                        key={`edit-${account.id}`}
                        placement="top"
                        overlay={<Tooltip className="ttp-top">{__('editar')}</Tooltip>}
                      >
                        <Link href={route('crm-accounts.edit', account.id)} className="btn btn-sm btn-info ms-1">
                          <i className="la la-edit" />
                        </Link>
                      </OverlayTrigger>
                    )}

                    {permissions?.['crm-accounts.destroy'] && (
                      <OverlayTrigger
                        key={`delete-${account.id}`}
                        placement="top"
                        overlay={<Tooltip className="ttp-top">{__('eliminar')}</Tooltip>}
                      >
                        <span>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger ms-1"
                            onClick={() => handleDelete(account.id)}
                          >
                            <i className="la la-trash" />
                          </button>
                        </span>
                      </OverlayTrigger>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <ShowRegister
          id={showId}
          open={showPanelOpen}
          onClose={handleCloseShowPanel}
          routeName="crm-accounts.show"
          title={__('cuenta')}
          ViewComponent={CrmAccountShowView}
        />

        <Pagination
          links={accounts.meta.links}
          totalRecords={accounts.meta.total}
          currentPage={accounts.meta.current_page}
          perPage={accounts.meta.per_page}
          onPageChange={(page) => {
            router.get(route('crm-accounts.index'), {
              ...queryParams,
              page,
              per_page: perPage,
              sort_field: sortParams.sort_field,
              sort_direction: sortParams.sort_direction,
            }, { preserveState: true });
          }}
        />
      </div>
    </AdminAuthenticatedLayout>
  );
}
