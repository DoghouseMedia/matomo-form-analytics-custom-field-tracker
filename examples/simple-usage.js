/**
 * Simple Usage Example
 * 
 * This demonstrates the new simplified API where developers
 * just need to import FormAnalyticsCustomFieldTracker and
 * pass their custom fields as an array to init().
 */

import {
    FormAnalyticsCustomFieldTracker,
    BaseField,
    FieldCategories
} from '@doghouse/matomo-form-analytics-custom-field-tracker';

// Define a custom field for tracking H2 clicks
class H2ClickField extends BaseField {
    static fieldType = 'h2Click';
    static category = FieldCategories.SELECTABLE;
    static selector = '.survey-full__intro[data-name]';

    constructor(tracker, element, fieldName, debug = false) {
        super(tracker, element, fieldName, debug);
        this.h2Element = this.getInteractiveElement();
        this.clickCount = 0;
    }

    getInteractiveElement() {
        return this.element.querySelector('h2');
    }

    isBlank() {
        return this.clickCount === 0;
    }

    getFieldSize() {
        return this.clickCount;
    }

    setupEventListeners() {
        if (!this.h2Element) return;

        this.h2Element.addEventListener('click', () => {
            this.onFocus();
            this.clickCount++;
            this.onChange();
            setTimeout(() => this.onBlur(), 100);
        });
    }
}

// Define another custom field for tracking button clicks
class ButtonClickField extends BaseField {
    static fieldType = 'buttonClick';
    static category = FieldCategories.SELECTABLE;
    static selector = '.custom-button[data-name]';

    constructor(tracker, element, fieldName, debug = false) {
        super(tracker, element, fieldName, debug);
        this.clickCount = 0;
    }

    getInteractiveElement() {
        return this.element;
    }

    isBlank() {
        return this.clickCount === 0;
    }

    getFieldSize() {
        return this.clickCount;
    }

    setupEventListeners() {
        this.element.addEventListener('click', () => {
            this.onFocus();
            this.clickCount++;
            this.onChange();
            setTimeout(() => this.onBlur(), 100);
        });
    }
}

// Initialize the tracker with custom fields and debug enabled
FormAnalyticsCustomFieldTracker.init([
    { fieldType: 'h2Click', FieldClass: H2ClickField },
    { fieldType: 'buttonClick', FieldClass: ButtonClickField }
], true); // Enable debug logging

console.log('✅ Matomo Form Analytics Custom Field Tracker initialized with custom fields and debug enabled');

// You can also register fields programmatically:
// FormAnalyticsCustomFieldTracker.registerFieldType('myField', MyCustomField, true);

// Check available field types:
// console.log('Available field types:', FormAnalyticsCustomFieldTracker.getAvailableFieldTypes());
