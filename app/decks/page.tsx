import DecksPageDeleteDeckButton from '@/components/cardsAndDecks/DecksPageDeleteDeckButton';
import DecksPageNewDeckButton from '@/components/cardsAndDecks/DecksPageNewDeckButton';
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import limitsConstants from '@/constants/limitsConstants';
import { strTruncate } from '@/helpers/formatingHelper';
import { requestAuthUser } from '@/services/requests/authRequests';
import { requestUserDecks } from '@/services/requests/userRequests';
import AuthService from '@/services/systems/authService';
import DeckService from '@/services/systems/deckService'
import { DOE, MRenderError } from '@/types/common';
import { AuthUser, DeckModel } from '@/types/models'
import Link from 'next/link';
import React from 'react'

async function DecksPage() {
    // get auth user and decks

    const authUserDoe: DOE<AuthUser> = await requestAuthUser();
    if (!authUserDoe.data) throw new MRenderError(`Error fetching auth user`, {allowRetry: false});

    const authUser: AuthUser = authUserDoe.data;

    const decksDoe: DOE<DeckModel[]> = await requestUserDecks(authUser.id, authUser.id);
    const decks: DeckModel[] = decksDoe.data ?? [];
    // const decks: DeckModel[] = Array(3).fill(null).map((_, i) => DeckService.makeNewDeckInstance({}, 30));

    return (
        <MainLayout innerClasses='flex flex-col gap-8' authUser={authUserDoe.data}>

            {/* // top bar */}
            <section className='w-full flex items-center px-2 py-2 rounded border gap-2'>
                <p className='mr-auto'>Decks ({decks.length})</p>

                <DecksPageNewDeckButton decksCount={decks.length} authUserId={authUser.id} />
            </section>

            {/* // table of decks */}
            <section className='w-full flex flex-col gap-8'>
                {decks.length > 0 ?
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
                                                {strTruncate(d.title, 48)}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {d.created_at.toISOString().substring(0, 10)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {d.is_private ? "Private" : "Public"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <DecksPageDeleteDeckButton deckId={d.id} authUserId={authUser.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    :
                    <>
                        <p>No decks.</p>
                    </>
                }
            </section>

        </MainLayout>
    )

}

export default DecksPage