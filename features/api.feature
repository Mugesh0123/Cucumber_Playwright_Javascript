@api @smoke
Feature: API Testing
  As a QA Engineer
  I want to test the application's API endpoints
  So that I can ensure the backend functionality works correctly

  Background:
    Given I have a valid API client configured
    And I have test data prepared

  @authentication
  Scenario: Successful API authentication
    When I authenticate with valid credentials
    Then I should receive a valid access token
    And the response status should be 200
    And the response should contain user information

  @authentication @negative
  Scenario: Failed API authentication with invalid credentials
    When I authenticate with invalid credentials
    Then I should receive an authentication error
    And the response status should be 401
    And the error message should be "Invalid credentials"

  @users @crud
  Scenario: Create a new user via API
    When I create a new user with valid data
    Then the response status should be 201
    And the response should contain the created user data
    And the user should be created in the database

  @users @crud
  Scenario: Get user by ID via API
    Given I have a user ID
    When I retrieve the user by ID
    Then the response status should be 200
    And the response should contain the user data
    And the user ID should match the requested ID

  @users @crud
  Scenario: Update user via API
    Given I have a user ID
    When I update the user with new data
    Then the response status should be 200
    And the response should contain the updated user data
    And the user should be updated in the database

  @users @crud
  Scenario: Delete user via API
    Given I have a user ID
    When I delete the user
    Then the response status should be 204
    And the user should be deleted from the database

  @products @crud
  Scenario: Get all products via API
    When I retrieve all products
    Then the response status should be 200
    And the response should be an array
    And each product should have required fields

  @products @search
  Scenario: Search products by category via API
    When I search products by category "electronics"
    Then the response status should be 200
    And all returned products should have category "electronics"

  @orders @workflow
  Scenario: Complete order workflow via API
    Given I have a valid user account
    And I have product IDs
    When I create a new order
    And I add products to the order
    And I submit the order
    Then the order should be created successfully
    And the order status should be "pending"
    And the order should be assigned an order ID

  @performance @load
  Scenario: API performance under load
    When I make 100 concurrent requests to the products endpoint
    Then all requests should complete within 5 seconds
    And the average response time should be less than 500ms
    And no requests should fail

  @validation @negative
  Scenario: API validation for required fields
    When I create a user without required fields
    Then the response status should be 400
    And the response should contain validation errors
    And the error message should list missing required fields

  @rate-limiting @security
  Scenario: API rate limiting
    When I make 150 requests within 1 minute
    Then the 101st request should be rate limited
    And the response status should be 429
    And the response should contain rate limit information

  @file-upload
  Scenario: Upload file via API
    Given I have a test file
    When I upload the file to the upload endpoint
    Then the response status should be 200
    And the file should be uploaded successfully
    And the response should contain the file URL

  @file-download
  Scenario: Download file via API
    Given I have a file URL
    When I download the file
    Then the response status should be 200
    And the file should be downloaded successfully
    And the file content should match the original

  @health-check
  Scenario: API health check
    When I check the API health status
    Then the response status should be 200
    And the response should indicate the service is healthy
    And the response should contain version information

  @error-handling @negative
  Scenario: API error handling for non-existent resource
    When I request a non-existent resource
    Then the response status should be 404
    And the response should contain an appropriate error message

  @pagination
  Scenario: API pagination
    When I request the first page of products with limit 10
    Then the response status should be 200
    And the response should contain exactly 10 products
    And the response should contain pagination metadata
    And the total count should be greater than 10

  @filtering
  Scenario: API filtering and sorting
    When I filter products by price range and sort by name
    Then the response status should be 200
    And all products should be within the specified price range
    And products should be sorted alphabetically by name

  @batch-operations
  Scenario: Batch create multiple users
    When I create 5 users in a batch request
    Then the response status should be 200
    And all 5 users should be created successfully
    And the response should contain IDs for all created users

  @webhook
  Scenario: Webhook notification
    Given I have a webhook URL configured
    When I create a new order
    Then a webhook notification should be sent
    And the webhook payload should contain order details

  @security @headers
  Scenario: API security headers
    When I make a request to any endpoint
    Then the response should include security headers
    And the CORS headers should be properly configured
    And the content security policy should be set

  @caching
  Scenario: API response caching
    When I make the same request twice
    Then both responses should be identical
    And the second response should be served from cache
    And the cache headers should be properly set

  @compression
  Scenario: API response compression
    When I request a large dataset
    Then the response should be compressed
    And the content encoding should be gzip
    And the response size should be smaller than uncompressed

  @timeout
  Scenario: API request timeout
    When I make a request that takes longer than the timeout
    Then the request should timeout after 30 seconds
    And the response should be a timeout error

  @retry
  Scenario: API retry mechanism
    Given the API is temporarily unavailable
    When I make a request
    Then the request should be retried automatically
    And the request should succeed after retries
    And the retry count should be logged

  @monitoring
  Scenario: API monitoring and metrics
    When I make multiple API requests
    Then the response times should be logged
    And the success/failure rates should be tracked
    And performance metrics should be available 