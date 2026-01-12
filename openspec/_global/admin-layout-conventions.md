# Admin layout conventions (global)

Estas convenciones aplican por defecto a todos los módulos salvo que el spec/tasks indique explícitamente lo contrario.

## Controllers
- Por defecto, los Controllers deben crearse en el namespace:
  - `App\Http\Controllers\Admin`
- Por defecto, los controllers deben declarar estas propiedades:
  - `private string $module = '[slug-modulo]';`
  - `private string $option = '[slug-modulo-castellano]';`
  - `protected array $permissions = [];`

## Frontend Pages
- Por defecto, las páginas deben ubicarse en:
  - `resources/js/Pages/Admin/[Model]/`
- Todas las Pages deben declarar:
  - `const actions = [];`
  (Obligatorio aunque esté vacío)
  - En el array actions deben incluirse todos los CTA genéricos de la páginas (ej: regresar a la vista anterior, crear nuevo item del modelo, crear valores supeditados al modelo principal, ir a funcionalidades paralelas al modelo,...)
  - Su accesibilidad siempre estará supeditada a que el usuario disponga del permiso correspondiente.
  - Las acciones pueden ser un enlace directo o mostrar un modal (modal = true)
  - A continuación se muestra un ejemplo de una acción tipo:
        const actions = [];
        if (permissions?.['crm-contacts.create']) {
            actions.push({
                text: __('contacto_nuevo'),
                icon: 'la-plus',
                url: '',
                modal: true,
                onClick: handleOpenModalUserCreate
            });
        }


## Layout obligatorio (Pages)
- Todas las Pages deben usar esta estructura base de return salvo que se indique lo contrario:

return (
    <AdminAuthenticatedLayout
        user={auth.user}
        title={title}
        subtitle={subtitle}
        actions={actions}
    >
        <Head title={title} />

        {/* Contenido */}
        <div className="contents">
            ...
        </div>
    </AdminAuthenticatedLayout>
);
