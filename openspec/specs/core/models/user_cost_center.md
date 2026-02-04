# Model: UserCostCenter

## Objetivo
Vincular usuarios con centros de coste dentro del contexto multiempresa. Un CostCenter pertenece a una única empresa (cost_centers.company_id), pero el vínculo (asignación) también se scopa por empresa mediante user_cost_centers.company_id para consultas, seguridad y consistencia.

## Alcance
- Crear/ajustar la **migración** de `user_cost_centers` (el archivo ya existe).
- Crear el **modelo** `App\Models\UserCostCenter`.
- No crear controllers, requests, routes, views ni componentes.

## Base de datos

### Tabla: user_cost_centers
Campos requeridos:
- id (PK)
- company_id (FK a companies.id) NOT NULL
- user_id (FK a users.id) NOT NULL
- cost_center_id (FK a cost_centers.id) NOT NULL
- is_default (boolean) NOT NULL default false
- timestamps

Índices y constraints:
- unique(company_id, user_id, cost_center_id)
- index(company_id, user_id)
- index(company_id, cost_center_id)

Foreign keys:
- company_id -> companies.id (onDelete cascade si aplica en el proyecto)
- user_id -> users.id (onDelete cascade)
- cost_center_id -> cost_centers.id (onDelete cascade)

Regla de coherencia (a validar en capa de aplicación):
- user_cost_centers.company_id DEBE coincidir con cost_centers.company_id del cost_center_id asignado.

## Modelo: App\Models\UserCostCenter

Requisitos:
- Debe extender `Illuminate\Database\Eloquent\Relations\Pivot` salvo convención distinta del repo.
- protected $table = 'user_cost_centers'
- $fillable: company_id, user_id, cost_center_id, is_default
- $casts: is_default => boolean

Relaciones:
- company(): belongsTo(Company::class)
- user(): belongsTo(User::class)
- costCenter(): belongsTo(CostCenter::class)

Scopes:
- scopeForCompany($query, int $companyId)
- (opcional) scopeForUser($query, int $userId)

## Criterios de aceptación
- La migración crea exactamente la estructura indicada, con FKs + índices + unique.
- El modelo contiene $fillable y no ignora campos al crear/actualizar.
- No se generan archivos fuera del alcance.
