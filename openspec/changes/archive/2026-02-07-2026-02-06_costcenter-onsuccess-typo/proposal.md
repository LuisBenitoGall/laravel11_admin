# Change: Corregir typo onSuccess en CostCenter/Edit

## Why

En el formulario de edición de centro de coste, el callback de éxito de la petición está mal escrito como `nSuccess` en lugar de `onSuccess`. Inertia solo reconoce `onSuccess`, por lo que el callback nunca se ejecuta tras guardar correctamente.

## What Changes

- Corregir la propiedad `nSuccess` → `onSuccess` en la llamada a `router.post()` dentro de `handleSubmit`.
- Opcionalmente sustituir los `console.log` del callback por un callback vacío o por feedback real (p. ej. toast), para mantener consistencia y no dejar logs de depuración.

## Capabilities

### Modified Capabilities

- **cost-center-edit**: Al guardar el formulario de centro de coste con éxito, el cliente MUST ejecutar el callback configurado (`onSuccess`), permitiendo refrescar estado, mostrar mensaje o redirigir si se desea en el futuro.

## Impact

- `resources/js/Pages/Admin/CostCenter/Edit.jsx`: una línea (typo); opcionalmente limpieza de console.log en ese mismo bloque.
