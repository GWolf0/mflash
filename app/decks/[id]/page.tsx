import DeckClientPage from '@/components/clientPages/DeckClientPage'
import React from 'react'

async function DecksPage({params}: {
    params: { id: string }
}) {
    // retreive deck and user

    return (
        <DeckClientPage />
    )

}

export default DecksPage