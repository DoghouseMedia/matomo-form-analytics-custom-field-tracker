import { BaseField } from './BaseField.js';

/**
 * WYSIWYG Field Creator
 * Handles contenteditable div elements with ProseMirror editor
 *
 * @class WysiwygField
 * @extends BaseField
 */
export class WysiwygField extends BaseField {
    static fieldType = 'wysiwyg';

    static category = BaseField.FieldCategories.TEXT;

    /**
     * @inheritDoc
     */
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.editor = this.getInteractiveElement();
    }

    /**
     * @inheritDoc
     */
    getInteractiveElement() {
        return this.element.querySelector('.ProseMirror[contenteditable="true"]');
    }

    /**
     * @inheritDoc
     */
    isBlank() {
        if (!this.editor) return true;
        const content = this.editor.innerText || this.editor.textContent || '';
        return content.trim().length === 0;
    }

    /**
     * @inheritDoc
     */
    getFieldSize() {
        if (!this.editor) return 0;
        const content = this.editor.innerText || this.editor.textContent || '';
        return content.length;
    }
}
