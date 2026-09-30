# Spec: document-gallery-list

## ADDED Requirements

### Requirement: Paginated list of documents

The system SHALL provide a paginated list of documents for the current company. Results MUST be restricted to documents whose `company_id` matches the company in session.

#### Scenario: User requests document list with defaults

- **WHEN** user navigates to `/admin/documents`
- **THEN** system returns the first page of documents for the current company
- **AND** each item includes: uuid, thumb_url (or icon fallback), title, original_name, extension, mime_type, size_bytes, created_at
- **AND** pagination metadata (total, per_page, current_page) is included

#### Scenario: User filters by type

- **WHEN** user selects type filter (image, pdf, or office)
- **THEN** system returns only documents matching that MIME/extension category
- **AND** results remain paginated and company-scoped

#### Scenario: User searches by text

- **WHEN** user enters search text (title, original_name, or description)
- **THEN** system returns documents matching the search within the current company
- **AND** filters (type) and pagination apply to the filtered result set

#### Scenario: User changes sort order

- **WHEN** user selects a sort field and direction (e.g. created_at desc)
- **THEN** system returns documents ordered accordingly
- **AND** results remain company-scoped and paginated

### Requirement: Grid view with selection

The system SHALL render documents in a grid of cards with thumbnails for images, thumb or icon for PDF, and icon for Office. Users MUST be able to select one or multiple items (Ctrl/Cmd+click).

#### Scenario: Grid displays thumbnails or icons

- **WHEN** documents are loaded
- **THEN** images show thumb_url (thumb_sm or thumb_md) when available
- **AND** PDF shows thumb or generic PDF icon as fallback
- **AND** Office files (xls, xlsx, docx) show a generic Office icon

#### Scenario: Card layout — image centered, filename at bottom

- **WHEN** a document card is rendered
- **THEN** the image (or icon) is vertically centered within the cell/card area
- **AND** the file name (original_name) is always displayed at the bottom of the `.card-body`
- **AND** the layout keeps the filename visible and fixed at the bottom regardless of thumb size

#### Scenario: Single and multiple selection

- **WHEN** user clicks a document card
- **THEN** that document is selected (visual highlight)
- **WHEN** user Ctrl/Cmd+clicks additional cards
- **THEN** multiple documents are selected
- **WHEN** user clicks an already selected document
- **THEN** that document is deselected

### Requirement: Thumb action buttons

The system SHALL display action buttons on each thumb card, positioned in the bottom-right corner. Each button MUST use an appropriate icon and a tooltip (title) via React Bootstrap `OverlayTrigger` + `Tooltip`, following the same pattern as in `User/Index.jsx`.

#### Scenario: Delete button with confirmation

- **WHEN** user clicks the delete button on a thumb
- **THEN** system shows a confirmation dialog via SweetAlert (or equivalent)
- **AND** on confirm, system deletes the document (authorized request) and refreshes or removes the thumb from the grid
- **AND** the button is wrapped in `OverlayTrigger` with a tooltip (e.g. "Eliminar" / "Delete")

#### Scenario: View enlarged image in modal

- **WHEN** user clicks the view-enlarge button on a thumb (image or PDF)
- **THEN** system opens a modal showing the image or PDF at larger size (preview URL)
- **AND** the button uses `OverlayTrigger` with a tooltip (e.g. "Ver ampliado" / "View enlarged")

#### Scenario: Image tools button

- **WHEN** user clicks the image-tools button on a thumb (for image documents)
- **THEN** system exposes or opens tools for that image: crop, recortar (cut), reducir tamaño (resize), etc., as per implementation
- **AND** the button uses `OverlayTrigger` with a tooltip (e.g. "Herramientas de imagen" / "Image tools")
- **AND** for non-image documents (PDF, Office) this button MAY be hidden or disabled
