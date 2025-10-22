import { FieldCategories, isValidFieldCategory, getSupportedFieldCategories } from '../src/Enums/FieldCategories.js';

describe('FieldCategories', () => {
    test('should export all field categories', () => {
        expect(FieldCategories.TEXT).toBe('FIELD_TEXT');
        expect(FieldCategories.SELECTABLE).toBe('FIELD_SELECTABLE');
        expect(FieldCategories.CHECKABLE).toBe('FIELD_CHECKABLE');
    });

    test('isValidFieldCategory should validate categories correctly', () => {
        expect(isValidFieldCategory('FIELD_TEXT')).toBe(true);
        expect(isValidFieldCategory('FIELD_SELECTABLE')).toBe(true);
        expect(isValidFieldCategory('FIELD_CHECKABLE')).toBe(true);
        expect(isValidFieldCategory('INVALID_CATEGORY')).toBe(false);
    });

    test('getSupportedFieldCategories should return all categories', () => {
        const categories = getSupportedFieldCategories();
        expect(categories).toHaveLength(3);
        expect(categories).toContain('FIELD_TEXT');
        expect(categories).toContain('FIELD_SELECTABLE');
        expect(categories).toContain('FIELD_CHECKABLE');
    });
});
