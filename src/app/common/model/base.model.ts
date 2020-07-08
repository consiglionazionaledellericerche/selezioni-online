export interface Base {
    getId(): string;
    hasId(): boolean;
    setAllowableActions(allowableActions: string[]);
    canDelete(): boolean;
    getType(): string;
    getBaseType(): string;
}