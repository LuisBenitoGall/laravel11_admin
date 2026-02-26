- 22/02/2026:

Change: 2026-02-22_component_gallery_docs. 
Objetivo: componente de archivos
Rule: 10-architecture
Prohibición: no tocar implementación, solo artefactos. 

Objetivo:
Implementar un módulo “Galería de documentos” estilo Media Library (inspiración WP) pero mejorado:
- Grid de miniaturas/tarjetas con selección simple/múltiple
- Panel lateral de detalles y edición de metadatos
- Subida drag&drop con progreso usando el componente existente DropzoneGallery.jsx
- Previsualización de imágenes y PDF
- Soporte de Office básico (xls/xlsx/doc) con icono + descarga
- Multiempresa estricta por company_id en sesión

Regla multiempresa (CRÍTICA):
- Todos los documentos pertenecen SIEMPRE a una empresa por company_id.
- company_id se obtiene exclusivamente de la empresa en sesión (tenant actual). No se acepta por request.
- Todas las queries y operaciones (listar, subir, editar, borrar, descargar, preview) filtran por company_id actual.
- Debe ser imposible acceder a documentos de otra empresa (incluye UUID guessing).
- Toda URL de descarga/preview debe validar pertenencia y permisos.

Tipos de archivo (limitación actual + extensible):
ALLOWED:
- Imágenes: .jpg, .png, .gif, .webp
- PDF: .pdf
- Office: .xls, .xlsx, .docx
NO incluir vídeo por ahora.
Diseñar validación y UI para poder añadir más tipos en el futuro sin refactor masivo (configurable y centralizado).

Base de datos (migraciones):
1) documents (mínimo viable, extensible):
- id, company_id (FK), uploaded_by_user_id (FK), uuid (unique),
  disk, path, original_name, stored_name (o path), extension, mime_type,
  size_bytes, is_image (bool), width/height nullable,
  title/alt_text/description nullable, meta json nullable,
  timestamps, soft deletes.
Índices:
- (company_id, created_at), (company_id, mime_type), uuid unique.
Opcional: checksum si se quiere dedupe (no obligatorio en esta fase).

2) document_variants (para thumbs y previews, sólo aplica a imágenes y thumbnails de PDF si se soporta):
- id, company_id, document_id, variant (thumb_sm, thumb_md, preview),
  disk, path, mime_type, size_bytes, width/height, timestamps.
Índices:
- (company_id, document_id), (company_id, variant).

NOTA: No implementar carpetas/tags en esta fase salvo que sea trivial y sin ensuciar.
(En caso de no implementarlas, dejar la arquitectura lista para añadirlas después sin romper API ni UI).

Almacenamiento:
- Guardar bajo storage/app/companies/{company_id}/documents/...
- Separar originales y variantes.
- No exponer rutas directas multiempresa.
- Descarga/preview mediante endpoints autorizados (stream o URL firmada corta).

Procesado de archivos:
- Imágenes:
  - Corregir orientación EXIF si aplica.
  - Generar variantes: thumb_sm (200px), thumb_md (480px), preview (1280px) manteniendo ratio.
  - Compresión razonable (sin perder calidad grotescamente).
- PDF:
  - Preview inline en navegador (endpoint preview).
  - Miniatura de primera página: implementar sólo si el entorno lo soporta de forma fiable; si no, fallback a icono genérico.
- Office (xls/xlsx/doc):
  - No generar preview (por ahora). Mostrar icono + metadatos + descarga.
- Procesado pesado: usar Jobs/Queue para no bloquear la subida masiva.

Validaciones y seguridad:
- Validar MIME real + extensión permitida.
- Tamaño máximo configurable (p.ej. 25MB) y límite de batch configurable.
- Sanitizar nombre original (evitar path traversal y caracteres raros).
- Bloquear cualquier otro tipo de archivo no permitido.
- Todas las operaciones deben pasar por autorización y company_id actual.

Backend (contrato de endpoints):
- GET /admin/documents
  Params: search, type (image/pdf/office), sort, dir, page.
  Respuesta: items paginados + data necesaria para render (thumb_url si existe).
- POST /admin/documents/upload
  Subida múltiple. Respuesta incluye documentos creados y estado de procesado (si hay jobs).
- GET /admin/documents/{uuid}
  Detalle (metadatos + variantes).
- PATCH /admin/documents/{uuid}
  Editar title/alt_text/description (y cualquier metadato permitido).
- DELETE /admin/documents/{uuid}
  Soft delete recomendado.
- GET /admin/documents/{uuid}/download
  Descarga autorizada.
- GET /admin/documents/{uuid}/preview
  Imágenes: servir variant preview. PDF: inline. Office: opcional “no preview” (redirigir a download o 404 controlado).

Frontend (Inertia + React + Bootstrap):
- Página Index con:
  - Toolbar: buscar, filtro por tipo (image/pdf/office), ordenar, botón subir
  - Grid de tarjetas con thumb para imágenes, thumb/icono para PDF, icono para Office
  - Selección múltiple (ctrl/cmd). Sidebar de detalles.
  - Modal de preview: imágenes y PDF.
- IMPORTANTE: Reutilizar el componente existente DropzoneGallery.jsx.
  - NO crear otro uploader.
  - Adaptarlo para trabajar con los endpoints nuevos y para refrescar/inyectar resultados en el grid.
  - Gestionar progreso, errores por archivo y estado final.

Permisos / Policies:
Indicar si hay que crear Policy para Document y aplicarla en controladores.
(Se recomienda: viewAny/view/create/update/delete, con verificación adicional de company_id).

Entrega:
- Mostrar diffs de migraciones, modelos, servicios/jobs, controladores/requests, rutas y componentes React modificados (incluido DropzoneGallery.jsx).
- Incluir tests mínimos:
  - Aislamiento por company_id (listar, descargar, preview).
  - Subida válida e inválida por tipo/tamaño.
  - Acceso denegado cross-company.