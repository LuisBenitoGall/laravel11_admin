# cost-center-edit Specification

## Purpose
TBD - created by archiving change 2026-02-06_costcenter-onsuccess-typo. Update Purpose after archive.
## Requirements
### Requirement: Callback de éxito al guardar

El cliente MUST usar la opción estándar de Inertia `onSuccess` al enviar el formulario de edición de centro de coste, de modo que el callback se ejecute tras un guardado correcto.

#### Scenario: Guardado exitoso

- **WHEN** el usuario envía el formulario (PUT) y el servidor responde con éxito
- **THEN** Inertia ejecuta el callback asociado a `onSuccess`
- **AND** no se usa la propiedad incorrecta `nSuccess` (que Inertia ignora)

