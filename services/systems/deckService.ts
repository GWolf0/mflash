import { DECK_CATEGORIES } from "@/constants/deckAndCardsConstants";
import { DeckData, FlashCard } from "@/types/deck";
import { DeckModel } from "@/types/models";
import { ObjectId } from "mongodb";

export default class DeckService {

    // make new deck instance
    static makeNewDeckInstance(params: Partial<Omit<DeckModel, "_id">>): DeckModel {
        return {
            _id: null,
            title: params.title ?? "New Deck",
            description: params.description ?? "No description.",
            category: params.category ?? DECK_CATEGORIES[0],
            is_private: Object.hasOwn(params, "is_private") ? params.is_private! : true,
            data: DeckService.makeNewDeckDataInstance(),
            created_at: new Date(),
            updated_at: new Date(),
            user_id: params.user_id ?? null,
        }
    }

    // make new deck data instance
    static makeNewDeckDataInstance(): DeckData {
        return { cards: [] };
    }

    // make new card instance
    static makeNewCardInstance(params: Partial<FlashCard>, deckCards: FlashCard[]): FlashCard {
        // find new id
        const highestId: number | undefined = deckCards.map(card => card.id).toSorted().pop();
        const newId: number = highestId != undefined ? highestId + 1 : 1;
        
        return {
            id: newId,
            frontMainText: params.frontMainText ?? "",
            frontSecondaryText: params.frontSecondaryText ?? "",
            backMainText: params.backMainText ?? "",
            backSecondaryText: params.backSecondaryText ?? "",
            backExtraText: params.backExtraText ?? "",
            stats: params.stats ?? { score: 0, lastViewed: null, enabled: true }
        }
    }

}