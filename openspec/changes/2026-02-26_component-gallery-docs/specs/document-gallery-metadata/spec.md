# Spec: document-gallery-metadata

## ADDED Requirements

### Requirement: Side panel with document details

The system SHALL display a side panel with document metadata when one or more documents are selected. The panel MUST show editable fields for title, alt_text, and description.

#### Scenario: Side panel shows for selected document

- **WHEN** user selects a single document
- **THEN** side panel displays document details: uuid, original_name, extension, mime_type, size_bytes, created_at
- **AND** editable fields: title, alt_text, description (pre-filled with current values)
- **AND** save/cancel actions are available

#### Scenario: Full path and copy in detail

- **WHEN** user views the detail of a document in the side panel
- **THEN** the file name is shown as the full path (or full public URL) suitable for use in public views
- **AND** a small button with an appropriate icon (e.g. copy/clipboard) is displayed next to the path
- **AND** when the user clicks the copy button, the full path (or URL) is copied to the clipboard so it can be pasted in any public view

#### Scenario: Side panel shows for multiple selection

- **WHEN** user selects multiple documents
- **THEN** side panel displays aggregate info (count, types)
- **AND** bulk edit for title/alt_text/description MAY be available (implementation-defined)
- **OR** panel indicates "select one to edit" if bulk edit is not implemented

### Requirement: Update metadata via PATCH endpoint

The system SHALL allow updating document metadata (title, alt_text, description) via a PATCH request. The document MUST belong to the current company.

#### Scenario: Successful metadata update

- **WHEN** user submits updated title, alt_text, or description for a document
- **THEN** system validates the request
- **AND** system updates the Document record
- **AND** response returns the updated document
- **AND** company_id is never accepted from the request; it MUST be derived from session

#### Scenario: Update non-existent or cross-company document

- **WHEN** user sends PATCH for a document uuid that does not exist or belongs to another company
- **THEN** system returns 404
- **AND** no changes are persisted
