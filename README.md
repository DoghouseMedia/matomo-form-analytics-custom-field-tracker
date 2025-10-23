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
npm install matomo-form-analytics-custom-field-tracker
```

## 📦 Usage

### Basic Usage

```javascript
import FormAnalyticsCustomFieldTracker from 'matomo-form-analytics-custom-field-tracker';

// Initialize the tracker
FormAnalyticsCustomFieldTracker.init();
```

### With Custom Fields

```javascript
import { 
  FormAnalyticsCustomFieldTracker,
  BaseField,
  FieldCategories 
} from 'matomo-form-analytics-custom-field-tracker';

// Define your custom field
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

// Initialize with custom fields and debug enabled
FormAnalyticsCustomFieldTracker.init([
  { fieldType: 'h2Click', FieldClass: H2ClickField }
], true); // Enable debug logging
```

### Debug Mode

Enable debug logging to see detailed information about field tracking:

```javascript
// Enable debug logging
FormAnalyticsCustomFieldTracker.init(customFields, true);

// Disable debug logging (default)
FormAnalyticsCustomFieldTracker.init(customFields, false);
```

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

## 🛠️ Creating Custom Field Types

### Step 1: Create Your Field Class

```javascript
import { BaseField } from 'matomo-form-analytics-custom-field-tracker';

class MyCustomField extends BaseField {
  static fieldType = 'myCustomField';
  static category = BaseField.FieldCategories.SELECTABLE;
  static selector = '.my-custom-field[data-name]';
  
  constructor(tracker, element, fieldName, debug = false) {
    super(tracker, element, fieldName, debug);
    this.interactiveElement = this.getInteractiveElement();
  }
  
  getInteractiveElement() {
    return this.element.querySelector('.interactive-part');
  }
  
  isBlank() {
    return !this.interactiveElement?.value;
  }
  
  getFieldSize() {
    return this.interactiveElement?.value?.length || 0;
  }
  
  setupEventListeners() {
    if (!this.interactiveElement) {
      if (this.debug) console.error('Interactive element not found');
      return;
    }
    
    this.interactiveElement.addEventListener('change', () => {
      this.onFocus();
      this.onChange();
      setTimeout(() => this.onBlur(), 100);
    });
  }
}
```

### Step 2: Register Your Field

```javascript
import FormAnalyticsCustomFieldTracker from 'matomo-form-analytics-custom-field-tracker';
import { MyCustomField } from './MyCustomField.js';

// Register and initialize
FormAnalyticsCustomFieldTracker.init([
  { fieldType: 'myCustomField', FieldClass: MyCustomField }
], true); // Enable debug logging
```

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

## 🔧 API Reference

### FormAnalyticsCustomFieldTracker

#### `init(customFields, debug)`
Initializes the tracker with custom field types.

**Parameters:**
- `customFields` (Array): Array of field definitions `[{ fieldType: 'string', FieldClass: Class }]`
- `debug` (Boolean): Enable debug logging (default: `false`)

#### `getAvailableFieldTypes()`
Returns an array of registered field types.

#### `isFieldTypeSupported(fieldType)`
Checks if a field type is supported.

### BaseField

#### Constructor
```javascript
constructor(tracker, element, fieldName, debug = false)
```

#### Required Static Properties
- `fieldType`: Unique identifier for the field type
- `category`: Field category from `FieldCategories` enum
- `selector`: CSS selector to find elements

#### Required Methods
- `getInteractiveElement()`: Return the interactive element
- `isBlank()`: Return true if field is empty
- `getFieldSize()`: Return field size/content length

#### Optional Methods
- `setupEventListeners()`: Override for custom event handling

## 🚀 Build Formats

### ES Modules
```javascript
import FormAnalyticsCustomFieldTracker from 'matomo-form-analytics-custom-field-tracker';
```

### CommonJS
```javascript
const FormAnalyticsCustomFieldTracker = require('matomo-form-analytics-custom-field-tracker');
```

### Browser (UMD)
```html
<script src="https://unpkg.com/matomo-form-analytics-custom-field-tracker/dist/index.umd.js"></script>
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

**Made with ❤️ by [Doghouse Media](https://doghousemedia.com)**