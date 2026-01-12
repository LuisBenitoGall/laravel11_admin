# Spec: Product

## Context

El model Product gestiona la información relativa a los artículos (productos o servicios) de cada empresa.


## Goals / Non-goals

### Goals:
- Gestión de artículos por empresa.
- CRUD + pestañas: imágenes, ventas, compras, unidades, categorías, atributos, historial de precios, serialización.
- Soportar filtros/búsqueda por campos core y (más adelante) por atributos filtrables.

### Non-goals:
- Variantes/SKUs por combinatoria.
- Inventario avanzado.
- Motor completo de atributos


## Domain model
Conceptos básicos del modelo:
- product: entidad base, pertenece a una empresa.
- type: producto vs servicio.
  - producto: permite a criterio del administrador utilizar stock_management, batch y serialization.
  - servicio: stock_management = false, batch = false, serialization = false
- pricing: historial y precio vigente (si aplica).
- serialization: si el artículo se serializa, cómo se representan las unidades serializadas.
- attributes: extensiones (con set por categoría en el futuro, etc.).
- batch: valor booleano, si permite gestión de lotes o no.
- stock_management: valor booleano, si el artículo gestiona stock o no.
- on_sale: valor booleano, si el artículo es para venta o no.
- status: valor booleano, estado del artículo (activo o inactivo). Desde las vistas de catálogo, para la empresa propietaria del catálogo, se puede acceder a todos los artículos, independientemente de su estado. Para operaciones de nuevas ventas, nuevas compras, generación de albaranes, definición de tarifas sólo son accesibles los artículos activos.


## Data model
Características y restricciones de los principales campos:
- Campos core (ej.: name, manual_ref, type, status, company_id, on_sale)
- Constraints:
  - company_id obligatorio
  - name obligatorio
  - type obligatorio (string: 'p' = producto; 's' = servicio)
  - manual_ref único por empresa (si aplica)
  - status booleano, por default true
- Relaciones (solo nombres y cardinalidad):
  - belongsTo Company
  - hasMany ProductImage
  - belongsToMany Category
  - belongsToMany Unit


## Permissions & authorization

Se aplican 2 contextos para acceder a artículos:

### Contexto A: gestión de catálogo de mi propia empresa.
La visibilidad y acceso a los artículos depende de:
- que el módulo este activado para la empresa en sesión.
- artículos relacionados exclusivamente con la empresa en sesión.
- disponer el usuario del permiso sobre el módulo: `module_products`.
- disponer el usuario de los permisos pertinentes. El formato de los permisos para artículos es: `products.[create|destroy|edit|show|index|search|update]`
- permite todas las acciones para las que el usuario tenga permiso.
- el scope es company_id = currentCompany.
- Reglas multiempresa:
  - Nunca permitir operar sobre artículos de otra empresa aunque el usuario “tenga permisos” en otra.

Nota de implementación (en spec, no en código): preferir Policy como fuente de verdad y middleware para guardas generales.

### Contexto B: Consulta de catálogo ajeno.
Permite búsqueda y visibilidad de catálogos ajenos, por ejemplo para un ecommerce que visualizas y buscas artículos de proveedores.
- Reglas:
  - No es necesario que la empresa del usuario en sesión tenga activa module_products.
  - Que la empresa propietaria del catálogo lo tenga accesible a terceros (ej.: vista de catálogo, e-commerce).
  - Sólo son accesibles los artículos activos en el catálogo (status = 1) y puestos a la venta (on_sale = 1)
  - La búsqueda pública puede operar en (a) un catálogo global multiempresa o (b) un catálogo por empresa, según el canal (catálogo/ecommerce)
  - El acceso a la vista de artículos (catálogo o ecommerce) podrá ser pública o restringida a criterio de la empresa propietaria del catálogo, aunque siempre aplica la regla status = 1 y on_sale = 1

### Decisions:
- D1 Public catalog access: El catálogo ajeno (Contexto B) es accesible sin requerir module_products en currentCompany.
- D2 Public visibility rule: En Contexto B solo se exponen artículos con status=1 y on_sale=1.
- D3 Public endpoints: Los endpoints públicos globales no aceptan filtros por empresa; el catálogo por empresa se accede solo por rutas públicas controladas /catalog/{company_slug}.
- D4 Public fields whitelist: En Contexto B se usa un DTO/Resource con lista blanca de campos (no se retorna el modelo completo).
- D5 Authorization source of truth: La autorización se implementa con ProductPolicy + middlewares generales (auth/module/company) para Contexto A.
- D6 Variants out of scope: Variantes/SKUs por combinatoria quedan fuera de este módulo/spec.


## UX / Screens
Definición de pantallas del CRUD.

### Index
Presenta el listado de artículos por empresa:
- Selector para mostrar / ocultar columnas
- Filtros avanzados
- Selector resultados por página
- CTA exportación a Excel y PDF
- Filtros
- Acciones por fila
- Numerador de registros por página y número total de registros
- Paginador

### Create
Formulario de creación de nuevos artículos:
- campos mínimos
- comportamiento al guardar: redirige hacia Edit

### Show
Vista de presentación del artículo:
- Distintos layouts según sea para visualización de administradores, para ecommerce,...

