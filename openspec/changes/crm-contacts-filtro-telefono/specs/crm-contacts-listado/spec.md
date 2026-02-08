# Spec: Listado contactos CRM — filtro por teléfono en tabla

## ADDED Requirements

### Requirement: Filtro de teléfono en filtros de tabla

El listado de contactos CRM MUST incluir un filtro por teléfono en la fila de filtros de la tabla (cabecera), de modo que el usuario pueda escribir un valor y restringir los resultados a contactos cuyo número de teléfono coincida total o parcialmente.

#### Scenario: Usuario aplica filtro por teléfono

- **WHEN** el usuario escribe un valor en el campo de filtro de la columna "Teléfonos" y se dispara la búsqueda (p. ej. al cambiar el valor o al enviar)
- **THEN** la petición al endpoint de datos filtrados incluye el parámetro correspondiente (p. ej. `phones`)
- **AND** el backend restringe los resultados a usuarios que tengan al menos un teléfono (relación phones) cuyo número contenga el valor introducido
- **AND** la columna Teléfonos sigue mostrando los teléfonos del usuario (sin cambiar el formato de visualización)

#### Scenario: Filtro de teléfono vacío

- **WHEN** el campo de filtro de teléfonos está vacío
- **THEN** no se aplica restricción por teléfono y se muestran todos los contactos según el resto de filtros
