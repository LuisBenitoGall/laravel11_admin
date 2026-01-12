# Project Context

## Purpose

Este proyecto es un **ERP desarrollado en Laravel 11** con frontend **Inertia + React**.  
Su objetivo es centralizar la gestión interna de la empresa en varios dominios:

- Gestión comercial (presupuestos, pedidos)
- Gestión logística (albaranes, reparto, stocks)
- CRM (contactos, empresas, agenda, seguimiento comercial)
- Gestión administrativa y operativa (facturas, contabilidad)
- RRHH (contratos laborales, control horario, planificación recursos)

**Objetivos principales:**

- Proporcionar una base sólida y extensible para ir incorporando módulos de negocio.
- Mantener una arquitectura limpia y coherente a medida que el sistema crece.
- Facilitar el trabajo asistido por IA usando OpenSpec como contrato entre requisitos y código.
- Minimizar regresiones mediante tests alineados con las especificaciones.

## Tech Stack

### Backend

- **Language:** PHP 8.2+  
- **Framework:** Laravel 11
- **HTTP Layer:** Controladores Laravel + rutas agrupadas por dominio/módulo
- **DB Layer:** Eloquent ORM
- **Database:** MySQL/MariaDB (entorno local con Laragon)  
  - TODO: concretar versión y motor (InnoDB, etc.)
- **Migrations & Seeders:** Migrations estándar de Laravel + seeders por dominio

### Frontend

- **Framework:** Inertia.js
- **UI Layer:** React
- **Bundler:** Vite
- **Styling:**  
  - CSS/SCSS + utilidades (Tailwind u otra librería, si aplica)  
  - TODO: describir framework de estilos real si ya está decidido
- **State Management:** estado local con hooks de React; state global mínimo y específico por pantalla

### Tooling & Runtime

- **Local Dev:** Laragon en Windows
- **Node.js:** v24.12.x (para tooling de frontend y OpenSpec CLI)
- **Package Manager:** npm
- **CLI adicional:** `@fission-ai/openspec` instalado globalmente

## Project Conventions

### Code Style

**PHP / Laravel**

- PSR-12 como guía principal de estilo.
- Uso de `strict_types` cuando sea posible.
- Clases y métodos con nombres expresivos orientados al dominio.
- Controllers delgados: delegan lógica de negocio a servicios/acciones de dominio.

**JavaScript / TypeScript / React**

- Componentes funcionales con hooks.
- Nombres en `PascalCase` para componentes, `camelCase` para funciones y variables.
- Un componente por archivo salvo componentes muy pequeños y relacionados.
- TODO: indicar si el proyecto usará TypeScript de forma progresiva o solo JavaScript.

**General**

- Evitar lógica de negocio compleja en vistas/blades/componentes React.
- Preferir funciones puras y reutilizables para transformaciones de datos.
- Comentarios solo cuando aporten contexto adicional; el código debe ser autoexplicativo.
- La indentación en el código (PHP, JavaScript/React, Blade, tests, etc.) será de 4 espacios (no tabs), de forma consistente en todo el proyecto.

### Architecture Patterns

- **Organización por dominios/módulos** dentro de `app/` y `resources/js`  
  (por ejemplo: `CRM`, `Billing`, `Inventory`, etc.).
- Lógica de negocio en **servicios/acciones** específicos, no en controllers.
- Reglas de autorización centralizadas mediante **Policies de Laravel**.
- Validación de datos con **Form Requests** allí donde aplique.
- Reutilización de patrones entre módulos (por ejemplo, el patrón usado en CRM Contacts se reutilizará para otros listados).

### Testing Strategy

- Tests de **feature** para flujos completos de usuario (HTTP + base de datos).
- Tests de **unidad** para servicios/acciones de dominio con lógica relevante.
- Los escenarios definidos en `openspec/specs/**/spec.md` deben reflejarse en tests:
  - Cada `Scenario` importante se mapea, idealmente, a uno o varios tests.
- Uso de factories y seeders específicos por dominio para preparar datos de prueba.
- TODO: especificar si se usa PHPUnit o Pest y la estructura de carpetas de tests.

### Git Workflow

