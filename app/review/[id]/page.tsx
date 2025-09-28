import DeckReviewClientPage from '@/components/clientPages/reviewPage/DeckReviewClientPage'
import DeckService from '@/services/systems/deckService';
import { DeckModel } from '@/types/models';
import React from 'react'

async function ReviewPage({params}: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;
    const deck: DeckModel = DeckService.makeNewDeckInstance({}, 30);

    return (
        <DeckReviewClientPage deck={deck} />
    )

}

export default ReviewPage