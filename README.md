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
- **Any custom interactive form elements**

## ✨ Key Features

- 🔧 **Modular Architecture** - Easy to extend with new field types
- 🎯 **Object-Oriented Design** - Clean inheritance patterns
- 📊 **Full Matomo Integration** - Compatible with FormAnalytics API
- 🚀 **Multiple Build Formats** - ESM, CommonJS, and UMD support
- 📝 **TypeScript Support** - Complete type definitions included
- 🧪 **Comprehensive Testing** - Jest test suite with coverage
- 📚 **Well Documented** - Extensive examples and API reference

## 🚀 Installation

```bash
npm install matomo-form-analytics-custom-field-tracker
```

## 📦 Usage

### ES Modules

```javascript
import FormAnalyticsCustomFieldTracker from 'matomo-form-analytics-custom-field-tracker';

// Initialize the tracker
FormAnalyticsCustomFieldTracker.init();
```

### CommonJS

```javascript
const FormAnalyticsCustomFieldTracker = require('matomo-form-analytics-custom-field-tracker');

// Initialize the tracker
FormAnalyticsCustomFieldTracker.init();
```

### Browser (UMD)

```html
<script src="https://unpkg.com/matomo-form-analytics-custom-field-tracker/dist/index.umd.js"></script>
<script>
  MatomoFormAnalyticsCustomFieldTracker.init();
</script>
```

### Advanced Usage

```javascript
import { 
  createField, 
  WysiwygField, 
  RatingField, 
  ImageSelectorField,
  FieldCategories 
} from 'matomo-form-analytics-custom-field-tracker';

// Create custom fields programmatically
const customField = createField(tracker, element, 'my-field', 'wysiwyg');
```

## 🎯 Supported Field Types

This package comes with built-in support for the following field types:

| Field Type | Description | Category | Selector |
|------------|-------------|----------|----------|
| `wysiwyg` | WYSIWYG editor fields | TEXT | `.formulate-input-element--wysiwyg[data-name]` |
| `rating` | Star rating fields | SELECTABLE | `.formulate-input-element--rating-container[data-name]` |
| `imageSelector` | Image selection fields | CHECKABLE | `.formulate-input-element--image_selection[data-name]` |

## 📁 Structure

```
FormAnalyticsCustomFieldTracker/
├── FormAnalyticsCustomFieldTracker.js  # Main integration file
├── Enums/
│   └── FieldCategories.js      # Field categories ENUM
└── CustomFields/
    ├── BaseField.js            # Abstract base class with common functionality
    ├── WysiwygField.js         # WYSIWYG editor field implementation
    ├── RatingField.js          # Star rating field implementation
    ├── ImageSelectorField.js   # Image selection field implementation
    ├── index.js                # Centralized factory and field registry
    └── README.md               # This documentation
```

## 🎯 Architecture Overview

### **BaseField (Abstract Base Class)**
The foundation of the modular architecture. Contains all common functionality:

- **Common Properties**: `timespent`, `hesitationtime`, `numChanges`, etc.
- **Common Methods**: `onFocus()`, `onBlur()`, `onChange()`, `getTimeSpent()`
- **Abstract Methods**: `isBlank()`, `getFieldSize()` (must be implemented by subclasses)
- **Helper Methods**: `trackCursorMovement()`, `trackDeletion()`

### **Field Implementations**
Each field type extends `BaseField` and implements only field-specific logic:

- **WysiwygField**: Handles contenteditable div elements
- **RatingField**: Manages star rating interactions
- **ImageSelectorField**: Tracks image selection/deselection

### **Centralized Factory Pattern**
The `index.js` file provides a single factory function that creates any field type:

```javascript
import { createField } from './CustomFields/index.js';

// Single factory function for all field types
const field = createField(tracker, element, fieldName, 'wysiwyg');
```

## 🚀 Quick Start

### 1. **Using Existing Field Types**

```javascript
import { createField } from './CustomFields/index.js';

// Create a WYSIWYG field
const wysiwygField = createField(tracker, element, 'comment-field', 'wysiwyg');

// Create a rating field
const ratingField = createField(tracker, element, 'rating-field', 'rating');

// Create an image selector field
const imageField = createField(tracker, element, 'image-field', 'imageSelector');
```

### 2. **Checking Available Types**

```javascript
import { getAvailableFieldTypes, isFieldTypeSupported } from './CustomFields/index.js';

// Get all available field types
const types = getAvailableFieldTypes(); // ['wysiwyg', 'rating', 'imageSelector']

// Check if a type is supported
if (isFieldTypeSupported('wysiwyg')) {
    // Create wysiwyg field
}
```

