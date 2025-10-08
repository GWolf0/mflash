"use client"

import React, { useState } from 'react'
import MForm from '../ui/MForm'
import { DeckModel } from '@/types/models'
import DeckService from '@/services/systems/deckService';
import { DOE, JSONType } from '@/types/common';
import { VALIDATION_DECK_CREATE, VALIDATION_DECK_PARTIAL } from '@/lib/validations';
import { DECK_CATEGORIES } from '@/constants/deckConstants';

function DeckInfoEditor({deck, onDeckData}: {
    deck?: DeckModel, onDeckData: (deck: DeckModel) => any,
}) {
    const mode = deck != undefined ? "edit" : "create";
    const _deck = deck != undefined ? {...deck} : DeckService.makeNewDeckInstance({});

    const [justEdited, setJustEdited] = useState<boolean>(false);

    async function onJson(json: JSONType): Promise<DOE> {
        if(justEdited) return {data: true, error: null};

        const deckData: DeckModel = {..._deck, ...json};
        onDeckData(deckData);

        setJustEdited(true);

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