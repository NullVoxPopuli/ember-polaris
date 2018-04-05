import Component from '@ember/component';
import { computed } from '@ember/object';
import { gt } from '@ember/object/computed';
import { isPresent } from '@ember/utils';
import { isArray } from '@ember/array';
import { assert } from '@ember/debug';
import layout from '../templates/components/polaris-action-list';

/**
 * Polaris action list component.
 * See [https://polaris.shopify.com/components/actions/action-list](https://polaris.shopify.com/components/actions/action-list).
 *
 * @class polaris-action-list
 * @public
 */
export default Component.extend({
  tagName: '',

  layout,

  /**
   * Collection of actions for list
   *
   * @property items
   * @type {Array}
   * @default null
   * @public
   */
  items: null,

  /**
   * Collection of sectioned action items
   *
   * @property sections
   * @type {Array}
   * @default null
   * @public
   */
  sections: null,

  /**
   * Callback when any item is clicked or keypressed
   *
   * @property onActionAnyItem
   * @type {function}
   * @default no-op
   * @public
   */
  onActionAnyItem() {},

  /**
   * Computed list of sections to render.
   *
   * @property finalSections
   * @type {Array}
   * @private
   */
  finalSections: computed('items', 'sections.[]', function() {
    let finalSections = [];

    let items = this.get('items');
    if (isPresent(items)) {
      finalSections.push({ items });
    }

    let sections = this.get('sections') || [];
    assert(`ember-polaris::polaris-action-list - sections must be an array, you passed ${ sections }`, isArray(sections));
    finalSections.push(...sections);

    return finalSections;
  }).readOnly(),

  /**
   * Whether the action list has more than one section.
   *
   * @property hasMultipleSections
   * @type {boolean}
   * @private
   */
  hasMultipleSections: gt('finalSections.length', 1).readOnly(),
});
