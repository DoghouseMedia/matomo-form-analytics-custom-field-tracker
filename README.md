# Matomo Form Analytics Custom Field Tracker

[![npm version](https://badge.fury.io/js/matomo-form-analytics-custom-field-tracker.svg)](https://badge.fury.io/js/matomo-form-analytics-custom-field-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/DoghouseMedia/matomo-form-analytics-custom-field-tracker.svg)](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/DoghouseMedia/matomo-form-analytics-custom-field-tracker.svg)](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/issues)

A modular, object-oriented npm package for creating custom field trackers that integrate with Matomo FormAnalytics. Built with **inheritance patterns** and **centralized factory design**.

## 🎯 What This Package Does

This package extends Matomo FormAnalytics to track custom form fields that aren't natively supported, such as:
- **WYSIWYG editors** (ProseMirror, TinyMCE, etc.)
- **Star rating systems**
- **Image selection interfaces**
- **Custom buttons and interactive elements**
- **Any custom interactive form elements**

## ✨ Key Features

- 🔧 **Modular Architecture** - Easy to extend with new field types
- 🎯 **Object-Oriented Design** - Clean inheritance patterns
- 📊 **Full Matomo Integration** - Compatible with FormAnalytics API
- 🚀 **Multiple Build Formats** - ESM, CommonJS, and UMD support
- 📝 **TypeScript Support** - Complete type definitions included
- 🧪 **Comprehensive Testing** - Jest test suite with coverage
- 📚 **Well Documented** - Extensive examples and API reference
- 🐛 **Debug Support** - Built-in debug logging for development
- 📦 **Sample Implementations** - Reference examples for common field types
- 🧹 **Automatic Cleanup** - Memory leak prevention with tracked event listeners and timers
- 🔄 **Dynamic Field Detection** - Automatic support for conditional fields and paginated forms

## 🚀 Installation

```bash
npm install @doghouse/matomo-form-analytics-custom-field-tracker
```

## 📦 Usage

### Creating Custom Fields

To track custom form fields, you need to create a field class that extends `BaseField`. Here's how:

#### 1. Create Your Custom Field Class

Create a new file for your custom field (e.g., `MyCustomField.js`):

```javascript
import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker';

export class H2ClickField extends BaseField {
  static fieldType = 'h2Click';
  static category = BaseField.BaseField.FieldCategories.SELECTABLE;
  static selector = '.survey-full__intro[data-name]';
  
  constructor(tracker, element, fieldName) {
    super(tracker, element, fieldName);
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
    
    this._addTrackedEventListener(this.h2Element, 'click', () => {
      this.onFocus();
      this.clickCount++;
      this.onChange();
      this._trackTimer(setTimeout(() => this.onBlur(), 100));
    });
  }
}
```

#### Required Static Properties

Every custom field **must** define these three static properties:

```javascript
export class H2ClickField extends BaseField {
  static fieldType = 'h2Click';                    // Unique identifier
  static category = BaseField.FieldCategories.SELECTABLE;  // Field category
  static selector = '.survey-full__intro[data-name]';       // CSS selector
  // ... rest of implementation
}
```

**Property explanations:**
- **`static fieldType`** - Unique identifier for your field type (e.g., `'h2Click'`, `'rating'`, `'wysiwyg'`). Used internally to identify and register your field type. Must be unique across all your custom fields.
- **`static category`** - Field category from `BaseField.FieldCategories` enum (`TEXT`, `SELECTABLE`, or `CHECKABLE`). Tells Matomo how to categorize this field for analytics. Choose from `TEXT` (text input), `SELECTABLE` (dropdowns, ratings), or `CHECKABLE` (checkboxes, image selectors).
- **`static selector`** - CSS selector to find elements on the page (e.g., `'.survey-full__intro[data-name]'`). CSS selector that finds the DOM elements this field should track. Should target elements with `data-name` attributes for proper field identification.

#### Required Overrides

Every custom field **must** implement these three abstract methods:

- **`getInteractiveElement()`** - Returns the DOM element that users interact with. This is the actual clickable/typeable element inside your field container. For example, in a WYSIWYG editor, this would be the contenteditable div, not the outer wrapper.
- **`isBlank()`** - Determines if the field is empty/unused. Returns `true` if the field has no content or user input. Used by Matomo to track completion rates and identify abandoned fields.
- **`getFieldSize()`** - Returns the field's content size/value. This could be character count for text fields, number of selected items for multi-selects, or rating value for star ratings. Used by Matomo to analyze field complexity and user engagement.

#### Optional Overrides

- **`setupEventListeners()`** - Override this when you need custom event handling beyond the default focus/blur/change events

#### Memory Management & Cleanup

The BaseField class includes automatic memory leak prevention through tracked event listeners, timers, and MutationObservers:

- **`_addTrackedEventListener(element, event, handler, options)`** - Use this instead of `addEventListener()` to automatically track listeners for cleanup
- **`_trackTimer(timerId)`** - Use this to wrap `setTimeout()` or `setInterval()` calls for automatic cleanup
- **`_trackMutationObserver(observer)`** - Use this to track `MutationObserver` instances for automatic cleanup
- **`_setupTrackedMutationObserver(callback, observeOptions, targetElement)`** - Convenient helper to create, track, and observe with a MutationObserver (handles disconnecting existing observer if called multiple times)
- **`destroy()`** - Automatically removes all tracked event listeners, clears all timers, and disconnects all MutationObservers

**Example with proper cleanup:**
```javascript
setupEventListeners() {
  if (!this.h2Element) return;
  
  // Use tracked event listener (automatically cleaned up)
  this._addTrackedEventListener(this.h2Element, 'click', () => {
    this.onFocus();
    this.clickCount++;
    this.onChange();
    // Use tracked timer (automatically cleaned up)
    this._trackTimer(setTimeout(() => this.onBlur(), 100));
  });
}

setupMutationObserver() {
  const container = this.element.querySelector('.container');
  if (!container) return;
  
  // Option 1: Use _setupTrackedMutationObserver helper (recommended for single observer)
  this._setupTrackedMutationObserver(
    () => this.checkStateChanges(),
    {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    },
    container
  );
  
  // Option 2: Manual setup with _trackMutationObserver (for multiple observers)
  // const observer = this._trackMutationObserver(new MutationObserver(() => {
  //   this.checkStateChanges();
  // }));
  // observer.observe(container, { attributes: true, childList: true, subtree: true });
}
```

**Benefits:**
- ✅ Automatic cleanup prevents memory leaks
- ✅ Idempotent (safe to call `destroy()` multiple times)
- ✅ No orphaned event listeners, timers, or MutationObservers
- ✅ Consistent cleanup pattern across all field types

#### Debug Logging

When implementing custom logic, use conditional debug logging:

```javascript
setupEventListeners() {
  if (!this.h2Element) {
    this.debug && console.log('H2 element not found');
    return;
  }
  
  this._addTrackedEventListener(this.h2Element, 'click', () => {
    this.debug && console.log(`H2 clicked: ${this.fieldName}`);
    this.onFocus();
    this.clickCount++;
    this.onChange();
    this._trackTimer(setTimeout(() => this.onBlur(), 100));
  });
}
```

**Important:** Always use `this.debug && console.log(...)` for debug output to respect the global debug setting.

#### 2. Initialize the Tracker

After creating your custom field classes, initialize the tracker:

```javascript
import FormAnalyticsCustomFieldTracker from '@doghouse/matomo-form-analytics-custom-field-tracker';
import { H2ClickField } from './SampleCustom/H2ClickField.js';
import { RatingField } from './SampleCustom/RatingField.js';
import { WysiwygField } from './SampleCustom/WysiwygField.js';
import { ImageSelectorField } from './SampleCustom/ImageSelectorField.js';

// Initialize custom field tracking for unsupported field types
FormAnalyticsCustomFieldTracker.init([
    { fieldType: 'h2Click', FieldClass: H2ClickField },
    { fieldType: 'rating', FieldClass: RatingField },
    { fieldType: 'wysiwyg', FieldClass: WysiwygField },
    { fieldType: 'imageSelector', FieldClass: ImageSelectorField },
], true); // Enable debug logging
```

### Debug Mode

Enable debug logging to see detailed information about field tracking. Debug mode is controlled globally and affects all field instances:

```javascript
// Enable debug logging
FormAnalyticsCustomFieldTracker.init(customFields, true);

// Disable debug logging (default)
FormAnalyticsCustomFieldTracker.init(customFields, false);
```

When debug mode is enabled, you'll see console messages like:
- `✅ Integrated custom rating field: cmF0aW5nOjIwMjUtMTAtMjBUMDE6MzA6MzUuOTUzWg==`
- `⚡️ WYSIWYG focus (wysiwyg-field)`
- `⚡️ RATING changed from 3 to 4 (rating-field)`
- `⚡️ BUTTON click (button-field)`

Debug output includes:
- Form detection and processing
- Field type matching and integration
- User interactions (focus, blur, change)
- Error messages and warnings

### Conditional Fields & Paginated Forms

The tracker automatically supports **conditional fields** and **paginated forms** through dynamic field detection.

#### Conditional Fields

**Conditional fields** are hidden fields that appear dynamically based on another field's value. For example, if a user selects "Yes" to a question, additional fields may appear that weren't visible initially.

The tracker uses a `MutationObserver` to automatically detect when new fields are added to the form and integrates them seamlessly:

```javascript
// Example: A conditional field appears when user selects an option
// The tracker automatically detects and starts tracking it
FormAnalyticsCustomFieldTracker.init([
    { fieldType: 'rating', FieldClass: RatingField },
    { fieldType: 'wysiwyg', FieldClass: WysiwygField },
], true);

// When a conditional field appears (e.g., after selecting "Yes"),
// it's automatically detected and tracked without any additional code
```

**How it works:**
- The tracker monitors the form for DOM changes
- When new fields matching your custom field selectors are added, they're automatically detected
- Both native Matomo fields and custom fields are re-scanned
- Fields are only tracked once (duplicate detection prevents double-tracking)

#### Paginated Forms

**Paginated forms** are multi-step forms where fields are added to the DOM as users navigate through pages. The tracker handles this automatically:

```javascript
// Works seamlessly with multi-step/paginated forms
FormAnalyticsCustomFieldTracker.init([
    { fieldType: 'rating', FieldClass: RatingField },
    { fieldType: 'wysiwyg', FieldClass: WysiwygField },
], true);

// As users navigate to page 2, 3, etc., new fields are automatically detected
```

**Features:**
- ✅ Automatic detection of fields added on new pages
- ✅ Debounced re-scanning (300ms) to handle rapid changes efficiently
- ✅ Works with both native Matomo fields and custom fields
- ✅ No additional configuration needed

**Debug output for dynamic fields:**
When debug mode is enabled, you'll see messages like:
- `📄 New fields detected (pagination/conditional), re-scanning...`
- `🔄 Re-scanned native tracker for new fields`
- `👀 Set up dynamic field observer for pagination/conditional fields`
- `✅ Integrated custom rating field: field-name` (for newly detected fields)

**Technical details:**
- Uses `MutationObserver` API to watch for DOM changes
- Observes the entire form subtree for added nodes
- Detects standard form fields (`input`, `select`, `textarea`) and custom field containers
- Debounces re-scanning to optimize performance
- Prevents duplicate tracking by checking if fields are already tracked

## 📁 Project Structure

```
src/
├── BaseField.js                    # Base class for custom fields
├── FormAnalyticsCustomFieldTracker.js  # Main tracker with field management
├── Enums/
│   └── FieldCategories.js         # Field category definitions
├── examples/                      # Example implementations
│   ├── SampleWysiwygField.js
│   ├── SampleButtonClickField.js
│   ├── SampleRatingField.js
│   └── index.js
└── index.js                       # Main exports
```

## 🎯 Field Categories

Matomo FormAnalytics supports three field categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **TEXT** | Text-based input fields | `password`, `text`, `url`, `tel`, `email`, `search`, `textarea` |
| **SELECTABLE** | Selection-based fields | `color`, `date`, `datetime`, `datetime-local`, `month`, `number`, `range`, `time`, `week`, `select` |
| **CHECKABLE** | Checkbox/radio fields | `radio`, `checkbox` |

## 📚 Sample Implementations

The package includes sample implementations in the `examples/` folder that demonstrate proper usage of the cleanup functionality:

### SampleWysiwygField
- **Category**: TEXT
- **Purpose**: Handles rich text editing with ProseMirror editor
- **Selector**: `.formulate-input-element--wysiwyg[data-name]`
- **Cleanup**: Uses default BaseField event listeners (automatically tracked)

### SampleButtonClickField
- **Category**: SELECTABLE
- **Purpose**: Tracks button clicks and counts them as field interactions
- **Selector**: `.custom-button[data-name]`
- **Cleanup**: Uses `_addTrackedEventListener()` and `_trackTimer()` for proper cleanup

### SampleRatingField
- **Category**: SELECTABLE
- **Purpose**: Handles star rating elements with click-based selection
- **Selector**: `.formulate-input-element--rating-container[data-name]`
- **Cleanup**: Uses `_addTrackedEventListener()` and `_trackTimer()` for proper cleanup

All sample implementations now include proper memory management and cleanup patterns that prevent memory leaks.

## 🚀 Build Formats

### ES Modules
```javascript
import FormAnalyticsCustomFieldTracker from '@doghouse/matomo-form-analytics-custom-field-tracker';
```

### CommonJS
```javascript
const FormAnalyticsCustomFieldTracker = require('@doghouse/matomo-form-analytics-custom-field-tracker');
```

### Browser (UMD)
```html
<script src="https://unpkg.com/@doghouse/matomo-form-analytics-custom-field-tracker/dist/index.umd.js"></script>
<script>
  MatomoFormAnalyticsCustomFieldTracker.init();
</script>
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Building

```bash
# Build all formats
npm run build

# Build specific format
npm run build:esm
npm run build:cjs
npm run build:umd
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Matomo FormAnalytics integration
- Inspired by modern JavaScript patterns and best practices
- Community feedback and contributions

## 📞 Support

- 📧 Email: support@doghouse.agency 
- 🐛 Issues: [GitHub Issues](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/wiki)

---

**Made with ❤️ by [Doghouse Agency](https://doghouse.agency/)**