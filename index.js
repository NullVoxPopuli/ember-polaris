'use strict';

const path = require('path');
const resolve = require('resolve');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const BroccoliDebug = require('broccoli-debug');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

module.exports = {
  name: require('./package').name,

  options: {
    svgJar: {
      stripPath: false,
      sourceDirs: ['dist/assets/icons'],
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
    this._shopifyPolarisPackageNode = new UnwatchedDir(this._getPackageRoot());
  },

  treeForStyles(tree) {
    tree = this.debugTree(tree, 'tree-for-styles:input');

    let polarisScssFiles = new Funnel(
      this._getPackageRoot('@shopify/polaris'),
      {
        include: ['styles.scss', 'styles/**/*'],
        destDir: 'ember-polaris',
        annotation: 'PolarisScssFunnel',
      }
    );
    polarisScssFiles = this.debugTree(
      polarisScssFiles,
      'tree-for-styles:polarisScssFiles'
    );

    let output = new MergeTrees([polarisScssFiles, tree]);
    output = this.debugTree(output, 'tree-for-styles:output');

    return this._super.treeForStyles(output);
  },

  treeForPublic() {
    let trees = [];

    let icons = this._getTreeForPublic(
      ['**/icons/*.svg'],
      'assets/icons/polaris'
    );
    icons = this.debugTree(icons, 'tree-for-public:icons');
    trees.push(icons);

    let images = this._getTreeForPublic(
      ['**/images/*.svg'],
      'assets/images/polaris'
    );
    images = this.debugTree(images, 'tree-for-public:images');
    trees.push(images);

    let illustrations = this._getTreeForPublic(
      ['**/illustrations/*.svg'],
      'assets/illustrations/polaris'
    );
    illustrations = this.debugTree(
      illustrations,
      'tree-for-public:illustrations'
    );
    trees.push(illustrations);

    let output = new MergeTrees(trees);
    output = this.debugTree(output, 'tree-for-public:output');

    return output;
  },

  isDevelopingAddon() {
    return process.env.SMILE_DEV;
  },

  _getPackageRoot(packageName = 'polaris-react') {
    return path.dirname(
      resolve.sync(`${packageName}/package.json`, { basedir: __dirname })
    );
  },

  _getTreeForPublic(include, destDir) {
    return new Funnel(this._shopifyPolarisPackageNode, {
      srcDir: 'src',
      include,
      destDir,
      getDestinationPath: function(relativePath) {
        let parts = relativePath.split('/');
        return parts[parts.length - 1];
      },
    });
  },
};
