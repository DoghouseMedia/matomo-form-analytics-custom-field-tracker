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

- **`static fieldType`** - Unique identifier for your field type (e.g., `'h2Click'`, `'rating'`, `'wysiwyg'`)
- **`static category`** - Field category from `BaseField.FieldCategories` enum (`TEXT`, `SELECTABLE`, or `CHECKABLE`)
- **`static selector`** - CSS selector to find elements on the page (e.g., `'.survey-full__intro[data-name]'`)

```javascript
export class H2ClickField extends BaseField {
  static fieldType = 'h2Click';                    // Unique identifier
  static category = BaseField.FieldCategories.SELECTABLE;  // Field category
  static selector = '.survey-full__intro[data-name]';       // CSS selector
  // ... rest of implementation
}
```

**Explanation of each property:**
- **`fieldType`**: Used internally to identify and register your field type. Must be unique across all your custom fields.
- **`category`**: Tells Matomo how to categorize this field for analytics. Choose from `TEXT` (text input), `SELECTABLE` (dropdowns, ratings), or `CHECKABLE` (checkboxes, image selectors).
- **`selector`**: CSS selector that finds the DOM elements this field should track. Should target elements with `data-name` attributes for proper field identification.

#### Required Overrides

Every custom field **must** implement these three abstract methods:

- **`getInteractiveElement()`** - Returns the DOM element that users interact with
- **`isBlank()`** - Determines if the field is empty/unused
- **`getFieldSize()`** - Returns the field's content size/value

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

```javascript
import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker';

export class RatingField extends BaseField {
  static fieldType = 'rating';
  static category = BaseField.FieldCategories.SELECTABLE;
  static selector = '.formulate-input-element--rating-container[data-name]';
  
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
    this.stars = this.getInteractiveElement();
    this.lastRating = this.getFieldSize();
    }

    getInteractiveElement() {
    return this.element.querySelectorAll('.star-full');
    }

    isBlank() {
    const filledStars = this.element.querySelectorAll('.star-full .icon-full');
    return filledStars.length === 0;
    }

    getFieldSize() {
    const filledStars = this.element.querySelectorAll('.star-full .icon-full');
    return filledStars.length;
    }

    setupEventListeners() {
    if (this.stars.length === 0) {
      this.debug && console.error('Rating stars not found:', this.element);
            return;
        }

    this.stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        this.handleStarClick(index + 1);
        });
    });
}
  
  handleStarClick(rating) {
    const prevRating = this.lastRating;
    const newRating = rating === prevRating ? 0 : rating;

    this.debug && console.log(`⚡️ RATING changed from ${prevRating} to ${newRating} (${this.fieldName})`);
    
    this.onFocus();
    this.lastRating = newRating;
    this.onChange();

    if (newRating < prevRating) {
      this.trackDeletion();
      this.debug && console.log(`⚡️ RATING decreased from ${prevRating} to ${newRating} (${this.fieldName})`);
    }

    setTimeout(() => this.onBlur(), 100);
  }
}
```

```javascript
import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker';

export class WysiwygField extends BaseField {
    static fieldType = 'wysiwyg';
  static category = BaseField.FieldCategories.TEXT;
  static selector = '.formulate-input-element--wysiwyg[data-name]';
    
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.editor = this.getInteractiveElement();
    }

    getInteractiveElement() {
        return this.element.querySelector('.ProseMirror[contenteditable="true"]');
    }

    isBlank() {
        if (!this.editor) return true;
        const content = this.editor.innerText || this.editor.textContent || '';
        return content.trim().length === 0;
    }

    getFieldSize() {
        if (!this.editor) return 0;
        const content = this.editor.innerText || this.editor.textContent || '';
        return content.length;
    }
}
```

```javascript
import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker';

export class ImageSelectorField extends BaseField {
    static fieldType = 'imageSelector';
  static category = BaseField.FieldCategories.CHECKABLE;
  static selector = '.formulate-input-element--image_selection[data-name]';

    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.imageContainers = this.getInteractiveElement();
        this.lastSelectedValue = this.getSelectedValue();
    }

    getInteractiveElement() {
        return this.element.querySelectorAll('.engage-image-selector--container');
    }

    isBlank() {
        return this.getSelectedImages().length === 0;
    }

    getFieldSize() {
    return -1; // FIELD_CHECKABLE fields return -1
  }

  getSelectedImages() {
    return this.element.querySelectorAll('.engage-image-selector--container.selected');
  }

  getSelectedValue() {
    const selected = this.element.querySelector('.engage-image-selector--container.selected');
    if (!selected) return null;
    const radio = selected.querySelector('input[type="radio"]');
    return radio?.value || null;
    }

    setupEventListeners() {
    if (!this.imageContainers.length) {
      if (this.debug) console.error('Image containers not found:', this.element);
      return;
    }

        this.imageContainers.forEach((container, index) => {
            container.addEventListener('click', () => this.handleImageClick(index + 1));
        });
    }

  handleImageClick(_imageIndex) {
        const prevSelectedValue = this.lastSelectedValue;
        this.onFocus();

        setTimeout(() => {
            const newSelectedValue = this.getSelectedValue();
      this.debug && console.log(`⚡️ IMAGE SELECTOR changed from "${prevSelectedValue}" to "${newSelectedValue}" (${this.fieldName})`);

            this.lastSelectedValue = newSelectedValue;
            this.onChange();

            if (prevSelectedValue && !newSelectedValue) {
                this.trackDeletion();
        this.debug && console.log(`⚡️ IMAGE SELECTOR deselected (${this.fieldName})`);
            }

            setTimeout(() => this.onBlur(), 100);
        }, 50);
    }
}
```

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
- `🔧 FormAnalyticsCustomFieldTracker initialized with debug: true`
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

## 🛠️ Creating Custom Field Types

### Step 1: Create Your Field Class

```javascript
import { BaseField } from '@doghouse/matomo-form-analytics-custom-field-tracker';

class MyCustomField extends BaseField {
  static fieldType = 'myCustomField';
  static category = BaseField.BaseField.FieldCategories.SELECTABLE;
  static selector = '.my-custom-field[data-name]';
  
  constructor(tracker, element, fieldName) {
    super(tracker, element, fieldName);
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
import FormAnalyticsCustomFieldTracker from '@doghouse/matomo-form-analytics-custom-field-tracker';
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
constructor(tracker, element, fieldName)
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

**Made with ❤️ by [Doghouse Media](https://doghousemedia.com)**