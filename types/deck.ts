export interface FlashCard {
    id: number,
    frontMainText: string,
    frontSecondaryText?: string,
    backMainText: string,
    backSecondaryText?: string,
    backExtraText?: string,
    // stats: {
    //     score: number,
    //     lastViewed: number, // unix timestamp
    //     enabled: boolean,
    // }
}

export interface DeckData {
    cards: FlashCard[],
}

export interface FlashCardStats {
    cardId: number,
    score: number,
    lastViewed: number, // unix timestamp
    enabled: boolean,
}

export interface DeckProgressData {
    cardsStats: FlashCardStats[], 
}