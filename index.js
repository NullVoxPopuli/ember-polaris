/* eslint-env node */
'use strict';

var path = require('path');
var resolve = require('resolve');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-polaris',

  treeForStyles(tree) {
    var packageRoot = path.dirname(resolve.sync('@shopify/polaris/package.json', { basedir: __dirname }));
    var polarisScssFiles = new Funnel(packageRoot, {
      include: ['styles.scss', 'styles/**/*'],
      srcDir: './',
      destDir: 'ember-polaris',
      annotation: 'PolarisScssFunnel'
    });

    return this._super.treeForStyles(mergeTrees([polarisScssFiles, tree], { overwrite: true }));
  },

  treeForPublic() {
    var packageRoot = path.dirname(resolve.sync('@shopify/polaris/package.json', { basedir: __dirname }));

    var polarisSvgFiles = new Funnel(packageRoot, {
      include: ['**/*.svg'],
      srcDir: './src',
      destDir: 'ember-polaris-svg-icons',
      annotation: 'PolarisSvgFunnel'
    });

    var superTree = this._super.treeForPublic.apply(this, arguments);
    var trees = [ polarisSvgFiles ];
    if (superTree) {
      trees.push(superTree);
    }

    return mergeTrees(trees, { overwrite: true });
  },

  // TODO remove this once shipping to prod
  isDevelopingAddon() {
    return true;
  }
};
