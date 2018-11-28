import Component from '@ember/component';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { classify } from '@ember/string';
import layout from '../../templates/components/polaris-drop-zone/file-upload';

const iconDragDrop = 'drag-drop';
const assetFileUpload = '/assets/images/polaris/file-upload.svg';
const assetImageUpload = '/assets/images/polaris/image-upload.svg';

const fileUpload = {
  actionTitleFile: 'Add file',
  actionTitleImage: 'Add image',
  actionHintFile: 'or drop files to upload',
  actionHintImage: 'or drop images to upload',
};

export default Component.extend({
  classNames: ['Polaris-DropZone-FileUpload'],

  layout,

  /**
   * String that appears in file upload
   *
   * @type {String}
   * @default `Add file`
   * @public
   * @property actionTitle
   */
  actionTitle: computed('type', function() {
    let type = this.get('type');
    return fileUpload[`actionTitle${classify(type)}`];
  }),

  /**
   * String that appears in file upload
   *
   * @type {String}
   * @default `or drop files to upload`
   * @public
   * @property actionHint
   */
  actionHint: computed('type', function() {
    let type = this.get('type');
    return fileUpload[`actionHint${classify(type)}`];
  }),

  iconDragDrop,

  assetFileUpload,

  assetImageUpload,

  type: readOnly('context.type'),

  size: readOnly('context.size'),

  imageClasses: computed('size', function() {
    let classes = ['Polaris-DropZone-FileUpload__Image'];
    let size = this.get('size');
    if (['extraLarge', 'large'].includes(size)) {
      classes.push(`Polaris-DropZone-FileUpload--size${classify(size)}`);
    }

    return classes.join(' ');
  }).readOnly(),
});
