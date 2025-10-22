import { WysiwygField } from './WysiwygField.js';
import { RatingField } from './RatingField.js';
import { ImageSelectorField } from './ImageSelectorField.js';

/**
 * Field Classes Registry
 * Maps field types to their corresponding classes
 */
export const fieldClasses = {
    wysiwyg: WysiwygField,
    rating: RatingField,
    imageSelector: ImageSelectorField
};

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
export function createField(tracker, element, fieldName, fieldType) {
    const FieldClass = fieldClasses[fieldType];
    if (!FieldClass) {
        console.error(`No field class found for type: ${fieldType}`);
        return null;
    }

    try {
        // Verify the fieldType matches the class's static property
        if (FieldClass.fieldType !== fieldType) {
            console.error(`Field type mismatch: expected ${fieldType}, got ${FieldClass.fieldType}`);
            return null;
        }

        const field = new FieldClass(tracker, element, fieldName);
        field.setupEventListeners();
        return field;
    } catch (error) {
        console.error(`Error creating ${fieldType} field:`, error);
        return null;
    }
}

/**
 * Get available field types
 * @returns {string[]} Array of supported field types
 */
export function getAvailableFieldTypes() {
    return Object.keys(fieldClasses);
}

/**
 * Check if a field type is supported
 * @param {string} fieldType - Field type to check
 * @returns {boolean} True if supported, false otherwise
 */
export function isFieldTypeSupported(fieldType) {
    return fieldType in fieldClasses;
}
