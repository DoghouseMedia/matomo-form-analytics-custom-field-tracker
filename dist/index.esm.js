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
    const field = new FieldClass(tracker, element, fieldName);
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
        if (tracker.fieldNodes.includes(field)) {
          if (debugMode) {
            console.log(`⏭️ Skipping already tracked ${fieldType} field: ${field.getAttribute('data-name')}`);
          }
          return;
        }
        const fieldName = field.getAttribute('data-name');
        if (!fieldName) {
          debugMode && console.warn(`⚠️ Field missing data-name attribute:`, field);
          return;
        }
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

/**
 * Re-scans both native tracker and custom fields when new fields appear
 * Handles pagination and conditional fields
 */
function reScanFormFields(tracker, form) {
  if (!tracker || !form) return;

  // Re-scan the native tracker for new standard fields
  if (typeof tracker.scanForFields === 'function') {
    tracker.scanForFields();
    if (debugMode) {
      console.log('🔄 Re-scanned native tracker for new fields');
    }
  }

  // Re-inject custom fields
  injectCustomFields(tracker, form);
}

/**
 * Sets up MutationObserver to detect new fields appearing
 * Handles both pagination and conditional fields
 */
function setupDynamicFieldObserver(tracker, form) {
  let reScanTimeout = null;
  const observer = new MutationObserver(mutations => {
    let hasNewFields = false;
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          // Element node
          // Check if new form fields were added
          const isFormField = node.matches && (
          // Standard form fields
          node.matches('input, select, textarea') ||
          // Custom field containers
          node.matches('[class*="formulate-input-element"]') ||
          // Fields within added nodes
          node.querySelector('input, select, textarea, [class*="formulate-input-element"]'));
          if (isFormField) {
            hasNewFields = true;
          }
        }
      });
    });
    if (hasNewFields) {
      // Debounce re-scanning to avoid multiple scans for rapid changes
      if (reScanTimeout) {
        clearTimeout(reScanTimeout);
      }
      reScanTimeout = setTimeout(() => {
        if (debugMode) {
          console.log('📄 New fields detected (pagination/conditional), re-scanning...');
        }
        reScanFormFields(tracker, form);
        reScanTimeout = null;
      }, 300); // 300ms debounce
    }
  });

  // Observe the form for changes
  observer.observe(form, {
    childList: true,
    // Watch for added/removed children
    subtree: true,
    // Watch all descendants
    attributes: false
  });
  if (debugMode) {
    console.log('👀 Set up dynamic field observer for pagination/conditional fields');
  }

  // Store observer reference for potential cleanup
  form._fieldObserver = observer;
}
var FormAnalyticsCustomFieldTracker = {
  init(customFields = [], debug = false) {
    debugMode = debug;

    // Register custom fields if provided
    if (customFields && customFields.length > 0) {
      customFields.forEach(({
        fieldType,
        FieldClass
      }) => {
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
            // Set up an observer for dynamic fields (pagination/conditional)
            setupDynamicFieldObserver(tracker, form);
          }
        }, 100);
      });
    };
  }
};

/**
 * Provides global access to the current debug mode state.
 * This allows other modules (e.g., BaseField) to check whether debug logging is enabled,
 * without needing to pass the debug flag through constructors or method parameters.
 */
const getDebugMode = () => debugMode;

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
const FieldCategories = {
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
function isValidFieldCategory(category) {
  return Object.values(FieldCategories).includes(category);
}

/**
 * Gets all supported field categories
 * @returns {string[]} Array of all supported field categories
 */
function getSupportedFieldCategories() {
  return Object.values(FieldCategories);
}

/**
 * Gets field category description
 * @param {string} category - Field category
 * @returns {string} Human-readable description
 */
function getFieldCategoryDescription(category) {
  const descriptions = {
    [FieldCategories.TEXT]: 'Text-based input fields (password, text, url, tel, email, search, textarea)',
    [FieldCategories.SELECTABLE]: 'Selection-based fields (color, date, datetime, datetime-local, month, number, range, time, week, select)',
    [FieldCategories.CHECKABLE]: 'Checkbox/radio fields (radio, checkbox)'
  };
  return descriptions[category] || 'Unknown field category';
}

/**
 * BaseField Class
 *
 * A reusable abstract class providing shared tracking logic
 * for all custom form field types (e.g., WYSIWYG, rating, image selector).
 *
 * @class BaseField
 * @abstract
 */
class BaseField {
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
    this._mutationObservers = new Set();
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
    this._eventListeners.get(key).push({
      element,
      event,
      handler,
      options
    });
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
   * Helper method to track MutationObservers for cleanup
   * @private
   * @param {MutationObserver} observer - MutationObserver instance
   * @returns {MutationObserver} The observer instance
   */
  _trackMutationObserver(observer) {
    if (this._isDestroyed) return observer;
    this._mutationObservers.add(observer);
    return observer;
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
    this._addTrackedEventListener(interactiveElement, 'keydown', event => {
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
        this.timespent += this.timeLastChange - this.startFocus;
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
      for (const {
        element,
        event,
        handler,
        options
      } of listeners) {
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

    // Disconnect all tracked MutationObservers
    for (const observer of this._mutationObservers) {
      try {
        observer.disconnect();
      } catch (e) {
        this.debug && console.warn(`Failed to disconnect MutationObserver:`, e);
      }
    }
    this._mutationObservers.clear();

    // Null out heavy references to prevent memory leaks
    this.element = null;
    this.nodes = null;
    this.tracker = null;
    this.startFocus = null;
    this.timeLastChange = null;
  }
}

export { BaseField, FieldCategories, FormAnalyticsCustomFieldTracker as default, getFieldCategoryDescription, getSupportedFieldCategories, isValidFieldCategory };
//# sourceMappingURL=index.esm.js.map
