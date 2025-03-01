import Component from '@ember/component';
import { computed, get } from '@ember/object';
import layout from '../../templates/components/polaris-resource-list/filter-control';
import { context } from '@smile-io/ember-polaris/components/polaris-resource-list';
import { FilterType } from '@smile-io/ember-polaris/components/polaris-resource-list/filter-control/filter-value-selector';

export default Component.extend(context.ConsumerMixin, {
  tagName: '',

  layout,

  /**
   * @property searchValue
   * @type {String}
   * @default null
   * @public
   */
  searchValue: null,

  /**
   * @property appliedFilters
   * @type {Object[]}
   * @default null
   * @public
   */
  appliedFilters: null,

  /**
   * @property additionalAction
   * @type {Object}
   * @default null
   * @public
   */
  additionalAction: null,

  /**
   * @property focused
   * @type {Boolean}
   * @default false
   * @public
   */
  focused: false,

  /**
   * @property filters
   * @type {Object[]}
   * @default null
   * @public
   */
  filters: null,

  /**
   * @property onSearchBlur
   * @type {Function}
   * @default noop
   * @public
   */
  onSearchBlur() {},

  /**
   * @property onSearchChange
   * @type {Function}
   * @default noop
   * @public
   */
  onSearchChange() {},

  /**
   * @property onFiltersChange
   * @type {Function}
   * @default noop
   * @public
   */
  onFiltersChange() {},

  /**
   * Button details for `additionalAction`. This is here
   * instead of in the template because handlebars
   * always evaluates both branches of an `if`-statement
   * so will try creating an action from `additionalAction.onAction`
   * even if it doesn't exist, which leads to an error.
   *
   * @property additionalActionButton
   * @type {Object}
   * @private
   */
  additionalActionButton: computed(
    'additionalAction.{text,accessibilityLabel,url,external,destructive,icon,loading,onAction}',
    'context.selectMode',
    function() {
      let { additionalAction, context } = this.getProperties(
        'additionalAction',
        'context'
      );
      if (!additionalAction) {
        return null;
      }

      let props = Object.assign({}, additionalAction, {
        disabled: get(context, 'selectMode'),
      });

      // Rename onAction to onClick.
      props.onClick = props.onAction;
      delete props.onAction;

      return {
        componentName: 'polaris-button',
        props,
      };
    }
  ).readOnly(),

  /**
   * List of appliedFilters in a format
   * for rendering in the template
   *
   * @property appliedFiltersForRender
   * @type {Object[]}
   * @private
   */
  appliedFiltersForRender: computed('appliedFilters.[]', function() {
    let appliedFilters = this.get('appliedFilters') || [];
    return appliedFilters.map((appliedFilter) => {
      let appliedFilterForRender = JSON.parse(JSON.stringify(appliedFilter));
      appliedFilterForRender.label = this.getFilterLabel(appliedFilter);
      return appliedFilterForRender;
    });
  }).readOnly(),

  textFieldLabel: computed(function() {
    return `Search ${this.get(
      'context.resourceName.plural'
    ).toLocaleLowerCase()}`;
  }).readOnly(),

  handleAddFilter(newFilter) {
    let { onFiltersChange, appliedFilters } = this.getProperties(
      'onFiltersChange',
      'appliedFilters'
    );
    appliedFilters = appliedFilters || [];

    if (!onFiltersChange) {
      return;
    }

    let foundFilter = appliedFilters.find(
      (appliedFilter) => idFromFilter(appliedFilter) === idFromFilter(newFilter)
    );

    if (foundFilter) {
      return;
    }

    let newAppliedFilters = [...appliedFilters, newFilter];

    onFiltersChange(newAppliedFilters);
  },

  handleRemoveFilter(filter) {
    let filterId = idFromFilter(filter);
    let { onFiltersChange, appliedFilters } = this.getProperties(
      'onFiltersChange',
      'appliedFilters'
    );
    appliedFilters = appliedFilters || [];

    if (!onFiltersChange) {
      return;
    }

    let foundIndex = appliedFilters.findIndex(
      (appliedFilter) => idFromFilter(appliedFilter) === filterId
    );

    let newAppliedFilters =
      foundIndex >= 0
        ? [
            ...appliedFilters.slice(0, foundIndex),
            ...appliedFilters.slice(foundIndex + 1, appliedFilters.length),
          ]
        : [...appliedFilters];

    onFiltersChange(newAppliedFilters);
  },

  getFilterLabel(appliedFilter) {
    let key = get(appliedFilter, 'key');
    let value = get(appliedFilter, 'value');
    let label = get(appliedFilter, 'label');
    if (label) {
      return label;
    }

    let filters = this.get('filters') || [];

    let filter = filters.find((filter) => {
      let minKey = get(filter, 'minKey');
      let maxKey = get(filter, 'maxKey');
      let operatorText = get(filter, 'operatorText');

      if (minKey || maxKey) {
        return get(filter, 'key') === key || minKey === key || maxKey === key;
      }

      if (operatorText && typeof operatorText !== 'string') {
        return (
          get(filter, 'key') === key ||
          operatorText.filter((operator) => get(operator, 'key') === key)
            .length === 1
        );
      }

      return get(filter, 'key') === key;
    });

    if (!filter) {
      return value;
    }

    let filterOperatorLabel = findOperatorLabel(filter, appliedFilter);
    let filterLabelByType = this.findFilterLabelByType(filter, appliedFilter);

    if (!filterOperatorLabel) {
      return `${filter.label} ${filterLabelByType}`;
    }

    return `${filter.label} ${filterOperatorLabel} ${filterLabelByType}`;
  },

  findFilterLabelByType(filter, appliedFilter) {
    let appliedFilterValue = get(appliedFilter, 'value');

    if (get(filter, 'type') === FilterType.Select) {
      let foundFilterOption = get(filter, 'options').find((option) =>
        typeof option === 'string'
          ? option === appliedFilterValue
          : get(option, 'value') === appliedFilterValue
      );

      if (foundFilterOption) {
        return typeof foundFilterOption === 'string'
          ? foundFilterOption
          : get(foundFilterOption, 'label');
      }
    }

    if (get(filter, 'type') === FilterType.DateSelector) {
      if (get(filter, 'key') === get(appliedFilter, 'key')) {
        return getFilterLabelForValue(get(appliedFilter, 'value'));
      }

      if (get(appliedFilter, 'key') === get(filter, 'maxKey')) {
        return `before ${formatDateForLabelDisplay(
          get(appliedFilter, 'value')
        )}`;
      }

      if (get(appliedFilter, 'key') === get(filter, 'minKey')) {
        return `after ${formatDateForLabelDisplay(
          get(appliedFilter, 'value')
        )}`;
      }
    }

    return appliedFilterValue;
  },
});

