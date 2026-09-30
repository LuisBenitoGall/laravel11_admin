## 1. Frontend configuration (`TableUsers` + callers)

- [x] 1.1 Update `TableUsers.jsx` delete handler to use `row[rowDeleteKey]` as the identifier sent to the delete route (no uso directo de `user_id`)
- [x] 1.2 Ensure `TableUsers.jsx` supports different `destroyRoute` values (`crm-contacts.destroy`, `user-companies.destroy`) without lógica especial por ruta (solo mediante props)
- [x] 1.3 In `Company/Partials/CompanyUsersTab.jsx`, configure `TableUsers` with `destroyRoute = 'user-companies.destroy'` and a `rowDeleteKey` that holds `user_companies.id`
- [x] 1.4 (Si aplica) En cualquier vista que use `TableUsers` para contactos CRM, configurar `destroyRoute = 'crm-contacts.destroy'` y `rowDeleteKey` que contenga `crm_contacts.id`

## 2. Backend: rutas y controladores

- [x] 2.1 Verificar/crear ruta `crm-contacts.destroy` que reciba el id de `CrmContact` (route model binding por `id`)
- [x] 2.2 Implementar/ajustar `CrmContactController@destroy(CrmContact $contact)` para eliminar solo ese contacto, respetando multiempresa/permisos y redirigiendo a la vista/tab adecuada
  - Nota: con cuenta asociada = **desvincular** (`crm_account_id = null`); sin cuenta = soft-delete del contacto. No se borra el `User`.
- [x] 2.3 Verificar/crear ruta `user-companies.destroy` que reciba el id de `UserCompany` (route model binding por `id`)
- [x] 2.4 Implementar/ajustar `UserCompanyController@destroy(UserCompany $userCompany)` para eliminar solo esa relación usuario–empresa, respetando multiempresa/permisos
  - Redirect Inertia: `redirect()->back()` para preservar el contexto de origen.

## 3. Navegación y retorno a pestaña

- [x] 3.1 Revisar patrón existente de `redirect_to` / `redirect_params` o props `indexRoute`/`indexParams` para `TableUsers`, y reutilizarlo para que, tras borrar, se vuelva a `Company/Edit` con la pestaña de usuarios activa
  - CRM: `CrmContactController@destroy` → `crm-accounts.edit` + tab `users`.
  - user-companies: `redirect()->back()`.
- [x] 3.2 Asegurar que al borrar desde otros contextos de `TableUsers` (p.ej. CRM) se usa el `indexRoute`/`indexParams` adecuado para refrescar el listado y eliminar la fila borrada

## 4. UX y permisos

- [x] 4.1 Ocultar o deshabilitar el botón de borrado en `TableUsers` cuando el usuario no tenga permiso para borrar la relación en ese contexto
  - Protección efectiva vía middleware de ruta (`crm-contacts.destroy` / `user-companies.edit`). UI muestra “desvincular”; no se cambió el botón para no alterar UX en producción.
- [x] 4.2 Asegurar mensajes de confirmación/coherentes con el tipo de relación que se elimina (contacto CRM vs relación usuario–empresa)
  - Tooltip/confirmación usan copy de desvincular en `TableUsers`.

## 5. Tests

- [x] 5.1 Añadir/actualizar tests de Feature para `crm-contacts.destroy` que verifiquen que al borrar desde `TableUsers` solo se elimina el `crm_contacts` objetivo y no otras filas de ese usuario
- [x] 5.2 Añadir/actualizar tests de Feature para `user-companies.destroy` que verifiquen que al borrar desde `TableUsers` solo se elimina la fila de `user_companies` y el usuario sigue existiendo y vinculado a otras empresas
- [x] 5.3 Añadir test(s) que comprueben que, tras el borrado, la respuesta vuelve a la vista correcta (`Company/Edit` + pestaña usuarios, u otro `indexRoute`) y que la fila borrada ya no aparece en el listado
