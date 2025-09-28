import DecksPageDeleteDeckButton from '@/components/cardsAndDecks/DecksPageDeleteDeckButton';
import DecksPageNewDeckButton from '@/components/cardsAndDecks/DecksPageNewDeckButton';
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import limitsConstants from '@/constants/limitsConstants';
import { requestAuthUser } from '@/services/requests/authRequests';
import AuthService from '@/services/systems/authService';
import DeckService from '@/services/systems/deckService'
import { DOE } from '@/types/common';
import { AuthUser, DeckModel } from '@/types/models'
import Link from 'next/link';
import React from 'react'

async function DecksPage() {
    const authUserDoe: DOE<AuthUser> = await requestAuthUser();

    const decks: DeckModel[] = Array(3).fill(null).map((_, i) => DeckService.makeNewDeckInstance({}, 30));



    return (
        <MainLayout innerClasses='flex flex-col gap-8' authUser={authUserDoe.data}>

            {/* // top bar */}
            <section className='w-full flex items-center px-2 py-2 rounded border gap-2'>
                <p className='mr-auto'>Decks ({decks.length})</p>

                <DecksPageNewDeckButton />
            </section>

            {/* // table of decks */}
            <section className='w-full'>
                <Table>
                    <TableCaption>List of decks ({decks.length}/{limitsConstants.maxDecks})</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="">Title</TableHead>
                            <TableHead className="">Created At</TableHead>
                            <TableHead className="">Is Private</TableHead>
                            <TableHead className="">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            decks.map((d, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">
                                        <Link className='block underline hover:opacity-70' href={`/decks/${d.id}`} target='_blank'>
                                            {d.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {d.created_at.toISOString().substring(0, 10)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {d.is_private ? "Private" : "Public"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <DecksPageDeleteDeckButton />
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </section>

        </MainLayout>
    )

}

export default DecksPage