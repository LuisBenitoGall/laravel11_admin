Tu prompt debe tener SIEMPRE esta estructura:

1. Contexto y objetivo (1-2 líneas)
2. Fuentes de verdad (OpenSpec archivos)
3. Alcance (qué tocar y qué NO tocar)
4. Requisitos verificables (criterios Done)
5. Entrega (diff, archivos, explicación breve)


Regla mental para estructurar tus peticiones (para que lo interiorices)

Cuando quieras pedir algo a Cursor, piensa en este “formato ERP”:

1. Qué quiero
2. Dónde se documenta (spec)
3. Dónde se controla (task)
4. Qué archivos toca
5. Qué NO debe tocar
6. Cómo sé que está hecho (Done)

Si lo haces así, el agente no “interpreta”, ejecuta.



Lee y aplica estrictamente: openspec/specs/modules/<modulo>/spec.md
y las convenciones en openspec/_global/.

Tareas:
1) Implementa lo requerido en el spec.
2) No crees nada fuera del alcance del spec.
3) Antes de modificar/crear archivos, verifica si ya existen y respeta convenciones del repo.
4) Añade TODOs donde el spec deje decisiones abiertas (no inventes).

Entrega:
- Lista de archivos creados/modificados.
- Resumen breve de lo implementado vs criterios de aceptación.
