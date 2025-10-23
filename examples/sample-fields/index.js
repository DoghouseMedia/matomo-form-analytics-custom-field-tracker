/**
 * Sample Custom Field Implementations
 * 
 * This folder contains example implementations of custom fields for Matomo FormAnalytics.
 * These are provided as reference implementations to help developers understand
 * how to create their own custom field types.
 * 
 * Each sample demonstrates different field categories and interaction patterns:
 * 
 * - SampleWysiwygField: TEXT category - handles rich text editing
 * - SampleButtonClickField: SELECTABLE category - tracks button clicks
 * - SampleRatingField: SELECTABLE category - handles star ratings
 * 
 * To use these samples in your project:
 * 
 * 1. Copy the field class you need
 * 2. Modify the selector to match your HTML structure
 * 3. Adjust the getInteractiveElement(), isBlank(), and getFieldSize() methods as needed
 * 4. Register your field with FormAnalyticsCustomFieldTracker.init()
 * 
 * Example usage:
 * 
 * ```javascript
 * import { FormAnalyticsCustomFieldTracker } from '@your-package/matomo-form-analytics-custom-field-tracker';
 * import { SampleWysiwygField } from './samples/SampleWysiwygField.js';
 * 
 * FormAnalyticsCustomFieldTracker.init([
 *     { fieldType: 'wysiwyg', FieldClass: SampleWysiwygField }
 * ], true); // Enable debug logging
 * ```
 */

export { SampleWysiwygField } from './SampleWysiwygField.js';
export { SampleButtonClickField } from './SampleButtonClickField.js';
export { SampleRatingField } from './SampleRatingField.js';
