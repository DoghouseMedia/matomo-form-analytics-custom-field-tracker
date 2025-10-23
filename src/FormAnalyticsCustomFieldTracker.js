// Custom Field Integration for Matomo FormAnalytics
import { createField, fieldClasses } from './CustomFields/index.js';

export default {
    init(customFields = []) {
        (function () {
            'use strict';

            // Register custom fields if provided
            if (customFields && customFields.length > 0) {
                customFields.forEach(({ fieldType, FieldClass }) => {
                    if (fieldType && FieldClass) {
                        fieldClasses[fieldType] = FieldClass;
                        console.log(`✅ Registered custom field type: ${fieldType}`);
                    } else {
                        console.warn('Custom field must have fieldType and FieldClass properties');
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

                                console.log(`✅ Integrated custom ${fieldType} field: ${fieldName}`);
                            }
                        });
                    }
                });
            }
        })();
    }
};
