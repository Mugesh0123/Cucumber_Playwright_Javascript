module.exports = {
  default: {
    requireModule: ['@babel/register'],
    require: [
      'step-definitions/index.js',
      'step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1,
    retry: 1
  }
}; 