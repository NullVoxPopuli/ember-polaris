import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../templates/components/polaris-resource-list/filter-control/date-selector';

const VALID_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}$/;

export const DateFilterOption = {
  PastWeek: 'past_week',
  PastMonth: 'past_month',
  PastQuarter: 'past_quarter',
  PastYear: 'past_year',
  ComingWeek: 'coming_week',
  ComingMonth: 'coming_month',
  ComingQuarter: 'coming_quarter',
  ComingYear: 'coming_year',
  OnOrBefore: 'on_or_before',
  OnOrAfter: 'on_or_after',
};

export default Component.extend({
  tagName: '',

  layout,

  /**
   * Can be 'past', 'future' or 'full'.
   *
   * @property dateOptionType
   * @type {String}
   * @default 'full'
   * @public
   */
  dateOptionType: 'full',

  /**
   * @property filterValue
   * @type {String}
   * @default null
   * @public
   */
  filterValue: null,

  /**
   * @property filterKey
   * @type {String}
   * @default null
   * @public
   */
  filterKey: null,

  /**
   * @property filterMinKey
   * @type {String}
   * @default null
   * @public
   */
  filterMinKey: null,

  /**
   * @property filterMaxKey
   * @type {String}
   * @default null
   * @public
   */
  filterMaxKey: null,

  /**
   * @property onFilterValueChange
   * @type {Function}
   * @default noop
   * @public
   */
  onFilterValueChange() {},

  /**
   * @property onFilterKeyChange
   * @type {Function}
   * @default noop
   * @public
   */
  onFilterKeyChange() {},

  /**
   * @property selectedDate
   * @type {Date}
   * @default null
   * @private
   */
  selectedDate: null,

  /**
   * @property userInputDate
   * @type {String}
   * @default null
   * @private
   */
  userInputDate: null,

  /**
   * @property userInputDateError
   * @type {String}
   * @default null
   * @private
   */
  userInputDateError: null,

  /**
   * Month enum value, either string day of month or integer index (0 = Sunday).
   *
   * @property datePickerMonth
   * @type {String|Number}
   * @private
   */
  datePickerMonth: null,

  /**
   * @property datePickerYear
   * @type {Number}
   * @private
   */
  datePickerYear: null,

  /**
   * Will be set on initialisation.
   *
   * @property initialConsumerFilterKey
   * @type {String}
   * @default null
   * @private
   */
  initialConsumerFilterKey: null,

  dateComparatorOptions: computed(function() {
    return [
      {
        value: DateFilterOption.OnOrBefore,
        label: 'on or before',
      },
      {
        value: DateFilterOption.OnOrAfter,
        label: 'on or after',
      },
    ];
  }).readOnly(),

  datePastOptions: computed(function() {
    return [
      {
        value: DateFilterOption.PastWeek,
        label: 'in the last week',
      },
      {
        value: DateFilterOption.PastMonth,
        label: 'in the last month',
      },
      {
        value: DateFilterOption.PastQuarter,
        label: 'in the last 3 months',
      },
      {
        value: DateFilterOption.PastYear,
        label: 'in the last year',
      },
    ];
  }).readOnly(),

  dateFutureOptions: computed(function() {
    return [
      {
        value: DateFilterOption.ComingWeek,
        label: 'next week',
      },
      {
        value: DateFilterOption.ComingMonth,
        label: 'next month',
      },
      {
        value: DateFilterOption.ComingQuarter,
        label: 'in the next 3 months',
      },
      {
        value: DateFilterOption.ComingYear,
        label: 'in the next year',
      },
    ];
  }).readOnly(),

  dateOptionTypes: computed(function() {
    return {
      past: [
        ...this.get('datePastOptions'),
        ...this.get('dateComparatorOptions'),
      ],
      future: [
        ...this.get('dateFutureOptions'),
        ...this.get('dateComparatorOptions'),
      ],
      full: [
        ...this.get('datePastOptions'),
        ...this.get('dateFutureOptions'),
        ...this.get('dateComparatorOptions'),
      ],
    };
  }).readOnly(),

  now: computed(function() {
    return new Date();
  }).readOnly(),

  dateTextFieldValue: computed('userInputDate', 'selectedDate', function() {
    const { userInputDate, selectedDate } = this.getProperties(
      'userInputDate',
      'selectedDate'
    );

    if (!userInputDate && !selectedDate) {
      return undefined;
    }

    if (userInputDate !== undefined) {
      return userInputDate;
    }

    if (selectedDate) {
      return stripTimeFromISOString(formatDateForLocalTimezone(selectedDate));
    }
  }).readOnly(),

  dateFilterOption: computed(
    'filterValue',
    'filterKey',
    'filterMinKey',
    'filterMaxKey',
    function() {
      let {
        filterValue,
        filterKey,
        filterMinKey,
        filterMaxKey,
      } = this.getProperties(
        'filterValue',
        'filterKey',
        'filterMinKey',
        'filterMaxKey'
      );

      return getDateFilterOption(
        filterValue,
        filterKey,
        filterMinKey,
        filterMaxKey
      );
    }
  ).readOnly(),

  showDatePredicate: computed('dateFilterOption', function() {
    let dateFilterOption = this.get('dateFilterOption');

    return (
      dateFilterOption === DateFilterOption.OnOrBefore ||
      dateFilterOption === DateFilterOption.OnOrAfter
    );
  }).readOnly(),

  dateOptions: computed('dateOptionType', function() {
    let dateOptionType = this.get('dateOptionType') || 'full';

    return this.get(`dateOptionTypes.${dateOptionType}`);
  }).readOnly(),

  handleDateFilterOptionsChange(newOption) {
    let {
      onFilterValueChange,
      onFilterKeyChange,
      filterMinKey,
      filterMaxKey,
      initialConsumerFilterKey,
      selectedDate,
    } = this.getProperties(
      'onFilterValueChange',
      'onFilterKeyChange',
      'filterMinKey',
      'filterMaxKey',
      'initialConsumerFilterKey',
      'selectedDate'
    );

    if (!initialConsumerFilterKey) {
      return;
    }

    if (newOption === DateFilterOption.OnOrBefore) {
      onFilterKeyChange(filterMaxKey);
      onFilterValueChange(
        selectedDate
          ? stripTimeFromISOString(formatDateForLocalTimezone(selectedDate))
          : undefined
      );
      return;
    }

    if (newOption === DateFilterOption.OnOrAfter) {
      onFilterKeyChange(filterMinKey);
      onFilterValueChange(
        selectedDate
          ? stripTimeFromISOString(formatDateForLocalTimezone(selectedDate))
          : undefined
      );
      return;
    }

    onFilterKeyChange(initialConsumerFilterKey);
    onFilterValueChange(newOption);
  },

  handleDateFieldChange(value) {
    let { onFilterValueChange, userInputDateError } = this.getProperties(
      'onFilterValueChange',
      'userInputDateError'
    );

    if (value.length === 0) {
      this.set('selectedDate', undefined);
      onFilterValueChange(undefined);
    }

    if (userInputDateError && isValidDate(value)) {
      this.set('userInputDateError', undefined);
    }

    this.set('userInputDate', value);
  },

  handleDateBlur() {
    let { onFilterValueChange, dateTextFieldValue } = this.getProperties(
      'onFilterValueChange',
      'dateTextFieldValue'
    );

    if (!dateTextFieldValue || !isValidDate(dateTextFieldValue)) {
      this.setProperties({
        selectedDate: undefined,
        userInputDateError: 'Match YYYY-MM-DD format',
      });
      onFilterValueChange(undefined);

      return;
    }

    let userInputDate = this.get('userInputDate');
    if (!userInputDate) {
      return;
    }

    let formattedDateForTimezone = new Date(
      formatDateForLocalTimezone(new Date(userInputDate))
    );

    this.setProperties({
      selectedDate: formattedDateForTimezone,
      datePickerMonth: formattedDateForTimezone.getMonth(),
      datePickerYear: formattedDateForTimezone.getFullYear(),
      userInputDate: undefined,
      userInputDateError: undefined,
    });
    this.handleDateChanged();
  },

  handleDateChanged() {
    let { onFilterValueChange, selectedDate } = this.getProperties(
      'onFilterValueChange',
      'selectedDate'
    );

    if (!selectedDate) {
      return;
    }

    onFilterValueChange(
      stripTimeFromISOString(formatDateForLocalTimezone(selectedDate))
    );
  },

  handleDatePickerChange({ end: nextDate }) {
    this.setProperties({
      selectedDate: new Date(nextDate),
      userInputDate: undefined,
      userInputDateError: undefined,
    });

    this.handleDateChanged();
  },

  handleDatePickerMonthChange(month, year) {
    this.setProperties({
      datePickerMonth: month,
      datePickerYear: year,
    });
  },

  init() {
    this._super(...arguments);

    this.setProperties({
      datePickerMonth: this.get('now').getMonth(),
      datePickerYear: this.get('now').getYear(),
      initialConsumerFilterKey: this.get('filterKey'),
    });
  },
});

function isValidDate(date) {
  if (!date) {
    return false;
  }
  return VALID_DATE_REGEX.test(date) && !isNaN(new Date(date).getTime());
}

function getDateFilterOption(
  filterValue,
  filterKey,
  filterMinKey,
  filterMaxKey
) {
  if (filterKey === filterMaxKey) {
    return DateFilterOption.OnOrBefore;
  }

  if (filterKey === filterMinKey) {
    return DateFilterOption.OnOrAfter;
  }

  return filterValue;
}

function stripTimeFromISOString(ISOString) {
  return ISOString.slice(0, 10);
}

function formatDateForLocalTimezone(date) {
  let timezoneOffset = date.getTimezoneOffset();
  let timezoneOffsetMs = timezoneOffset * 60 * 1000;
  let isFringeTimezone = timezoneOffset === -720 || timezoneOffset === 720;
  let formattedDate = new Date();

  if (isFringeTimezone && date.getHours() !== 0) {
    return date.toISOString();
  }

  let newTime =
    timezoneOffset > -1
      ? date.getTime() + timezoneOffsetMs
      : date.getTime() - timezoneOffsetMs;

  formattedDate.setTime(newTime);
  return formattedDate.toISOString();
}
