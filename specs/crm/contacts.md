# Spec: CRM Contacts Listing

## Context
Listado de contactos de la empresa en el CRM (Laravel 11 + Inertia + React).

## Requirements
- Incluir todos los contactos, aunque no tengan email.
- Filtrar por nombre, apellido, email, teléfono, posición, departamento, tipo de contacto.
- Los filtros deben ser case-insensitive y accent-insensitive (ejemplo: "Jose" debe coincidir con "José").
- Leads = contactos con `contact_type = clp`.

## Acceptance Criteria
- Contacto sin email aparece en el listado.
- Buscar "Jose" devuelve también "José".
- Buscar "Munoz" devuelve también "Muñoz".
- Filtrar por `contact_type = clp` devuelve solo leads.

## Notes
Este spec sirve como contrato entre backend y frontend.  
Los tests de Laravel deben validar estos criterios.  
El frontend React debe aplicar la misma normalización en sus filtros.
