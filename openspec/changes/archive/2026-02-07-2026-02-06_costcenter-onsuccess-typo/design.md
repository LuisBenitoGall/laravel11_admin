# Design: Corrección typo onSuccess en CostCenter/Edit

## Context

- El componente usa `router.post(..., { nSuccess: ..., onError: ..., onFinish: ... })`. Inertia espera `onSuccess`, no `nSuccess`.
- Los callbacks actuales son `console.log`; no aportan valor al usuario y dejan ruido en consola.

## Goals / Non-Goals

**Goals:** Corregir el nombre de la propiedad para que el callback de éxito se ejecute. Reducir ruido de depuración en ese bloque.

**Non-Goals:** No implementar toast/notificación global en este change; solo asegurar que la opción correcta esté disponible.

## Decisions

### Decision 1: nSuccess → onSuccess

- Cambiar únicamente el nombre de la propiedad a `onSuccess` para que Inertia la reconozca.
- Sustituir el cuerpo del callback por una función vacía `() => {}` (o mantener un callback que en el futuro pueda usarse para toast/recarga). Se evita dejar `console.log` en producción.
