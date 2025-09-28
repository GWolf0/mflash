import { DECK_CATEGORIES } from "@/constants/deckAndCardsConstants";
import { DeckData, DeckProgressData, FlashCard, FlashCardStats } from "@/types/deck";
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
        return { cards: Array(testCards).fill(0).map((_, i) => DeckService.makeNewCardInstance({}, undefined, i + 1)) };
    }

    // make new card instance
    static makeNewCardInstance(params: Partial<FlashCard>, deckCards?: FlashCard[], id?: number): FlashCard {
        // find new id
        const highestId: number | undefined = deckCards?.map(card => card.id).toSorted((a, b) => a - b).pop();
        const newId: number = highestId != undefined ? highestId + 1 : id ? id : -1;

        return {
            id: newId,
            frontMainText: params.frontMainText ?? "Front" + newId,
            frontSecondaryText: params.frontSecondaryText ?? "secondary front",
            backMainText: params.backMainText ?? "Back" + newId,
            backSecondaryText: params.backSecondaryText ?? "secondary back",
            backExtraText: params.backExtraText ?? "",
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

    // suggest cards to review/test
    static suggestCardsForReview(cards: FlashCard[], cardsStats: FlashCardStats[], reviewed: FlashCard[], count: number = 1): FlashCard[] {
        if (cards.length === 0) return [];

        count = Math.min(cards.length, count);

        const reviewedSet = new Set(reviewed.map(c => c.id));

        const now = Date.now();
        const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

        const lastViewedWeight = 1;
        const scoreWeight = 2;
        const reviewedPenalty = 2;

        function decayScore(score: number, lastViewed: number, now: number): number {
            const daysPassed = (now - lastViewed) / (1000 * 60 * 60 * 24);
            const halfLife = 15; // 15 days until memory halves
            const factor = Math.pow(0.5, daysPassed / halfLife);
            return score * factor;
        }

        const scored = cards.map(card => {
            const stats = cardsStats.find(cs => cs.cardId === card.id) ?? DeckService.getDefaultCardStats(card.id);

            const lastViewed = stats.lastViewed ?? 0;
            const timeSinceViewed = Math.max(0, now - lastViewed);

            // Normalize: map [0, oneMonthMs] → [1, 5]
            let normalizedTime = 1 + (timeSinceViewed / oneMonthMs) * 4;
            normalizedTime = Math.min(5, Math.max(1, normalizedTime));

            const rawScore = stats.score ?? 0;
            const decayedScore = decayScore(rawScore, lastViewed, now);

            const randomJitter = (Math.random() - 0.5) * 0.5; // adds slight randomness

            // Higher priority = more relevant
            let priority =
                normalizedTime * lastViewedWeight -
                decayedScore * scoreWeight +
                randomJitter;

            if (reviewedSet.has(card.id)) {
                priority -= reviewedPenalty;
            }

            return { card, priority };
        });

        scored.sort((a, b) => b.priority - a.priority);

        return scored.slice(0, count).map(s => s.card);
    }


}