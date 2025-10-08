/**
 * Deck service (Main points)
 * - create new instance related to decks/cards
 * - static helper methods related to decks/cards
 * - implement basic spaced repetition method
 */

import { APP_VERSION } from "@/constants/appConstants";
import { CARD_MAX_SCORE, DECK_CATEGORIES } from "@/constants/deckConstants";
import { CardStatusType, DeckData, DeckProgressData, FlashCard, FlashCardStats } from "@/types/deck";
import { DeckModel, DeckProgressModel } from "@/types/models";


export default class DeckService {

    // make new deck instance
    static makeNewDeckInstance(params: Partial<Omit<DeckModel, "id">>, testCards: number = 0): DeckModel {
        return {
            id: "",
            title: params.title ?? "New Deck",
            description: params.description ?? "No description.",
            category: params.category ?? DECK_CATEGORIES[0],
            is_private: Object.hasOwn(params, "is_private") ? params.is_private! : true,
            data: DeckService.makeNewDeckDataInstance(testCards),
            created_at: new Date(),
            updated_at: new Date(),
            user_id: params.user_id ?? "",
        }
    }

    // make new deck data instance
    static makeNewDeckDataInstance(testCards: number = 0): DeckData {
        return {
            cards: Array(testCards).fill(0).map((_, i) => DeckService.makeNewCardInstance({}, undefined, i + 1)),
            v: APP_VERSION,
            lastId: testCards,
        };
    }

    // make new card instance
    static makeNewCardInstance(params: Partial<FlashCard>, deckData?: DeckData, id?: number): FlashCard {
        // find new id
        const highestId: number | undefined = deckData?.lastId;
        const newId: number = highestId != undefined ? highestId + 1 : id ? id : -1;

        return {
            id: newId,
            frontMainText: params.frontMainText ?? "Front",
            frontSecondaryText: params.frontSecondaryText ?? "secondary front",
            backMainText: params.backMainText ?? "Back",
            backSecondaryText: params.backSecondaryText ?? "secondary back",
        }
    }

    // get default card stats
    static getDefaultCardStats(cardId: number): FlashCardStats {
        // set lastviewed to one day before
        return { cardId, score: 0, lastViewed: Date.now() - 86400000, enabled: true };
    }

    // get new deck progress data
    static makeNewDeckProgressDataInstance(cards: FlashCard[]): DeckProgressData {
        return {
            cardsStats: cards.map(c => DeckService.getDefaultCardStats(c.id))
        }
    }

    // get new deck progress model instance
    static makeNewDeckProgressModelInstance(deckId: string, userId: string, cards: FlashCard[]): DeckProgressModel {
        return {
            id: "",
            deck_id: deckId,
            user_id: userId,
            data: DeckService.makeNewDeckProgressDataInstance(cards),
            created_at: new Date(),
            updated_at: new Date(),
        }
    }

    // get synced deck progress data with deck data
    // typically synced before reviewing/testing on a deck
    static getSyncedDeckProgressDataWithDeckData(deckProgressData: DeckProgressData, deckData: DeckData): DeckProgressData {
        return {
            cardsStats: deckData.cards.map(c => {
                const stats = deckProgressData.cardsStats.find(s => s.cardId === c.id);
                return stats ?? DeckService.getDefaultCardStats(c.id);
            })
        };
    }


    // suggest random cards from deck
    static suggestRandomCards(cards: FlashCard[], excludeIds: number[], count: number): FlashCard[] {
        if (cards.length === 0 || count <= 0) return [];

        // filter out excluded cards
        const available = cards.filter(c => !excludeIds.includes(c.id));
        if (available.length === 0) return [];

        // shuffle available cards
        const shuffled = [...available].sort(() => Math.random() - 0.5);

        // return up to "count" cards
        return shuffled.slice(0, Math.min(count, available.length));
    }

