@login @smoke
Feature: Login Functionality
  As a user 14
  I want to be able to login to the demo webshop
  So that I can access my account and make purchases

  Background:
    Given I have a registered user account
    And I am on the login page

  @valid-login
  Scenario: Successful login with valid credentials
    When I enter valid email "${TEST_USER_EMAIL}"
    And I enter valid password "${TEST_USER_PASSWORD}"
    And I click the login button
    Then I should be successfully logged in
    And I should see the welcome message