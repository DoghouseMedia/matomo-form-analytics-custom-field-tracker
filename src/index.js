/**
 * Matomo Form Analytics Custom Field Tracker
 * 
 * A modular, object-oriented system for creating custom field trackers
 * that integrate with Matomo FormAnalytics.
 * 
 * @module matomo-form-analytics-custom-field-tracker
 */

// Main tracker integration
export { default as FormAnalyticsCustomFieldTracker } from './FormAnalyticsCustomFieldTracker.js';

// Field classes and factory
export {
    createField,
    getAvailableFieldTypes,
    isFieldTypeSupported,
    fieldClasses
} from './CustomFields/index.js';

// Base field class for extending
export { BaseField } from './CustomFields/BaseField.js';

// Specific field implementations
export { WysiwygField } from './CustomFields/WysiwygField.js';
export { RatingField } from './CustomFields/RatingField.js';
export { ImageSelectorField } from './CustomFields/ImageSelectorField.js';

// Field categories enum
export {
    FieldCategories,
    isValidFieldCategory,
    getSupportedFieldCategories,
    getFieldCategoryDescription
} from './Enums/FieldCategories.js';

// Default export for easy initialization
export { default } from './FormAnalyticsCustomFieldTracker.js';
