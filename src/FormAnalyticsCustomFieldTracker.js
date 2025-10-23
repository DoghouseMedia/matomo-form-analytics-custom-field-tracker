/**
 * Field Classes Registry
 * Maps field types to their corresponding classes
 */
const fieldClasses = {};
let debugMode = false;

/**
 * Factory function for creating fields of any type
 * Uses the factory pattern to create field instances based on type
 *
 * @param {Object} tracker - Matomo tracker instance
 * @param {HTMLElement} element - DOM element
 * @param {string} fieldName - Field identifier
 * @param {string} fieldType - Type of field to create
 * @returns {BaseField|null} Created field instance or null if type not found
 * @throws {Error} If field creation fails
 */
function createField(tracker, element, fieldName, fieldType) {
    const FieldClass = fieldClasses[fieldType];
    if (!FieldClass) {
        debugMode && console.error(`No field class found for type: ${fieldType}`);
        return null;
    }

    try {
        // Verify the fieldType matches the class's static property
        if (FieldClass.fieldType !== fieldType) {
            debugMode && console.error(`Field type mismatch: expected ${fieldType}, got ${FieldClass.fieldType}`);
            return null;
        }

        const field = new FieldClass(tracker, element, fieldName, debugMode);
        field.setupEventListeners();
        return field;
    } catch (error) {
        debugMode && console.error(`Error creating ${fieldType} field:`, error);
        return null;
    }
}

function injectCustomFields(tracker, form) {
    // Dynamically get field types and their selectors from registered field classes
    Object.entries(fieldClasses).forEach(([fieldType, FieldClass]) => {
        // Check if the field class has a selector defined

        if (FieldClass.selector) {
            const fields = form.querySelectorAll(FieldClass.selector);
            fields.forEach(field => {
                const fieldName = field.getAttribute('data-name');
                const customField = createField(tracker, field, fieldName, fieldType);

                if (customField) {
                    // Add to tracker
                    tracker.fields.push(customField);
                    tracker.fieldNodes.push(field);

                    debugMode && console.log(`✅ Integrated custom ${fieldType} field: ${fieldName}`);
                }
            });
        }
    });
}

export default {
    init(customFields = [], debug = false) {
        // (function () {
        //     'use strict';

        debugMode = debug;

        // Register custom fields if provided
        if (customFields && customFields.length > 0) {
            customFields.forEach(({ fieldType, FieldClass }) => {
                if (fieldType && FieldClass) {
                    fieldClasses[fieldType] = FieldClass;
                } else {
                    debugMode && console.warn('Custom field must have fieldType and FieldClass properties');
                }
            });
        }

        // Wait for FormAnalytics to initialize
        window.matomoFormAnalyticsAsyncInit = function () {
            const forms = document.querySelectorAll('form, [data-matomo-form]');
            forms.forEach(form => {
                setTimeout(() => {
                    const tracker = window.Piwik?.FormAnalytics?.element?.findFormTrackerInstance(form);
                    if (tracker) {
                        injectCustomFields(tracker, form);
                    }
                }, 100);
            });
        };
        // })();
    }
};

/**
 * Get available field types
 * @returns {string[]} Array of supported field types
 */
export const getAvailableFieldTypes = () => Object.keys(fieldClasses);

/**
 * Check if a field type is supported
 * @param {string} fieldType - Field type to check
 * @returns {boolean} True if supported, false otherwise
 */
export const isFieldTypeSupported = (type) => type in fieldClasses;
