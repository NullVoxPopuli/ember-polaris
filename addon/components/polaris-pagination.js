import Component from '@ember/component';
import { not } from '@ember/object/computed';
import { handleMouseUpByBlurring } from '../utils/focus';
import layout from '../templates/components/polaris-pagination';

export default Component.extend({
  tagName: 'nav',

  attributeBindings: ['accessibilityLabel:aria-label'],

  classNames: ['Polaris-Pagination'],

  classNameBindings: ['plain:Polaris-Pagination--plain'],

  layout,

  /**
   * A more subdued control for use in headers
   *
   * @property plain
   * @type {Boolean}
   * @default false
   * @public
   */
  plain: false,

  /**
   * The URL of the next page
   *
   * TODO not implemented
   * @property nextUrl
   * @type {String}
   * @default null
   * @public
   */
  nextUrl: null,

  /**
   * The URL of the previous page
   *
   * TODO not implemented
   * @property previousUrl
   * @type {String}
   * @default null
   * @public
   */
  previousUrl: null,

  /**
   * Whether there is a next page to show
   *
   * @property hasNext
   * @type {Boolean}
   * @default false
   * @public
   */
  hasNext: false,

  /**
   * Whether there is a previous page to show
   *
   * @property hasPrevious
   * @type {Boolean}
   * @default false
   * @public
   */
  hasPrevious: false,

  /**
   * Visually hidden text for screen readers
   *
   * @property accessibilityLabel
   * @type {string}
   * @default 'Pagination'
   * @public
   */
  accessibilityLabel: 'Pagination',

  /**
   * Callback when next button is clicked
   *
   * @property onNext
   * @type {function}
   * @default no-op
   * @public
   */
  onNext() {},

  /**
   * Callback when previous button is clicked
   *
   * @property onPrevious
   * @type {function}
   * @default no-op
   * @public
   */
  onPrevious() {},

handleMouseUpByBlurring,
  isPreviousDisabled: not('hasPrevious').readOnly(),
  isNextDisabled: not('hasNext').readOnly(),
});
