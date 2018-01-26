/* eslint-env node */
module.exports = {
  description: '',

  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified when running `ember g ember-polaris`
    // (since that doesn't actually matter to us)
  },

  included(app) {
    this._super.included.apply(this, arguments);
console.log(app.options);
    this.options = app.options['ember-polaris'];
  },

  afterInstall: function(/* options */) {
// console.log('\n\n***\n');
// console.log(this.options);
// console.log('\n***\n\n');
    // return this.addPackagesToProject([
    //   { name: 'ember-cli-sass', target: 'latest' }
    // ]);
  }
};
