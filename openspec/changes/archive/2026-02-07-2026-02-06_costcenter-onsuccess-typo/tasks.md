# Tasks: CostCenter Edit — typo onSuccess

## 1. Corrección

- [x] 1.1 En `CostCenter/Edit.jsx`, en `router.post(..., { ... })`, cambiar `nSuccess` por `onSuccess`.
- [x] 1.2 Sustituir los callbacks `console.log` de `onSuccess` y `onFinish` por callbacks vacíos (o eliminar si no se requiere comportamiento); mantener `onError` útil si se desea (o dejarlo sin console para producción).

## 2. Verificación

- [x] 2.1 Comprobar que no queden referencias a `nSuccess` en el archivo.
