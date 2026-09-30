## Context

El proyecto usa `TableUsers.jsx` como componente reutilizable para mostrar y gestionar usuarios en distintos contextos (por ejemplo, pestaña de usuarios dentro de `Company/Edit` y pantallas más globales de usuarios/CRM).  
Actualmente, el borrado se basa en un `destroyRoute` y suele trabajar con `user_id`, lo que no diferencia entre:
- Contactos CRM (`crm_contacts`) asociados a una cuenta concreta.
- Relaciones usuario–empresa (`user_companies`) que enlazan un usuario con una empresa.

Esto genera ambigüedad: borrar “un usuario” desde la tabla puede eliminar más relaciones de las deseadas si se actúa por `user_id` en vez de por el **id de la relación/fila**.

Restricciones:
- Mantener `TableUsers` como componente genérico, configurable vía props (rutas, claves de fila, etc.).
- Respetar el patrón Inertia/Laravel actual (uso de `router` y rutas nombradas).
- Respetar el contexto de navegación (volver a la misma vista y pestaña tras el borrado).

## Goals / Non-Goals

**Goals:**
- Hacer que `TableUsers` borre **relaciones concretas** según el contexto:
  - `crm-contacts.destroy`: eliminar solo el registro de `crm_contacts` correspondiente a la cuenta actual.
  - `user-companies.destroy`: eliminar solo la fila de `user_companies` que vincula usuario y empresa actual.
- Configurar `TableUsers` para que, según `destroyRoute` y `rowDeleteKey`, envíe al backend el identificador correcto (`crm_contacts.id` o `user_companies.id`).
- Asegurar que existen rutas y métodos en controladores que acepten esos identificadores y devuelvan una respuesta Inertia adecuada (mismo view/tab).

**Non-Goals:**
- No rediseñar por completo `TableUsers` (paginación, filtros, exportación, etc.).
- No cambiar la semántica global de borrado de usuarios en otras pantallas que ya tengan un flujo claro de “borrar usuario completo” (a menos que usen explícitamente este componente en el mismo contexto).
- No introducir cambios en el modelo de datos (`crm_contacts`, `user_companies`, `users`) más allá de lo necesario para localizar la fila correcta.

## Decisions

### 1. Identificador de borrado basado en `rowDeleteKey`

**Decisión:**  
`TableUsers` seguirá recibiendo una prop `rowDeleteKey` que indica qué campo usar como identificador de borrado en cada fila.  
Ejemplos:
- En pestaña de usuarios de empresa: `rowDeleteKey = 'user_company_id'` (id de la fila en `user_companies`).
- En listado de contactos CRM: `rowDeleteKey = 'crm_contact_id'` (id del registro en `crm_contacts`).

El payload de borrado Inertia/axios incluirá siempre `{ id: row[rowDeleteKey] }` (o nombre equivalente esperado por la ruta) y **no** `{ user_id: row.id }`.

**Alternativa considerada:** Deducir en el componente qué campo usar según `destroyRoute`.  
Rechazada para mantener `TableUsers` desacoplado de rutas concretas y permitir más reutilización.

### 2. Rutas específicas por relación

**Decisión:**  
Usar rutas dedicadas:
- `crm-contacts.destroy` → `CrmContactController@destroy(CrmContact $contact)` que elimina el registro de contacto (por id) y redirige a la cuenta/pestaña adecuada.
- `user-companies.destroy` → `UserCompanyController@destroy(UserCompany $userCompany)` que elimina la relación usuario–empresa (por id) sin borrar la entidad `User`.

Ambas rutas usarán **route model binding** por su clave primaria (`id`) y verificarán contexto de empresa y permisos.

**Alternativa considerada:** Reutilizar un único endpoint `users.destroy` con flags de contexto.  
Rechazada por mezclar responsabilidades y aumentar el riesgo de borrados incorrectos.

### 3. Navegación y retorno a la misma vista/pestaña

**Decisión:**  
Al borrar desde `TableUsers`, se usará el patrón ya existente en otras partes del proyecto para regresar a la misma vista/tab:
- El frontend llamará a la ruta de borrado sin cambiar la URL actual (usando `router.delete`/`router.visit` con `preserveScroll` / `preserveState` según convenga), o
- El backend redirigirá explícitamente a la ruta `Company/Edit` con los parámetros necesarios para seleccionar la pestaña de usuarios (ej. `?tab=users`), siguiendo el patrón ya usado en otros cambios (`redirect_to`, `redirect_params` en el controller).

Se priorizará reutilizar el mecanismo de `redirect_to`/`redirect_params` ya implementado para otras operaciones de usuario/empresa, de modo que:
- `TableUsers` pueda opcionalmente pasar estos parámetros junto con la petición de borrado.
- Los controladores lean estos parámetros y hagan `redirect()->route(...)` a la pestaña correcta.

### 4. Manejo de respuestas y refresco del listado

**Decisión:**  
Tras un borrado exitoso:
- El backend devolverá una redirección Inertia a la misma ruta de listado (Company/Edit + tab correspondiente).
- O bien el componente `TableUsers` hará un `router.get`/`router.reload` explícito a su `indexRoute` con los filtros/paginación actuales.

Se mantendrá la consistencia con otros listados: mensajes flash (éxito/error) y preservación, en la medida de lo posible, de filtros y página actual.

## Risks / Trade-offs

- **[Riesgo] Confusión sobre `rowDeleteKey`** → *Mitigación:* documentar claramente en los lugares donde se instancia `TableUsers` qué campo se está usando como identificador y qué ruta lo maneja; añadir nombres de claves expresivos (`user_company_id`, `crm_contact_id`).
- **[Riesgo] Rutas Inertia mal configuradas** → *Mitigación:* tests funcionales que cubran los dos casos (`crm-contacts.destroy` y `user-companies.destroy`) y verifiquen que solo se elimina la relación esperada y que se vuelve a la pestaña correcta.
- **[Riesgo] Borrado de usuario completo por error** → *Mitigación:* separar claramente las rutas de “borrar relación” (`user-companies.destroy`, `crm-contacts.destroy`) de cualquier ruta que realmente borre un `User`; evitar reutilizar `users.destroy` en `TableUsers` para estos contextos.

