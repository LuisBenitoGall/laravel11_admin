## ADDED Requirements

### Requirement: Delete CRM contact relation only

The system SHALL, when configured with `destroyRoute = 'crm-contacts.destroy'`, delete ONLY the CRM contact record associated with the current account, identified by the row's contact id, and MUST NOT delete the underlying user or other contact relations.

#### Scenario: Delete single CRM contact row
- **WHEN** the user clicks the delete action on a row where `destroyRoute === 'crm-contacts.destroy'`
- **THEN** the frontend sends a delete request to `crm-contacts.destroy` with the contact identifier from `row[rowDeleteKey]` (e.g. `crm_contacts.id`)
- **AND** the backend deletes the corresponding `crm_contacts` row for the current account
- **AND** any other `crm_contacts` rows for the same user in other accounts remain intact

#### Scenario: Invalid or missing CRM contact id
- **WHEN** the frontend attempts to delete a CRM contact but the row lacks a valid contact identifier
- **THEN** the system MUST NOT attempt deletion
- **AND** the user is shown an error or the action is disabled

### Requirement: Delete user-company relation only

The system SHALL, when configured with `destroyRoute = 'user-companies.destroy'`, delete ONLY the user–company relationship in `user_companies`, identified by the relation id, and MUST NOT delete the user or other company relations.

#### Scenario: Delete single user-company relation
- **WHEN** the user clicks the delete action on a row where `destroyRoute === 'user-companies.destroy'`
- **THEN** the frontend sends a delete request to `user-companies.destroy` with the relation identifier from `row[rowDeleteKey]` (e.g. `user_companies.id`)
- **AND** the backend deletes only that `user_companies` row
- **AND** the `users` record and any other `user_companies` rows for that user remain intact

#### Scenario: User linked to multiple companies
- **WHEN** the user deletes one row for a user that is linked to multiple companies
- **THEN** only the relation for the current company is removed
- **AND** the same user still appears in other companies' user lists as appropriate

### Requirement: Preserve context and return to same view/tab

The system SHALL return the user to the same screen and tab from which the delete was initiated, preserving filters and pagination when reasonably possible.

#### Scenario: Delete from company users tab
- **WHEN** the delete action is triggered from the users tab inside `Company/Edit`
- **THEN** after a successful delete the response MUST navigate back to `Company/Edit` for the same company
- **AND** the users tab is active
- **AND** the users list is refreshed so the deleted row no longer appears

#### Scenario: Delete from other TableUsers context
- **WHEN** `TableUsers` is used in another context (e.g. CRM contacts listing) with a configured `indexRoute` and `indexParams`
- **THEN** after delete the component MUST either:
- **THEN** navigate back using `indexRoute` + `indexParams`
- **AND** reload the listing so the deleted row is removed

### Requirement: Safety and authorization

The system MUST ensure that delete actions from `TableUsers` respect existing authorization and multi-tenant constraints for both CRM contacts and user-company relations.

#### Scenario: Unauthorized delete attempt
- **WHEN** a user without delete permission attempts to trigger the delete action in `TableUsers`
- **THEN** the frontend SHOULD hide or disable the delete control
- **AND** any direct request to the delete route MUST be rejected with an appropriate error (e.g. 403)

