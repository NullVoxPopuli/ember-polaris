'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function() {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-3.10',
        npm: {
          devDependencies: {
            'ember-source': '~3.10.2',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      // The default `.travis.yml` runs this scenario via `npm test`,
      // not via `ember try`. It's still included here so that running
      // `ember try:each` manually or from a customized CI config will run it
      // along with all the other scenarios.
      {
        name: 'ember-default',
        npm: {
          devDependencies: {},
        },
      },
      {
        name: 'ember-default-with-jquery',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.5.1',
          },
        },
      },
    ],
  };
};
