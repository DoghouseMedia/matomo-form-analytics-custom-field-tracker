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

// Base field class for extending (for developers who want to create custom fields)
export { BaseField } from './CustomFields/BaseField.js';

// Field categories enum (for developers who want to create custom fields)
export {
    FieldCategories,
    isValidFieldCategory,
    getSupportedFieldCategories,
    getFieldCategoryDescription
} from './Enums/FieldCategories.js';

// Default export for easy initialization
export { default } from './FormAnalyticsCustomFieldTracker.js';
