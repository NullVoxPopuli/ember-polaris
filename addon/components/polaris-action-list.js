import Component from '@ember/component';
import { computed } from '@ember/object';
import { gt } from '@ember/object/computed';
import { isNone, isPresent } from '@ember/utils';
import { isArray } from '@ember/array';
import { assert } from '@ember/debug';
import layout from '../templates/components/polaris-action-list';

/**
 * Polaris action list component.
 * See https://polaris.shopify.com/components/actions/action-list
 */
export default Component.extend({
  tagName: '',

  layout,

  /*
   * Public attributes.
   */
  /**
   * Collection of actions for list
   *
   * @property items
   * @type {Array}
   * @default null
   */
  items: null,

  /**
   * Collection of sectioned action items
   *
   * @property sections
   * @type {Array}
   * @default null
   */
  sections: null,

  /**
   * Callback when any item is clicked or keypressed
   *
   * @property onActionAnyItem
   * @type {function}
   * @default no-op
   */
  onActionAnyItem() {},

  /*
   * Internal properties.
   */
  finalSections: computed('items', 'sections.[]', function() {
    let finalSections = [];

    let items = this.get('items');
    if (isPresent(items)) {
      finalSections.push({ items });
    }

    let sections = this.get('sections');
    if (isNone(sections)) {
      sections = [];
    }

    assert(`ember-polaris::polaris-action-list - sections must be an array, you passed ${ sections }`, isArray(sections));
    finalSections.push(...sections);

    return finalSections;
  }).readOnly(),

  hasMultipleSections: gt('finalSections.length', 1).readOnly(),
});
