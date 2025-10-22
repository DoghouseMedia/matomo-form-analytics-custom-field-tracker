/**
 * Field Categories Enum
 *
 * Defines the three field categories supported by Matomo FormAnalytics
 * - FIELD_TEXT: Text-based input fields
 * - FIELD_SELECTABLE: Selection-based fields
 * - FIELD_CHECKABLE: Checkbox/radio fields
 *
 * @enum {string}
 */
export const FieldCategories = {
    /**
     * Text-based input fields (password, text, url, tel, email, search, textarea)
     */
    TEXT: 'FIELD_TEXT',
    /**
     * Selection-based fields (color, date, datetime, datetime-local, month, number, range, time, week, select)
     */
    SELECTABLE: 'FIELD_SELECTABLE',
    /**
     * Checkbox/radio fields (radio, checkbox)
     */
    CHECKABLE: 'FIELD_CHECKABLE'
};

/**
 * Validates if a field category is supported by Matomo
 * @param {string} category - Field category to validate
 * @returns {boolean} True if category is valid
 */
export function isValidFieldCategory(category) {
    return Object.values(FieldCategories).includes(category);
}

/**
 * Gets all supported field categories
 * @returns {string[]} Array of all supported field categories
 */
export function getSupportedFieldCategories() {
    return Object.values(FieldCategories);
}

/**
 * Gets field category description
 * @param {string} category - Field category
 * @returns {string} Human-readable description
 */
export function getFieldCategoryDescription(category) {
    const descriptions = {
        [FieldCategories.TEXT]: 'Text-based input fields (password, text, url, tel, email, search, textarea)',
        [FieldCategories.SELECTABLE]: 'Selection-based fields (color, date, datetime, datetime-local, month, number, range, time, week, select)',
        [FieldCategories.CHECKABLE]: 'Checkbox/radio fields (radio, checkbox)'
    };

    return descriptions[category] || 'Unknown field category';
}
