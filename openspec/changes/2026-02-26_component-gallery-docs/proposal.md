# Proposal: Galería de documentos (Document Gallery)

## Why

El proyecto necesita un módulo centralizado para gestionar documentos (imágenes, PDF, Office) por empresa, con experiencia de usuario tipo Media Library: grid de miniaturas, subida drag&drop, edición de metadatos y preview. Actualmente no existe un único punto de acceso multiempresa para archivos con estas capacidades. Es prioritario por la necesidad de compartir y organizar documentos por compañía sin exponer datos entre empresas.

## What Changes

- Nuevo módulo **Document Gallery** en `/admin/documents`:
  - Grid de tarjetas con miniaturas (imágenes) o iconos (PDF, Office).
  - Selección simple y múltiple (Ctrl/Cmd).
  - Panel lateral de detalles y edición de metadatos (title, alt_text, description).
  - Subida drag&drop con progreso reutilizando `DropzoneGallery.jsx`.
  - Preview inline para imágenes y PDF; icono + descarga para Office (xls, xlsx, docx).
- Nuevas tablas: `documents`, `document_variants`.
- Almacenamiento bajo `storage/app/companies/{company_id}/documents/`.
- Endpoints CRUD + upload, download, preview con aislamiento estricto por `company_id`.
- Tipos permitidos (configurable): imágenes (.jpg, .png, .gif, .webp), PDF, Office (.xls, .xlsx, .docx).
- Policy `DocumentPolicy` con verificación de `company_id`.
- Tests de aislamiento multiempresa y validaciones de subida.

## Capabilities

### New Capabilities

- `document-gallery-list`: Listado paginado, filtros por tipo (image/pdf/office), búsqueda, ordenación, grid de tarjetas con selección.
- `document-gallery-upload`: Subida múltiple con DropzoneGallery.jsx, progreso, integración con endpoints, Jobs para procesado pesado.
- `document-gallery-metadata`: Panel lateral de detalles, edición title/alt_text/description, endpoint PATCH.
- `document-gallery-preview-download`: Preview para imágenes y PDF, descarga autorizada, fallback para Office.
- `document-gallery-multi-company`: Aislamiento por company_id en listar, subir, editar, borrar, descargar y preview; imposible acceso cross-company.

### Modified Capabilities

<!-- None in this phase -->

## Impact

- **Migraciones:** `documents`, `document_variants`.
- **Modelos:** `Document`, `DocumentVariant`.
- **Controlador:** `DocumentController` con index, store (upload), show, update, destroy, download, preview.
- **Rutas:** `/admin/documents` (GET, POST), `/admin/documents/{uuid}` (GET, PATCH, DELETE), `/admin/documents/{uuid}/download`, `/admin/documents/{uuid}/preview`.
- **Jobs:** Procesado de imágenes (variantes, EXIF), opcional thumbnail PDF.
- **Frontend:** Nueva página `Admin/DocumentGallery/Index.jsx`, adaptación de `DropzoneGallery.jsx`.
- **Config:** Tipos MIME/extensión permitidos, tamaño máximo, límite batch.
- **Policy:** `DocumentPolicy` (viewAny, view, create, update, delete).
- **Tests:** Feature tests para aislamiento multiempresa y validaciones.
