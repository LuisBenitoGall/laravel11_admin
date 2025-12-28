import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Comfort({ title, subtitle, intended, alert }) {
  const { props } = usePage();

  const message = alert || props.alert || 'Necesitas seleccionar una empresa activa para continuar.';

  return (
    <AdminAuthenticatedLayout
      user={props.auth?.user}
      title={title}
      subtitle={subtitle}
      actions={[]}
    >
      <Head title={title} />

      <div className="contents">
        <div className="alert alert-warning">
          <div className="fw-semibold mb-1">{message}</div>
          <div className="small text-muted">
            No pasa nada: selecciona una empresa y vuelves a donde estabas.
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {/* Ajusta esta ruta a tu “selector” real si ya lo tienes */}
          <Link className="btn btn-primary" href={route('companies.index')}>
            Ir a empresas
          </Link>

          {/* Si tienes una ruta específica tipo companies.refresh-session, úsala aquí */}
          {/* <Link className="btn btn-primary" href={route('companies.refresh-session')}>Seleccionar empresa</Link> */}

          {intended ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => router.visit(intended)}
            >
              Reintentar
            </button>
          ) : null}

          <Link className="btn btn-outline-secondary" href={route('dashboard')}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </AdminAuthenticatedLayout>
  );
}
