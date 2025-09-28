import { DOE } from "@/types/common";
import { DeckData } from "@/types/deck";
import { DeckModel, DeckProgressModel } from "@/types/models";
import { requestUpdateDeckProgress } from "../requests/deckProgressRequests";
import { requestUpdateDeck } from "../requests/deckRequests";

export default class SaveService {

    // save full deck doc
    static async saveDeck(deck: DeckModel): Promise<DOE<DeckModel>> {
        return await requestUpdateDeck(deck.id, deck);
    }

    // save deck data only
    static async saveDeckDataOnly(deckId: string, deckData: DeckData): Promise<DOE<DeckModel>> {
        return await requestUpdateDeck(deckId, { data: deckData, });
    }

    // save deck non-data only (without data field)
    static async saveDeckNonData(deckId: string, deck: DeckModel): Promise<DOE<DeckModel>> {
        // omit data field
        const { data, ...deckWithoutData } = deck as DeckModel;

        return await requestUpdateDeck(deckId, { ...deckWithoutData, });
    }

    // save deck progress
    static async saveDeckProgress(deckProgress: DeckProgressModel): Promise<DOE<DeckProgressModel>> {
        return await requestUpdateDeckProgress(deckProgress.id, deckProgress);
    }
}