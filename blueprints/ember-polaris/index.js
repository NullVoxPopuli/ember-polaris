/* eslint-env node */
module.exports = {
  description: '',

  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified when running `ember g ember-polaris`
    // (since that doesn't actually matter to us)
  },

  afterInstall: function(/* options */) {
    return this.addPackagesToProject([
      { name: 'ember-cli-sass', target: 'latest' }
    ]).then(function() {
      var BuildConfigEditor = require('ember-cli-build-config-editor.js');
      var fs = require('fs');

      // Specify 'utf-8' to force it to be a string instead of a buffer
      var emberCliBuildPath = './ember-cli-build.js';
      var source = fs.readFileSync(emberCliBuildPath, 'utf-8');

      var build = new BuildConfigEditor(source);

      build.edit('svgJar', {
        // TODO check the advantages of using a `symbol` strategy
        strategy: 'inline',
        inline: {
          stripPath: false,
          optimizer: {
            removeTitle: true,
            removeDimensions: true,
          },
          sourceDirs: [
            'public/images/svg',
          ],
        }
      });

      fs.writeFileSync(emberCliBuildPath, build.code());
    });
  }
};