    /**
     * This comment is AI generated
     * Suggests which cards a user should review next using a simplified
     * spaced repetition strategy.
     *
     * The algorithm combines:
     * - Time since last review (longer gaps = higher priority)
     * - Memory decay (scores decrease over time using a half-life model)
     * - Random jitter (avoids same order every time)
     * - Penalty for already-reviewed cards (to encourage variety in sessions)
     *
     * @param cards       List of all flashcards in the deck
     * @param cardsStats  Per-card statistics (score, last viewed timestamp, etc.)
     * @param reviewed    Cards already reviewed in the current session
     * @param count       Number of cards to suggest (default: 1)
     * @returns           Subset of cards ranked by priority
     */
    static suggestCardsForReview(
        cards: FlashCard[],
        cardsStats: FlashCardStats[],
        reviewed: FlashCard[],
        count: number = 1
    ): FlashCard[] {
        if (cards.length === 0) return [];

        // Never request more than available
        count = Math.min(cards.length, count);

        const reviewedSet = new Set(reviewed.map(c => c.id));
        const now = Date.now();
        const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

        // Tunable weights
        const lastViewedWeight = 1;   // boost for time since last viewed
        const scoreWeight = 2;        // penalty for cards user already knows well
        const reviewedPenalty = 2;    // penalty if card already reviewed in session

        /**
         * Decays a card's score over time, simulating memory fade.
         * Uses exponential decay with a half-life of 15 days.
         */
        function decayScore(score: number, lastViewed: number, now: number): number {
            const daysPassed = (now - lastViewed) / (1000 * 60 * 60 * 24);
            const halfLife = 15; // memory strength halves every 15 days
            const factor = Math.pow(0.5, daysPassed / halfLife);
            return score * factor;
        }

        const scored = cards.map(card => {
            const stats =
                cardsStats.find(cs => cs.cardId === card.id) ??
                DeckService.getDefaultCardStats(card.id);

            const lastViewed = stats.lastViewed ?? 0;
            const timeSinceViewed = Math.max(0, now - lastViewed);

            // Normalize time → scale from 1 (recent) to 5 (over a month ago)
            let normalizedTime = 1 + (timeSinceViewed / oneMonthMs) * 4;
            normalizedTime = Math.min(5, Math.max(1, normalizedTime));

            // Apply decay to knowledge score
            const rawScore = stats.score ?? 0;
            const decayedScore = decayScore(rawScore, lastViewed, now);

            // Add slight randomness so reviews aren't too deterministic
            const randomJitter = (Math.random() - 0.5) * 0.5;

            // Compute priority: higher = more likely to be chosen
            let priority =
                normalizedTime * lastViewedWeight -
                decayedScore * scoreWeight +
                randomJitter;

            // Penalize if already reviewed this session
            if (reviewedSet.has(card.id)) {
                priority -= reviewedPenalty;
            }

            return { card, priority };
        });

        // Sort descending by priority and return top N cards
        scored.sort((a, b) => b.priority - a.priority);

        return scored.slice(0, count).map(s => s.card);
    }

    static inferCardStatusLabelFromScore(score: number): CardStatusType {
        if (score <= -1) return "very bad";           // -2 -> -1
        if (score > -1 && score < 0) return "bad";    // -1 -> 0 (exclusive)
        if (score === 0) return "neutral";            // exactly 0
        if (score > 0 && score < 1) return "good";    // 0 -> 1 (exclusive)
        return "very good";                           // 1 -> 2
    }

    static getCardStatusColorFromCardScore(score: number): string {
        const label = this.inferCardStatusLabelFromScore(score);

        switch (label) {
            case "very bad": return "#e74c3c"; // red
            case "bad": return "#e67e22";      // orange
            case "neutral": return "#95a5a6";  // gray
            case "good": return "#2ecc71";     // light green
            case "very good": return "#27ae60"; // dark green
            default: return "#000000";         // fallback black
        }
    }

    // helper to get cards stats from progress data by card id
    static getCardStatsFromProgress(cardId: number, progress: DeckProgressData): FlashCardStats {
        return progress.cardsStats.find(s => s.cardId === cardId) ?? DeckService.getDefaultCardStats(cardId);
    }

}