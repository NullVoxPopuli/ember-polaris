import { computed } from "@ember/object";
import EmberObject, { get } from '@ember/object';
import { capitalize } from '@ember/string';

const dropZone = {
  overlayTextFile: 'Drop file to upload',
  overlayTextImage: 'Drop image to upload',
  errorOverlayTextFile: 'File type is not valid',
  errorOverlayTextImage: 'Image type is not valid',
};

export default class DropZoneState extends EmberObject {
 /**
  * Whether is a file or an image
  *
  * @type {String}
  * @default 'file'
  * @property type
  */
 type = 'file';

 /**
  * The size of the dropzone
  * @type {String}
  * @default 'extraLarge'
  * @property size
  */
 size = 'extraLarge';

 /**
  * True, when dragging in progress
  * @type {Boolean}
  * @default false
  * @property dragging
  */
 dragging = false;

 /**
  * True, when dropzone has errors
  * @type {Boolean}
  * @default false
  * @property error
  */
 error = false;

 /**
  * Number of files
  * @type {Number}
  * @default 0
  * @property numFiles
  */
 numFiles = 0;

 @computed('type')
 get overlayText() {
   let type = this.get('type');
   return get(dropZone, `overlayText${capitalize(type)}`);
 }

 @computed('type')
 get errorOverlayText() {
   let type = this.get('type');
   return get(dropZone, `errorOverlayText${capitalize(type)}`);
 }
}
