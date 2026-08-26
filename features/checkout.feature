@smoke @regression
Feature: Checkout

  As a customer with items in the cart
  I want to review my order and fill in my details
  so that I can reach the payment step.

  Background:
    Given a product is in the cart
    And they go to the checkout page

  @regression
  Scenario: Checkout page loads with billing form
    Then the checkout form is visible
    And the billing first name field is visible
    And the billing email field is visible
    And the billing phone field is visible

  @regression
  Scenario: Order summary shows the product
    Then the order review section is visible
    And the order summary contains the product

  @regression
  Scenario: Payment methods are displayed
    Then the payment methods section is visible
    And at least 1 payment method is available

  @regression
  Scenario: Filling billing fields works
    When they fill the billing first name with "Michael"
    And they fill the billing last name with "Tester"
    And they fill the billing email with a test email
    And they fill the billing phone with "3001234567"
    Then the billing first name field contains "Michael"

  @regression
  Scenario: Place order button is visible (not clicked)
    Then the place order button is visible
