import Component from '@ember/component';
import layout from '../templates/components/polaris-dropzone';
import { computed } from '@ember/object';
import { or } from '@ember/object/computed';
import { capitalize } from '@ember/string';
import { debounce } from '@ember/runloop';
import { isNone, isPresent } from '@ember/utils';
import State from '../-private/dropzone-state';
import { fileAccepted, getDataTransferFiles } from '../utils/dropzone';
import ContextBoundEventListenersMixin from 'ember-lifeline/mixins/dom';

const iconDragDrop = 'drag-drop';
const iconAlertCircle = 'alert-circle';

export default Component.extend(ContextBoundEventListenersMixin, {
  layout,
  classNames: ['Polaris-DropZone'],
  classNameBindings: [
    'outline:Polaris-DropZone--hasOutline',
    'isDragging:Polaris-DropZone--isDragging',
    'state.error:Polaris-DropZone--hasError',
    'sizeClass',
  ],
  attributeBindings: [
    'ariaDisabled:aria-disabled',
  ],

  /**
   * Allowed file types
   *
   * @type {String}
   * @public
   */
  accept: null,

  /**
   *  Sets an active state
   *
   * @type {Boolean}
   * @default false
   * @public
   */
  active: false,

  /**
   * Allows multiple files to be uploaded
   *
   * @type {Boolean}
   * @default true
   * @public
   */
  allowMultiple: true,

  /**
   * Sets a disabled state
   *
   * @type {Boolean}
   * @default false
   * @public
   */
  disabled: false,

  /**
   * Allows a file to be dropped anywhere on the page
   *
   * @type {Boolean}
   * @default false
   * @public
   */
  dropOnPage: false,

  /**
   * Sets an error state
   *
   * @type {Boolean}
   * @default false
   * @public
   */
  error: false,

  /**
   * Text that appears in the overlay when set in error state
   *
   * @type {String}
   * @default null
   * @public
   */
  errorOverlayText: null,

  /**
   * Sets the default file dialog state
   *
   * @type {Boolean}
   * @default false
   * @public
   */
  openFileDialog: false,

  /**
   *  Displays an outline border
   *
   * @type {Boolean}
   * @default true
   * @public
   */
  outline: true,

  /**
   * Displays an overlay on hover
   *
   * @type {Boolean}
   * @default true
   * @public
   */
  overlay: true,

  /**
   * Text that appears in the overlay
   *
   * @type {String}
   * @default null
   * @public
   */
  overlayText: null,

  /**
   * Whether is a file or an image, `file` | `image`.
   *
   * @type {String}
   * @default 'file'
   * @public
   */
  type: 'file',

  /**
   * Adds custom validations
   * (file) => boolean
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  customValidator: null,

  /**
   * Callback triggered on click
   * (event) => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onClick: null,

  /**
   * Callback triggered when one or more files entered the drag area
   * () => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onDragEnter() {},

  /**
   * Callback triggered when one or more files left the drag area
   * () => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onDragLeave() {},

  /**
   * Callback triggered when one or more files are dragging over the drag area
   * () => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onDragOver() {},

  /**
   * Callback triggered on any file drop
   * (files, acceptedFiles, rejectedFiles) => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onDrop() {},

  /**
   * Callback triggered when at least one of the files dropped was accepted
   * (acceptedFiles) => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onDropAccepted() {},

  /**
   * Callback triggered when at least one of the files dropped was rejected
   * (rejectedFiles) => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onDropRejected() {},

  /**
   * Callback triggered when the file dialog is canceled
   * () => void
   *
   * @type {Function}
   * @default no-op
   * @public
   */
  onFileDialogClose() {},

  iconDragDrop,
  iconAlertCircle,

  state: computed(() => State.create()).readOnly(),

  isDragging: or('active', 'state.dragging').readOnly(),

  fileInputNode: computed(function() {
    return this.$(`#${ this.get('elementId') }-input:first`);
  }).readOnly(),

  ariaDisabled: computed('disabled', function() {
    if (isPresent(this.get('disabled'))) {
      return 'true';
    }

    return null;
  }).readOnly(),

  sizeClass: computed('state.size', function() {
    let size = this.get('state.size');
    return `Polaris-DropZone--size${ capitalize(size) }`;
  }).readOnly(),

  showDragOverlay: computed('isDragging', 'state.error', 'overlay', function() {
    let { isDragging, error, overlay } = this.getProperties(
      'isDragging',
      'state.error',
      'overlay',
    );

    return isDragging && !error && overlay;
  }).readOnly(),

  /**
   * Event handlers
   */
  handleClick(e) {
    let { onClick, disabled } = this.getProperties('onClick', 'disabled');
    if (disabled) {
      return;
    }

    return onClick ? onClick(e) : this.open(e);
  },

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    let { disabled, onDrop, onDropAccepted, onDropRejected } = this.getProperties(
      'disabled',
      'onDrop',
      'onDropAccepted',
      'onDropRejected',
    );
    if (disabled) {
      return;
    }
    let fileList = getDataTransferFiles(e);
    let { files, acceptedFiles, rejectedFiles } = this.getValidatedFiles(fileList);

    this.set('dragTargets', []);

    this.get('state').setProperties({
      dragging: false,
      error: rejectedFiles.length > 0,
    });

    onDrop(files, acceptedFiles, rejectedFiles);

    if (acceptedFiles.length) {
      onDropAccepted(acceptedFiles);
    }

    if (rejectedFiles.length) {
      onDropRejected(rejectedFiles);
    }
  },

  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();

    let dragging = this.get('state.dragging');
    let { disabled, onDragEnter, dragTargets } = this.getProperties('disabled', 'onDragEnter', 'dragTargets');
    if (disabled) {
      return;
    }

    let fileList = getDataTransferFiles(e);
    if (dragTargets.indexOf(e.target) === -1) {
      dragTargets.push(e.target);
    }

    if (dragging) {
      return false;
    }

    let { rejectedFiles } = this.getValidatedFiles(fileList);

    this.get('state').setProperties({
      dragging: true,
      error: rejectedFiles.length > 0,
    });

    onDragEnter();
  },

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    let { disabled, onDragOver } = this.getProperties('disabled', 'onDragOver');
    if (disabled) {
      return;
    }

    onDragOver();

    return false;
  },

  handleDragLeave(e) {
    e.preventDefault();

    let { disabled, onDragLeave, dragTargets, dropNode } = this.getProperties(
      'disabled',
      'onDragLeave',
      'dragTargets',
      'dropNode',
    );
    if (disabled) {
      return;
    }

    dragTargets = dragTargets.filter((el) => {
      return el !== e.target &&
        dropNode &&
        dropNode.contains(el);
    });

    if (dragTargets.length > 0) {
      return;
    }

    this.get('state').setProperties({
      dragging: false,
      error: false,
    });

    onDragLeave();
  },

  handleDragStart(e) {
    e.preventDefault();
    e.stopPropagation();
  },

  adjustSize() {
    debounce(this, function() {
      let node = this.get('node');
      if (isNone(node)) {
        return;
      }

      let size = 'large';
      let width = node.getBoundingClientRect().width;

      if (width < 114) {
        size = 'small';
      } else if (width < 300) {
        size = 'medium';
      }

      this.set('state.size', size);
    }, 50);
  },

  getValidatedFiles(files) {
    let { accept, allowMultiple, customValidator } = this.getProperties(
      'accept',
      'allowMultiple',
      'customValidator',
    );

    let acceptedFiles = [];
    let rejectedFiles = [];

    Array.from(files).forEach((file) => {
      if (!fileAccepted(file, accept) || (customValidator && !customValidator(file))) {
        rejectedFiles.push(file);
      } else {
        acceptedFiles.push(file);
      }
    });

    if (!allowMultiple) {
      acceptedFiles.splice(1, acceptedFiles.length);
      rejectedFiles.push(...acceptedFiles.slice(1));
    }

    return {
      files,
      acceptedFiles,
      rejectedFiles,
    };
  },

  setupEvents() {
    let dropNode = this.get('dropNode');
    if (isNone(dropNode)) {
      return;
    }

    this.addEventListener(dropNode, 'drop', this.handleDrop);
    this.addEventListener(dropNode, 'dragover', this.handleDragOver);
    this.addEventListener(dropNode, 'dragenter', this.handleDragEnter);
    this.addEventListener(dropNode, 'dragleave', this.handleDragLeave);

    this.addEventListener(this.element, 'click', this.handleClick);
    this.addEventListener(this.element, 'dragStart', this.handleDragStart);

    this.addEventListener(window, 'resize', this.adjustSize);
  },

  setNode() {
    let dropOnPage = this.get('dropOnPage');
    this.setProperties({
      node: this.element,
      dropNode: dropOnPage ? document : this.element,
    });

    this.adjustSize();
  },

  updateStateFromProps() {
    let { error, type, overlayText, errorOverlayText } = this.get('state').getProperties(
      'error',
      'type',
      'overlayText',
      'errorOverlayText',
    );

    if (error !== this.get('error')) {
      this.set('state.error', this.get('error'));
    }

    let newType = this.get('type');
    if (isPresent(newType) && newType !== type) {
      this.set('state.type', newType);
    }

    let newOverlayText = this.get('overlayText');
    if (isPresent(newOverlayText) && newOverlayText !== overlayText) {
      this.set('state.overlayText', newOverlayText);
    }

    let newErrorOverlayText = this.get('errorOverlayText');
    if (isPresent(newErrorOverlayText) && newErrorOverlayText !== errorOverlayText) {
      this.set('state.errorOverlayText', newErrorOverlayText);
    }
  },

  open() {
    let fileInputNode = this.get('fileInputNode');
    if (isNone(fileInputNode)) {
      return;
    }

    fileInputNode.click();
  },

  /**
   * Component life-cycle hooks
   */
  init() {
    this._super(...arguments);
    this.set('dragTargets', []);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.updateStateFromProps();
  },

  didInsertElement() {
    this._super(...arguments);

    this.setNode();
    this.setupEvents();
  },

  actions: {
    handleDrop() {
      this.handleDrop(...arguments);
    }
  }
});
