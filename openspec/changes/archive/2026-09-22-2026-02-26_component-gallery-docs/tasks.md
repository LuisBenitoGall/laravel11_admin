# Tasks: Document Gallery

## 1. Config and migrations

- [x] 1.1 Create `config/document_gallery.php` with allowed_extensions, allowed_mime_types, max_file_size, max_batch, image_variants (thumb_sm 200px, thumb_md 480px, preview 1280px)
- [x] 1.2 Create migration `documents`: id, company_id, uploaded_by_user_id, uuid (unique), disk, path, original_name, stored_name, extension, mime_type, size_bytes, is_image, width/height (nullable), title/alt_text/description (nullable), meta (json), timestamps, soft deletes; indexes (company_id, created_at), (company_id, mime_type), uuid unique
- [x] 1.3 Create migration `document_variants`: id, company_id, document_id, variant (thumb_sm, thumb_md, preview), disk, path, mime_type, size_bytes, width/height, timestamps; indexes (company_id, document_id), (company_id, variant)

## 2. Models and policy

- [x] 2.1 Create `Document` model with company relation, document_variants relation, uuid generation, soft deletes, scopes for company
- [x] 2.2 Create `DocumentVariant` model with document relation
- [x] 2.3 Create `DocumentPolicy` with viewAny, view, create, update, delete; each method MUST verify `company_id` matches session current company
- [x] 2.4 Register DocumentPolicy in AuthServiceProvider

## 3. Document service and storage

- [x] 3.1 Create DocumentService (or equivalent) for: resolve path by company_id, sanitize original_name (prevent path traversal), validate MIME real + extension
- [x] 3.2 Implement storage under `storage/app/companies/{company_id}/documents/originals/` and `variants/{uuid}/`
- [x] 3.3 Create DocumentUploadRequest: validate files (allowed extensions, MIME real, max size, max batch)

## 4. DocumentController and routes

- [x] 4.1 Add routes: GET /admin/documents (index), POST /admin/documents (store/upload), GET /admin/documents/{uuid} (show), PATCH /admin/documents/{uuid} (update), DELETE /admin/documents/{uuid} (destroy), GET download, GET preview, GET thumb
- [x] 4.2 Implement DocumentController@index: paginate, filter by type (image/pdf/office), search (title, original_name, description), sort; scope by company_id from session; return thumb_url per item
- [x] 4.3 Implement DocumentController@store: accept multiple files, create Document per file with company_id from session, store files, dispatch ProcessDocumentVariants for images; authorize create
- [x] 4.4 Implement DocumentController@show: resolve by uuid, scope by company, authorize view
- [x] 4.5 Implement DocumentController@update: PATCH title/alt_text/description; authorize update; return 404 for cross-company
- [x] 4.6 Implement DocumentController@destroy: soft delete; authorize delete; return 404 for cross-company
- [x] 4.7 Implement DocumentController@download: resolve by uuid, authorize, stream with Content-Disposition attachment; 404 for cross-company
- [x] 4.8 Implement DocumentController@preview: images/PDF serve inline; Office redirect to download or 404; 404 for cross-company

## 5. ProcessDocumentVariants job

- [x] 5.1 Create `ProcessDocumentVariants` Job: load Document by id, verify company_id, correct EXIF orientation, generate thumb_sm/thumb_md/preview; create DocumentVariant records; handle failures gracefully

## 6. Frontend: DocumentGallery index page

- [x] 6.1 Create `Admin/DocumentGallery/Index.jsx` page with toolbar (search, type filter, sort, upload button)
- [x] 6.2 Implement grid of cards: thumb_url for images, icon for PDF/Office; single and Ctrl/Cmd multi-selection
- [x] 6.3 Integrate DropzoneGallery.jsx for upload: adapt to POST /admin/documents, show progress, refresh grid on success, handle per-file errors

## 7. Frontend: side panel and preview

- [x] 7.1 Implement side panel: show when 1 document selected; display uuid, original_name, extension, mime_type, size_bytes, created_at; editable title, alt_text, description; save via PATCH /admin/documents/{uuid}
- [x] 7.2 Handle multi-selection: show count or "select one to edit" as per design
- [x] 7.3 Add preview modal: images and PDF inline (use preview URL); Office show icon + download link

## 8. Menu and authorization

- [x] 8.1 Add "Documentos" / "Document Gallery" link to admin menu; permission gate (e.g. documents.viewAny)

## 9. Tests

- [x] 9.1 Feature test: list returns only current company documents; cross-company uuid returns 403 for show/update/destroy
- [x] 9.2 Feature test: upload valid image/PDF/Office creates Document with correct company_id; invalid type rejected
- [x] 9.3 Feature test: ProcessDocumentVariants creates variants for image; non-image does not run variant Job

## 10. Thumb action buttons (per card)

- [x] 10.1 Add action bar to each thumb card: position buttons in bottom-right; use OverlayTrigger + Tooltip (react-bootstrap) for each button title, same pattern as User/Index.jsx
- [x] 10.2 Delete button: icon (e.g. trash), tooltip "Eliminar"; on click show SweetAlert confirmation, on confirm call delete endpoint and refresh grid
- [x] 10.3 View-enlarge button: icon (e.g. expand), tooltip "Ver ampliado"; on click open modal with image/PDF preview (preview URL)
- [x] 10.4 Image-tools button: icon (e.g. crop/edit), tooltip "Herramientas de imagen"; for image documents only, open or expose crop, recortar, reducir tamaño (resize); hide or disable for PDF/Office

## 11. Layout and detail copy

- [x] 11.1 Card layout: in each grid cell, center the image/thumb vertically; ensure filename (original_name) is always at the bottom of `.card-body`
- [x] 11.2 Detail panel: show document filename as full path (or full public URL); add small button with copy icon to copy full path/URL to clipboard for use in public views
