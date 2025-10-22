import { FieldCategories } from '../Enums/FieldCategories.js';

/**
 * BaseField Class
 *
 * A reusable abstract class providing shared tracking logic
 * for all custom form field types (e.g., WYSIWYG, rating, image selector).
 *
 * @class BaseField
 * @abstract
 */
export class BaseField {
    /**
     * Field Categories ENUM - Available to all subclasses
     * @static
     */
    static FieldCategories = FieldCategories;

    /**
     * Required static properties for field classes:
     * 
     * @static {string} fieldType - Unique identifier for the field type (e.g., 'wysiwyg', 'rating')
     * @static {string} category - Field category from FieldCategories enum
     * @static {string} selector - CSS selector to find elements for this field type (required for automatic detection)
     * 
     * Example:
     * static fieldType = 'myField';
     * static category = BaseField.FieldCategories.TEXT;
     * static selector = '.my-field[data-name]';
     */

    /**
     * Creates a new BaseField instance
     *
     * @param {Object} tracker - Matomo tracker instance
     * @param {HTMLElement} element - DOM element for the field
     * @param {string} fieldName - Unique identifier for the field
     * @param {string} fieldType - Type of field (wysiwyg, rating, etc.)
     * @param {string} category - Matomo field category (FIELD_TEXT, FIELD_SELECTABLE, etc.)
     */
    constructor(tracker, element, fieldName) {
        // Get fieldType and category from static properties
        const fieldType = this.constructor.fieldType;
        const category = this.constructor.category;
        const selector = this.constructor.selector;

        if (!fieldType || !category || !selector) {
            throw new Error(`${this.constructor.name} must define static fieldType, selector and category properties`);
        }

        // Common properties for all field types
        this.discoveredDate = Date.now();
        this.timespent = 0;
        this.hesitationtime = 0;
        this.nodes = [element];
        this.tagName = 'div';
        this.fieldName = fieldName;
        this.fieldType = fieldType;
        this.startFocus = null;
        this.timeLastChange = null;
        this.numChanges = 0;
        this.numFocus = 0;
        this.numDeletes = 0;
        this.numCursor = 0;
        this.canCountChange = true;
        this.isFocusedCausedAuto = false;
        this.hasChangedValueSinceFocus = false;
        this.tracker = tracker;
        this.category = category;

        // Store references for field-specific implementations
        this.element = element;

        // // Set up event listeners for all custom fields
        // this.setupEventListeners();
    }

    /**
     * Abstract method: Gets the interactive element for this field
     * Must be implemented by subclasses to define their interactive element
     * @abstract
     * @returns {HTMLElement|NodeList} Interactive element for this field
     * @throws {Error} If not implemented by subclass
     */
    getInteractiveElement() {
        throw new Error(`getInteractiveElement() must be implemented by ${this.fieldType} field`);
    }

    /**
     * Abstract method: Determines if field is blank/empty
     * Must be implemented by subclasses
     * @abstract
     * @returns {boolean} True if field is blank, false otherwise
     * @throws {Error} If not implemented by subclass
     */
    isBlank() {
        throw new Error(`isBlank() must be implemented by ${this.fieldType} field`);
    }

    /**
     * Abstract method: Gets field size/content length
     * Must be implemented by subclasses
     * @abstract
     * @returns {number} Field size (content length, rating value, etc.)
     * @throws {Error} If not implemented by subclass
     */
    getFieldSize() {
        throw new Error(`getFieldSize() must be implemented by ${this.fieldType} field`);
    }

    /**
     * Sets up event listeners for all custom field types
     * This method provides common event handling for all custom fields
     * Can be overridden by subclasses for custom event handling
     */
    setupEventListeners() {
        // Check if the subclass has overridden this method.
        if (this.constructor.prototype.setupEventListeners !== BaseField.prototype.setupEventListeners) {
            // Subclass has its own implementation, call it
            this.constructor.prototype.setupEventListeners.call(this);
            return;
        }

        // Default implementation for fields that don't override
        this.setupDefaultEventListeners();
    }

    /**
     * Sets up default event listeners for standard field types
     * Used by fields that don't need custom event handling
     */
    setupDefaultEventListeners() {
        // Get the actual interactive element (overridden by subclasses)
        const interactiveElement = this.getInteractiveElement();

        if (!interactiveElement) {
            console.error(`${this.fieldType.toUpperCase()} interactive element not found:`, this.element);
            return;
        }

        // Focus event
        interactiveElement.addEventListener('focus', () => {
            this.onFocus();
        });

        // Blur event
        interactiveElement.addEventListener('blur', () => {
            this.onBlur();
        });

        // Input event (typing)
        interactiveElement.addEventListener('input', () => {
            this.onChange();
        });

        // Keydown event (cursor movements, deletions)
        interactiveElement.addEventListener('keydown', (event) => {
            this.handleKeydown(event);
        });

        // Click event (cursor movements)
        interactiveElement.addEventListener('click', () => {
            this.trackCursorMovement();
            console.log(`⚡️ ${this.fieldType.toUpperCase()} click:`, this.fieldName);
        });
    }

