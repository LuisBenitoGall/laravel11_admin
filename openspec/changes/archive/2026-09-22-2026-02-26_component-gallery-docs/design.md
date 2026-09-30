# Design: Galería de documentos (Document Gallery)

## Context

El proyecto Laravel usa Inertia + React, Bootstrap, y un patrón multiempresa donde `company_id` se obtiene de la sesión (`session('currentCompany')` o `CompanyContext`). No existe aún un módulo centralizado para documentos por empresa. El componente `DropzoneGallery.jsx` existe y debe reutilizarse para subida. El almacenamiento actual usa `storage/app/` con rutas no expuestas directamente para contenido sensible.

**Constraints:**
- Multiempresa estricta: `company_id` solo de sesión, nunca de request.
- No exponer rutas de almacenamiento directas.
- Tipos de archivo configurables y extensibles.

## Goals / Non-Goals

**Goals:**
- Módulo Document Gallery con CRUD, upload, download, preview.
- Aislamiento total por `company_id` en todas las operaciones.
- Variantes de imagen (thumb_sm, thumb_md, preview) generadas en Job.
- Preview inline para imágenes y PDF; icono + descarga para Office.
- Integración con `DropzoneGallery.jsx` sin crear otro uploader.

**Non-Goals:**
- Carpetas, tags, categorías (dejar arquitectura preparada).
- Vídeo.
- Preview de Office (xls, xlsx, docx).
- Miniatura PDF (fallback a icono genérico si no es fiable).

## Decisions

### 1. Modelo de datos

**Tablas:** `documents`, `document_variants` según especificación.

**Decisión:** Usar `uuid` como identificador público (no exponer `id` en URLs) para evitar enumeración cross-company. `company_id` en ambas tablas para queries directas sin JOIN.

**Alternativa considerada:** Solo `id` numérico — rechazada por riesgo de guessing entre empresas.

### 2. Almacenamiento

**Path:** `storage/app/companies/{company_id}/documents/originals/{uuid}.{ext}` y `storage/app/companies/{company_id}/documents/variants/{document_uuid}/{variant}.{ext}`.

**Decisión:** Usar `local` disk con path dinámico por empresa. No exponer URLs directas; descarga y preview vía endpoints autorizados que validan pertenencia.

**Alternativa:** URL firmada — viable para CDN futuro; no necesaria en esta fase.

### 3. Tipos permitidos (config)

**Decisión:** Fichero `config/document_gallery.php` con:
- `allowed_extensions` → array de extensiones
- `allowed_mime_types` → mapa extensión → MIME
- `max_file_size` (bytes)
- `max_batch` (número de archivos por upload)
- `image_variants` (dimensiones thumb_sm, thumb_md, preview)

Permite añadir tipos sin refactor masivo.

### 4. Procesado asíncrono

**Decisión:** Job `ProcessDocumentVariants` para imágenes (EXIF, variantes). El upload responde inmediatamente con el documento creado; el Job actualiza variantes en background. El frontend puede mostrar placeholder o icono hasta que exista thumb.

**Alternativa:** Procesado síncrono — rechazada por subida masiva lenta.

### 5. Validación MIME

**Decisión:** Validar extensión permitida + MIME real (lectura de cabeceras del archivo). Evitar confianza solo en extensión o Content-Type del request.

### 6. Policy y autorización

**Decisión:** Crear `DocumentPolicy` con `viewAny`, `view`, `create`, `update`, `delete`. Cada método comprueba `$document->company_id === session('currentCompany')` (o equivalente). Aplicar en `DocumentController` con `authorize()`.

### 7. Endpoints download/preview

**Decisión:** `GET /admin/documents/{uuid}/download` y `GET /admin/documents/{uuid}/preview` resuelven documento por UUID, validan `company_id` y Policy, y sirven stream o `Storage::response()`. Office en preview → redirigir a download o 404.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| UUID guessing | Validar siempre `company_id` antes de servir; Policy en cada acción. |
| Procesado lento (Job) | UI muestra estado “procesando” o placeholder; thumb disponible cuando el Job termina. |
| PDF thumbnail no fiable | Fallback a icono genérico; no bloquear preview inline. |
| Batch muy grande | Límite `max_batch` en config; validar en Request. |
| Path traversal en nombres | Sanitizar `original_name` (quitar `/`, `..`, caracteres raros) antes de guardar. |

## Migration Plan

1. Crear migraciones `documents`, `document_variants`.
2. Publicar/crear `config/document_gallery.php`.
3. Modelos `Document`, `DocumentVariant`.
4. `DocumentPolicy`, `DocumentController`, rutas.
5. Jobs `ProcessDocumentVariants`.
6. Frontend Index + adaptación `DropzoneGallery.jsx`.
7. Tests Feature.
8. Rollback: migraciones down; eliminar rutas y controlador si es necesario.
