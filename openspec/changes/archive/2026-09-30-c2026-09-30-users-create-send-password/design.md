## Context

`User/Create.jsx` envía `send_password`. `UserController::store` (~L689) exige `send_pwd` y `side != 'crm-accounts'` para `Mail::send('emails.send-user-password', ...)`. `ModalUserCreate.jsx` ya usa `send_pwd`. La recuperación usa `Password::sendResetLink`, otro camino. Brief: `docs/prompts/c2026-09-30-users-create-send-password.md`.

## Goals / Non-Goals

**Goals:**

- El checkbox de `/admin/users/create` activa el envío existente.
- Campo `send_pwd` alineado con modal y controller.
- Feature Mail fake on/off.

**Non-Goals:**

- Reset de password, plantilla, SMTP, `Mail::send` internals, altas `crm-accounts`, rediseño del formulario.

## Decisions

1. **Contrato canónico: `send_pwd`**  
   Renombrar en `Create.jsx` el estado y el `name` del checkbox a `send_pwd`.  
   **Descartado:** cambiar el controller a `send_password` (rompería el modal).  
   **Descartado:** aceptar ambos en el controller (no pedido; el bug es solo Create).

2. **Lógica de envío intacta**  
   Mismo `Mail::send`, mismos `$data`, from/to/subject. No tocar `side == 'crm-accounts'`.

3. **Tests**  
   `Mail::fake()`. POST `users.store` sin `user_id`, con email, `send_pwd` true → assert enviado a la vista `emails.send-user-password` (o `Mail::assertSent` según API de Laravel 11 para send por vista). `send_pwd` false → `Mail::assertNothingSent`. Usuario con `users.create` y empresa en sesión como el resto de Feature admin.

## Risks / Trade-offs

- **[Riesgo]** Test asume Mailable class y el código usa vista. **Mitigación:** assert sobre `Mail::sent` / facade según el patrón real de `Mail::send(view)`.  
- **[Riesgo]** Tocar reset “por si acaso”. **Mitigación:** NonGoal explícito.

## Migration Plan

- Deploy front. Rollback: revertir `Create.jsx`.

## Open Questions

Ninguna.
