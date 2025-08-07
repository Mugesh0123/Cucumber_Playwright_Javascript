@login @smoke
Feature: Login Functionality
  As a user
  I want to be able to login to the demo webshop
  So that I can access my account and make purchases

  Background:
    Given I am on the login page

  @valid-login
  Scenario: Successful login with valid credentials
    When I enter valid email "${TEST_USER_EMAIL}"
    And I enter valid password "${TEST_USER_PASSWORD}"
    And I click the login button
    Then I should be successfully logged in
    And I should see the welcome message

  @simple-login
  Scenario: Simple login page navigation test
    Given I am on the login page
    Then the login form should be visible
    And the email field should be enabled
    And the password field should be enabled
    And the login button should be enabled

  @basic-navigation
  Scenario: Basic login page navigation
    Given I am on the login page
    Then I should remain on the login page