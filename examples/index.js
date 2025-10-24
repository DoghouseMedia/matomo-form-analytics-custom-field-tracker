import FormAnalyticsCustomFieldTracker from '@doghouse/matomo-form-analytics-custom-field-tracker';
import { SampleWysiwygField } from './SampleWysiwygField.js';
import { SampleButtonClickField } from './SampleButtonClickField.js';
import { SampleRatingField } from './SampleRatingField.js';

// Initialize custom field tracking for unsupported field types
FormAnalyticsCustomFieldTracker.init([
    { fieldType: 'SampleWysiwygField', FieldClass: SampleWysiwygField },
    { fieldType: 'SampleButtonClickField', FieldClass: SampleButtonClickField },
    { fieldType: 'SampleRatingField', FieldClass: SampleRatingField },
], true); // Enable debug logging
