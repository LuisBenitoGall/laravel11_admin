# schedule-calendar-rules Specification

## Purpose
TBD - created by archiving change schedule-calendar-rules. Update Purpose after archive.
## Requirements
### Requirement: Event requires at least one schedule
La aplicación **DEBE** impedir la creación de eventos de agenda si el usuario no tiene al menos una agenda existente y visible/creable en el contexto actual (empresa/sesión).

#### Scenario: User tries to create an event without any schedules
- **WHEN** el usuario intenta crear o guardar un evento (por ejemplo, abriendo el formulario de nuevo evento o enviando el formulario) y no existe ninguna agenda disponible en el sistema para ese usuario/empresa
- **THEN** el sistema **NO DEBE** crear el evento
- **AND** debe mostrarse un aviso mediante SweetAlert con el mensaje `debes crear una agenda antes de guardar eventos`

### Requirement: Event end date must not be before start date
La aplicación **DEBE** validar que la fecha de finalización de un evento nunca sea anterior a la fecha de inicio.

#### Scenario: User selects an end date before the start date
- **WHEN** el usuario selecciona una fecha de finalización anterior a la fecha de inicio en el formulario de evento
- **THEN** el sistema **DEBE** rechazar la operación y no guardar el evento
- **AND** debe mostrarse un mensaje de error claro indicando que la fecha de fin no puede ser anterior a la fecha de inicio

### Requirement: Event end time must be at least 15 minutes after start time
Para eventos con hora (no todo el día), la aplicación **DEBE** asegurar que la hora de finalización sea estrictamente posterior a la hora de inicio, con un intervalo mínimo de 15 minutos.

#### Scenario: User selects an end time equal to or before the start time
- **WHEN** el usuario introduce una hora de fin igual o anterior a la hora de inicio en el formulario de evento
- **THEN** el sistema **DEBE** rechazar la operación y no guardar el evento
- **AND** debe informarse al usuario de que la hora de fin debe ser posterior a la de inicio
- **AND** el sistema **DEBE** exigir al menos 15 minutos de diferencia entre hora de inicio y hora de fin

