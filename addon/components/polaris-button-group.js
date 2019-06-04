import { className, classNames, layout as templateLayout } from "@ember-decorators/component";
import Component from '@ember/component';
import layout from '../templates/components/polaris-button-group';
import { wrapChildren, rejectNodesByClassName } from '../utils/dom';

/**
 * Polaris button group component.
 * See https://polaris.shopify.com/components/actions/button-group
 */
@classNames('Polaris-ButtonGroup')
@templateLayout(layout)
export default class PolarisButtonGroup extends Component {
 /**
  * Button components
  *
  * This component can be used in block form,
  * in which case the block content will be used
  * instead of `text`
  *
  * @property text
  * @type {String}
  * @default null
  * @public
  */
 text = null;

 /**
  * Join buttons as segmented group
  *
  * @property segmented
  * @type {Boolean}
  * @default false
  * @public
  */
 @className("Polaris-ButtonGroup--segmented")
 segmented = false;

 /**
  * Buttons will stretch/shrink to occupy the full width
  *
  * @property fullWidth
  * @type {Boolean}
  * @default false
  * @public
  */
 @className("Polaris-ButtonGroup--fullWidth")
 fullWidth = false;

 /**
  * Remove top left and right border radius
  *
  * @property connectedTop
  * @type {Boolean}
  * @default false
  * @public
  */
 @className("Polaris-ButtonGroup--connectedTop")
 connectedTop = false;

 'data-test-button-group' = true;

 didRender() {
   super.didRender(...arguments);

   // Wrap each child element that isn't already a group item.
   let nodesToWrap = rejectNodesByClassName(
     this.element.children,
     'Polaris-ButtonGroup__Item'
   );
   let wrapper = document.createElement('div');

   wrapper.classList.add('Polaris-ButtonGroup__Item');
   wrapper.setAttribute('data-test-button-group-item', true);
   wrapChildren(nodesToWrap, wrapper);
 }
}
