import { BaseField } from './BaseField.js';

/**
 * Rating Field Creator
 * Handles star rating elements with click-based selection
 *
 * @class RatingField
 * @extends BaseField
 */
export class RatingField extends BaseField {
    static fieldType = 'rating';

    static category = BaseField.FieldCategories.SELECTABLE;

    /**
     * @inheritDoc
     */
    constructor(tracker, element, fieldName) {
        super(tracker, element, fieldName);
        this.stars = this.getInteractiveElement();
        this.lastRating = this.getFieldSize();
    }

    /**
     * @inheritDoc
     */
    getInteractiveElement() {
        return this.element.querySelectorAll('.star-full');
    }

    /**
     * @inheritDoc
     */
    isBlank() {
        const filledStars = this.element.querySelectorAll('.star-full .icon-full');
        return filledStars.length === 0;
    }

    /**
     * @inheritDoc
     */
    getFieldSize() {
        const filledStars = this.element.querySelectorAll('.star-full .icon-full');
        return filledStars.length;
    }

    /**
     * Sets up custom event listeners for rating field
     * Overrides BaseField's setupEventListeners for custom star handling
     */
    setupEventListeners() {
        if (this.stars.length === 0) {
            console.error('Rating stars not found:', this.element);
            return;
        }

        // Set up click events on each star
        this.stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.handleStarClick(index + 1);
            });
        });
    }

    /**
     * Handles star click events
     * Tracks rating changes and deletions (rating decreases)
     *
     * @param {number} rating - New rating value
     */
    handleStarClick(rating) {
        const prevRating = this.lastRating;
        const newRating = rating === prevRating ? 0 : rating;

        console.log(`⚡️ RATING changed from ${prevRating} to ${newRating} (${this.fieldName})`);
        // Simulate focus if this is the first interaction with the form
        this.onFocus();
        // Update stored rating for next click
        this.lastRating = newRating;

        // Always track as change since something happened
        this.onChange();

        // Track rating changes as "deletions" if the rating decreased
        if (newRating < prevRating) {
            this.trackDeletion();
            console.log(`⚡️ RATING decreased from ${prevRating} to ${newRating} (${this.fieldName})`);
        }

        // Simulate blur after a short delay to complete
        // the focus → change → blur cycle
        setTimeout(() => {
            this.onBlur();
        }, 100);
    }
}
