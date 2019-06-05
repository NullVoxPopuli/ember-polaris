import {
  classNames,
  layout as templateLayout,
} from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
import { typeOf } from '@ember/utils';
import layout from '../../templates/components/polaris-color-picker/hue-picker';
import { clamp } from '../../utils/math';

const VERTICAL_PADDING = 13;

function offsetForHue(hue, sliderHeight, draggerHeight) {
  const slidableArea = sliderHeight - (draggerHeight + VERTICAL_PADDING);
  return clamp(
    (hue / 360) * slidableArea + VERTICAL_PADDING,
    0,
    sliderHeight - draggerHeight
  );
}

function hueForOffset(offset, sliderHeight) {
  const selectionHeight = offset - VERTICAL_PADDING;
  const slidableArea = sliderHeight - VERTICAL_PADDING * 2;
  return clamp((selectionHeight / slidableArea) * 360, 0, 360);
}

@classNames('Polaris-ColorPicker__HuePicker')
@templateLayout(layout)
export default class HuePicker extends Component {
  /**
   * The current hue value
   *
   * @property hue
   * @type {Number}
   * @default 0
   * @public
   */
  hue = 0;

  /**
   * Callback when hue is changed
   *
   * @property onChange
   * @type {function}
   * @default null
   * @public
   */
  onChange = null;

  /**
   * @private
   */
  sliderHeight = null;

  /**
   * @private
   */
  draggerHeight = null;

  /**
   * @private
   */
  @(computed('hue', 'sliderHeight').readOnly())
  get draggerY() {
    const { hue, sliderHeight, draggerHeight } = this.getProperties(
      'hue',
      'sliderHeight',
      'draggerHeight'
    );
    const offset = offsetForHue(hue, sliderHeight, draggerHeight);
    return clamp(offset, 0, sliderHeight);
  }

  didRender() {
    super.didRender(...arguments);

    // Grab the size of the component for positioning the draggable marker.
    const huePickerElement = this.element;
    this.set('sliderHeight', huePickerElement.clientHeight);
  }

  @action
  handleChange({ y }) {
    const { sliderHeight, onChange } = this.getProperties(
      'sliderHeight',
      'onChange'
    );
    if (typeOf(onChange) !== 'function') {
      return;
    }

    const offsetY = clamp(y, 0, sliderHeight);
    const hue = hueForOffset(offsetY, sliderHeight);

    onChange(hue);
  }
}
