# Tasks: Filtro de teléfono en CRM contactos (tabla)

## 1. Backend

- [x] 1.1 En `CrmContactController::filteredData()`, añadir al array `$filters` una entrada para `phones` que, cuando el request tenga el parámetro `phones` no vacío, restrinja por `User->whereHas('phones', ...)` con búsqueda LIKE sobre el campo de número (e164).

## 2. Frontend

- [x] 2.1 En `resources/js/Pages/Admin/CrmContact/Index.jsx`, en la definición de la columna `phones`, cambiar `filter: ''` a `filter: 'text'` para que FilterRow muestre el input y envíe el parámetro.

## 3. Verificación

- [ ] 3.1 Comprobar que al escribir en el filtro de teléfonos se aplica el filtro y los resultados se restringen correctamente.
- [ ] 3.2 Comprobar que con el filtro vacío el listado se comporta como antes (sin restricción por teléfono).
