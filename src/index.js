/**
 * Matomo Form Analytics Custom Field Tracker
 *
 * A modular, object-oriented system for creating custom field trackers
 * that integrate with Matomo FormAnalytics.
 *
 * @module matomo-form-analytics-custom-field-tracker
 */

// Main tracker integration
export { default } from './FormAnalyticsCustomFieldTracker.js';
// Base field class for extending (for developers who want to create custom fields)
export { BaseField } from './BaseField.js';
// Field categories enum (The field category that is supported by Matomo's FormAnalytics)
export {
    FieldCategories,
    isValidFieldCategory,
    getSupportedFieldCategories,
    getFieldCategoryDescription
} from './Enums/FieldCategories.js';
