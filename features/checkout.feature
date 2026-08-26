@smoke @regression
Feature: Checkout

  As a customer with items in the cart
  I want to go through the checkout flow
  so that I can review my order, fill billing details and reach payment.

  Background:
    Given a product is in the cart
    And they go to the cart page
    And they click Finalizar compra
    And they click the continue button
    And they log in at checkout

  # --- Step 1: Cart summary ---

  @regression
  Scenario: Cart summary shows product and totals
    Then the cart summary is visible
    And the cart summary contains the product name
    And the cart summary shows a subtotal
    And the cart summary shows a total

  # --- Step 2: Billing form ---

  @regression
  Scenario: Billing form has all required fields
    Then the billing form is visible
    And the document type selector is visible
    And the billing first name field is visible
    And the billing last name field is visible
    And the billing gender selector is visible
    And the billing email field is visible
    And the billing phone field is visible
    And the billing address field is visible

  @regression
  Scenario: Billing form fields can be filled
    When they fill the billing first name with "Michael"
    And they fill the billing last name with "Rojas"
    And they fill the billing phone with "3101234567"
    Then the billing first name field contains "Michael"
    And the billing last name field contains "Rojas"

  # --- Step 3: Payment ---

  @regression
  Scenario: Place order completes the purchase
    Then the place order button is visible
    When they accept the terms and conditions
    And they click place order
    Then the order confirmation is displayed
    And the order has a number
    And the order shows a total
    And the order payment method is Wompi
