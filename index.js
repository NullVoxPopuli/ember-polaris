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

  treeForPublic(tree) {
    var packageRoot = path.dirname(resolve.sync('@shopify/polaris/package.json', { basedir: __dirname }));
    var polarisSvgFiles = new Funnel(packageRoot, {
      include: ['src/**/*.svg'],
      srcDir: './',
      destDir: 'ember-polaris-svg-icons',
      annotation: 'PolarisSvgFunnel'
    });

    return this._super.treeForPublic(mergeTrees([polarisSvgFiles, tree], { overwrite: true }));
  },

  // TODO remove this once shipping to prod
  isDevelopingAddon() {
    return true;
  }
};
