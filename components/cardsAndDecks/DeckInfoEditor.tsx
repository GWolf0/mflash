import React from 'react'
import MForm from '../ui/MForm'
import { DeckModel } from '@/types/models'
import DeckService from '@/services/systems/deckService';
import { DOE, JSONType } from '@/types/common';
import { DECK_CATEGORIES } from '@/constants/deckAndCardsConstants';
import { VALIDATION_DECK_CREATE, VALIDATION_DECK_PARTIAL } from '@/lib/validations';

function DeckInfoEditor({deck, onDeckData}: {
    deck?: DeckModel, onDeckData: (deck: DeckModel) => any,
}) {
    const mode = deck != undefined ? "edit" : "create";
    const _deck = deck != undefined ? {...deck} : DeckService.makeNewDeckInstance({});

    async function onJson(json: JSONType): Promise<DOE> {
        const deckData: DeckModel = {..._deck, ...json};
        onDeckData(deckData);

        return {data: true, error: null};
    } 

    return (
        <div className='w-full'>
            {/* // form */}
            <MForm 
                formDef={{
                    id: "deck-info-editor",
                    title: mode === "create" ? "New Deck" : "Edit Deck",
                    items: [
                        {name: "title", type: "text"},
                        {name: "description", type: "text-lg"},
                        {name: "category", type: "options", meta: {options: DECK_CATEGORIES.map(cat => ({label: cat, value: cat}))}},
                        {name: "is_private", type: "checkbox"},
                    ],
                    validations: VALIDATION_DECK_PARTIAL,
                    onJson: onJson,
                    options: {
                        submitLabel: mode === "create" ? "Create" : "Edit",
                        showReset: true,
                    },
                    data: _deck
                }}
            />
        </div>
    )

}

export default DeckInfoEditor