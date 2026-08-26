@smoke @regression
Feature: Edit billing and shipping addresses

  As a registered customer
  I want to manage my billing and shipping addresses
  so that my orders are delivered to the right place.

  Background:
    Given a logged-in customer on the edit account page

  # --- Billing: happy paths ---

  @regression
  Scenario: Save billing address with valid data
    When they open the billing address modal
    And they fill the billing address with valid data
    And they save the billing address
    Then the billing address is saved successfully

  @regression
  Scenario: Delete billing address
    When they open the billing address modal
    And they fill the billing address with valid data
    And they save the billing address
    And they delete the billing address
    Then the billing address is removed

  # --- Billing: bug scenarios ---

  @regression
  Scenario: Billing delete button should not be visible without address data
    Then the billing delete button should not be visible

  @regression
  Scenario: Billing edit button should say Add when no address exists
    Then the billing edit button should say Add

  @regression
  Scenario: Billing address cannot be saved with empty required fields
    When they open the billing address modal
    And they clear the billing address fields
    And they save the billing address
    Then an address validation error is displayed

  @regression
  Scenario: Billing phone field should reject non-numeric characters
    When they open the billing address modal
    And they enter non-numeric characters in the billing phone field
    And they save the billing address
    Then an address validation error is displayed

  @regression
  Scenario: Billing city dropdown should have city options
    When they open the billing address modal
    Then the billing city dropdown should have city options

  @regression
  Scenario: Billing email should pre-fill from account
    When they open the billing address modal
    Then the billing email field should be pre-filled

  # --- Shipping: happy paths ---

  @regression
  Scenario: Save shipping address with valid data
    When they open the shipping address modal
    And they fill the shipping address with valid data
    And they save the shipping address
    Then the shipping address is saved successfully

  @regression
  Scenario: Delete shipping address
    When they open the shipping address modal
    And they fill the shipping address with valid data
    And they save the shipping address
    And they delete the shipping address
    Then the shipping address is removed

  # --- Shipping: bug scenarios ---

  @regression
  Scenario: Shipping delete button should not be visible without address data
    Then the shipping delete button should not be visible

  @regression
  Scenario: Shipping phone field should reject non-numeric characters
    When they open the shipping address modal
    And they enter non-numeric characters in the shipping phone field
    And they save the shipping address
    Then an address validation error is displayed

  @regression
  Scenario: Shipping address cannot be saved with empty required fields
    When they open the shipping address modal
    And they clear the shipping address fields
    And they save the shipping address
    Then an address validation error is displayed
