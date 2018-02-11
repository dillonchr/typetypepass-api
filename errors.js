const Raven = require('raven');
Raven.config('https://6b7aecd1c45940faa2ac159d4b24c23c:7582ef77a273481ba61361fccb911ab0@sentry.io/286584').install();

module.exports = err => {
    Raven.captureException(err);
};
