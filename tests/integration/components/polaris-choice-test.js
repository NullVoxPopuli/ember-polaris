import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import buildNestedSelector from '../../helpers/build-nested-selector';
import MockSvgJarComponent from '../../mocks/components/svg-jar';

// A simple component to test rendering of label components.
const TestLabelComponent = Component.extend({
  tagName: 'div',
  classNames: ['test-label-component'],

  layout: hbs`{{text}}`,

  text: 'test label component',
});

module('Integration | Component | polaris choice', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('component:svg-jar', MockSvgJarComponent);
    this.owner.register('component:test-label', TestLabelComponent);
  });

  const labelSelector = 'label.Polaris-Choice';
  const controlSelector = buildNestedSelector(
    labelSelector,
    'span.Polaris-Choice__Control'
  );
  const labelContentSelector = buildNestedSelector(
    labelSelector,
    'span.Polaris-Choice__Label'
  );

  // When an error or help text are passed into the choice component,
  // they get rendered in a description div alongside the label;
  // both get wrapped up in one containing div.
  const withDescriptionWrapperSelector = buildNestedSelector(
    'div.choice-with-description-wrapper',
    'div'
  );
  const labelWithDescriptionSelector = buildNestedSelector(
    withDescriptionWrapperSelector,
    labelSelector
  );
  const controlWithDescriptionSelector = buildNestedSelector(
    withDescriptionWrapperSelector,
    controlSelector
  );
  const labelContentWithDescriptionSelector = buildNestedSelector(
    withDescriptionWrapperSelector,
    labelContentSelector
  );

  const descriptionSelector = buildNestedSelector(
    withDescriptionWrapperSelector,
    'div.Polaris-Choice__Descriptions'
  );
  const helpTextSelector = buildNestedSelector(
    descriptionSelector,
    'div.Polaris-Choice__HelpText'
  );
  const errorSelector = buildNestedSelector(
    descriptionSelector,
    'div.Polaris-Choice__Error'
  );
  const errorIconSelector = buildNestedSelector(
    errorSelector,
    'div.Polaris-InlineError',
    'div.Polaris-InlineError__Icon',
    'span.Polaris-Icon',
    'svg'
  );

  test('it renders the correct HTML when no error or helpText are provided', async function(assert) {
    await render(hbs`
      {{#polaris-choice inputId="test-choice" label="This is my label"}}
        <span class="test-control">This is a test control</span>
      {{/polaris-choice}}
    `);

    const labels = assert.dom(labelSelector);
    labels.exists({ count: 1 }, 'renders one label');
    labels.hasAttribute(
      'for',
      'test-choice',
      'renders the label with the correct `for` attribute'
    );

    const testControlSelector = buildNestedSelector(
      controlSelector,
      'span.test-control'
    );
    const testControls = assert.dom(testControlSelector);
    testControls.exists({ count: 1 }, 'renders one control');
    testControls.hasText(
      'This is a test control',
      'renders the control correctly'
    );

    const labelContents = assert.dom(labelContentSelector);
    labelContents.exists({ count: 1 }, 'renders one label content wrapper');
    labelContents.hasText(
      'This is my label',
      'renders the label text correctly'
    );
  });

  test('it renders the correct HTML when helpText is provided', async function(assert) {
    await render(hbs`
      <div class="choice-with-description-wrapper">
        {{#polaris-choice
          inputId="helpful-test-choice"
          label="This is my label for a control with help text"
          helpText="This is some help text"
        }}
          <span class="helpful-test-control">This is a test control with help text</span>
        {{/polaris-choice}}
      </div>
    `);

    const labels = assert.dom(labelWithDescriptionSelector);
    labels.exists({ count: 1 }, 'renders one label');
    labels.hasAttribute(
      'for',
      'helpful-test-choice',
      'renders the label with the correct `for` attribute'
    );

    const testControlSelector = buildNestedSelector(
      controlWithDescriptionSelector,
      'span.helpful-test-control'
    );
    const testControls = assert.dom(testControlSelector);
    testControls.exists({ count: 1 }, 'renders one control');
    testControls.hasText(
      'This is a test control with help text',
      'renders the control correctly'
    );

    const labelContents = assert.dom(labelContentWithDescriptionSelector);
    labelContents.exists({ count: 1 }, 'renders one label content wrapper');
    labelContents.hasText(
      'This is my label for a control with help text',
      'renders the label text correctly'
    );

    // Check the help text rendering.
    const helpTexts = assert.dom(helpTextSelector);
    helpTexts.exists({ count: 1 }, 'renders one help text');
    // assert.equal(helpTexts[0].id, 'helpful-test-choiceHelpText'); TODO: figure out why ID isn't being set
    helpTexts.hasText(
      'This is some help text',
      'renders the correct help text'
    );
  });

  test('it renders the correct HTML when an error is provided', async function(assert) {
    await render(hbs`
      <div class="choice-with-description-wrapper">
        {{#polaris-choice
          inputId="error-test-choice"
          label="This is my label for a control with an error"
          error="This is an error message"
        }}
          <span class="error-test-control">This is a test control with an error</span>
        {{/polaris-choice}}
      </div>
    `);

    const labels = assert.dom(labelWithDescriptionSelector);
    labels.exists({ count: 1 }, 'renders one label');
    labels.hasAttribute(
      'for',
      'error-test-choice',
      'renders the label with the correct `for` attribute'
    );

    const testControlSelector = buildNestedSelector(
      controlWithDescriptionSelector,
      'span.error-test-control'
    );
    const testControls = assert.dom(testControlSelector);
    testControls.exists({ count: 1 }, 'renders one control');
    testControls.hasText(
      'This is a test control with an error',
      'renders the control correctly'
    );

    const labelContents = assert.dom(labelContentWithDescriptionSelector);
    labelContents.exists({ count: 1 }, 'renders one label content wrapper');
    labelContents.hasText(
      'This is my label for a control with an error',
      'renders the label text correctly'
    );

    // Check the error rendering.
    const errors = assert.dom(errorSelector);
    errors.exists({ count: 1 }, 'renders one error');
    // assert.equal(errors[0].id, 'error-test-choiceError'); TODO: figure out why ID isn't being set
    errors.hasText(
      'This is an error message',
      'renders the correct error text'
    );

    const errorIcons = assert.dom(errorIconSelector);
    errorIcons.exists({ count: 1 }, 'renders one error icon');
    errorIcons.hasAttribute(
      'data-icon-source',
      'polaris/alert',
      'renders the correct error icon'
    );
  });

  test('it handles the labelHidden attribute correctly', async function(assert) {
    this.set('labelHidden', true);
    await render(hbs`
      {{polaris-choice
        inputId="hidden-label-test-choice"
        label="This is my hidden label"
        labelHidden=labelHidden
      }}
    `);

    let label = assert.dom(labelSelector);
    label.exists('without description - renders the label');
    label.hasClass(
      'Polaris-Choice--labelHidden',
      'without description - applies labelHidden class when labelHidden true'
    );

    this.set('labelHidden', false);
    label.hasNoClass(
      'Polaris-Choice--labelHidden',
      'without description - does not apply labelHidden class when labelHidden false'
    );

    await render(hbs`
      {{polaris-choice
        inputId="hidden-label-test-choice-with-error"
        label="This is my hidden label with an error"
        labelHidden=labelHidden
        error="This is an error message"
      }}
    `);

    label = assert.dom(labelSelector);
    label.exists('with description - renders the label');
    label.hasNoClass(
      'Polaris-Choice--labelHidden',
      'with description - does not apply labelHidden class when labelHidden false'
    );

    this.set('labelHidden', true);
    label.hasClass(
      'Polaris-Choice--labelHidden',
      'with description - applies labelHidden class when labelHidden true'
    );
  });

  test('it handles label components correctly when no description is present', async function(assert) {
    this.setProperties({
      label: null,
      labelComponent: 'test-label',
    });

    await render(hbs`
      {{polaris-choice
        label=label
        labelComponent=labelComponent
      }}
    `);

    let labelContent = assert.dom(labelContentSelector);
    labelContent.exists('renders the label');

    const labelComponentSelector = buildNestedSelector(
      labelContentSelector,
      'div.test-label-component'
    );
    let labelComponent = assert.dom(labelComponentSelector);

    labelComponent.exists(
      'with label component string - renders the label component'
    );
    labelContent.hasText(
      'test label component',
      'with label component string - renders the correct label content'
    );

    this.set('label', 'literal label');
    labelContent.hasText(
      'test label component',
      'with label component string and label - renders the correct label content'
    );

    this.set('labelComponent', null);
    labelContent.hasText(
      'literal label',
      'with label - renders the correct label content'
    );

    this.setProperties({
      label: null,
      useLabelComponent: true,
    });
    await render(hbs`
      {{polaris-choice
        label=label
        labelComponent=(if useLabelComponent (
          component "test-label" text="test label component from component closure"
        ))
      }}
    `);

    labelContent = assert.dom(labelContentSelector);
    assert.ok(labelContent, 'renders the label');

    labelComponent = assert.dom(labelComponentSelector);
    assert.ok(
      labelComponent,
      'with label component closure - renders the label component'
    );
    labelContent.hasText(
      'test label component from component closure',
      'with label component closure - renders the correct label content'
    );

    this.set('label', 'literal label');
    labelContent.hasText(
      'test label component from component closure',
      'with label component closure and label - renders the correct label content'
    );

    this.set('useLabelComponent', false);
    labelContent.hasText(
      'literal label',
      'with label - renders the correct label content'
    );
  });

  test('it handles label components correctly when a description is supplied', async function(assert) {
    this.setProperties({
      label: null,
      labelComponent: 'test-label',
    });

    await render(hbs`
      {{polaris-choice
        label=label
        labelComponent=labelComponent
        description="testing label components"
      }}
    `);

    let labelContent = assert.dom(labelContentSelector);
    assert.ok(labelContent, 'renders the label');

    const labelComponentSelector = buildNestedSelector(
      labelContentSelector,
      'div.test-label-component'
    );
    let labelComponent = assert.dom(labelComponentSelector);
    assert.ok(
      labelComponent,
      'with label component string - renders the label component'
    );
    labelContent.hasText(
      'test label component',
      'with label component string - renders the correct label content'
    );

    this.set('label', 'literal label');
    labelContent.hasText(
      'test label component',
      'with label component string and label - renders the correct label content'
    );

    this.set('labelComponent', null);
    labelContent.hasText(
      'literal label',
      'with label - renders the correct label content'
    );

    this.setProperties({
      label: null,
      useLabelComponent: true,
    });
    await render(hbs`
      {{polaris-choice
        label=label
        labelComponent=(if useLabelComponent (
          component "test-label" text="test label component from component closure"
        ))
      }}
    `);

    labelContent = assert.dom(labelContentSelector);
    assert.ok(labelContent, 'renders the label');

    labelComponent = assert.dom(labelComponentSelector);
    assert.ok(
      labelComponent,
      'with label component closure - renders the label component'
    );
    labelContent.hasText(
      'test label component from component closure',
      'with label component closure - renders the correct label content'
    );

    this.set('label', 'literal label');
    labelContent.hasText(
      'test label component from component closure',
      'with label component closure and label - renders the correct label content'
    );

    this.set('useLabelComponent', false);
    labelContent.hasText(
      'literal label',
      'with label - renders the correct label content'
    );
  });

  test('it handles the disabled attribute correctly', async function(assert) {
    let disabledClass = 'Polaris-Choice--disabled';

    this.set('disabled', true);

    await render(hbs`
      {{polaris-choice
        inputId="disabled-test"
        label="My label"
        disabled=disabled
      }}
    `);

    assert.dom(labelSelector).hasClass(disabledClass);

    this.set('disabled', false);

    assert.dom(labelSelector).hasNoClass(disabledClass);
  });

  test('it allows passing a component as the helpText property', async function(assert) {
    await render(hbs`
      {{polaris-choice
        inputId="help-text-component-test"
        helpText=(component "polaris-icon" source="circle-check-mark")
      }}
    `);

    assert.dom('[data-test-icon]').exists({ count: 1 });
  });
});
