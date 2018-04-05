import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/polaris-link';

/*
 * Polaris link component.
 * See https://polaris.shopify.com/components/navigation/link
 */
export default Component.extend({
  // No tag since we dynamically render either an anchor or a button element.
  tagName: '',

  layout,

  /*
   * Public attributes.
   */
  /*
   * The url to link to.
   *
   * @property url
   * @type {string}
   * @default null
   */
  url: null,

  /*
   * The content to display inside link
   *
   * @property text
   * @type {string}
   * @default null
   */
  text: null,

  /*
   * Use for a links that open a different site
   *
   * @property external
   * @type {boolean}
   * @default false
   */
  external: false,

  /*
   * Callback when a link is clicked
   *
   * @property onClick
   * @type {function}
   * @default noop
   */
  onClick() {},

  /*
   * Internal properties.
   */
  linkClass: computed('class', function() {
    let linkClass = 'Polaris-Link';
    const externalClasses = this.get('class');

    if (externalClasses) {
      linkClass += ` ${externalClasses}`;
    }

    return linkClass;
  }).readOnly(),
});
