import DeckTestClientPage from '@/components/clientPages/testPage/DeckTestClientPage';
import DeckService from '@/services/systems/deckService';
import { DeckModel } from '@/types/models';
import React from 'react'

async function DeckTestPage({params}: {
    params: Promise<{id: string}>
}) {
    const { id } = await params;
    const deck: DeckModel = DeckService.makeNewDeckInstance({}, 30);

    return (
        <DeckTestClientPage deck={deck} />
    )

}

export default DeckTestPage