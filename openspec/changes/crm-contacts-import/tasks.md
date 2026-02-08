## 1. Rutas y permisos

- [x] 1.1 Añadir en `routes/web.php` GET `crm-contacts/import` → `CrmContactController@import` y POST `crm-contacts/import` → `CrmContactController@importStore`, ambas con middleware `permission:crm-contacts.create`
- [x] 1.2 Añadir ruta GET para descarga del template (p. ej. `crm-contacts/import/template`) → método que devuelve el archivo desde `storage/app/templates/`, con middleware de permiso

## 2. Template Excel

- [x] 2.1 Crear carpeta `storage/app/templates/` si no existe y generar archivo template (nombre descriptivo, p. ej. `contactos-import.xls`) con cabeceras: name, surname, user_email, user_nif, position, department, observations, company, company_nif, company_city, company_postal_code, company_street, company_phone, company_email

## 3. Backend — vista de importación

- [x] 3.1 Implementar `CrmContactController@import`: comprobar empresa en sesión y permiso; devolver vista Inertia `Admin/CrmContact/Import` con props necesarias (permisos, rutas, i18n si aplica), siguiendo el consenso de otros métodos del controller (index, etc.)

## 4. Backend — descarga de template

- [x] 4.1 Implementar método en controller (o ruta dedicada) que lea el archivo desde `storage/app/templates/` y devuelva la descarga con nombre amigable; proteger con permiso `crm-contacts.create`

## 5. Backend — importStore (validación y lectura)

- [x] 5.1 En `CrmContactController@importStore`: validar request (archivo requerido, formato .xls/.xlsx, tamaño máx. 2 MB); leer archivo con PhpSpreadsheet (o librería existente) y comprobar que no supera 1000 filas de datos; si falla validación, devolver errores a la vista
- [x] 5.2 Implementar helper/clase de normalización de celdas (trim, minúsculas para email, saneamiento de caracteres conflictivos) y aplicarla a cada valor leído antes de usarlo

## 6. Backend — importStore (proceso por fila)

- [x] 6.1 Por cada fila: buscar o crear User (por email si existe, si no por nif; si no hay email ni nif crear siempre). Campos: name (required), surname, email, nif, isAdmin false, status true
- [x] 6.2 Si hay datos de empresa en la fila: buscar o crear CrmAccount por tax_id; mapear columnas a name, normalized_name (slug), tax_id, billing_city, billing_postal_code, billing_street, main_phone, main_email
- [x] 6.3 Buscar CrmContact por user_id (y company_id de sesión); si no existe, crear con company_id, user_id, crm_account_id (si hay), position, department, observations
- [x] 6.4 Acumular filas que fallen (validación, excepción) con número de fila y motivo; devolver en la respuesta junto a total procesados y total fallidos

## 7. Backend — respuesta y redirección

- [x] 7.1 Tras procesar, devolver a la vista Import (Inertia) con payload: success/error, total_processed, total_failed, failed_rows (array con fila y motivo/datos) para mostrar mensaje y listado de no procesadas

## 8. Frontend — vista Import

- [x] 8.1 Crear `resources/js/Pages/Admin/CrmContact/Import.jsx` con layout admin (AdminAuthenticatedLayout), título y contenido: texto i18n explicativo (formato .xls/.xlsx, 2 MB, 1000 filas), enlace a ruta de descarga del template, formulario con input file
- [x] 8.2 Añadir validación JS al enviar: comprobar extensión (.xls/.xlsx) y tamaño ≤ 2 MB; mostrar mensaje de error y opcionalmente bloquear submit si no cumple
- [x] 8.3 Mostrar spinner o barra de progreso con texto tranquilizador mientras se envía el formulario (estado processing)
- [x] 8.4 Tras recibir respuesta: mostrar mensaje de éxito o error; si hay `failed_rows`, mostrar listado indicando que no se pudieron procesar (número de fila y/o motivo)

## 9. Frontend — acción en listado

- [x] 9.1 En `resources/js/Pages/Admin/CrmContact/Index.jsx`, añadir al array de actions un ítem con texto `contactos_importar` (i18n), icono `la-file-import`, enlace a ruta GET import; solo incluir si `permissions['crm-contacts.create']` es true

## 10. i18n

- [x] 10.1 Añadir claves en `lang` (p. ej. es.json): `contactos_importar`, y las necesarias para el texto explicativo de la vista Import (condiciones, mensajes de error/éxito, etiquetas del formulario y de filas no procesadas)

## 11. Verificación

- [ ] 11.1 Comprobar que sin permiso `crm-contacts.create` no se muestra el botón Importar y el acceso a GET/POST import devuelve error o redirección
- [ ] 11.2 Comprobar flujo completo: descargar template, rellenar unas filas, subir archivo; ver progreso y resultado; verificar que se crean users/crm_accounts/crm_contacts y que las filas fallidas se listan correctamente
- [ ] 11.3 Comprobar validación: archivo > 2 MB o > 1000 filas o formato incorrecto es rechazado con mensaje claro
