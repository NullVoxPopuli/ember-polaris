import { tagName, layout as templateLayout } from "@ember-decorators/component";
import Component from '@ember/component';
import layout from '../../templates/components/polaris-resource-list/loading-overlay';

/**
 * Internal component used to DRY up rendering resource list loading state.
 */
@tagName('')
@templateLayout(layout)
export default class LoadingOverlay extends Component {
 loading = false;
 spinnerStyle = null;
 spinnerSize = null;
}
