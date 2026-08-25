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
