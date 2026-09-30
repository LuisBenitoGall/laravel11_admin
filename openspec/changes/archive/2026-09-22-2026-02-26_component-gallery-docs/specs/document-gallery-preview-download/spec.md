# Spec: document-gallery-preview-download

## ADDED Requirements

### Requirement: Preview for images and PDF

The system SHALL provide an inline preview for images and PDF. Preview MUST be served through an authorized endpoint that validates company ownership.

#### Scenario: Preview image

- **WHEN** user requests preview for an image document (uuid)
- **THEN** system validates document belongs to current company and user has permission
- **AND** system serves the preview variant (or original if no variant) with appropriate Content-Type
- **AND** browser displays the image inline (e.g. in modal or new tab)

#### Scenario: Preview PDF

- **WHEN** user requests preview for a PDF document (uuid)
- **THEN** system validates document belongs to current company and user has permission
- **AND** system serves the PDF with Content-Type application/pdf
- **AND** browser displays the PDF inline (e.g. in iframe or embed)

#### Scenario: Preview Office file

- **WHEN** user requests preview for an Office document (xls, xlsx, docx)
- **THEN** system returns fallback behavior: redirect to download endpoint or 404 with controlled message
- **AND** system MUST NOT attempt to render Office files inline in this phase

### Requirement: Authorized download

The system SHALL provide an authorized download endpoint for any document type. The endpoint MUST validate company ownership before serving the file.

#### Scenario: Successful download

- **WHEN** user requests download for a document uuid
- **THEN** system validates document belongs to current company and user has permission
- **AND** system streams the original file with Content-Disposition attachment
- **AND** original filename (or sanitized version) is used for the downloaded file

#### Scenario: Download cross-company or non-existent document

- **WHEN** user requests download for a uuid of another company or non-existent
- **THEN** system returns 404
- **AND** no file content is served
