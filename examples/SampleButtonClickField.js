import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker'

/**
 * Sample Button Click Field Implementation
 * 
 * This is an example of how to create a custom field for Matomo FormAnalytics.
 * This field tracks button clicks and counts them as field interactions.
 *
 * @class SampleButtonClickField
 * @extends BaseField
 */
export class SampleButtonClickField extends BaseField {
    static fieldType = 'buttonClick';
    static category = BaseField.FieldCategories.SELECTABLE;
    static selector = '.custom-button[data-name]';

    /**
     * @inheritDoc
     */
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.clickCount = 0;
    }

    /**
     * @inheritDoc
     */
    getInteractiveElement() {
        return this.element;
    }

    /**
     * @inheritDoc
     */
    isBlank() {
        return this.clickCount === 0;
    }

    /**
     * @inheritDoc
     */
    getFieldSize() {
        return this.clickCount;
    }

    /**
     * Sets up custom event listeners for button click field
     * Overrides BaseField's setupEventListeners for custom click handling
     */
    setupEventListeners() {
        if (!this.element) {
            if (this.debug) console.error('Button element not found:', this.element);
            return;
        }

        this.element.addEventListener('click', () => {
            this.onFocus();
            this.clickCount++;
            this.onChange();
            setTimeout(() => this.onBlur(), 100);
        });
    }
}
