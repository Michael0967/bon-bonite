@smoke @regression
Feature: Edit profile and password

  As a registered customer
  I want to update my personal information and password
  so that my account details stay current and secure.

  Background:
    Given a logged-in customer on the edit account page

  # --- Profile happy paths ---

  @regression
  Scenario: Update phone number successfully
    When they activate the edit form
    And they update their phone number
    And they save the changes
    Then the success message is displayed

  @regression
  Scenario: Update name and last name successfully
    When they activate the edit form
    And they change their first name and last name
    And they save the changes
    Then the success message is displayed

  # --- Profile negative cases ---

  @regression
  Scenario: Email should not be changeable
    When they activate the edit form
    And they try to change their email address
    And they save the changes
    Then the email should remain unchanged

  @regression
  Scenario: Profile phone field should reject non-numeric characters
    When they activate the edit form
    And they enter non-numeric characters in the profile phone field
    And they save the changes
    Then a profile validation error is displayed

  @regression
  Scenario: Required fields cannot be saved empty
    When they activate the edit form
    And they clear required fields
    And they save the changes
    Then the required fields should not be empty

  # --- Password: negative cases ---

  @regression
  Scenario: Wrong current password is rejected
    When they activate the password form
    And they enter a wrong current password
    And they save the password changes
    Then the password error message is displayed

  @regression
  Scenario: Mismatched new passwords are rejected
    When they activate the password form
    And they enter mismatched new passwords
    And they save the password changes
    Then the password error message is displayed

  @regression
  Scenario: New password must differ from current
    When they activate the password form
    And they enter the same password as current
    And they save the password changes
    Then the password error message is displayed

  # --- Password: success ---

  @regression
  Scenario: Change password successfully
    When they activate the password form
    And they enter their current password and a new password
    And they save the password changes
    Then the password is changed and they are redirected
    And the new password works for re-login
