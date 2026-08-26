@smoke @regression
Feature: Product page

  As a store visitor
  I want to see product details and select variants
  so that I can decide whether to buy.

  Background:
    Given a visitor on the product page for "baleta-con-taches-en-cuero-capuccino"

  @regression
  Scenario: Product title is displayed
    Then the product title is visible

  @regression
  Scenario: Product price is displayed
    Then the product price is visible

  @regression
  Scenario: Product short description is displayed
    Then the product short description is visible

  @regression
  Scenario: Product gallery is displayed
    Then the product image gallery is visible
    And there are at least 2 thumbnail images

  @regression
  Scenario: Clicking a thumbnail changes the main image
    When they click the first thumbnail
    Then the gallery image updates

  @regression
  Scenario: Variant buttons are displayed when product has variants
    Then the variant buttons are visible
    And no variant is selected by default

  @regression
  Scenario: Selecting a variant enables the add to cart button
    When they select the first variant
    Then the add to cart button is enabled

  @regression
  Scenario: Quantity input defaults to 1
    Then the quantity input shows 1
