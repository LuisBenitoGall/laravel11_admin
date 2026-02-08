# Spec: Listado CRM contactos/leads — persistencia de filtros y modo builder

## ADDED Requirements

### Requirement: Persistir filtros al crear lista desde listado filtrado

Cuando el usuario tiene filtros aplicados (columnas o avanzados) y abre "Nueva Lista de Marketing", crea la lista y el backend redirige a la vista en modo builder, la URL del redirect MUST incluir los mismos filtros que el usuario tenía, de modo que la tabla muestre la misma lista filtrada (no la completa).

#### Scenario: Filtrar y luego crear lista

- **WHEN** el usuario está en contactos (o leads), aplica uno o más filtros (columna o avanzados) y a continuación abre el modal "Nueva Lista de Marketing", introduce nombre y guarda
- **THEN** el backend crea la lista y redirige a la misma vista con modo builder activo
- **AND** la URL de la redirección incluye los parámetros de filtro que el usuario tenía (p. ej. `full_name`, `email`, `adhoc`, etc.)
- **AND** la tabla mostrada es la lista filtrada, no la completa

#### Scenario: Crear lista sin filtros previos

- **WHEN** el usuario no tiene filtros aplicados y crea una lista desde el modal
- **THEN** el redirect incluye solo los parámetros de modo builder (`marketing_list_id`, `build_marketing_list`)
- **AND** la tabla muestra el listado completo (comportamiento actual aceptable)

---

### Requirement: Preservar modo builder al aplicar filtros u otras navegaciones

Cuando el usuario está en la vista de contactos (o leads) en modo builder (construyendo una lista de marketing), cualquier navegación que mantenga la misma vista (cambio de filtro, ordenación, paginación, registros por página) MUST conservar en la URL los parámetros de modo builder (`marketing_list_id`, `build_marketing_list`), de modo que la barra de "Seleccionar todos" / "Guardar miembros" siga visible.

#### Scenario: En modo builder, aplicar un filtro de columna

- **WHEN** el usuario está en modo builder (barra de construcción visible) y cambia un filtro de columna o aplica filtro avanzado
- **THEN** se realiza una petición a la misma ruta (index) con los nuevos parámetros de filtro
- **AND** la URL resultante incluye tanto los parámetros de filtro como `marketing_list_id` y `build_marketing_list`
- **AND** la barra de construcción (alert con "Seleccionar todos", "Guardar miembros") sigue visible

#### Scenario: En modo builder, cambiar ordenación o página

- **WHEN** el usuario está en modo builder y cambia la ordenación o la página o los registros por página
- **THEN** la navegación conserva `marketing_list_id` y `build_marketing_list` en la URL
- **AND** la barra de construcción sigue visible
