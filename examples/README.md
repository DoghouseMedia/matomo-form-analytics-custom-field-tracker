# Examples

This folder contains practical examples of how to use the Matomo Form Analytics Custom Field Tracker.

## Available Examples

### Simple Usage (`simple-usage.js`)
A basic example showing how to:
- Import the necessary components
- Create a custom field class
- Initialize the tracker with custom fields
- Enable debug logging

### Sample Field Implementations (`sample-fields/`)
Reference implementations of common field types that you can copy and modify:

- **`SampleWysiwygField.js`** - WYSIWYG editor tracking
- **`SampleRatingField.js`** - Star rating system tracking  
- **`SampleButtonClickField.js`** - Button click tracking
- **`SampleImageSelectorField.js`** - Image selection tracking

These samples show best practices for:
- Field class structure
- Event handling patterns
- Debug logging usage
- Matomo integration

## Running Examples

To run any example:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the package:**
   ```bash
   npm run build
   ```

3. **Run the example:**
   ```bash
   node examples/simple-usage.js
   ```

## Creating Your Own Examples

When creating new examples:

1. **Follow the naming convention:** `kebab-case.js`
2. **Include comprehensive comments** explaining each step
3. **Use realistic field types** that developers might actually need
4. **Include both debug and non-debug examples**
5. **Update this README** to document your example

## Example Structure

```javascript
import { 
  FormAnalyticsCustomFieldTracker,
  BaseField,
  FieldCategories 
} from '@doghouse/matomo-form-analytics-custom-field-tracker';

// Define your custom field
class MyCustomField extends BaseField {
  static fieldType = 'myField';
  static category = FieldCategories.SELECTABLE;
  static selector = '.my-field[data-name]';
  
  constructor(tracker, element, fieldName, debug = false) {
    super(tracker, element, fieldName, debug);
    // Your field-specific initialization
  }
  
  // Implement required methods...
}

// Initialize the tracker
FormAnalyticsCustomFieldTracker.init([
  { fieldType: 'myField', FieldClass: MyCustomField }
], true); // Enable debug logging
```
