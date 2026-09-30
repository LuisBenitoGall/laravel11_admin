# users-table-context-aware-delete Specification

## Purpose
TBD - created by archiving change c2026-02-24-users-table-delete. Update Purpose after archive.
## Requirements
### Requirement: Delete CRM contact relation only

The system SHALL, when configured with `destroyRoute = 'crm-contacts.destroy'`, act on ONLY the CRM contact identified by the row's contact id (`crm_contacts.id`), and MUST NOT delete the underlying user or other contact relations of that user.

When the contact is linked to a CRM account (`crm_account_id` set), the system MUST **unlink** it from that account (set `crm_account_id` to null) and MUST keep the `crm_contacts` row. When the contact has no account, the system MUST soft-delete that `crm_contacts` row.

#### Scenario: Unlink CRM contact from account
- **WHEN** the user clicks the delete action on a row where `destroyRoute === 'crm-contacts.destroy'` and the contact has `crm_account_id`
- **THEN** the frontend sends a delete request to `crm-contacts.destroy` with the contact identifier from `row[rowDeleteKey]` (e.g. `crm_contacts.id`)
- **AND** the backend sets that contact's `crm_account_id` to null (does not hard-delete the contact row)
- **AND** any other `crm_contacts` rows for the same user in other accounts remain intact
- **AND** the `users` record remains intact

#### Scenario: Delete CRM contact without account
- **WHEN** the user deletes a contact with no `crm_account_id`
- **THEN** the backend soft-deletes that `crm_contacts` row
- **AND** the underlying user remains intact

#### Scenario: Invalid or missing CRM contact id
- **WHEN** the frontend attempts to delete a CRM contact but the row lacks a valid contact identifier
- **THEN** the system MUST NOT attempt deletion against a user id as if it were a contact id
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
- **THEN** only the relation for the targeted company is removed
- **AND** the same user still appears in other companies' user lists as appropriate

### Requirement: Preserve context and return to same view/tab

The system SHALL return the user to the same screen and tab from which the delete was initiated, preserving filters and pagination when reasonably possible.

#### Scenario: Unlink from CRM account users tab
- **WHEN** the delete action is triggered from the users tab inside `Company/Edit` for a CRM account (`crm-contacts.destroy`)
- **THEN** after a successful unlink the response MUST navigate back to `crm-accounts.edit` for the same account
- **AND** the users tab is active

#### Scenario: Delete user-company from embedded TableUsers or user edit
- **WHEN** `user-companies.destroy` is called from an Inertia page (user edit, customer users tab, etc.)
- **THEN** after a successful delete the response MUST redirect back to the previous page (same context)
- **AND** the listing / form is refreshed so the deleted relation no longer appears

### Requirement: Safety and authorization

The system MUST ensure that delete actions from `TableUsers` respect existing authorization and multi-tenant constraints for both CRM contacts and user-company relations.

#### Scenario: Unauthorized delete attempt
- **WHEN** a user without delete permission attempts a direct request to the delete route
- **THEN** the request MUST be rejected with an appropriate error (e.g. 403)
- **AND** the frontend SHOULD hide or disable the delete control when permissions are available in page props

