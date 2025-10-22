/**
 * Matomo Form Analytics Custom Field Tracker Type Definitions
 */

export interface MatomoTracker {
    fields: BaseField[];
    fieldNodes: HTMLElement[];
    lastFocusedFieldName: string | null;
    exitFieldName: string | null;
    entryFieldName: string | null;
    setEngagedWithForm(): void;
    trackFieldUpdate(field: BaseField): void;
    scheduleSendUpdate(): void;
}

export interface TrackingParams {
    fa_fn: string;
    fa_ft: string;
    fa_fs: number;
    fa_fb: number;
    fa_fts: number;
    fa_fht: number;
    fa_ff: number;
    fa_fch: number;
    fa_fd: number;
    fa_fcu: number;
}

export enum FieldCategories {
    TEXT = 'FIELD_TEXT',
    SELECTABLE = 'FIELD_SELECTABLE',
    CHECKABLE = 'FIELD_CHECKABLE'
}

export declare class BaseField {
    static FieldCategories: typeof FieldCategories;

    readonly discoveredDate: number;
    timespent: number;
    hesitationtime: number;
    nodes: HTMLElement[];
    tagName: string;
    fieldName: string;
    fieldType: string;
    startFocus: number | null;
    timeLastChange: number | null;
    numChanges: number;
    numFocus: number;
    numDeletes: number;
    numCursor: number;
    canCountChange: boolean;
    isFocusedCausedAuto: boolean;
    hasChangedValueSinceFocus: boolean;
    tracker: MatomoTracker;
    category: string;
    element: HTMLElement;

    constructor(tracker: MatomoTracker, element: HTMLElement, fieldName: string);

    getInteractiveElement(): HTMLElement | NodeList;
    isBlank(): boolean;
    getFieldSize(): number;
    setupEventListeners(): void;
    addNode(node: HTMLElement): void;
    resetOnFormSubmit(): void;
    getTimeSpent(): number;
    getHesitationTime(): number;
    getTrackingParams(): TrackingParams;
    onFocus(): void;
    onBlur(): void;
    onChange(): void;
    trackCursorMovement(): void;
    trackDeletion(): void;
}

export declare class WysiwygField extends BaseField {
    static fieldType: 'wysiwyg';
    static category: FieldCategories.TEXT;

    editor: HTMLElement | null;
}

export declare class RatingField extends BaseField {
    static fieldType: 'rating';
    static category: FieldCategories.SELECTABLE;

    stars: NodeList;
    lastRating: number;

    handleStarClick(rating: number): void;
}

export declare class ImageSelectorField extends BaseField {
    static fieldType: 'imageSelector';
    static category: FieldCategories.CHECKABLE;

    imageContainers: NodeList;
    lastSelectedValue: string | null;

    getSelectedImages(): NodeList;
    getSelectedValue(): string | null;
    handleImageClick(imageIndex: number): void;
}

export declare const fieldClasses: {
    wysiwyg: typeof WysiwygField;
    rating: typeof RatingField;
    imageSelector: typeof ImageSelectorField;
};

export declare function createField(
    tracker: MatomoTracker,
    element: HTMLElement,
    fieldName: string,
    fieldType: string
): BaseField | null;

export declare function getAvailableFieldTypes(): string[];

export declare function isFieldTypeSupported(fieldType: string): boolean;

export declare function isValidFieldCategory(category: string): boolean;

export declare function getSupportedFieldCategories(): string[];

export declare function getFieldCategoryDescription(category: string): string;

export interface FormAnalyticsCustomFieldTracker {
    init(): void;
}

declare const FormAnalyticsCustomFieldTracker: FormAnalyticsCustomFieldTracker;
export default FormAnalyticsCustomFieldTracker;
