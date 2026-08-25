Feature: Product card hover interaction

  As a store visitor
  I want to hover over a product card and see color variants
  so that I can quickly switch between product variations.

  Scenario: Hover on product card reveals color thumbnails and clicking changes the image
    Given a visitor on the Bon Bonite homepage
    When they navigate to the Zapatos category
    And they find the product card for "Baleta con taches en cuero capuccino"
    And they hover over that product card
    Then the color thumbnail strip becomes visible
    When they click the second color thumbnail
    Then the main product image changes to the selected variant

  Scenario: Clicking on product card redirects to the product page
    Given a visitor on the Bon Bonite homepage
    When they navigate to the Zapatos category
    And they find the product card for "Baleta con taches en cuero capuccino"
    And they click on the product card link
    Then they are redirected to the product page

  Scenario: Product page variant and add-to-cart button state
    Given a visitor on the Bon Bonite homepage
    When they navigate to the Zapatos category
    And they find the product card for "Baleta con taches en cuero capuccino"
    And they click on the product card link
    Then they are redirected to the product page
    And the product page displays its title
    And the add to cart button state matches the variant selection rules

  Scenario: Comprar Ahora redirects to cart with the product
    Given a visitor on the Bon Bonite homepage
    When they navigate to the Zapatos category
    And they find the product card for "Baleta con taches en cuero capuccino"
    And they click on the product card link
    Then they are redirected to the product page
    When they select the first available variant
    And they click on Comprar Ahora
    Then they are redirected to the cart page
    And the cart badge displays 1

  Scenario: Anadir al carrito adds product and shows success message
    Given a visitor on the Bon Bonite homepage
    When they navigate to the Zapatos category
    And they find the product card for "Baleta con taches en cuero capuccino"
    And they click on the product card link
    Then they are redirected to the product page
    When they select the first available variant
    And they click on Anadir al carrito
    Then the cart badge displays 1
    And the success message confirms the product was added to cart
