export interface Base {
    getId(): string;
    hasId(): boolean;
    setAllowableActions(allowableActions: string[]);
}