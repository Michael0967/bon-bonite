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
