# Implementation handoff

Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Viñetas según `openspec/prompts/template_prompts.md`.

## Change

- Ruta: `openspec/changes/c2026-09-30-users-create-send-password/`
- Comando: `/opsx-apply`
- **No archivar.**

## Fases

1. `Create.jsx`: `send_pwd`.
2. Feature Mail fake. Marcar `tasks.md` `[x]`.

## Leer primero

- `docs/prompts/c2026-09-30-users-create-send-password.md`
- `design.md`, `specs/users-create-send-password/spec.md`, `tasks.md`
- `resources/js/Pages/Admin/User/Create.jsx`
- `app/Http/Controllers/Admin/UserController.php` (`store` ~envío)
- `resources/js/Components/modals/ModalUserCreate.jsx`

## Patrones

- Contrato `send_pwd` del modal. `Mail::fake()`. PHP 8.2 / Laravel 11.

## UI

- Sin componentes nuevos.

## Checks

- Tests §2. Grep: no tocar reset de password.

## tasks.md

Marcar `[x]`. Dudas → Architecture. No reescribir spec/design.
