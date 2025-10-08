"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { DOE } from '@/types/common';
import { requestDeleteDeck } from '@/services/requests/deckRequests';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function DecksPageDeleteDeckButton({ deckId, authUserId }: {
    deckId: string, authUserId: string,
}) {
    const router = useRouter();

    const [requestLoading, setRequestLoading] = useState<boolean>(false);

    async function onAttemptDelete() {
        if (requestLoading || !confirm(`Confirm delete deck`)) return;

        setRequestLoading(true);
        const res: DOE = await requestDeleteDeck(deckId, authUserId);

        if (!res.data) {
            toast("Error trying deleting deck");
        } else {
            router.refresh();
        }

        setRequestLoading(false);
    }

    return (
        <Button size={"sm"} variant={"destructive"} title='delete' onClick={onAttemptDelete} disabled={requestLoading}>
            <i className='bi bi-trash'></i>
        </Button>
    )

}

export default DecksPageDeleteDeckButton