- Rama principal: `main` (estable).
- Ramas de trabajo: `feature/<nombre-cambio>` o `chore/<nombre>` según tipo.
- Commits descriptivos; se recomienda un estilo cercano a Conventional Commits:
  - `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- Cada cambio relevante de negocio debería tener:
  - una carpeta en `openspec/changes/<change-id>/`
  - una rama de Git asociada usando el mismo `<change-id>` cuando sea posible.

### Internationalización (i18n)

- No se permiten textos hardcodeados en el código (controladores, vistas Blade, componentes React, validaciones, etc.).
- Todos los textos visibles para el usuario deberán obtenerse de los archivos de traducción.
- En backend (Laravel) se utilizará siempre el helper `__()` (u otros helpers de traducción estándar de Laravel) para recuperar cadenas traducibles.
- Los archivos de traducción deberán organizarse por dominio/módulo cuando sea posible, evitando ficheros monolíticos con claves mezcladas.
- Los tests no deberán depender de textos literales; siempre que sea necesario validar mensajes, se preferirá el uso de claves o estructuras que no rompan al cambiar una traducción.


## Domain Context

### Módulos

El ERP se organiza en **módulos** funcionales (usuarios, empresas, configuración, CRM, pedidos, presupuestos, proyectos, RRHH, productos, etc.).  
Cada módulo representa un área de negocio coherente y se identifica por un **slug** único.

Los módulos se clasifican por nivel mediante el atributo `level`:

- `1` → módulos de administrador
- `2` → módulos básicos
- `3` → módulos optativos

La definición inicial de los módulos se realiza mediante seeders en `database/seeders/ModulesTableSeeder.php`, donde se declara un array asociativo con las propiedades de cada módulo (slug, nombre, nivel, etc.).

### Funcionalidades

Cada módulo agrupa un conjunto variable de **funcionalidades** (por ejemplo: en *Usuarios*: listados, categorías; en *Empresas*: listado, directorio por sectores, centros de coste, centros de trabajo, etc.).

Las funcionalidades se definen inicialmente en `database/seeders/FunctionalitiesTableSeeder.php` como un array asociativo.  
La relación con el módulo padre se establece a través del índice `module`, cuyo valor es el **slug** del módulo al que pertenece la funcionalidad.

### Roles y permisos

El ERP utiliza **Spatie Laravel Permission** como sistema de gestión de roles y permisos.

- Cada **módulo** genera automáticamente un permiso con el siguiente formato:  
  `module_[slug-module]`
- Cada **funcionalidad** genera automáticamente **7 permisos**, con el formato:  
  `[slug_functionality].[method]` donde `method ∈ {index, create, show, search, edit, update, destroy}`
- A cada nueva empresa se le asignan unos roles previamente definidos que tienen carácter universal, son los mismos para todas las empresas.
- Paralelamente cada empresa puede crear sus propios roles, limitados a la inclusión de los permisos disponibles para las empresas, que a diferencia del SuperAdmin, no son todos.

El objetivo de esta estructura es **delimitar el acceso a cualquier acción posible de cualquier funcionalidad**, a dos niveles:

1. **Permiso de módulo**  
   - Controla el acceso global a un módulo completo.  
   - La presencia o ausencia de este permiso determina si el módulo se muestra u oculta en el menú principal.
   - Los *middlewares* asociados se encargan de permitir o vetar el acceso a las rutas del módulo.

2. **Permisos de funcionalidad**  
   - Controlan las acciones concretas dentro de cada funcionalidad (ver listados, crear, editar, etc.).
   - Permiten definir roles finos que combinan accesos específicos sobre distintas funcionalidades de uno o varios módulos.

### Multiempresa (SaaS multi-tenant)

El ERP funciona como una plataforma **SaaS multiempresa** con **multi-tenancy lógico**:

- Una sola base de datos compartida para todas las empresas.
- Aislamiento de datos mediante claves de empresa (p. ej. `company_id`) y reglas de autorización.
- Cada empresa puede tener su propia configuración de módulos y roles.
- Distintas empresas pueden acceder y utilizar la misma plataforma, cada una con sus **credenciales propias**.
- Cada empresa selecciona los **módulos optativos** que tiene disponibles en función del tipo de cuenta/plan contratado.
- Un mismo usuario puede estar asociado a **N empresas** y trabajar en contextos distintos.

La asignación y evaluación de roles y permisos se realiza siempre en el contexto de una **empresa concreta (tenant)**, de forma que:

- un mismo usuario puede tener permisos distintos según la empresa en la que esté operando,
- la disponibilidad de módulos y funcionalidades respetará tanto el plan de la empresa como los roles asignados al usuario en esa empresa.


### Dominios principales previstos

- **Registro + login**
  - Los usuarios se registran vinculados a alguna empresa ya existente en el sistema o una nueva.
  - Sistema de doble validación con email optativo. Las empresas configuran si desean o no utilizarlo.

- **Roles**
  - El rol de Super Admin es la máxima instancia de permisos del ERP. Tiene acceso directo a todo, siguiendo el esquema al respecto propuesto por Spatie. 

- **Layout estructural**
  - A la izquierda de la pantalla se sitúa el aside del menú de Módulos y Funcionalidades. 
  - Por orden de arriba hacia abajo se presenta la siguiente información:
    - Logo del proyecto.
    - Logo de la empresa en sesión.
    - Menú de módulos obligatorios.
    - Menú de modulos optativos. Sólo muestra las opciones activadas por la empresa en sesión.
    - Cada módulo engloba diferentes funcionalidades presentadas a modo de submenú.
  - En la parte superior de la pantalla se encuentra una franja de acciones e información contextual. De izquierda a derecha encontramos:
    - Nombre funcionalidad + acción
    - Selector idioma
    - Widget para establecer preferencias de menú
    - Otras opciones todavía en desarrollo (chat, notificaciones, notas personales,...) (TODO)
    - Nombre de la empresa en sesión o selector de empresas cuando el usuario está vinculado a más de una empresa
    - Menú del usuario logueado (acceso a perfil personal, logout)

A partir de aquí se presentan los dominios específicos, una vez presentados los bloques estructurales y transversales a todo el ERP. Entre paréntesis se indica si el módulo es Administrador (L1), Básico (L2) u Optativo (L3)
  
- **Dashboard** (L2)
  - Incluye diferentes widgets como notas personales (presentación tipo post it), opciones de menú favoritas, recordatorios varios y otras funciones todavía en desarrollo (TODO)

- **Mi Cuenta** (L2)
  - Cuenta. Cada empresa requiere de una cuenta activa en el ERP. Esta opción presenta el histórico de renovaciones de la cuenta, condiciones y una opción para renovar la cuenta en el momento del vencimiento.
  - Módulos de la empresa. La empresa activa o desactiva para si los módulos presentes y activos en el ERP. No todas las empresas utilizan todos los módulos, ni todos los módulos existentes en el ERP se presentan como accesibles para las empresas.

- **Usuarios** (L2)
  - Gestión de usuarios del ERP, ya sean vinculados a la empresa en sesión como de clientes, proveedores. 
  - Gestión de categorías de usuarios y filtro de usuarios por categorías.

- **Empresas** (L2)
  - Gestión de empresas y su información vinculada
  - Funcionalidades:
    - Empresas propias
    - Areas de negocio
    - Centros de coste
    - Centros de trabajo
    - Configuración. Valores de configuración para la empresa en sesión (moneda, idiomas, impuestos, emails corporativos,...)
    - Clientes
    - Proveedores
    - Directorio por sectores

- **Configuración** (L1)
  - Tablas maestras de la aplicación. Este módulo sólo es accesible para Super Admin
  - Funcionalidades:
    - Cuentas. Tipos de cuentas contratables por las empresas
    - Módulos
    - Roles
    - Permisos
    - Monedas
    - Bancos
    - Países
    - Contenidos
    - Tipos de movimientos de stock
    - Unidades
    - Tipos de IVA
    - Grupos contables

- **RRHH** (L3)
  - Gestión de los Recursos Humanos por cada empresa
  - Funcionalidades:
    - Contratos. Tipos de contratos laborales.
    - Empleados
    - Grupos
    - Selección personal
    - Protocolos

- **Horarios** (L3)
  - Funcionalidades:
    - Horarios de los empleados
    - Conceptos horarios
    - Firma de horarios

- **Calendario** (L3)
  - Funcionalidades:
    - Calendario laboral y de empresa
    - Tipos de jornada
    - Criterios de calendario

- **Catálogo** (L3)
  - Relación de los productos y servicios ofrecidos por cada empresa
  - Funcionalidades:
    - Productos
    - Familias
    - Categorías
    - Patrones de numeración y referenciación de productos
    - Atributos
    - Tarifas

- **Stocks** (L3)
  - Gestión del stock de cada empresa
  - Funcionalidades:
    - Almacenes
    - Control de stocks y movimientos
    - Inventario
    - FIFO

- **Presupuestos** (L3)
  - Elaboración y gestión de presupuestos por parte de cada empresa.
  - Funcionalidades:
    - Presupuestos a clientes
    - Presupuestos de proveedores
    - Patrones de numeración de presupuestos
    - Formularios
    - Configuración de presupuestos

- **Pedidos** (L3)
  - Elaboración y gestión de los pedidos de cada empresa a partir de presupuestos previos o desde 0
  - Funcionalidades:
    - Ventas
    - Compras
    - Panel de control
    - Agrupaciones de pedidos
    - Patrones de numeración de pedidos de venta
    - Patrones de numeración de pedidos de compra
    - Configuración de pedidos
    - Incidencias sobre líneas de pedidos
    - E-commerce

- **Albaranes** (L3)
  - Elaboración y gestión de los documentos de entrega y recepción de productos o servicios por parte de cada empresa.
  - Funcionalidades:
    - Entregas
    - Recepciones
    - Patrones de numeración de entregas
    - Patrones de numeración de recepciones

- **SAT** (L3)  
  - Gestión del Servicio de Asistencia Técnica. Implica necesariamente al módulo de pedidos, pues cada SAT consta de dos pedidos: uno de venta y otro de compra.
  - Funcionalidades:
    - Listado 
    - Patrones de numeración de SAT

- **Logística** (L3)
  - Gestión de la logística para la entrega o recogida de productos
  - Funcionalidades:
    - Envíos / Repartos
    - Patrones de numeración de repartos
    - Vehículos (flota)
    - Repartidores
    - Agencias transporte
    - Rutas

- **Proyectos** (L3)
  - Control de la actividad de la empresa mediante la generación y gestión de proyectos y tareas
  - Funcionalidades:
    - Listado de proyectos
    - Patrones de numeración de proyectos
    - Categorías de proyectos

- **Producción** (L3)
  - Planificación y gestión de la producción industrial o artesanal por parte de cada empresa
  - Funcionalidades:
    - Planning
    - Consumos / insumos
    - Hardware (relación de maquinaria y herramientas)
    - Lotes
    - Patrones de numeración de lotes de fabricación

- **CRM** (L3)
  - Gestión de las cuentas y contactos de cada empresa previos a tener relaciones comerciales (cliente o proveedor)
  - Funcionalidades:
    - Cuentas
    - Contactos
    - Leads
    - Agenda
    - Posible pipeline de oportunidades, actividades y tareas comerciales.

- **Marketing** (L3)
  - Funcionalidades:
    - Listados de marketing
    - Campañas

- **Contabilidad** (L3)
  - Módulo de contabilidad, tesorería y presentación de obligaciones fiscales
  - Funcionalidades:
    - Facturas
    - Patrones de numeración de facturas
    - Configuración de facturas
    - Amortizaciones
    - Cuentas bancarias
    - Cuentas contables
    - Asientos contables
    - Modelos de asientos contables
    - Caja
    - Conceptos de caja
    - Patrones de numeración de caja
    - Efectos
    - Remesas
    - Patrones de numeración de remesas
    - Métodos de pago
    - Sistema SII
    - Verifactu

- **Calidad** (L3)
  - Módulo para la gestión de incidencias y procesos de calidad.
  - Funcionalidades:
    - Incidencias
    - Patrones de numeración de incidencias

- **Procedimientos** (L3)
  - Para la elaboración, versionado y gestión de los procedimientos internos de cada empresa.
  - Funcionalidades:
    - Listado
    - Patrones de numeración de procedimientos

- **Manual** (L3)
  - Manual de uso del ERP, mediante textos y pantallazos de cada funcionalidad


### CRM Contacts (estado actual)

- Existe ya un **listado de contactos** implementado y funcionando.
- Backend: endpoint(s) en Laravel 11 con filtros por campos básicos.
- Frontend: pantalla Inertia + React con tabla, filtros y paginación.
- El comportamiento actual deberá ser capturado en `openspec/specs/crm/contacts/spec.md`
  para servir como contrato entre backend y frontend.

## Important Constraints

- El proyecto debe mantenerse **legible y extensible**: evitar “quick fixes” que comprometan la arquitectura a medio plazo.
- De momento se asume un **entorno monolítico** Laravel (sin microservicios).
- TODO: indicar si es multiempresa/multitenant o single-tenant.
- TODO: añadir restricciones de rendimiento (tamaño máximo de dataset, SLAs internos, etc.) si aplican.
- Las decisiones de seguridad (autenticación, autorización, protección CSRF, etc.) deben seguir las prácticas recomendadas de Laravel 11.

## External Dependencies

- **Infraestructura local:** Laragon (Apache/Nginx + MySQL/MariaDB + PHP).
- **Servicios externos actuales:**
  - TODO: listar proveedores de email (SMTP, API), almacenamiento de ficheros, pasarelas de pago u otros servicios externos.
- **Integraciones futuras previstas:**
  - TODO: describir sistemas externos con los que el ERP deberá integrarse
    (p.ej. contabilidad, e-commerce, herramientas de terceros).

## OpenSpec & AI Usage Guidelines

- Todas las herramientas de IA que trabajen con este repo deben:
  - Leer `openspec/AGENTS.md` y este `project.md` antes de proponer cambios.
  - Respetar las especificaciones definidas en `openspec/specs/**/spec.md`.
  - Proponer y modificar código únicamente en el contexto de un **change** de OpenSpec
    (`openspec/changes/<change-id>/`) salvo cambios triviales de formato.

- Flujo recomendado para nuevas funcionalidades o cambios relevantes:
  1. Crear propuesta con `/openspec-proposal <change-id>` describiendo el cambio.
  2. Revisar/ajustar `proposal.md`, `tasks.md` y los deltas de `spec.md`.
  3. Implementar siguiendo las tasks (idealmente vía `/openspec-apply`).
  4. Añadir/ajustar tests alineados con los escenarios de la spec.
  5. Archivar el cambio con `openspec archive <change-id> --yes` cuando esté desplegado.

