"use client"

import { FlashCard } from '@/types/deck'
import React, { useMemo } from 'react'
import MForm from '../ui/MForm';
import DeckService from '@/services/systems/deckService';
import { DOE, JSONType } from '@/types/common';
import { VALIDATION_FLASH_CARD_PARTIAL } from '@/lib/validations';

function CardEditor({card, cards, onCardData}: {
    card?: FlashCard, cards: FlashCard[], onCardData: (card: FlashCard) => any,
}) {
    const mode = card != undefined ? "edit" : "create";
    const _card = card != undefined ? {...card} : DeckService.makeNewCardInstance({}, cards);

    async function onJson(json: JSONType): Promise<DOE> {
        const cardData: FlashCard = {..._card, ...json};
        onCardData(cardData);

        return {data: true, error: null};
    } 

    return (
        <div className='w-full'>
            {/* // form */}
            <MForm 
                formDef={{
                    id: "card-editor",
                    title: mode === "create" ? "New Card" : "Edit Card",
                    items: [
                        {name: "frontMainText", type: "text"},
                        {name: "frontSecondaryText", type: "text"},
                        {name: "backMainText", type: "text"},
                        {name: "backSecondaryText", type: "text"},
                        // {name: "backExtraText", type: "text"}
                    ],
                    validations: VALIDATION_FLASH_CARD_PARTIAL,
                    onJson: onJson,
                    options: {
                        submitLabel: mode === "create" ? "Create" : "Edit",
                        showReset: true,
                    },
                    data: _card
                }}
            />
        </div>
    )

}

export default CardEditor