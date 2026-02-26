## Why

La tabla de usuarios reutilizada (`TableUsers`) se usa en distintos contextos (por ejemplo, pestaña de usuarios de empresa y gestión de contactos CRM) pero el comportamiento de borrado actual no distingue bien el tipo de relación. En algunos casos se está eliminando por `user_id`, lo que puede borrar más relaciones de las deseadas (p.ej. un contacto asociado a varias cuentas o un usuario vinculado a varias empresas) y obliga a corregir manualmente la asociación.

## What Changes

- Ajustar el comportamiento de borrado en `TableUsers` para que actúe sobre **la relación concreta** y no genéricamente por `user_id`.
- Cuando `deleteUserRoute === 'crm-contacts.destroy'`:
  - Eliminar el **registro de contacto** concreto en `crm_contacts` por su `id` (o key de fila configurada), desvinculándolo de la cuenta actual.
  - No borrar el usuario global, ya que puede estar asociado como contacto a otras cuentas.
- Cuando `deleteUserRoute === 'user-companies.destroy'`:
  - Eliminar la fila específica de la tabla puente `user_companies` por su `id` (o key de fila), rompiendo solo la relación entre usuario y empresa actual.
  - Mantener el usuario y otras relaciones con otras empresas.
- Asegurar que existen las **rutas** y los **métodos de controlador** correspondientes para ambos casos (`crm-contacts.destroy` y `user-companies.destroy`) y que aceptan el identificador correcto.
- Garantizar que, tras la operación de borrado, la navegación regresa a la **misma vista y pestaña** desde la que se lanzó el borrado (ej. `Company/Edit` en la pestaña de usuarios), respetando filtros y paginación cuando sea posible.

## Capabilities

### New Capabilities

- `users-table-context-aware-delete`: La tabla de usuarios soporta borrado contextual por tipo de relación (contacto CRM o relación usuario-empresa), eliminando solo la fila/relación indicada en lugar de operar genéricamente por `user_id`.

### Modified Capabilities

- `crm-contacts-listado`: El borrado de contactos desde la tabla genérica pasa a eliminar únicamente el registro de `crm_contacts` de la cuenta actual, sin afectar a otras asociaciones del mismo usuario.
- `user-companies-management`: El borrado desde la tabla de usuarios de empresa pasa a eliminar solo la relación en `user_companies`, manteniendo el usuario y otras relaciones.

## Impact

- **Frontend**
  - `Components/TableUsers.jsx`: lógica de borrado (`destroyRoute`, `rowDeleteKey`, payload y manejo de respuesta) para distinguir `crm-contacts.destroy` y `user-companies.destroy` y enviar el identificador correcto de la relación.
  - `Pages/Admin/Company/Edit.jsx` y `Company/Partials/CompanyUsersTab.jsx`: configuración de `TableUsers` (rutas de borrado, claves de fila, parámetros de retorno a pestaña actual).
  - `Pages/Admin/User/Index.jsx` (si reutiliza `TableUsers` u otro patrón similar) para asegurar consistencia de comportamiento.

- **Backend**
  - Rutas:
    - `crm-contacts.destroy`: validar que existe y que acepta el identificador de contacto (`crm_contacts.id`).
    - `user-companies.destroy`: validar que existe y que acepta el identificador de relación (`user_companies.id`).
  - Controladores:
    - `CrmContactController` (o controlador equivalente): método `destroy` que elimina/desvincula el contacto correcto, respetando multiempresa y permisos.
    - `UserCompanyController` (o controlador equivalente): método `destroy` que borra la fila de `user_companies` correspondiente sin borrar el usuario.
  - Modelos/relaciones:
    - Uso consistente de las relaciones `User`–`CrmContact` y `User`–`Company` (`user_companies`) para localizar y borrar únicamente la relación objetivo.

- **Navegación / UX**
  - Confirmaciones de borrado coherentes con el tipo de relación que se está eliminando.
  - Redirecciones/`Inertia` responses que vuelven a la misma vista y pestaña, minimizando la fricción de usuario.

