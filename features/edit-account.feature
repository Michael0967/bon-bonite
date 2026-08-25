Feature: Edit account data

  As a registered customer
  I want to update my personal information
  so that my account details stay current.

  Background:
    Given a logged-in customer on the edit account page

  # --- Happy paths ---

  Scenario: Update phone number successfully
    When they activate the edit form
    And they update their phone number
    And they save the changes
    Then the success message is displayed

  Scenario: Update name and last name successfully
    When they activate the edit form
    And they change their first name and last name
    And they save the changes
    Then the success message is displayed

  # --- Negative cases (bugs) ---

  Scenario: Email should not be changeable (e-commerce best practice)
    When they activate the edit form
    And they try to change their email address
    And they save the changes
    Then the email should remain unchanged

  Scenario: Required fields cannot be saved empty
    When they activate the edit form
    And they clear required fields
    And they save the changes
    Then the required fields should not be empty

  Scenario: Wrong current password is rejected
    When they activate the password form
    And they enter a wrong current password
    And they save the password changes
    Then the password error message is displayed

  Scenario: Mismatched new passwords are rejected
    When they activate the password form
    And they enter mismatched new passwords
    And they save the password changes
    Then the password error message is displayed

  Scenario: New password must differ from current
    When they activate the password form
    And they enter the same password as current
    And they save the password changes
    Then the password error message is displayed

  # --- Success last (changes password) ---

  Scenario: Change password successfully
    When they activate the password form
    And they enter their current password and a new password
    And they save the password changes
    Then the password is changed and they are redirected
    And the new password works for re-login

  # --- Address: billing happy paths ---

  Scenario: Save billing address with valid data
    When they open the billing address modal
    And they fill the billing address with valid data
    And they save the billing address
    Then the billing address is saved successfully

  Scenario: Delete billing address
    When they open the billing address modal
    And they fill the billing address with valid data
    And they save the billing address
    And they delete the billing address
    Then the billing address is removed

  # --- Address: billing bugs ---

  Scenario: Billing delete button should not be visible without address data
    Then the billing delete button should not be visible

  Scenario: Billing edit button should say Add when no address exists
    Then the billing edit button should say Add

  Scenario: Billing address cannot be saved with empty required fields
    When they open the billing address modal
    And they clear the billing address fields
    And they save the billing address
    Then a validation error is displayed

  Scenario: Billing phone field should reject non-numeric characters
    When they open the billing address modal
    And they enter non-numeric characters in the billing phone field
    And they save the billing address
    Then a validation error is displayed

  Scenario: Billing city dropdown should have city options
    When they open the billing address modal
    Then the billing city dropdown should have city options

  Scenario: Billing email should pre-fill from account
    When they open the billing address modal
    Then the billing email field should be pre-filled

  # --- Address: shipping happy paths ---

  Scenario: Save shipping address with valid data
    When they open the shipping address modal
    And they fill the shipping address with valid data
    And they save the shipping address
    Then the shipping address is saved successfully

  Scenario: Delete shipping address
    When they open the shipping address modal
    And they fill the shipping address with valid data
    And they save the shipping address
    And they delete the shipping address
    Then the shipping address is removed

  # --- Address: shipping bugs ---

  Scenario: Shipping delete button should not be visible without address data
    Then the shipping delete button should not be visible

  Scenario: Shipping address cannot be saved with empty required fields
    When they open the shipping address modal
    And they clear the shipping address fields
    And they save the shipping address
    Then a validation error is displayed
