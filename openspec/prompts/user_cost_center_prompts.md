- 03/02/2026:

Lee y aplica estrictamente:
- openspec/specs/core/models/user_cost_center.md
- openspec/_global/ (convenciones del proyecto)

Objetivo:
1) Completar la migration existente de user_cost_centers para que cumpla EXACTAMENTE el spec.
2) Crear el modelo App\Models\UserCostCenter cumpliendo EXACTAMENTE el spec.

Restricciones:
- NO crear controllers, requests, routes, views, tests ni factories.
- NO modificar archivos fuera del alcance, salvo que sea imprescindible por convenciones del repo.
- Si el archivo del modelo ya existe, actualizarlo sin romper compatibilidad.
- No inventar campos, permisos ni lógica fuera de lo indicado. Si falta algo, dejar // TODO.

Entrega:
- Lista de archivos modificados/creados.
- Confirmación explícita de: columnas, índices, unique, foreign keys, $fillable, $casts, relaciones y scopes.
