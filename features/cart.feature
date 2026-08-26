@smoke @regression
Feature: Cart

  As a store visitor
  I want to manage items in my cart
  so that I can review before purchasing.

  Background:
    Given a product is in the cart
    And they open the cart page

  # --- Happy paths ---

  @regression
  Scenario: Cart displays the added product
    Then the cart is not empty
    And the cart contains 1 item

  @regression
  Scenario: Cart shows subtotal and total
    Then the cart subtotal is visible
    And the cart total is visible

  @regression
  Scenario: Proceed to checkout button is visible
    Then the proceed to checkout button is visible

  # --- Modify ---

  @regression
  Scenario: Remove product from cart
    When they remove the product from the cart
    Then the cart is empty

  @regression
  Scenario: Empty cart shows a message
    When they remove the product from the cart
    Then the empty cart message is displayed


