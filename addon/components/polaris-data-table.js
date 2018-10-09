import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank, isPresent, isNone } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { scheduleOnce } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import ContextBoundEventListenersMixin from 'ember-lifeline/mixins/dom';
import ContextBoundTasksMixin from 'ember-lifeline/mixins/run';
import layout from '../templates/components/polaris-data-table';

function elementLookup(selector) {
  return computed(function() {
    return this.element.querySelector(selector);
  });
}

function measureColumn(tableData) {
  return function(column, index) {
    let {
      tableLeftVisibleEdge,
      tableRightVisibleEdge,
      firstVisibleColumnIndex,
      fixedColumnWidth,
    } = tableData;
    let width = column.offsetWidth;
    let leftEdge = column.offsetLeft - fixedColumnWidth;
    let rightEdge = leftEdge + width;
    let leftEdgeIsVisible = isEdgeVisible(
      leftEdge,
      tableLeftVisibleEdge,
      tableRightVisibleEdge
    );
    let rightEdgeIsVisible = isEdgeVisible(
      rightEdge,
      tableLeftVisibleEdge,
      tableRightVisibleEdge
    );
    let isCompletelyVisible =
      leftEdge < tableLeftVisibleEdge && rightEdge > tableRightVisibleEdge;
    let isVisible =
      isCompletelyVisible || leftEdgeIsVisible || rightEdgeIsVisible;
    if (isVisible) {
      tableData.firstVisibleColumnIndex = Math.min(
        firstVisibleColumnIndex,
        index
      );
    }
    return { leftEdge, rightEdge, isVisible };
  };
}

function isEdgeVisible(position, start, end) {
  let minVisiblePixels = 30;
  return position >= start + minVisiblePixels && position <= end - minVisiblePixels;
}

function getPrevAndCurrentColumns(tableData, columnData) {
  const { firstVisibleColumnIndex } = tableData;
  const previousColumnIndex = Math.max(firstVisibleColumnIndex - 1, 0);
  const previousColumn = columnData[previousColumnIndex];
  const currentColumn = columnData[firstVisibleColumnIndex];

  return { previousColumn, currentColumn };
}

/**
 * Polaris data table component.
 * See https://polaris.shopify.com/components/lists-and-tables/data-table
 */
