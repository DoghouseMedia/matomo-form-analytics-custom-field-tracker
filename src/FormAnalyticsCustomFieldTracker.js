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

    const observer = new MutationObserver((mutations) => {
        let hasNewFields = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if new form fields were added
                    const isFormField = node.matches && (
                        // Standard form fields
                        node.matches('input, select, textarea') ||
                        // Custom field containers
                        node.matches('[class*="formulate-input-element"]') ||
                        // Fields within added nodes
                        node.querySelector('input, select, textarea, [class*="formulate-input-element"]')
                    );

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
        childList: true,    // Watch for added/removed children
        subtree: true,      // Watch all descendants
        attributes: false,
    });

    if (debugMode) {
        console.log('👀 Set up dynamic field observer for pagination/conditional fields');
    }

    // Store observer reference for potential cleanup
    form._fieldObserver = observer;
}

export default {
    init(customFields = [], debug = false) {
        debugMode = debug;

        // Register custom fields if provided
        if (customFields && customFields.length > 0) {
            customFields.forEach(({ fieldType, FieldClass }) => {
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
 * Get available field types
 * @returns {string[]} Array of supported field types
 */
export const getAvailableFieldTypes = () => Object.keys(fieldClasses);

/**
 * Check if a field type is supported
 * @param {string} fieldType - Field type to check
 * @returns {boolean} True if supported, false otherwise
 */
export const isFieldTypeSupported = (type) => type in fieldClasses;

/**
 * Provides global access to the current debug mode state.
 * This allows other modules (e.g., BaseField) to check whether debug logging is enabled,
 * without needing to pass the debug flag through constructors or method parameters.
 */
export const getDebugMode = () => debugMode;
