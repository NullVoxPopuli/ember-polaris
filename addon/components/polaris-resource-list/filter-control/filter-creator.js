import { tagName, layout as templateLayout } from '@ember-decorators/component';
import { computed } from '@ember/object';
import { and } from '@ember/object/computed';
import Component from '@ember/component';
import { get } from '@ember/object';
import layout from '../../../templates/components/polaris-resource-list/filter-control/filter-creator';

@tagName('')
@templateLayout(layout)
export default class FilterCreator extends Component {
  /**
   * @property filters
   * @type {Object[]}
   * @default null
   * @public
   */
  filters = null;

  /**
   * Object with `singular` and `plural` properties.
   *
   * @property resourceName
   * @type {Object}
   * @default null
   * @public
   */
  resourceName = null;

  /**
   * @property disabled
   * @type {Boolean}
   * @default false
   * @public
   */
  disabled = false;

  /**
   * @property onAddFilter
   * @type {Function}
   * @default noop
   * @public
   */
  onAddFilter() {}

  /**
   * @property selectedFilter
   * @type {Object}
   * @default null
   * @private
   */
  selectedFilter = null;

  /**
   * @property selectedFilterKey
   * @type {String}
   * @default null
   * @private
   */
  selectedFilterKey = null;

  /**
   * @property selectedFilterValue
   * @type {String}
   * @default null
   * @private
   */
  selectedFilterValue = null;

  @(and(
    'selectedFilter',
    'selectedFilterKey',
    'selectedFilterValue'
  ).readOnly())
  canAddFilter;

  @(computed('resourceName.plural').readOnly())
  get selectLabel() {
    return `Show all ${this.get('resourceName.plural')} where:`;
  }

  @(computed('filters.@each.{key,label}').readOnly())
  get filterOptions() {
    return this.get('filters').map(({ key, label }) => ({
      value: key,
      label,
    }));
  }

  handleButtonFocus(...args) {
    let event = args[0];
    if (!this.get('node') && event) {
      this.set('node', event.target);
    }
  }

  handleFilterKeyChange(filterKey) {
    let filters = this.get('filters');

    let foundFilter = filters.find((filter) => {
      let minKey = get(filter, 'minKey');
      let maxKey = get(filter, 'maxKey');
      let operatorText = get(filter, 'operatorText');

      if (minKey || maxKey) {
        return (
          get(filter, 'key') === filterKey ||
          minKey === filterKey ||
          maxKey === filterKey
        );
      }

      if (operatorText && typeof operatorText !== 'string') {
        return (
          get(filter, 'key') === filterKey ||
          operatorText.filter(({ key }) => key === filterKey).length === 1
        );
      }

      return get(filter, 'key') === filterKey;
    });

    if (!foundFilter) {
      return;
    }

    this.setProperties({
      selectedFilter: foundFilter,
      selectedFilterKey: filterKey,
      selectedFilterValue: undefined,
    });
  }

  handleAddFilter(popover) {
    let { onAddFilter, selectedFilterKey } = this.getProperties(
      'onAddFilter',
      'selectedFilterKey'
    );

    if (!onAddFilter || !this.get('canAddFilter') || !selectedFilterKey) {
      return;
    }

    onAddFilter({
      key: selectedFilterKey,
      value: this.get('selectedFilterValue') || '',
    });
    this.setProperties({
      selectedFilter: undefined,
      selectedFilterValue: undefined,
    });

    popover.close();

    let node = this.get('node');
    if (node != null) {
      node.focus();
    }
  }
}
