import DeckReviewClientPage from '@/components/clientPages/reviewPage/DeckReviewClientPage'
import { requestAuthUser } from '@/services/requests/authRequests';
import { requestGetDeckById } from '@/services/requests/deckRequests';
import DeckService from '@/services/systems/deckService';
import { DOE, MRenderError } from '@/types/common';
import { AuthUser, DeckModel, DeckWithRelations } from '@/types/models';
import React from 'react'

async function ReviewPage({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // get auth user and decks

    const authUserDoe: DOE<AuthUser> = await requestAuthUser();
    // if (!authUserDoe.data) throw new MRenderError(authUserDoe.error?.message ?? `Error fetching auth user`, { allowRetry: false });

    const authUser: AuthUser = authUserDoe.data;

    const deckDoe: DOE<DeckWithRelations> = await requestGetDeckById(id, authUser?.id ?? "", ["user", "progress"]);
    if (!deckDoe.data) throw new MRenderError(deckDoe.error?.message ?? `Error fetching deck`, { allowRetry: false });

    const deckWithRelations: DeckWithRelations = deckDoe.data;

    // deny access if deck is private
    if (deckWithRelations.deck.is_private && authUser?.id !== deckWithRelations.deck.user_id) throw new MRenderError(`Access denied, this deck is private`, { allowRetry: false });

    return (
        <DeckReviewClientPage deckWithRelations={deckWithRelations} authUser={authUser} />
    )

}

export default ReviewPage