/**
 * Save service (main points)
 * - Handling saving to db (decks, decksProgress)
 */

import { DOE } from "@/types/common";
import { DeckData } from "@/types/deck";
import { DeckModel, DeckProgressModel } from "@/types/models";
import { requestUpdateDeckProgress } from "../requests/deckProgressRequests";
import { requestUpdateDeck } from "../requests/deckRequests";

export default class SaveService {

    // save full deck doc
    static async saveDeck(deck: DeckModel, authUserId?: string): Promise<DOE<DeckModel>> {
        if(!authUserId) return {error: {message: `Action unauthorized`}};
        
        return await requestUpdateDeck(deck.id, authUserId, deck);
    }

    // save deck data only
    static async saveDeckDataOnly(deckId: string, deckData: DeckData, authUserId?: string): Promise<DOE<DeckModel>> {
        if(!authUserId) return {error: {message: `Action unauthorized`}};

        return await requestUpdateDeck(deckId, authUserId, { data: deckData, });
    }

    // save deck non-data only (without data field)
    static async saveDeckNonData(deckId: string, deck: DeckModel, authUserId?: string): Promise<DOE<DeckModel>> {
        if(!authUserId) return {error: {message: `Action unauthorized`}};

        // omit data field
        const { data, ...deckWithoutData } = deck as DeckModel;

        return await requestUpdateDeck(deckId, authUserId, { ...deckWithoutData, });
    }

    // save deck progress
    static async saveDeckProgress(deckProgress: DeckProgressModel, authUserId: string): Promise<DOE<DeckProgressModel>> {
        if(!authUserId) return {error: {message: `Action unauthorized`}};
        
        return await requestUpdateDeckProgress(deckProgress.id, deckProgress, authUserId);
    }
}