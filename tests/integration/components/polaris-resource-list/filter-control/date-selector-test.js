import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { DateFilterOption } from '@smile-io/ember-polaris/components/polaris-resource-list/filter-control/date-selector';

const dateOptionType = {
  past: [
    DateFilterOption.PastWeek,
    DateFilterOption.PastMonth,
    DateFilterOption.PastQuarter,
    DateFilterOption.PastYear,
    DateFilterOption.OnOrBefore,
    DateFilterOption.OnOrAfter,
  ],
  future: [
    DateFilterOption.ComingWeek,
    DateFilterOption.ComingMonth,
    DateFilterOption.ComingQuarter,
    DateFilterOption.ComingYear,
    DateFilterOption.OnOrBefore,
    DateFilterOption.OnOrAfter,
  ],
  full: [
    DateFilterOption.PastWeek,
    DateFilterOption.PastMonth,
    DateFilterOption.PastQuarter,
    DateFilterOption.PastYear,
    DateFilterOption.ComingWeek,
    DateFilterOption.ComingMonth,
    DateFilterOption.ComingQuarter,
    DateFilterOption.ComingYear,
    DateFilterOption.OnOrBefore,
    DateFilterOption.OnOrAfter,
  ],
};

function getOptionsValuesList(options) {
  if (!options) {
    return [];
  }

  return options.map((option) => {
    return typeof option === 'string' ? option : option.value;
  });
}

module(
  'Integration | Component | polaris-resource-list/filter-control/date-selector',
  function(hooks) {
    setupRenderingTest(hooks);

    module('dateOptionType', function() {
      test('builds date filters Select options for past option type', async function(assert) {
        await render(hbs`
          {{polaris-resource-list/filter-control/date-selector
            filterKey="starts"
            filterMinKey="starts_min"
            filterMaxKey="starts_max"
            dateOptionType="past"
          }}
        `);

        const expectOptionValues = dateOptionType.past;

        assert.deepEqual(
          getOptionsValuesList(
            findAll('.Polaris-Select option:not([disabled])')
          ),
          expectOptionValues
        );
      });

      test('builds date filters Select options for future option type', async function(assert) {
        await render(hbs`
          {{polaris-resource-list/filter-control/date-selector
            filterKey="starts"
            filterMinKey="starts_min"
            filterMaxKey="starts_max"
            dateOptionType="future"
          }}
        `);

        const expectOptionValues = dateOptionType.future;

        assert.deepEqual(
          getOptionsValuesList(
            findAll('.Polaris-Select option:not([disabled])')
          ),
          expectOptionValues
        );
      });

      test('builds date filters Select options for full option type', async function(assert) {
        await render(hbs`
          {{polaris-resource-list/filter-control/date-selector
            filterKey="starts"
            filterMinKey="starts_min"
            filterMaxKey="starts_max"
            dateOptionType="full"
          }}
        `);

        const expectOptionValues = dateOptionType.full;

        assert.deepEqual(
          getOptionsValuesList(
            findAll('.Polaris-Select option:not([disabled])')
          ),
          expectOptionValues
        );
      });

      test('defaults to full date filters Select options when option type is missing', async function(assert) {
        await render(hbs`
          {{polaris-resource-list/filter-control/date-selector
            filterKey="starts"
            filterMinKey="starts_min"
            filterMaxKey="starts_max"
          }}
        `);

        const expectOptionValues = dateOptionType.full;

        assert.deepEqual(
          getOptionsValuesList(
            findAll('.Polaris-Select option:not([disabled])')
          ),
          expectOptionValues
        );
      });
    });
  }
);
