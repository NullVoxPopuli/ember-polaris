import Component from '@ember/component';
import layout from '../templates/components/polaris-visually-hidden';

/**
 * Polaris Visually hidden component.
 * See https://polaris.shopify.com/components/titles-and-text/visually-hidden
 */
export default Component.extend({
  tagName: 'span',
  classNames: ['Polaris-VisuallyHidden'],

  layout,

  /**
   * The content to be hidden visually
   *
   * This component can be used in block form,
   * in which case the block content will be used
   * instead of `text`
   *
   * @property text
   * @type {string}
   * @default: null
   * @public
   */
  text: null,
});
