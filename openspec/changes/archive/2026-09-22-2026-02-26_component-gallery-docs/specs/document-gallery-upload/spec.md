# Spec: document-gallery-upload

## ADDED Requirements

### Requirement: Multiple file upload via DropzoneGallery

The system SHALL accept multiple file uploads via the existing `DropzoneGallery.jsx` component. Upload MUST target the current company and use the configured allowed types and limits.

#### Scenario: User uploads valid files

- **WHEN** user drops or selects files within allowed types (images, PDF, Office) and within size limits
- **THEN** system creates one Document record per file with `company_id` from session
- **AND** files are stored under `storage/app/companies/{company_id}/documents/`
- **AND** response includes created documents (uuid, thumb_url when ready, status)
- **AND** upload progress is shown per file

#### Scenario: User uploads invalid file type

- **WHEN** user drops or selects a file with extension or MIME not in allowed list
- **THEN** system rejects the file with a clear error message
- **AND** no Document record is created for that file
- **AND** valid files in the same batch are processed

#### Scenario: User uploads file exceeding size limit

- **WHEN** user drops or selects a file larger than `max_file_size` (config)
- **THEN** system rejects the file with a clear error message
- **AND** no Document record is created for that file

#### Scenario: User exceeds batch limit

- **WHEN** user attempts to upload more files than `max_batch` (config) in a single request
- **THEN** system rejects the excess files with a clear error message
- **AND** up to `max_batch` files are processed

### Requirement: Background processing for images

The system SHALL process images asynchronously via a Job. Upload response MUST return immediately; thumbnails and variants MUST be generated in the background.

#### Scenario: Image upload triggers Job

- **WHEN** user uploads an image (jpg, png, gif, webp)
- **THEN** system creates the Document record and stores the original file
- **AND** system dispatches `ProcessDocumentVariants` Job
- **AND** upload response returns with document uuid and a processing/placeholder status for thumb
- **AND** Job generates thumb_sm (200px), thumb_md (480px), preview (1280px) and corrects EXIF orientation

#### Scenario: Non-image upload does not require variants Job

- **WHEN** user uploads PDF or Office file
- **THEN** system creates the Document record and stores the file
- **AND** no variant Job is dispatched
- **AND** response includes document uuid and icon fallback for display