export default Component.extend(
  ContextBoundEventListenersMixin,
  ContextBoundTasksMixin,
  {
    classNameBindings: ['collapsed:Polaris-DataTable--collapsed'],

    layout,

    /**
     * List of data types, which determines content alignment for each column.
     * Data types are "text," which aligns left, or "numeric," which aligns right.
     *
     * @property columnContentTypes
     * @type {String[]}
     * @public
     */
    columnContentTypes: null,

    /**
     * List of column headings.
     *
     * @property headings
     * @type {String[]}
     * @public
     */
    headings: null,

    /**
     * List of numeric column totals, highlighted in the table’s header below column headings.
     * Use empty strings as placeholders for columns with no total.
     *
     * @property totals
     * @type {Array}
     * @public
     */
    totals: null,

    /**
     * Lists of data points which map to table body rows.
     *
     * @property rows
     * @type {Array[]}
     * @public
     */
    rows: null,

    /**
     * Truncate content in first column instead of wrapping.
     *
     * @property truncate
     * @type {boolean}
     * @default false
     * @public
     */
    truncate: false,

    /**
     * Content centered in the full width cell of the table footer row.
     *
     * @property footerContent
     * @type {String|Number|Component}
     * @public
     */
    footerContent: null,

    /**
     * List of booleans, which maps to whether sorting is enabled or not for each column.
     * Defaults to false for all columns.
     *
     * @property sortable
     * @type {boolean[]}
     * @public
     */
    sortable: null,

    /**
     * The direction to sort the table rows on first click or keypress of a sortable column heading.
     * Defaults to ascending.
     *
     * @property defaultSortDirection
     * @type {String}
     * @default 'ascending'
     * @public
     */
    defaultSortDirection: 'ascending',

    /**
     * The index of the heading that the table rows are initially sorted by.
     * Defaults to the first column.
     *
     * @property initialSortColumnIndex
     * @type {Number}
     * @default 0
     * @public
     */
    initialSortColumnIndex: 0,

    /**
     * Callback fired on click or keypress of a sortable column heading.
     *
     * @property onSort
     * @type {function}
     * @default no-op
     * @public
     */
    onSort(/* headingIndex, direction */) {},

    /**
     * @property collapsed
     * @type {boolean}
     * @default false
     * @private
     */
    collapsed: false,

    /**
     * @property columnVisibilityData
     * @type {Object[]}
     * @private
     */
    columnVisibilityData: null,

    /**
     * @property previousColumn
     * @type {Object}
     * @private
     */
    previousColumn: null,

    /**
     * @property currentColumn
     * @type {Object}
     * @private
     */
    currentColumn: null,

    /**
     * @property sorted
     * @type {boolean}
     * @default false
     * @private
     */
    sorted: false,

    /**
     * @property sortedColumnIndex
     * @type {Number}
     * @private
     */
    sortedColumnIndex: null,

    /**
     * @property sortDirection
     * @type {String}
     * @private
     */
    sortDirection: null,

    /**
     * @property heights
     * @type {Number[]}
     * @private
     */
    heights: null,

    /**
     * @property preservedScrollPosition
     * @type {Object}
     * @private
     */
    preservedScrollPosition: null,

    /**
     * @property isScrolledFarthestLeft
     * @type {Boolean}
     * @private
     */
    isScrolledFarthestLeft: true,

    /**
     * @property isScrolledFarthestRight
     * @type {Boolean}
     * @private
     */
    isScrolledFarthestRight: false,

    /**
     * @property totalsRowHeading
     * @type {String}
     * @private
     */
    totalsRowHeading: 'Totals',

    /**
     * @property dataTable
     * @type {HTMLElement}
     * @private
     */
    dataTable: elementLookup('.Polaris-DataTable').readOnly(),

    /**
     * @property table
     * @type {HTMLElement}
     * @private
     */
    table: elementLookup('.Polaris-DataTable__Table').readOnly(),

    /**
     * @property scrollContainer
     * @type {HTMLElement}
     * @private
     */
    scrollContainer: elementLookup(
      '.Polaris-DataTable__ScrollContainer'
    ).readOnly(),

    /**
     * @property contentTypes
     * @type {String[]}
     * @private
     */
    // contentTypes: computed('columnContentTypes.[]', function() {
    //   let columnContentTypes = this.get('columnContentTypes');
    //   let fixedCellType = columnContentTypes[0];

    //   return [fixedCellType, ...columnContentTypes];
    // }).readOnly(),

    /**
     * @property scrollContainerStyle
     * @type {String}
     * @private
     */
    scrollContainerStyle: computed('footerContent', 'heights.[]', function() {
      if (isBlank(this.get('footerContent'))) {
        return null;
      }

      return htmlSafe(`margin-bottom: ${this.get('heights.lastObject')}px;`);
    }).readOnly(),

    resetScrollPosition() {
      let scrollContainer = this.get('scrollContainer');

      if (scrollContainer) {
        let { left, top } = this.get('preservedScrollPosition');

        if (left) {
          scrollContainer.scrollLeft = left;
        }

        if (top) {
          window.scrollTo(0, top);
        }
      }
    },

    setHeightsAndScrollPosition() {
      this.set('heights', this.tallestCellHeights());

      scheduleOnce('afterRender', this, this.resetScrollPosition);
    },

    calculateColumnVisibilityData(collapsed) {
      let {
        table,
        scrollContainer,
        dataTable,
      } = this.getProperties('table', 'scrollContainer', 'dataTable');

      if (collapsed && table && scrollContainer && dataTable) {
        let headerCells = table.querySelectorAll('[class*=header]');
        let collapsedHeaderCells = Array.from(headerCells).slice(1);
        let fixedColumnWidth = headerCells[0].offsetWidth;
        let firstVisibleColumnIndex = collapsedHeaderCells.length - 1;
        let tableLeftVisibleEdge = this.get('scrollContainer').scrollLeft + fixedColumnWidth;
        let tableRightVisibleEdge = this.get('scrollContainer').scrollLeft + dataTable.offsetWidth;

        let tableData = {
          fixedColumnWidth,
          firstVisibleColumnIndex,
          tableLeftVisibleEdge,
          tableRightVisibleEdge,
        };

        let columnVisibilityData = collapsedHeaderCells.map(
          measureColumn(tableData),
        );

        let lastColumn = columnVisibilityData[columnVisibilityData.length - 1];

        return assign(
          {
            fixedColumnWidth,
            columnVisibilityData,
            isScrolledFarthestLeft: tableLeftVisibleEdge === fixedColumnWidth,
            isScrolledFarthestRight: lastColumn.rightEdge <= tableRightVisibleEdge,
          },
          getPrevAndCurrentColumns(tableData, columnVisibilityData),
        );
      }

      return {
        columnVisibilityData: [],
        previousColumn: undefined,
        currentColumn: undefined,
      };
    },

    handleResize() {
      // This is needed to replicate the React implementation's `@debounce` decorator.
      this.debounceTask('debouncedHandleResize', 0);
    },

    debouncedHandleResize() {
      let {
        footerContent,
        truncate,
        table,
        scrollContainer,
      } = this.getProperties(
        'footerContent',
        'truncate',
        'table',
        'scrollContainer',
      );

      let collapsed = false;

      if (table && scrollContainer) {
        collapsed = table.scrollWidth > scrollContainer.clientWidth;
        scrollContainer.scrollLeft = 0;
      }

      this.setProperties(
        assign(
          {
            collapsed,
            heights: [],
          },
          this.calculateColumnVisibilityData(collapsed)
        )
      );

      scheduleOnce('afterRender', () => {
        if (footerContent || !truncate) {
          this.setHeightsAndScrollPosition();
        }
      });
    },

    scrollListener() {
      if (this.get('isDestroying') || this.get('isDestroyed')) {
        return;
      }

      this.setProperties(
        this.calculateColumnVisibilityData(this.get('collapsed'))
      );
    },

    tallestCellHeights() {
      let { footerContent, truncate, heights, table } = this.getProperties(
        'footerContent',
        'truncate',
        'heights',
        'table',
      );
      let rows = Array.from(table.getElementsByTagName('tr'));

      if (!truncate) {
        return (heights = rows.map((row) => {
          let fixedCell = row.children[0];
          return Math.max(row.clientHeight, fixedCell.clientHeight);
        }));
      }

      if (footerContent) {
        let footerCellHeight = rows[rows.length - 1].children[0].clientHeight;
        heights = [footerCellHeight];
      }

      return heights;
    },

    addEventHandlers() {
      this.addEventListener(window, 'resize', this.handleResize);
      this.addEventListener(window, 'scroll', this.scrollListener, {
        capture: true,
      });
    },

    init() {
      this._super(...arguments);

      this.setProperties({
        columnVisibilityData: [],
        sorted: isPresent(this.get('sortable')),
        heights: [],
        preservedScrollPosition: {},
      });
    },

    didInsertElement() {
      this._super(...arguments);

      this.handleResize();

      this.addEventHandlers();
    },

    actions: {
      navigateTable(direction) {
        let {
          currentColumn,
          previousColumn,
          fixedColumnWidth,
          scrollContainer,
        } = this.getProperties(
          'currentColumn',
          'previousColumn',
          'fixedColumnWidth',
          'scrollContainer',
        );

        if (!currentColumn || !previousColumn || !fixedColumnWidth) {
          return;
        }

        if (scrollContainer) {
          scrollContainer.scrollLeft =
            direction === 'right'
              ? currentColumn.rightEdge - fixedColumnWidth
              : previousColumn.leftEdge - fixedColumnWidth;

          requestAnimationFrame(() => {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
              return;
            }

            this.setProperties(
              this.calculateColumnVisibilityData(this.get('collapsed'))
            );
          });
        }
      },

      defaultOnSort(headingIndex) {
        let {
          onSort,
          truncate,
          defaultSortDirection = 'ascending',
          initialSortColumnIndex,
          sortDirection,
          sortedColumnIndex,
          scrollContainer,
        } = this.getProperties(
          'onSort',
          'truncate',
          'defaultSortDirection',
          'initialSortColumnIndex',
          'sortDirection',
          'sortedColumnIndex',
          'scrollContainer',
        );
        sortedColumnIndex = isNone(sortedColumnIndex)
          ? initialSortColumnIndex
          : sortedColumnIndex;
        let newSortDirection = defaultSortDirection;
        if (sortedColumnIndex === headingIndex) {
          newSortDirection =
            sortDirection === 'ascending' ? 'descending' : 'ascending';
        }

        this.setProperties({
          sorted: true,
          sortDirection: newSortDirection,
          sortedColumnIndex: headingIndex,
        });

        scheduleOnce('afterRender', () => {
          if (onSort) {
            onSort(headingIndex, newSortDirection);
            if (!truncate && scrollContainer) {
              let preservedScrollPosition = {
                left: scrollContainer.scrollLeft,
                top: window.scrollY,
              };
              this.set('preservedScrollPosition', preservedScrollPosition);
              this.handleResize();
            }
          }
        });
      },
    },
  }
);
