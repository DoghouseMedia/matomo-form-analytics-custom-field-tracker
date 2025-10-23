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

    // Store references for field-specific implementations
    this.element = element;
    this.debug = getDebugMode();
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
    interactiveElement.addEventListener('keydown', event => {
      this.handleKeydown(event);
    });

    // Click event (cursor movements)
    interactiveElement.addEventListener('click', () => {
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
}

export { BaseField, FieldCategories, FormAnalyticsCustomFieldTracker as default, getFieldCategoryDescription, getSupportedFieldCategories, isValidFieldCategory };
//# sourceMappingURL=index.esm.js.map
