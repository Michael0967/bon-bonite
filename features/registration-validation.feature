@smoke @regression
Feature: Registration form validation

  As a store visitor
  I want the registration form to reject incomplete or duplicated information
  so that every created account is valid and belongs to one person only.

  Background:
    Given a new visitor who does not have a store account yet

  Scenario Outline: Mandatory fields must be completed
    When they try to sign up without completing their <field>
    Then the form is not submitted and asks them to complete the missing information

    Examples:
      | field                  |
      | "ID number"            |
      | "first name"           |
      | "last name"            |
      | "email address"        |
      | "password"             |
      | "password confirmation"|
      | "privacy consent"      |

  @regression
  Scenario: Email address already registered
    When they try to sign up with an email address that is already registered
    Then the system explains that this email address is already registered

  @regression
  Scenario: ID number already registered
    When they try to sign up with an ID number that is already registered
    Then the system explains that this ID number is already registered

  @regression
  Scenario: Password shorter than the minimum
    When they try to sign up with a password shorter than 8 characters
    Then the form is not submitted and warns that the password must have at least 8 characters

  @regression
  Scenario: Password with the minimum length
    When they sign up with a password of exactly 8 characters
    Then their account is created and their session starts automatically