## 🛠️ Creating New Field Types

### **Step 1: Create Field Class**

```javascript
// CustomFields/NewFieldType.js
import { BaseField } from './BaseField.js';

/**
 * Custom Field Implementation Example
 * @class NewFieldType
 * @extends BaseField
 */
export class NewFieldType extends BaseField {
    static fieldType = 'newFieldType';
    static category = BaseField.FieldCategories.SELECTABLE;
    
    /**
     * Creates a new custom field instance
     * @param {Object} tracker - Matomo tracker instance
     * @param {HTMLElement} element - DOM element
     * @param {string} fieldName - Field identifier
     */
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        
        // Initialize field-specific properties
        this.customElement = this.getInteractiveElement();
    }

    /**
     * @inheritDoc
     */
    getInteractiveElement() {
        return this.element.querySelector('.custom-element');
    }

    /**
     * @inheritDoc
     */
    isBlank() {
        // Implement field-specific blank detection
        return this.getFieldSize() === 0;
    }

    /**
     * @inheritDoc
     */
    getFieldSize() {
        // Implement field-specific size calculation
        return this.customElement?.value?.length || 0;
    }

    /**
     * Sets up field-specific event listeners
     * Override BaseField's setupEventListeners for custom handling
     */
    setupEventListeners() {
        if (!this.customElement) {
            console.error('Custom element not found:', this.element);
            return;
        }

        // Add field-specific event listeners
        this.customElement.addEventListener('change', () => {
            console.log(`⚡️ CUSTOM FIELD changed (${this.fieldName})`);
            this.onFocus();
            this.onChange();
            setTimeout(() => this.onBlur(), 100);
        });

        // For fields that need focus/blur simulation (like rating/image selector)
        this.customElement.addEventListener('click', () => {
            console.log(`⚡️ CUSTOM FIELD clicked (${this.fieldName})`);
            this.onFocus();
            this.onChange();
            setTimeout(() => this.onBlur(), 100);
        });
    }
}
```

### **Step 2: Register Field Class**

```javascript
// CustomFields/index.js
import { WysiwygField } from './WysiwygField.js';
import { RatingField } from './RatingField.js';
import { ImageSelectorField } from './ImageSelectorField.js';
import { NewFieldType } from './NewFieldType.js';  // Import new field class

/**
 * Field Classes Registry
 * Maps field types to their corresponding classes
 */
export const fieldClasses = {
    wysiwyg: WysiwygField,
    rating: RatingField,
    imageSelector: ImageSelectorField,
    newFieldType: NewFieldType  // Add new field type
};
```

### **Step 3: Add Selector Configuration**

```javascript
// FormAnalyticsCustomFieldTracker.js
function injectCustomFields(tracker, form) {
    const customFieldTypes = {
        wysiwyg: '.formulate-input-element--wysiwyg[data-name]',
        imageSelector: '.formulate-input-element--image_selection[data-name]',
        rating: '.formulate-input-element--rating-container[data-name]',
        newFieldType: '.custom-field-container[data-name]'  // Add new selector
    };

    Object.entries(customFieldTypes).forEach(([type, selector]) => {
        const fields = form.querySelectorAll(selector);
        fields.forEach(field => {
            const fieldName = field.getAttribute('data-name');
            const customField = createField(tracker, field, fieldName, type);

            if (customField) {
                // Add to tracker
                tracker.fields.push(customField);
                tracker.fieldNodes.push(field);

                console.log(`✅ Integrated custom ${type} field: ${fieldName}`);
            }
        });
    });
}
```

## 📊 Field Categories

Fields are categorized using the `FieldCategories` ENUM for type safety:

```javascript
import { FieldCategories } from '../Enums/FieldCategories.js';

// Available categories
FieldCategories.TEXT        // 'FIELD_TEXT'
FieldCategories.SELECTABLE // 'FIELD_SELECTABLE'  
FieldCategories.CHECKABLE  // 'FIELD_CHECKABLE'

// Or access via BaseField (recommended)
BaseField.FieldCategories.TEXT        // 'FIELD_TEXT'
BaseField.FieldCategories.SELECTABLE // 'FIELD_SELECTABLE'  
BaseField.FieldCategories.CHECKABLE  // 'FIELD_CHECKABLE'
```

| Category | Description | Examples |
|----------|-------------|----------|
| `FieldCategories.TEXT` | Text-based input fields | WYSIWYG, textarea, input[type="text"] |
| `FieldCategories.SELECTABLE` | Selection-based fields | Rating, dropdown, input[type="number"] |
| `FieldCategories.CHECKABLE` | Checkbox/radio fields | Image selector, checkboxes, radio buttons |

