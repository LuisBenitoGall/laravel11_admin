# Spec: document-gallery-multi-company

## ADDED Requirements

### Requirement: Strict company isolation

The system SHALL enforce strict multi-company isolation. All operations MUST filter by `company_id` derived exclusively from the session (current company). It MUST be impossible to access documents belonging to another company.

#### Scenario: company_id from session only

- **WHEN** any request (list, upload, view, update, delete, download, preview) is processed
- **THEN** `company_id` is obtained ONLY from `session('currentCompany')` or equivalent tenant context
- **AND** `company_id` MUST NOT be accepted from query string, body, or headers

#### Scenario: List returns only current company documents

- **WHEN** user requests document list (GET /admin/documents)
- **THEN** system returns only documents where `document.company_id` equals the current company
- **AND** documents from other companies are never included

#### Scenario: Upload assigns current company

- **WHEN** user uploads a document (POST)
- **THEN** system assigns `company_id` from session to the new Document
- **AND** storage path MUST include `companies/{company_id}/documents/`

#### Scenario: Cross-company access by UUID returns 404

- **WHEN** user attempts to view, update, delete, download, or preview a document by UUID that belongs to another company
- **THEN** system returns 404 (or 403 as appropriate)
- **AND** no data from the other company's document is exposed
- **AND** UUID guessing MUST NOT allow cross-company access

### Requirement: DocumentPolicy enforces company check

The system SHALL use `DocumentPolicy` with company verification. Every controller action MUST authorize via the policy.

#### Scenario: Policy methods check company_id

- **WHEN** `viewAny`, `view`, `create`, `update`, or `delete` is invoked
- **THEN** policy MUST verify `$document->company_id === session('currentCompany')` (or equivalent)
- **AND** unauthorized access returns 403

#### Scenario: Controller applies authorization

- **WHEN** DocumentController handles any action
- **THEN** `authorize()` (or equivalent) is called before performing the operation
- **AND** download and preview endpoints apply the same authorization
