import { BaseField } from './BaseField.js';

/**
 * Image Selector Field Creator
 * Handles image selection elements with click-based selection
 *
 * @class ImageSelectorField
 * @extends BaseField
 */
export class ImageSelectorField extends BaseField {
    static fieldType = 'imageSelector';

    static category = BaseField.FieldCategories.CHECKABLE;

    /**
     * @inheritDoc
     */
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.imageContainers = this.getInteractiveElement();
        this.lastSelectedValue = this.getSelectedValue();
    }

    /**
     * @inheritDoc
     */
    getInteractiveElement() {
        return this.element.querySelectorAll('.engage-image-selector--container');
    }

    /**
     * @inheritDoc
     */
    isBlank() {
        // Follows Matomo's tracker logic: return false if any image is selected
        return this.getSelectedImages().length === 0;
    }

    /**
     * @inheritDoc
     */
    getFieldSize() {
        // Follow Matomo's tracker logic: return -1 for FIELD_CHECKABLE fields
        return -1;
    }

    /**
     * Gets currently selected images from DOM
     * @returns {NodeList} NodeList of selected image elements
     */
    getSelectedImages() {
        return this.element.querySelectorAll('.engage-image-selector--container.selected');
    }

    /**
     * Gets the value of the currently selected image
     * @returns {string|null} The selected image value or null if none selected
     */
    getSelectedValue() {
        const selected = this.element.querySelector('.engage-image-selector--container.selected');
        if (!selected) return null;

        const radio = selected.querySelector('input[type="radio"]');
        return radio?.value || null;
    }

    /**
     * Sets up custom event listeners for image selector field
     * Overrides BaseField's setupEventListeners for custom image handling
     */
    setupEventListeners() {
        if (!this.imageContainers.length) {
            console.error('Image containers not found:', this.element);
            return;
        }

        // Set up click events on each image container
        this.imageContainers.forEach((container, index) => {
            container.addEventListener('click', () => this.handleImageClick(index + 1))
        });
    }

    /**
     * Handles image click events
     * Tracks image selection changes and deletions (deselections)
     *
     * @param {number} imageIndex - Index of clicked image (1-based)
     */
    handleImageClick(_imageIndex) {
        const prevSelectedValue = this.lastSelectedValue;
        this.onFocus();

        // Wait for DOM to update, then get new selected value
        setTimeout(() => {
            const newSelectedValue = this.getSelectedValue();

            console.log(`⚡️ IMAGE SELECTOR changed from "${prevSelectedValue}" to "${newSelectedValue}" (${this.fieldName})`);

            // Update stored selected value for next click
            this.lastSelectedValue = newSelectedValue;

            // Always track as change since something happened
            this.onChange();

            // Track deselections as "deletions" if value changed from something to null
            if (prevSelectedValue && !newSelectedValue) {
                this.trackDeletion();
                console.log(`⚡️ IMAGE SELECTOR deselected (${this.fieldName})`);
            }

            // Simulate blur after a short delay to complete
            // the focus → change → blur cycle
            setTimeout(() => this.onBlur(), 100);
        }, 50); // Small delay to let DOM update
    }
}