### Edit
Vista de edición del artículo:
- organizado en tabs
- comportamiento común: guardar, flash messages, errores
- cada pestaña: propósito + reglas. 
- pestañas (TODO: revisar si se deben incluir más):
  - Artículo: core fields
  - Imágenes: imágenes vinculadas al artículo. Opciones: eliminar, marcar como principal, marcar como thumbnail
  - Ventas: tabla con histórico de ventas del artículo. Sólo se muestra si el campo on_sale = true
  - Compras: tabla con histórico de compras del artículo.
  - Unidades de venta y medición: configuración de las unidades de venta y medición del artículo. Relación con modelo Unit.
  - Categorías
  - Atributos
  - Histórico de precios: listado con la evolución de precios a lo largo del tiempo del artículo, tanto de venta como de compra
  - Serialización: configuración para generar y mantener números de serie del artículo, si aplica


## Requirements

### Requirement: control de acceso
- Catálogo propio (own catalog management):
  - El sistema DEBE impedir el acceso a rutas de gestión de Artículos si el module_products no está activo para currentCompany.
  - El sistema DEBE requerir module_products para cualquier ruta de gestión de Artículos.
  - El sistema DEBE requerir permisos a nivel de acción products.{action} para rutas de gestión (index|create|store|edit|update|destroy|...).
  - El sistema DEBE limitar todas las consultas de Artículos de gestión mediante company_id = currentCompany.

- Catálogo ajeno (external catalog browsing):
  - El sistema DEBE permitir products.search y products.show sobre artículos de otras empresas aunque el module_products no esté activo en currentCompany, solo cuando:
    - la empresa proveedora tenga habilitada alguna vista accesible a terceros (vista catálogo, ecommerce), y
    - el artículo es visible para clientes (por defecto status=1 y reglas adicionales si aplica).
    - el artículo está a la venta (on_sale = 1)
  - El sistema DEBE limitar los datos expuestos en modo externo a un subconjunto permitido de campos de una lista explícita (p.ej. name, ref, description, images, sale_price si procede), excluyendo campos internos.
  - En endpoints públicos globales NO se aceptará company_id ni filtros por empresa. 
  - El acceso por empresa se realizará solo mediante rutas públicas controladas (p.ej. /catalog/{company_slug}) y solo si la empresa tiene habilitado catálogo público.
  - TODO: directorio de catálogos completos por empresa para aquellas que lo autoricen y respetando las reglas establecidas en este documento.

### Requerimiento: Listar artículos
- El sistema DEBE proporcionar una lista paginada de artículos de la empresa actual.
- La lista DEBE permitir búsqueda por los campos configurados como searchable en el listado, incluyendo filtros avanzados cuando estén habilitados.
- La lista DEBE mostrar el estado y el tipo.
- La lista DEBE exponer acciones por fila basadas en permisos: ver/editar/eliminar.

### Requerimiento: Crear artículo
- El sistema DEBE permitir crear un artículo con los campos mínimos requeridos: nombre, tipo (producto o servicio), estado, artículo para venta
- En caso de éxito, la interfaz DEBE redirigir a la vista de Edición del artículo creado.
- En caso de error de validación, la interfaz DEBE mostrar los errores mediante FlashMessage y mantener los valores del formulario.

### Requerimiento: Editar artículo
- El sistema DEBE permitir editar los campos principales en la pestaña “Artículo”.
- La pantalla de Edición DEBE mostrar los metadatos de auditoría: created_at/by, updated_at/by.
- La pantalla se organiza en tabs.

### Requerimiento: Eliminar artículo
- El sistema DEBE permitir la eliminación del artículo única y exclusivamente si el usuario tiene el permiso products.destroy o tiene el rol de Super Admin.

### Requerimiento: Tabs
- Imágenes:
  - El sistema DEBE permitir subir y eliminar imágenes.
  - El sistema DEBE permitir seleccionar una única imagen principal.
  - El sistema DEBE permitir seleccionar una única imagen como thumbnail.
  - El sistema DEBE definir tamaño máximo y tipos permitidos. (por definir)

- Ventas:
  - El artículo DEBE tener el campo on_sale = true para permitir su venta.

- Compras:
  - El sistema DEBE permitir la vinculación del artículo comprado con las correspondientes referencias de los proveedores de dicho artículo.

- Unidades de venta y medición:
  - El sistema DEBE permitir la vinculación y desvinculación de un artículo con N unidades de venta y medición.

- Categorías:
  - El sistema DEBE permitir la vinculación y desvinculación de un artículo con N categorías y subcategorías de artículos.

- Atributos:
  - El sistema DEBE permitir la vinculación, desvinculación y modificación de valores de un artículo con N atributos.

- Histórico de precios:
  - El sistema DEBE mantener el histórico de precios de un artículo registrando el intervalo de fechas de su vigencia.

- Serialización:
  - El sistema DEBE permitir un sistema de serialización de artículos tanto por unidades como por lotes cuando así sea requerido.
  - El sistema DEBE mantener la integridad de los valores de serialización impidiendo repeticiones.


## Policy: 

- ProductPolicy define acceso en contexto A (company scope) y contexto B (público).