    /**
     * Handles keydown events for cursor and deletion tracking
     * Tracks arrow keys, home/end, and backspace/delete
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleKeydown(event) {
        // Track cursor movements
        const cursorKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
        if (cursorKeys.includes(event.key)) {
            this.trackCursorMovement();
            console.log(`${this.fieldType.toUpperCase()} cursor movement:`, event.key);
        }

        // Track deletions
        if (event.key === 'Backspace' || event.key === 'Delete') {
            this.trackDeletion();
            console.log(`${this.fieldType.toUpperCase()} deletion:`, event.key);
        }
    }

    /**
     * Adds a DOM node to this field's node collection
     * @param {HTMLElement} node - DOM node to add
     */
    addNode(node) {
        this.nodes.push(node);
    }

    /**
     * Resets all tracking counters when form is submitted
     * Called automatically by Matomo tracker on form submission
     */
    resetOnFormSubmit() {
        this.timespent = 0;
        this.numFocus = 0;
        this.numDeletes = 0;
        this.numCursor = 0;
        this.numChanges = 0;
        this.startFocus = null;
        this.timeLastChange = null;
        this.canCountChange = true;
        this.hasChangedValueSinceFocus = false;
        this.isFocusedCausedAuto = false;
    }

    /**
     * Calculates total time spent in this field
     * Includes both tracked time and current session time
     * @returns {number} Time spent in milliseconds
     */
    getTimeSpent() {
        if (this.numChanges && !this.timespent) {
            this.timespent = 1;
        }
        if (!this.startFocus || this.isFocusedCausedAuto) {
            return this.timespent;
        }
        if (this.timeLastChange) {
            const timeSpent = this.timeLastChange - this.startFocus;
            return this.timespent + (timeSpent > 0 ? timeSpent : 0);
        }
        return this.timespent + (Date.now() - this.startFocus);
    }

    /**
     * Calculates hesitation time before first interaction
     * Time from field detection to first user interaction
     * @returns {number} Hesitation time in milliseconds
     */
    getHesitationTime() {
        if (this.numChanges || !this.startFocus || this.isFocusedCausedAuto) {
            return this.hesitationtime;
        }
        return this.hesitationtime + (Date.now() - this.startFocus);
    }

    /**
     * Generates tracking parameters for Matomo FormAnalytics
     * Returns all field metrics in Matomo-compatible format
     * @returns {Object} Object containing all tracking parameters
     */
    getTrackingParams() {
        return {
            fa_fn: this.fieldName,
            fa_ft: this.fieldType,
            fa_fs: this.getFieldSize(),
            fa_fb: this.isBlank() ? 1 : 0,
            fa_fts: this.getTimeSpent(),
            fa_fht: this.getHesitationTime(),
            fa_ff: this.numFocus,
            fa_fch: this.numChanges,
            fa_fd: this.numDeletes,
            fa_fcu: this.numCursor
        };
    }

    /**
     * Handles field focus event
     * Tracks focus count, sets entry field, and triggers Matomo tracking
     */
    onFocus() {
        console.log(`⚡️ ${this.fieldType.toUpperCase()} focus (${this.fieldName})`);
        this.startFocus = Date.now();
        const isNewField = this.fieldName !== this.tracker.lastFocusedFieldName;

        if (isNewField && !this.isFocusedCausedAuto) {
            this.numFocus++;
            this.tracker.setEngagedWithForm();
            this.tracker.trackFieldUpdate(this);
            this.tracker.exitFieldName = this.fieldName;
            this.tracker.scheduleSendUpdate();
        }

        this.tracker.lastFocusedFieldName = this.fieldName;
        this.canCountChange = true;
    }

    /**
     * Handles field blur event
     * Calculates time spent and updates tracking data
     */
    onBlur() {
        console.log(`⚡️ ${this.fieldType.toUpperCase()} blur (${this.fieldName})`);
        if (!this.startFocus) return;

        if (this.hasChangedValueSinceFocus) {
            if (this.timeLastChange && this.startFocus) {
                this.timespent += (this.timeLastChange - this.startFocus);
            }
            this.timeLastChange = null;
            this.startFocus = null;
            return;
        }

        if (!this.isFocusedCausedAuto) {
            const now = Date.now();
            this.timespent += now - this.startFocus;
            if (!this.numChanges) {
                this.hesitationtime += now - this.startFocus;
            }
            this.tracker.setEngagedWithForm();
            this.tracker.trackFieldUpdate(this);
        }
        this.startFocus = null;
    }

    /**
     * Handles field change event
     * Tracks changes, hesitation time, and sets entry field
     */
    onChange() {
        console.log(`⚡️ ${this.fieldType.toUpperCase()} changed (${this.fieldName})`);
        this.timeLastChange = Date.now();
        if (this.isFocusedCausedAuto) {
            this.startFocus = this.timeLastChange;
        } else if (!this.startFocus) {
            return;
        }

        this.isFocusedCausedAuto = false;
        this.hasChangedValueSinceFocus = true;

        if (!this.numChanges) {
            this.hesitationtime += this.timeLastChange - this.startFocus;
        }

        if (this.canCountChange) {
            this.numChanges++;
            this.canCountChange = false;
        }

        if (!this.tracker.entryFieldName) {
            this.tracker.entryFieldName = this.fieldName;
        }

        this.tracker.setEngagedWithForm();
        this.tracker.trackFieldUpdate(this);
    }

    /**
     * Helper method for tracking cursor movements
     * Increments cursor count for arrow keys, clicks, etc.
     */
    trackCursorMovement() {
        this.numCursor++;
    }

    /**
     * Helper method for tracking deletions
     * Increments delete count for backspace, delete keys, etc.
     */
    trackDeletion() {
        this.numDeletes++;
    }
}
