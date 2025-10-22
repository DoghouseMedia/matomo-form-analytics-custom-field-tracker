// Custom Field Integration for Matomo FormAnalytics
import { createField } from './CustomFields/index.js';

export default {
    init() {
        (function() {
            'use strict';

            // Wait for FormAnalytics to initialize
            window.matomoFormAnalyticsAsyncInit = function() {
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
                const customFieldTypes = {
                    wysiwyg: '.formulate-input-element--wysiwyg[data-name]',
                    imageSelector: '.formulate-input-element--image_selection[data-name]',
                    rating: '.formulate-input-element--rating-container[data-name]'
                };

                Object.entries(customFieldTypes).forEach(([type, selector]) => {
                    const fields = form.querySelectorAll(selector);
                    fields.forEach(field => {
                        const fieldName = field.getAttribute('data-name');
                        const customField = createField(tracker, field, fieldName, type);

                        if (customField) {
                            // Add to tracker
                            tracker.fields.push(customField);
                            tracker.fieldNodes.push(field);

                            console.log(`✅ Integrated custom ${type} field: ${fieldName}`);
                        }
                    });
                });
            }
        })();
    }
};
