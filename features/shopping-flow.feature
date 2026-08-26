@smoke @regression
Feature: Shopping flow

  As a store visitor
  I want to browse products, see variants, and add them to my cart
  so that I can purchase items I like.

  Background:
    Given a visitor on the Bon Bonite homepage
    When they navigate to the Zapatos category
    And they find the product card for "Baleta con taches en cuero capuccino"

  @regression
  Scenario: Hover on product card reveals color thumbnails and clicking changes the image
    When they hover over that product card
    Then the color thumbnail strip becomes visible
    When they click the second color thumbnail
    Then the main product image changes to the selected variant

  @regression
  Scenario: Clicking on product card redirects to the product page
    When they click on the product card link
    Then they are redirected to the product page

  @regression
  Scenario: Product page variant and add-to-cart button state
    When they click on the product card link
    Then they are redirected to the product page
    And the product page displays its title
    And the add to cart button state matches the variant selection rules

  @regression
  Scenario: Comprar Ahora redirects to cart with the product
    When they click on the product card link
    Then they are redirected to the product page
    When they select the first available variant
    And they click on Comprar Ahora
    Then they are redirected to the cart page
    And the cart badge displays 1

  @regression
  Scenario: Anadir al carrito adds product and shows success message
    When they click on the product card link
    Then they are redirected to the product page
    When they select the first available variant
    And they click on Anadir al carrito
    Then the cart badge displays 1
    And the success message confirms the product was added to cart
