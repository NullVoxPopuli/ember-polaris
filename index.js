'use strict';

const path = require('path');
const resolve = require('resolve');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const BroccoliDebug = require('broccoli-debug');

module.exports = {
  name: require('./package').name,

  options: {
    svgJar: {
      sourceDirs: [
        'public',
        'tests/dummy/public/assets/images/svg',
        'node_modules/@smile-io/ember-polaris/public',
      ],
    },
  },

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    this.debugTree = BroccoliDebug.buildDebugCallback(
      `ember-polaris:${this.parent.name}`
    );
  },

  included() {
    this._super.included.apply(this, arguments);
  },

  treeForStyles(tree) {
    tree = this.debugTree(tree, 'tree-for-styles:input');

    let packageRoot = path.dirname(
      resolve.sync('@shopify/polaris/package.json', { basedir: __dirname })
    );

    let polarisScssFiles = Funnel(packageRoot, {
      include: ['styles.scss', 'styles/**/*'],
      srcDir: './',
      destDir: 'ember-polaris',
      annotation: 'PolarisScssFunnel',
    });
    polarisScssFiles = this.debugTree(
      polarisScssFiles,
      'tree-for-styles:polarisScssFiles'
    );

    return this._super.treeForStyles(
      MergeTrees([polarisScssFiles, tree], { overwrite: true })
    );
    // _super = this.debugTree(_super, 'tree-for-styles:output');

    // return _super;
  },

  treeForPublic() {
    let trees = [];

    let packageRoot = path.dirname(
      resolve.sync('polaris/package.json', { basedir: __dirname })
    );
    trees.push(
      Funnel(packageRoot, {
        include: ['**/icons/*.svg'],
        srcDir: 'src',
        destDir: 'assets/icons/polaris',
        getDestinationPath: function(relativePath) {
          let parts = relativePath.split('/');
          return parts[parts.length - 1];
        },
      })
    );
    trees.push(
      Funnel(packageRoot, {
        include: ['**/images/*.svg'],
        srcDir: 'src',
        destDir: 'assets/images/polaris',
        getDestinationPath: function(relativePath) {
          let parts = relativePath.split('/');
          return parts[parts.length - 1];
        },
      })
    );
    trees.push(
      Funnel(packageRoot, {
        include: ['**/illustrations/*.svg'],
        srcDir: 'src',
        destDir: 'assets/illustrations/polaris',
        getDestinationPath: function(relativePath) {
          let parts = relativePath.split('/');
          return parts[parts.length - 1];
        },
      })
    );

    let newTree = new MergeTrees(trees);

    return newTree;
  },

  isDevelopingAddon() {
    return process.env.SMILE_DEV;
  },
};
