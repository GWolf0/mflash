export interface FlashCard {
    id: number,
    frontMainText: string,
    frontSecondaryText?: string,
    backMainText: string,
    backSecondaryText?: string,
    backExtraText?: string,
    stats: {
        score: number,
        lastViewed: Date | null,
        enabled: boolean,
    }
}

export interface DeckData {
    cards: FlashCard[],
}