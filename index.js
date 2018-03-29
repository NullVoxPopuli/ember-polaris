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
    var trees = [];

    var superTree = this._super.treeForPublic.apply(this, arguments);
    if (superTree) {
      trees.push(superTree);
    }

    var packageRoot = path.dirname(resolve.sync('@shopify/polaris/package.json', { basedir: __dirname }));
    var destDir = 'images/svg/polaris';
    var polarisSvgFiles = new Funnel(packageRoot, {
      include: ['**/*.svg'],
      srcDir: './src',
      destDir: destDir,
      annotation: 'PolarisSvgFunnel'
    });

    trees.push(polarisSvgFiles);

    return mergeTrees(trees, { overwrite: true });
  },

  // TODO remove this once shipping to prod
  isDevelopingAddon() {
    return true;
  }
};
