# Sample Field Implementations

This folder contains reference implementations of common field types for Matomo FormAnalytics. These are provided as examples to help developers understand how to create their own custom field types.

## Available Sample Fields

### SampleWysiwygField
- **Category**: TEXT
- **Purpose**: Handles rich text editing with ProseMirror editor
- **Selector**: `.formulate-input-element--wysiwyg[data-name]`
- **Use Case**: Track user interactions with WYSIWYG editors

### SampleButtonClickField
- **Category**: SELECTABLE
- **Purpose**: Tracks button clicks and counts them as field interactions
- **Selector**: `.custom-button[data-name]`
- **Use Case**: Track user engagement with custom buttons

### SampleRatingField
- **Category**: SELECTABLE
- **Purpose**: Handles star rating elements with click-based selection
- **Selector**: `.formulate-input-element--rating-container[data-name]`
- **Use Case**: Track user rating selections and changes

## How to Use These Samples

1. **Copy the field class** you need from this folder
2. **Modify the selector** to match your HTML structure
3. **Adjust the methods** as needed:
   - `getInteractiveElement()`: Define what element users interact with
   - `isBlank()`: Define when the field is considered empty
   - `getFieldSize()`: Define how to measure field content
4. **Register your field** with FormAnalyticsCustomFieldTracker

## Example Usage

```javascript
import { FormAnalyticsCustomFieldTracker } from '@doghouse/matomo-form-analytics-custom-field-tracker';
import { SampleWysiwygField } from './sample-fields/SampleWysiwygField.js';

// Initialize with your custom field
FormAnalyticsCustomFieldTracker.init([
    { fieldType: 'wysiwyg', FieldClass: SampleWysiwygField }
], true); // Enable debug logging
```

## Field Categories

- **TEXT**: Text-based input fields (password, text, url, tel, email, search, textarea)
- **SELECTABLE**: Selection-based fields (color, date, datetime, datetime-local, month, number, range, time, week, select)
- **CHECKABLE**: Checkbox/radio fields (radio, checkbox)

## Creating Your Own Custom Field

1. Extend the `BaseField` class
2. Define required static properties:
   - `fieldType`: Unique identifier
   - `category`: Field category from `FieldCategories` enum
   - `selector`: CSS selector to find elements
3. Implement required methods:
   - `getInteractiveElement()`: Return the interactive element
   - `isBlank()`: Return true if field is empty
   - `getFieldSize()`: Return field size/content length
4. Optionally override `setupEventListeners()` for custom event handling

### Example Custom Field Implementation

```javascript
import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker';

class MyCustomField extends BaseField {
    static fieldType = 'myCustomField';
    static category = BaseField.FieldCategories.SELECTABLE;
    static selector = '.my-custom-field[data-name]';

    constructor(tracker, element, fieldName, debug = false) {
        super(tracker, element, fieldName, debug);
        this.interactiveElement = this.getInteractiveElement();
        this.clickCount = 0;
    }

    getInteractiveElement() {
        return this.element.querySelector('.interactive-part');
    }

    isBlank() {
        return this.clickCount === 0;
    }

    getFieldSize() {
        return this.clickCount;
    }

    setupEventListeners() {
        if (!this.interactiveElement) {
            if (this.debug) console.error('Interactive element not found:', this.element);
            return;
        }

        this.interactiveElement.addEventListener('click', () => {
            this.clickCount++;
            
            // Use this.debug for conditional logging
            this.debug && console.log(`⚡️ CUSTOM FIELD clicked (${this.fieldName})`);
            
            this.onFocus();
            this.onChange();
            setTimeout(() => this.onBlur(), 100);
        });
    }
}
```

## Debug Mode

Enable debug logging to see detailed information about field tracking:

```javascript
FormAnalyticsCustomFieldTracker.init(customFields, true);
```

### Debug Logging Patterns

The package supports two debug logging patterns:

#### 1. Conditional Logging with `this.debug`
Use this pattern in your custom field implementations:

```javascript
// Error logging
if (this.debug) console.error('Interactive element not found:', this.element);

// Event logging
this.debug && console.log(`⚡️ RATING decreased from ${prevRating} to ${newRating} (${this.fieldName})`);

// Complex conditional logging
if (this.debug) {
    console.log(`🎯 Processing ${fieldType} field: ${fieldName}`, field);
    console.log(`📊 Field size: ${this.getFieldSize()}`);
}
```

#### 2. Short-circuit Evaluation
For simple logging, you can use the short-circuit pattern:

```javascript
// Simple logging
this.debug && console.log(`⚡️ FIELD changed (${this.fieldName})`);

// With data
this.debug && console.log(`📊 Field data:`, fieldData);
```

### Debug Output Examples

When debug mode is enabled, you'll see output like:

```
🚀 FormAnalytics initialized, looking for forms...
📋 Found 2 forms on page: [form#contact-form, form#survey-form]
🔄 Processing form 1: <form id="contact-form">
📝 Form attributes: {data-matomo-form: "contact", id: "contact-form", name: "", class: "form"}
🎯 Tracker for form 1: FormTracker {formName: "contact", fields: Array(0)}
📊 Tracker form name: contact
✅ Injecting custom fields into form 1
🔍 Looking for rating fields with selector: .formulate-input-element--rating-container[data-name]
📊 Found 3 elements matching selector
🎯 Processing rating field: satisfaction <div class="formulate-input-element--rating-container">
✅ Integrated custom rating field: satisfaction
⚡️ RATING changed from 0 to 4 (satisfaction)
⚡️ RATING decreased from 4 to 2 (satisfaction)
```

This will show console logs for:
- Field registration
- Form detection and processing
- Field type matching and integration
- Field interactions (focus, blur, change)
- Error messages and warnings
- Custom field events