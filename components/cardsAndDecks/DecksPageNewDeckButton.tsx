"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import limitsConstants from '@/constants/limitsConstants'
import MForm from '../ui/MForm'
import { DOE, JSONType } from '@/types/common'
import { VALIDATION_DECK_CREATE, VALIDATION_DECK_PARTIAL } from '@/lib/validations'
import { requestCreateDeck } from '@/services/requests/deckRequests'
import { DeckModel } from '@/types/models'
import DeckService from '@/services/systems/deckService'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DECK_CATEGORIES } from '@/constants/deckConstants'

function DecksPageNewDeckButton({ decksCount, authUserId }: {
    decksCount: number, authUserId: string
}) {
    const router = useRouter();

    function canCreateNewDeck(): boolean {
        return decksCount < limitsConstants.maxDecks;
    }

    async function onAttemptCreatingNewDeck(json: JSONType): Promise<DOE> {
        if (!canCreateNewDeck()) return { error: { message: `Cannot create new deck (maximum decks count reached)` } };

        const deck: Omit<DeckModel, "id"> = {
            title: json.title,
            category: json.category,
            is_private: json.is_private,
            user_id: authUserId,
            created_at: new Date(),
            updated_at: new Date(),
            data: DeckService.makeNewDeckDataInstance(0),
        }
        const doe: DOE<DeckModel> = await requestCreateDeck(deck, authUserId);

        if (!doe.data) {
            toast(`Error trying to create new deck`);
        } else {
            const deckId = doe.data.id;
            router.push(`/decks/${deckId}`);
        }

        return doe;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={!canCreateNewDeck()}>
                    <i className='bi bi-plus-lg'></i> New Deck
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Deck</DialogTitle>
                </DialogHeader>

                <section className='w-full'>
                    {
                        canCreateNewDeck() ?
                            (
                                <MForm
                                    formDef={{
                                        id: "new-deck-form",
                                        items: [
                                            { name: "title", type: "text", inputProps: { required: true, maxLength: 256 } },
                                            { name: "description", type: "text-lg", inputProps: { maxLength: 256 } },
                                            { name: "category", type: "options", meta: { options: DECK_CATEGORIES.map(c => ({ label: c, value: c })) }, inputProps: { required: true } },
                                            { name: "is_private", type: "checkbox" }
                                        ],
                                        onJson: onAttemptCreatingNewDeck,
                                        validations: VALIDATION_DECK_PARTIAL,
                                    }}
                                />
                            ) :
                            (
                                <p>Cannot create new deck (maximum decks count reached {limitsConstants.maxDecks})</p>
                            )
                    }
                </section>
            </DialogContent>
        </Dialog>
    )

}

export default DecksPageNewDeckButton