## 🔧 Required Implementation

When extending `BaseField`, you **must** implement:

### **Static Properties (Required)**
```javascript
import { BaseField } from './BaseField.js';

export class NewFieldType extends BaseField {
    static fieldType = 'newFieldType';                           // Field type identifier
    static category = BaseField.FieldCategories.SELECTABLE;     // Use ENUM from BaseField
    
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName); // No need to pass fieldType/category
        // ... rest of constructor
    }
}
```

### **Abstract Methods (Must Implement)**

#### **`getInteractiveElement()`**
```javascript
getInteractiveElement() {
    // Return the DOM element(s) that should receive events
    // For single element: return HTMLElement
    // For multiple elements: return NodeList
    return this.element.querySelector('.interactive-element');
}
```

#### **`isBlank()`**
```javascript
isBlank() {
    // Return true if field is empty/blank
    // Return false if field has content
    // Follow Matomo's logic for your field category
}
```

#### **`getFieldSize()`**
```javascript
getFieldSize() {
    // Return field size metric:
    // - Character count for FIELD_TEXT fields
    // - -1 for FIELD_CHECKABLE fields (radio/checkbox groups)
    // - Selection count for FIELD_SELECTABLE fields
    // Follow Matomo's tracker.min.js logic
}
```

## 🎯 Inherited Methods (Available to All Fields)

These methods are automatically available to all field implementations:

### **Event Handlers**
- `onFocus()` - Handles focus events
- `onBlur()` - Handles blur events
- `onChange()` - Handles change events

### **Time Tracking**
- `getTimeSpent()` - Returns time spent in field
- `getHesitationTime()` - Returns hesitation time

### **Metrics**
- `getTrackingParams()` - Returns Matomo-compatible parameters
- `trackCursorMovement()` - Increments cursor count
- `trackDeletion()` - Increments deletion count

### **Lifecycle**
- `resetOnFormSubmit()` - Resets all counters
- `addNode(node)` - Adds DOM node to field

## 🐛 Debugging

### **Enable Debug Logging**
```javascript
// All field types include console.log statements for debugging
console.log('WYSIWYG focus:', fieldName);
console.log('Rating star clicked:', fieldName);
console.log('Image selection updated:', fieldName);
```

### **Check Field Creation**
```javascript
import { createField, isFieldTypeSupported } from './CustomFields/index.js';

// Verify field type is supported
if (!isFieldTypeSupported('myFieldType')) {
    console.error('Field type not supported');
    return;
}

// Create field and check for errors
const field = createField(tracker, element, fieldName, 'myFieldType');
if (!field) {
    console.error('Failed to create field');
    return;
}
```

### **Common Issues**

1. **Field not detected**: Check selector matches HTML structure
2. **Events not firing**: Verify `setupEventListeners()` is called
3. **Abstract method errors**: Ensure `isBlank()` and `getFieldSize()` are implemented
4. **Element not found**: Check `getElement` function in field configuration

## 📈 Performance Considerations

### **Event Listener Optimization**
- Event listeners are added only once per field
- Automatic cleanup on form submission
- Efficient DOM querying with cached selectors

### **Memory Management**
- Fields are stored in Maps for O(1) lookup
- Automatic reset on form submission
- No memory leaks from event listeners

## 🔒 Type Safety

### **JSDoc Documentation**
All methods include comprehensive JSDoc documentation:

```javascript
/**
 * Creates a new field instance
 * @param {Object} tracker - Matomo tracker instance
 * @param {HTMLElement} element - DOM element
 * @param {string} fieldName - Field identifier
 * @returns {BaseField} Field instance
 */
```

### **Error Handling**
- Graceful fallbacks for missing elements
- Clear error messages for debugging
- Null checks for all DOM operations

## 🎯 Field Type Examples

### **Text Field (WYSIWYG)**
```javascript
import { BaseField } from './BaseField.js';

export class WysiwygField extends BaseField {
    static fieldType = 'wysiwyg';
    static category = BaseField.FieldCategories.TEXT;
    
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

### **Selectable Field (Rating)**
```javascript
import { BaseField } from './BaseField.js';

