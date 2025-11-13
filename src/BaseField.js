import { FieldCategories } from './Enums/FieldCategories.js';
import { getDebugMode } from './FormAnalyticsCustomFieldTracker.js';

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
     * Creates a new BaseField instance
     *
     * @param {Object} tracker - Matomo tracker instance
     * @param {HTMLElement} element - DOM element for the field
     * @param {string} fieldName - Unique identifier for the field
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
        this.firstInteractionTime = null;

        // Store references for field-specific implementations
        this.element = element;
        this.debug = getDebugMode();

        // Cleanup tracking
        this._eventListeners = new Map();
        this._timers = new Set();
        this._isDestroyed = false;
        this._delayedBlurTimer = null;
    }

    /**
     * Helper method to track event listeners for cleanup
     * @private
     * @param {HTMLElement} element - Element to attach listener to
     * @param {string} event - Event type
     * @param {Function} handler - Event handler function
     * @param {Object} options - Event listener options
     */
    _addTrackedEventListener(element, event, handler, options = {}) {
        if (this._isDestroyed) return;

        const key = `${element}_${event}`;
        if (!this._eventListeners.has(key)) {
            this._eventListeners.set(key, []);
        }

        element.addEventListener(event, handler, options);
        this._eventListeners.get(key).push({ element, event, handler, options });
    }

    /**
     * Helper method to track timers for cleanup
     * @private
     * @param {number} timerId - Timer ID from setTimeout/setInterval
     * @returns {number} The timer ID
     */
    _trackTimer(timerId) {
        if (this._isDestroyed) return timerId;
        this._timers.add(timerId);
        return timerId;
    }

    /**
     * Tracks first interaction and sets focus if not already focused
     * Useful for click-based fields (rating, image selector, etc.) that need to track
     * time from the first interaction to blur for accurate "time spent per question" metrics
     *
     * @returns {boolean} True if this was the first interaction, false otherwise
     */
    trackFirstInteraction() {
        if (!this.firstInteractionTime) {
            this.firstInteractionTime = Date.now();
            this.onFocus();
            return true;
        }

        return false;
    }

    /**
     * Schedules a delayed blur event
     * Useful for fields that need to complete a focus → change → blur cycle
     */
    scheduleDelayedBlur(delay = 100) {
        this.cancelDelayedBlur();

        this._delayedBlurTimer = this._trackTimer(setTimeout(() => {
            if (this.hasChangedValueSinceFocus && this.startFocus) {
                this.timeLastChange = Date.now();
            }

            this._delayedBlurTimer = null;
            this.onBlur();
        }, delay));

        return this._delayedBlurTimer;
    }

    /**
     * Cancels any scheduled delayed blur
     */
    cancelDelayedBlur() {
        if (this._delayedBlurTimer) {
            clearTimeout(this._delayedBlurTimer);
            this._timers.delete(this._delayedBlurTimer);
            this._delayedBlurTimer = null;
        }
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
            this.debug && console.error(`${this.fieldType.toUpperCase()} interactive element not found:`, this.element);
            return;
        }

        // Focus event
        this._addTrackedEventListener(interactiveElement, 'focus', () => {
            this.onFocus();
        });

        // Blur event
        this._addTrackedEventListener(interactiveElement, 'blur', () => {
            this.onBlur();
        });

        // Input event (typing)
        this._addTrackedEventListener(interactiveElement, 'input', () => {
            this.onChange();
        });

        // Keydown event (cursor movements, deletions)
        this._addTrackedEventListener(interactiveElement, 'keydown', (event) => {
            this.handleKeydown(event);
        });

        // Click event (cursor movements)
        this._addTrackedEventListener(interactiveElement, 'click', () => {
            this.trackCursorMovement();
            this.debug && console.log(`⚡️ ${this.fieldType.toUpperCase()} click:`, this.fieldName);
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
            this.debug && console.log(`${this.fieldType.toUpperCase()} cursor movement:`, event.key);
        }

        // Track deletions
        if (event.key === 'Backspace' || event.key === 'Delete') {
            this.trackDeletion();
            this.debug && console.log(`${this.fieldType.toUpperCase()} deletion:`, event.key);
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
        this.firstInteractionTime = null;
        this.cancelDelayedBlur();
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
        this.debug && console.log(`⚡️ ${this.fieldType.toUpperCase()} focus (${this.fieldName})`);
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
        this.debug && console.log(`⚡️ ${this.fieldType.toUpperCase()} blur (${this.fieldName})`);
        if (!this.startFocus) return;

        // If firstInteractionTime is set, use it for more accurate time tracking
        // (useful for click-based fields where onChange happens immediately)
        if (this.firstInteractionTime && this.hasChangedValueSinceFocus) {
            const now = Date.now();
            const totalTime = now - this.firstInteractionTime;
            this.timespent += totalTime;
            this.firstInteractionTime = null;
            this.timeLastChange = null;
            this.startFocus = null;
            return;
        }

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
        this.debug && console.log(`⚡️ ${this.fieldType.toUpperCase()} changed (${this.fieldName})`);
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

    /**
     * Destroys the field instance and cleans up all resources
     * Removes event listeners, clears timers, and nulls heavy references
     * Safe to call multiple times (idempotent)
     */
    destroy() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        // Remove all tracked event listeners
        for (const [, listeners] of this._eventListeners) {
            for (const { element, event, handler, options } of listeners) {
                try {
                    element.removeEventListener(event, handler, options);
                } catch (e) {
                    this.debug && console.warn(`Failed to remove event listener: ${event}`, e);
                }
            }
        }
        this._eventListeners.clear();

        // Clear all tracked timers
        for (const timerId of this._timers) {
            try {
                clearTimeout(timerId);
                clearInterval(timerId);
            } catch (e) {
                this.debug && console.warn(`Failed to clear timer: ${timerId}`, e);
            }
        }
        this._timers.clear();

        // Null out heavy references to prevent memory leaks
        this.element = null;
        this.nodes = null;
        this.tracker = null;
        this.startFocus = null;
        this.timeLastChange = null;
    }
}