function idFromFilter(appliedFilter) {
  return `${get(appliedFilter, 'key')}-${get(appliedFilter, 'value')}`;
}

function formatDateForLabelDisplay(date) {
  if (isNaN(new Date(date).getTime())) {
    return date;
  }

  return new Date(date.replace(/-/g, '/')).toLocaleDateString();
}

function findOperatorLabel(filter, appliedFilter) {
  let operatorText = get(filter, 'operatorText');

  if (
    filter.type === FilterType.DateSelector &&
    (get(appliedFilter, 'key') === get(filter, 'minKey') ||
      get(appliedFilter, 'key') === get(filter, 'maxKey'))
  ) {
    return '';
  }

  if (!operatorText || typeof operatorText === 'string') {
    return operatorText;
  }

  let appliedOperator = operatorText.find((operator) => {
    return get(operator, 'key') === get(appliedFilter, 'key');
  });

  if (appliedOperator) {
    return (
      get(appliedOperator, 'filterLabel') || get(appliedOperator, 'optionLabel')
    );
  }
}

/**
 * This function is a workaround for the fact that the
 * React implementation uses the Polaris i18n service
 * internally, which we don't have.
 */
function getFilterLabelForValue(value) {
  let filterLabelKeys = {
    past_week: 'in the last week',
    past_month: 'in the last month',
    past_quarter: 'in the last 3 months',
    past_year: 'in the last year',
    coming_week: 'next week',
    coming_month: 'next month',
    coming_quarter: 'in the next 3 months',
    coming_year: 'in the next year',
  };

  return filterLabelKeys[value] || value;
}
