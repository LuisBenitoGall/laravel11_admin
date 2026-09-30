- 04/02/2026:

Objetivo: Implementar el change “2026-02-04_crm-contacts-filtros-avanzados” de forma EXPEDITIVA y ESTRICTA.

Fuente de verdad:
- openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/proposal.md
- openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/tasks.md

Alcance (solo filtros avanzados / adhoc):
- Añadir 2 filtros avanzados (adhoc) en /admin/crm-contacts y /admin/crm-leads:
  1) adhoc.cost_center_id (select)
     - Opciones: CostCenter where company_id = currentCompanyId AND status = 1
     - Filtrado: usuarios con registro en user_cost_centers donde company_id = currentCompanyId y cost_center_id = seleccionado
  2) adhoc.business_type (select)
     - Opciones: App\Concerns\HasBusinessTypes::comboOptions()
     - Filtrado: usuarios con algún crm_contacts (mismo company_id) con business_type = seleccionado (whereExists)

Restricciones:
- NO crear filtros de cabecera (query params directos fuera de adhoc).
- NO añadir columnas nuevas en la tabla/listado.
- Mantener el patrón existente:
  Backend: UserFilterRequest → CrmContactController::filteredData() → dataQuery() + adHocFilterDefinitions()
  Frontend: useTableManagement + formulario de filtros avanzados basado en adHocFilterUiConfig()
- Respetar multiempresa: siempre company_id = empresa en sesión.

Backend (mínimo):
- UserFilterRequest: aceptar adhoc.cost_center_id y adhoc.business_type (nullable|integer).
- CrmContactController:
  - adHocFilterDefinitions(): añadir closures apply para ambos filtros (cost_center_id via user_cost_centers; business_type via crm_contacts whereExists).
  - adHocFilterUiConfig(): añadir ambos selects con opciones correctas (cost centers filtrados + HasBusinessTypes).
  - activeFiltersLegend(): mostrar etiquetas legibles (business type desde HasBusinessTypes; cost center name por id + cache si procede).
  - NO tocar dataQuery salvo que sea imprescindible para no romper el pipeline actual.

Frontend:
- resources/js/Pages/Admin/CrmContact/Index.jsx (y/o componente del formulario adhoc):
  - Renderizar ambos selects desde la config devuelta por adHocFilterUiConfig().
  - Enviar valores como adhoc[business_type] y adhoc[cost_center_id].
  - Persistencia al paginar/ordenar y reset correcto al limpiar filtros.

Rendimiento:
- Verificar/añadir índices si faltan:
  user_cost_centers: company_id, user_id, cost_center_id (ideal compuesto)
  crm_contacts: company_id, user_id, business_type (ideal compuesto)

Entrega:
- Implementar y mostrar DIFF de los archivos tocados.
- Actualizar openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/tasks.md marcando [x] SOLO cuando cumpla “Done”.
- Sin refactors laterales ni cambios de estilo no solicitados.


-------------------------------------------------------------

- 17/02/2026:

Incluir filtro last_year_service. Este campo sirve para guardar el último año en que a un contacto se le prestó un servicio. El campo ya existe en la tabla crm_contacts. 

Pasos a seguir:
1. Crea el campo para editarlo en la vista User/Edit.jsx si se cumple la condición companyContext.type == 'contact'. El input debe ser un select que comprenda desde el año 2000 hasta el año actual (cada 1 de enero ese listado debe actualizarse automáticamente) en orden descendente. Introduce el selector entre los radio-button de Sexo y el checkbox de Aceptar emails.

2. Incluye la instrucción para guardar el valor en crm_contacts.last_year_service.

3. Incluye este campo en los filtros avanzados de Crm Contacts, a la derecha del selector de Centro de Coste. Utiliza el mismo selector de año que en la edición. Nada de escribir manualmente los años. Si acaso crea un componente específico para este tipo de selector y que pueda recibir por parámetros el intervalo de años. Mantén el estilo de otros componentes select.

4. Modifica los métodos implicados en CrmContactController para que el filtro funcione como el resto de filtros.

Una vez más pregunta cualquier duda que tengas antes de empezar a codear.


---------------------------------------------------------------------------

Respondo a tus dudas:

1. Condición en User/Edit
Has dicho “si se cumple la condición companyContext.type == 'contact'”. En el backend, company_context.type es 'contact' cuando el usuario que se edita tiene un crm_contact asociado (edición desde contacto CRM). ¿Confirmas que la condición debe ser exactamente company_context?.type === 'contact' (o equivalentemente “mostrar el campo solo cuando estamos editando un contacto CRM”)? ¿O hay otro contexto (p. ej. otra vista o tipo de empresa) donde también deba mostrarse?

RESPUESTA: el campo debe mostrarse cuando se edite un contacto CRM, no un usuario.

2. Guardado de last_year_service
Al guardar el formulario de User/Edit, los datos de contacto CRM se actualizan en algún método del UserController (update) que toque crm_contact. ¿Sabes si ya existe un punto donde se actualicen otros campos de crm_contacts (p. ej. position, department, contact_type) para que añada ahí last_year_service, o prefieres que localice yo ese punto en el código y te lo indique antes de implementar?

RESPUESTA: el método UserController@Update guarda también datos en crm_contacts.

3. Filtro en Crm Contacts
Quieres el filtro “a la derecha del selector de Centro de Coste”. En el controller los filtros avanzados están en adHocFilterUiConfig y el orden lo marca el array. ¿Te vale que añada last_year_service justo después de cost_center_id en ese config para que en la UI quede a la derecha del centro de coste, o tienes un orden concreto de filtros (lista de nombres/keys) que deba respetar?

RESPUESTA: ok a tu propuesta de incluirlo justo después de cost_center_id

4. Componente reutilizable de años
Para el selector de año (2000–año actual, descendente) que se usará en User/Edit y en el filtro de Crm Contacts: ¿prefieres un componente nuevo tipo YearSelect (o YearRangeSelect) que reciba por props algo como minYear, maxYear y opcionalmente placeholder / emptyLabel, manteniendo el mismo estilo que el resto de selects del proyecto?

RESPUESTA: ok a tu propuesta

Etiqueta del campo
¿Tienes ya una clave de traducción para “Último año de servicio” / “Last year of service” (p. ej. last_year_service o ultimo_ano_servicio) que deba usar en formulario y filtro, o la añado yo como nueva clave en los archivos de idioma?

RESPUESTA: añade la clave ultimo_servicio_any y su traducción al castellano Año del último servicio


-------------------------------------------------------------------------------

Para completar la tarea de incluir el campo last_year_service genera un comando para importar los valores desde el archivo storage/app/import/contacts_year_service.csv

Sigue la pauta que has hecho con otros comandos de importación en app/Console/Commands, creando un Import y un Promote. 

El archivo .csv contiene 4 columnas: name, surname, email, service_last_year. 
Omite todos los registros que no tengan valor en la columna service_last_year.
Con los valores filtrados, utiliza email para buscar en users.email y obtener users.id, y con ese valor buscas en crm_contacts.user_id e informas la columna last_year_service. Si hay valor de service_last_year pero no hay email, prueba a buscar con la combinación de name y surname en users.name y users.surname

