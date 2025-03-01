import Component from '@ember/component';
import layout from '../templates/components/polaris-inline-error';
import { assert } from '@ember/debug';

export default Component.extend({
  tagName: '',

  layout,

  /**
   * Unique identifier of the invalid form field that the message describes
   *
   * @type {String}
   * @default null
   * @public
   * @required
   */
  fieldID: null,

  /**
   * Content briefly explaining how to resolve the invalid form field input.
   *
   * @type {String|Component}
   * @default null
   * @public
   */
  message: null,

  dataTestInlineError: true,
  dataTestInlineErrorIcon: true,

  init() {
    this._super(...arguments);
    assert(
      '[polaris-inline-error] Missing required `fieldID` param!',
      this.get('fieldID')
    );
  },
});
