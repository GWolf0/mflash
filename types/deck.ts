/**
 * Decks/cards related types
 */

export interface FlashCard {
    id: number,
    frontMainText: string,
    frontSecondaryText?: string,
    backMainText: string,
    backSecondaryText?: string,
}

export interface DeckData {
    cards: FlashCard[],
    v: number, // version
    lastId: number, // last id given to a card
}

// individual card stats structure (mainly used for suggesting cards to review)
export interface FlashCardStats {
    cardId: number,
    score: number,
    lastViewed: number, // unix timestamp
    enabled: boolean,
}

// progress data contains list of cards stats of a deck
export interface DeckProgressData {
    cardsStats: FlashCardStats[], 
}

export type CardStatusType = "neutral" | "very bad" | "bad" | "good" | "very good";