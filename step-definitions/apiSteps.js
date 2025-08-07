const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const ApiClient = require('../support/apiClient');
const Joi = require('joi');
const faker = require('faker');

// Test data storage
let testData = {
  users: [],
  products: [],
  orders: [],
  authToken: null,
  responseData: null
};

// Schema definitions
const schemas = {
  user: Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required()
  }),
  
  product: Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    price: Joi.number().positive().required()
  }),
  
  authResponse: Joi.object({
    token: Joi.string().required(),
    user: Joi.object({
      id: Joi.number().required(),
      email: Joi.string().email().required()
    }).required()
  })
};

Given('I have a valid API client configured', async function () {
  this.apiClient = new ApiClient(process.env.API_BASE_URL, {
    auth: { type: 'api-key', key: process.env.API_KEY }
  });
});

Given('I have test data prepared', async function () {
  testData.testUser = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
});

Given('I have a user ID', async function () {
  if (testData.users.length === 0) {
    const response = await this.apiClient.post('/users', testData.testUser);
    testData.users.push(response);
  }
  this.userId = testData.users[0].id;
});

When('I authenticate with valid credentials', async function () {
  const credentials = {
    email: process.env.TEST_USER_EMAIL || testData.testUser.email,
    password: process.env.TEST_USER_PASSWORD || testData.testUser.password
  };
  
  const response = await this.apiClient.post('/auth/login', credentials);
  testData.authToken = response.token;
  this.apiClient.setAuthToken(response.token);
  testData.responseData = response;
});

When('I authenticate with invalid credentials', async function () {
  try {
    await this.apiClient.post('/auth/login', {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    testData.responseData = error;
  }
});

When('I create a new user with valid data', async function () {
  const userData = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
  
  const response = await this.apiClient.post('/users', userData);
  testData.responseData = response;
  testData.users.push(response);
});

When('I retrieve the user by ID', async function () {
  const response = await this.apiClient.get(`/users/${this.userId}`);
  testData.responseData = response;
});

When('I retrieve all products', async function () {
  const response = await this.apiClient.get('/products');
  testData.responseData = response;
});

When('I check the API health status', async function () {
  const response = await this.apiClient.get('/health');
  testData.responseData = response;
});

When('I make {int} concurrent requests to the products endpoint', async function (count) {
  const requests = Array(count).fill().map(() => 
    this.apiClient.measureResponseTime('/products', 'GET')
  );
  
  const results = await Promise.all(requests);
  testData.responseData = results;
});

Then('I should receive a valid access token', async function () {
  expect(testData.authToken).to.be.a('string');
  expect(testData.authToken).to.have.length.greaterThan(0);
});

Then('the response status should be {int}', async function (status) {
  if (testData.responseData && testData.responseData.status) {
    expect(testData.responseData.status).to.equal(status);
  }
});

Then('I should receive an authentication error', async function () {
  expect(testData.responseData).to.be.instanceOf(Error);
});

Then('the response should be an array', async function () {
  expect(testData.responseData).to.be.an('array');
});

Then('the response should indicate the service is healthy', async function () {
  expect(testData.responseData).to.have.property('status', 'healthy');
});

Then('all requests should complete within {int} seconds', async function (seconds) {
  const maxTime = seconds * 1000;
  testData.responseData.forEach(metric => {
    expect(metric.responseTime).to.be.lessThan(maxTime);
  });
});

Then('the average response time should be less than {int}ms', async function (maxAvgTime) {
  const avgTime = testData.responseData.reduce((sum, metric) => 
    sum + metric.responseTime, 0) / testData.responseData.length;
  expect(avgTime).to.be.lessThan(maxAvgTime);
}); 