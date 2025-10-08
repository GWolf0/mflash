import DeckClientPage from '@/components/clientPages/DeckClientPage'
import { requestAuthUser } from '@/services/requests/authRequests';
import { requestGetDeckById } from '@/services/requests/deckRequests';
import { DOE } from '@/types/common';
import { AuthUser, DeckModel, DeckWithRelations } from '@/types/models';
import React from 'react'
import { MRenderError } from '@/types/common';

async function DecksPage({ params }: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;
    // get auth user and decks

    const authUserDoe: DOE<AuthUser> = await requestAuthUser();
    if (!authUserDoe.data) throw new MRenderError(authUserDoe.error?.message ?? `Error fetching auth user`, {allowRetry: false});

    const authUser: AuthUser = authUserDoe.data;

    const deckDoe: DOE<DeckWithRelations> = await requestGetDeckById(id, authUser.id, ["user", "progress"]);
    if(!deckDoe.data) throw new MRenderError(deckDoe.error?.message ?? `Error fetching deck`, {allowRetry: false});

    const deckWithRelations: DeckWithRelations = deckDoe.data;

    // deny access if auth user is not the owner
    if(deckWithRelations.user!.id !== authUser.id) throw new MRenderError(`Access denied`, {allowRetry: false});

    return (
        <DeckClientPage deckWithRelations={deckWithRelations} authUser={authUser} />
    )

}

export default DecksPage