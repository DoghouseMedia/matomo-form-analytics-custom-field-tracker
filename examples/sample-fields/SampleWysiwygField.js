import { BaseField } from '../BaseField.js';

/**
 * Sample WYSIWYG Field Implementation
 * 
 * This is an example of how to create a custom field for Matomo FormAnalytics.
 * This field handles contenteditable div elements with ProseMirror editor.
 *
 * @class SampleWysiwygField
 * @extends BaseField
 */
export class SampleWysiwygField extends BaseField {
    static fieldType = 'wysiwyg';
    static category = BaseField.FieldCategories.TEXT;
    static selector = '.formulate-input-element--wysiwyg[data-name]';

    /**
     * @inheritDoc
     */
    constructor(tracker, element, fieldName, debug = false) {
        super(tracker, element, fieldName, debug);
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
