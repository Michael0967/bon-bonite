@smoke
Feature: Customer registration

  As a store visitor
  I want to create an account with my own details
  so that I can shop and track my orders as a registered customer.

  @regression
  Scenario: Successful registration of a new customer
    Given a new visitor who does not have a store account yet
    When they decide to sign up and complete the form with their personal details and email address
    Then their account is created and their session starts automatically