export class RatingField extends BaseField {
    static fieldType = 'rating';
    static category = BaseField.FieldCategories.SELECTABLE;
    
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.stars = this.getInteractiveElement();
        this.lastRating = this.getFieldSize();
    }

    getInteractiveElement() {
        return this.element.querySelectorAll('.star-full');
    }

    isBlank() {
        return this.getFilledStars().length === 0;
    }

    getFieldSize() {
        return this.getFilledStars().length;
    }

    setupEventListeners() {
        this.stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.handleStarClick(index + 1);
            });
        });
    }

    handleStarClick(rating) {
        const prevRating = this.lastRating;
        const newRating = rating === prevRating ? 0 : rating;
        
        this.onFocus();
        this.lastRating = newRating;
        this.onChange();
        
        if (newRating < prevRating) {
            this.trackDeletion();
        }
        
        setTimeout(() => this.onBlur(), 100);
    }
}
```

### **Checkable Field (Image Selector)**
```javascript
import { BaseField } from './BaseField.js';

export class ImageSelectorField extends BaseField {
    static fieldType = 'imageSelector';
    static category = BaseField.FieldCategories.CHECKABLE;

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
        return -1; // Follow Matomo's logic for FIELD_CHECKABLE
    }

    setupEventListeners() {
        this.imageContainers.forEach((container, index) => {
            container.addEventListener('click', () => this.handleImageClick(index + 1));
        });
    }

    handleImageClick(imageIndex) {
        const prevSelectedValue = this.lastSelectedValue;
        this.onFocus();

        setTimeout(() => {
            const newSelectedValue = this.getSelectedValue();
            this.lastSelectedValue = newSelectedValue;
            this.onChange();

            if (prevSelectedValue && !newSelectedValue) {
                this.trackDeletion();
            }

            setTimeout(() => this.onBlur(), 100);
        }, 50);
    }
}
```

## 🤝 Contributing

### **Adding New Field Types**

1. **Create field class** extending `BaseField`
2. **Implement abstract methods**: `getInteractiveElement()`, `isBlank()`, `getFieldSize()`
3. **Override `setupEventListeners()`** if needed for custom event handling
4. **Register in `fieldClasses`** object in `index.js`
5. **Add selector configuration** in `FormAnalyticsCustomFieldTracker.js`
6. **Test thoroughly** with debug logging

### **Code Standards**

- Use JSDoc for all methods with `@inheritDoc` for overridden methods
- Follow Matomo's tracker.min.js logic for field categories
- Implement proper error handling with console.error
- Include debug logging with `⚡️` prefix
- Test with multiple field instances and edge cases

## 🛠️ Development

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/matomo-form-analytics-custom-field-tracker.git
cd matomo-form-analytics-custom-field-tracker

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Clean build directory
npm run clean
```

## 📊 API Reference

### Main Exports

- `FormAnalyticsCustomFieldTracker` - Main tracker initialization
- `createField(tracker, element, fieldName, fieldType)` - Factory function for creating fields
- `BaseField` - Abstract base class for extending
- `WysiwygField`, `RatingField`, `ImageSelectorField` - Built-in field implementations
- `FieldCategories` - Field category enum

### Field Categories

- `FieldCategories.TEXT` - Text-based input fields
- `FieldCategories.SELECTABLE` - Selection-based fields  
- `FieldCategories.CHECKABLE` - Checkbox/radio fields

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 **Report Issues**
- Found a bug? [Open an issue](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/issues)
- Include steps to reproduce and expected vs actual behavior
- Check existing issues first to avoid duplicates

### 💡 **Request Features**
- Have an idea for a new field type? [Create a feature request](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/issues)
- Describe the use case and how it would benefit users

### 🔧 **Submit Code**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run the test suite (`npm test`)
5. Ensure code quality (`npm run lint`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### 📋 **Development Guidelines**
- Follow the existing code style (ESLint configuration included)
- Add tests for new functionality
- Update documentation for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This module extends Matomo FormAnalytics functionality. Ensure compliance with your Matomo license and local privacy regulations.

## 🔗 Links

- [Matomo FormAnalytics Documentation](https://matomo.org/docs/form-analytics/)
- [npm Package](https://www.npmjs.com/package/matomo-form-analytics-custom-field-tracker)
- [GitHub Repository](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker)
- [GitHub Releases](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/releases)

## 📊 Project Status

[![GitHub last commit](https://img.shields.io/github/last-commit/DoghouseMedia/matomo-form-analytics-custom-field-tracker.svg)](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/commits/main)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/DoghouseMedia/matomo-form-analytics-custom-field-tracker.svg)](https://github.com/DoghouseMedia/matomo-form-analytics-custom-field-tracker/commits/main)
[![npm downloads](https://img.shields.io/npm/dm/matomo-form-analytics-custom-field-tracker.svg)](https://www.npmjs.com/package/matomo-form-analytics-custom-field-tracker)

---

**Built with ❤️ using modular design and object-oriented patterns**
