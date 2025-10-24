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
    
    this.h2Element.addEventListener('click', () => {
      this.onFocus();
      this.clickCount++;
      this.onChange();
      setTimeout(() => this.onBlur(), 100);
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

#### Debug Logging

When implementing custom logic, use conditional debug logging:

```javascript
setupEventListeners() {
  if (!this.h2Element) {
    this.debug && console.log('H2 element not found');
    return;
  }
  
  this.h2Element.addEventListener('click', () => {
    this.debug && console.log(`H2 clicked: ${this.fieldName}`);
    this.onFocus();
    this.clickCount++;
    this.onChange();
    setTimeout(() => this.onBlur(), 100);
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

## 📁 Project Structure

```
src/
├── BaseField.js                    # Base class for custom fields
├── FormAnalyticsCustomFieldTracker.js  # Main tracker with field management
├── Enums/
│   └── FieldCategories.js         # Field category definitions
├── samples/                       # Example implementations
│   ├── SampleWysiwygField.js
│   ├── SampleButtonClickField.js
│   ├── SampleRatingField.js
│   ├── index.js
│   └── README.md
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

The package includes sample implementations in the `samples/` folder:

### SampleWysiwygField
- **Category**: TEXT
- **Purpose**: Handles rich text editing with ProseMirror editor
- **Selector**: `.formulate-input-element--wysiwyg[data-name]`

### SampleButtonClickField
- **Category**: SELECTABLE
- **Purpose**: Tracks button clicks and counts them as field interactions
- **Selector**: `.custom-button[data-name]`

### SampleRatingField
- **Category**: SELECTABLE
- **Purpose**: Handles star rating elements with click-based selection
- **Selector**: `.formulate-input-element--rating-container[data-name]`

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

- 📧 Email: support@doghousemedia.com
- 🐛 Issues: [GitHub Issues](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/wiki)

---

**Made with ❤️ by [Doghouse Agency](https://doghouse.agency/)**