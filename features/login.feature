@smoke
Feature: Customer login

  As a registered customer
  I want to sign in with my ID number and password
  so that I can access my account area.

  Scenario: Empty credentials are not submitted
    Given a visitor on the login page
    When they try to log in without entering any credentials
    Then the form is not submitted and asks them to complete the missing information

  Scenario: Login with an incorrect password
    Given a registered customer on the login page
    When they enter their ID number and an incorrect password
    Then the system informs them that the username or password is invalid

  Scenario: Login with an unregistered ID number
    Given a visitor on the login page
    When they enter an unregistered ID number and a password
    Then the system informs them that the username or password is invalid

  @regression
  Scenario: Successful login with valid credentials
    Given a registered customer on the login page
    When they enter their correct ID number and password
    Then the system grants access and displays their account area
