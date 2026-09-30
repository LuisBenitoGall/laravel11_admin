# Preflight check — c2026-09-30-users-create-send-password

## Resultado

**Listo para implementación.** Causa: mismatch `send_password` vs `send_pwd`.

## Dominio

- [x] Checkbox de Create activa `Mail::send` existente.
- [x] Recuperación de password fuera de alcance.

## Scope

- [x] Solo `Create.jsx` + tests. Modal ya correcto.

## Datos

- [x] No data impact expected.

## Autorización

- [x] `users.create` igual.

## UI

- [x] Mismo checkbox; solo el nombre del campo.

## Testing

- [x] Feature Mail fake on/off. Playwright no.

## Bloqueos

- Ninguno.
