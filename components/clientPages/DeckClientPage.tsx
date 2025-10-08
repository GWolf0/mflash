"use client"

import CardComp from '@/components/cardsAndDecks/CardComp';
import CardEditor from '@/components/cardsAndDecks/CardEditor';
import DeckInfoEditor from '@/components/cardsAndDecks/DeckInfoEditor';
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { strTruncate } from '@/helpers/formatingHelper';
import DeckService from '@/services/systems/deckService'
import SaveService from '@/services/systems/saveService';
import { DOE } from '@/types/common';
import { FlashCard } from '@/types/deck';
import { AuthUser, DeckModel, DeckProgressModel, DeckWithRelations, UserModel } from '@/types/models';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner';

function DeckClientPage({ deckWithRelations, authUser }: {
    deckWithRelations: DeckWithRelations, authUser: AuthUser,
}) {
    // refs
    const isFirstRenderData = useRef(true);
    const isFirstRenderNonData = useRef(true);

    // states and memos
    const [deck, setDeck] = useState<DeckModel>(deckWithRelations.deck);
    const deckOwner: UserModel = useMemo(() => deckWithRelations.user!, [deckWithRelations]);
    const [deckProgress, setDeckProgress] = useState<DeckProgressModel>(deckWithRelations.progress!);
    const cards = useMemo(() => deck.data.cards, [deck]);

    const nonDataFields = useMemo(() => {
        const { data, ...rest } = deck;
        return rest;
    }, [deck]);

    const [isNonDataSaved, setIsNonDataSaved] = useState<boolean>(true); // track only non data changes
    const [isDataSaved, setIsDataSaved] = useState<boolean>(true); // track only data changes
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const isSaved = useMemo<boolean>(() => isDataSaved && isNonDataSaved, [isDataSaved, isNonDataSaved]);

    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedCardIds, setSelectedCardsIds] = useState<number[]>([]);
    const [cardEditorState, setCardEditorState] = useState<{ isOpen: boolean, cardId?: number }>({ isOpen: false });
    const [deckInfoEditorOn, setDeckInfoEditorOn] = useState<boolean>(false);

    // effects
    // saving effect (track deck change) for non data & data only
    useEffect(() => {
        if (isFirstRenderData.current) isFirstRenderData.current = false;
        else setIsDataSaved(false);
    }, [deck.data]);

    useEffect(() => {
        if (isFirstRenderNonData.current) isFirstRenderNonData.current = false;
        else setIsNonDataSaved(false);
    }, [nonDataFields]);

    // effect for syncing deck progress data with current cards
    // (deck progress is not saved in this page!, this sync is just for convenience)
    useEffect(() => {
        const syncedProgressData = DeckService.getSyncedDeckProgressDataWithDeckData(deckProgress.data, deck.data);
        setDeckProgress(prev => ({...prev, data: syncedProgressData}));
    }, [deck.data.cards]);

    // render fns
    function renderDefaultToolbar(): React.ReactNode {
        return (
            <>
                <p className='text-sm mr-auto font-semibold'>
                    Cards ({cards.length})
                </p>

                <Button onClick={() => setEditMode(true)} title='edit mode' disabled={cards.length===0}>
                    <i className='bi bi-check2'></i> <p className='hidden md:block'>Edit Mode</p>
                </Button>

                <Button title='new card' onClick={() => setCardEditorState({ isOpen: true })}>
                    <i className='bi bi-plus-lg'></i> <p className='hidden md:block'>New Card</p>
                </Button>
            </>
        )
    }

    function renderEditModeToolbar(): React.ReactNode {
        return (
            <>
                <p className='text-sm mr-auto font-semibold'>
                    Selected cards ({selectedCardIds.length})
                </p>

                <Button onClick={() => { setEditMode(false); setSelectedCardsIds([]); }} title='cancel edit mode'>
                    <i className='bi bi-x-lg'></i> <p className='hidden md:block'>Cancel Edit Mode</p>
                </Button>

                {renderEditModeDropdownOptions()}
            </>
        )
    }

    function renderEditModeDropdownOptions(): React.ReactNode {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger><i className='bi bi-three-dots-vertical'></i></DropdownMenuTrigger>
                <DropdownMenuContent align='end' sideOffset={14}>
                    {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                    <DropdownMenuItem onClick={() => onSelectedCardsAction("select-all")}>Select All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSelectedCardsAction("deselect-all")}>Deselect All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSelectedCardsAction("delete")}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    function renderCardEditorModal() {
        return (
            <Dialog open={cardEditorState.isOpen} onOpenChange={(open: boolean) => setCardEditorState(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Card Editor</DialogTitle>
                    </DialogHeader>
                    <CardEditor card={cards.find(c => c.id === cardEditorState.cardId)} deckData={deck.data} onCardData={onCardData} />
                </DialogContent>
            </Dialog>
        )
    }
    function renderDeckInfoEditorModal() {
        return (
            <Dialog open={deckInfoEditorOn} onOpenChange={(open: boolean) => setDeckInfoEditorOn(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deck Editor</DialogTitle>
                    </DialogHeader>
                    <DeckInfoEditor deck={deck} onDeckData={onDeckData} />
                </DialogContent>
            </Dialog>
        )
    }

    // actions fns
    function onClickOnCard(card: FlashCard) {
        // handle selection mode
        if (editMode) {
            if (selectedCardIds.includes(card.id)) setSelectedCardsIds(prev => prev.filter(id => card.id !== id));
            else setSelectedCardsIds(prev => [...prev, card.id]);
        }
    }

    function onSelectedCardsAction(action: "select-all" | "deselect-all" | "delete") {
        switch (action) {
            case "select-all":
                setSelectedCardsIds(cards.map(c => c.id));
                break;
            case "deselect-all":
                setSelectedCardsIds([]);
                break;
            case "delete":
                if (confirm(`Confirm delete selected card(s)? Irreversible!`)) {
                    setDeck(prev => ({
                        ...prev, data: {
                            ...prev.data, cards: prev.data.cards.filter((c, i) => {
                                return !selectedCardIds.includes(c.id);
                            })
                        }
                    }));
                }
                break;
        }
    }

    function onCardEditBtn(cardId: number) {
        setCardEditorState({ isOpen: true, cardId });
    }

    function onCardDeleteBtn(cardId: number) {
        if (!confirm(`Confirm delete card?`)) return;

        setDeck(prev => ({ ...prev, data: { ...prev.data, cards: prev.data.cards.filter(c => c.id !== cardId) } }));
    }

    // received deck info
    function onDeckData(deckData: DeckModel) {
        const { data, ...rest } = deckData;

        setDeck(prev => ({ ...prev, ...rest }));
        setTimeout(() => onSave(), 2000);
    }

    // received new or updated card data
    function onCardData(cardData: FlashCard) {
        if (cardEditorState.cardId) { // edit
            setDeck(prev => ({
                ...prev, data: {
                    ...prev.data, cards: prev.data.cards.map(c => {
                        if (c.id === cardEditorState.cardId) {
                            return { ...cardData };
                        }
                        return c;
                    })
                }
            }));
        } else { // new card
            setDeck(prev => ({ ...prev, data: { ...prev.data, cards: [...prev.data.cards, { ...cardData }], lastId: prev.data.lastId + 1 } }));
        }
    }

    async function onSave() {
        setIsSaving(true);

        if (!isDataSaved) {
            const res: DOE<DeckModel> = await SaveService.saveDeckDataOnly(deck.id, deck.data, authUser?.id);
            if (res.error) {
                toast(`Error saving deck data`);
            }
            setIsDataSaved(!res.error);
        }
        if (!isNonDataSaved) {
            const res: DOE<DeckModel> = await SaveService.saveDeckNonData(deck.id, deck, authUser?.id);
            if (res.error) {
                toast(`Error saving deck info`);
            }
            setIsNonDataSaved(!res.error);
        }

        setIsSaving(false);
    }

    return (
        <MainLayout innerClasses='flex flex-col gap-4 md:gap-8' authUser={authUser}>
            {/* // Top bar */}
            <section className='flex gap-2 items-center bg-secondary px-2 md:px-4 py-4 rounded'>
                <div className='flex flex-col gap-1 justify-start items-start'>
                    {/* // click on the deck title enable editing of project fields */}
                    <p className='text-sm mr-auto font-semibold hover:underline hover:cursor-default hover:opacity-70'
                        title="edit"
                        onClick={() => setDeckInfoEditorOn(true)}
                    >
                        <i className='bi bi-pencil-fill mr-2 text-xs'></i>
                        {strTruncate(deck.title, 32)}
                    </p>

                    <p className='text-xs'>
                        by {deckOwner.name??"Undefined"}, at {deck.created_at.toISOString().substring(0, 10)} <br />
                        last update {deck.updated_at.toISOString().substring(0, 10)}
                    </p>

                    {/* <Button size={"sm"} variant={"outline"} className='mx-0 scale-75'>Edit</Button> */}
                </div>

                <div className='mr-auto'></div>

                <Button asChild disabled={!isSaved} title='review'>
                    <Link href={`/review/${deck.id}`} target='_blank'>
                        <i className='bi bi-eyeglasses'></i> <p className='hidden md:block'>Review</p>
                    </Link>
                </Button>
                <Button asChild disabled={!isSaved} title='test'>
                    <Link href={`/test/${deck.id}`} target='_blank'>
                        <i className='bi bi-play-fill'></i> <p className='hidden md:block'>Test</p>
                    </Link>
                </Button>

                <Button variant={isSaved ? "default" : "outline"} disabled={isSaved} title='save' onClick={onSave}>
                    {
                        isSaving ?
                            <LoaderCircle className='animate-spin' /> :
                            <>
                                <i className='bi bi-save'></i> <p className='hidden md:block'>Save ({isSaved ? "saved" : "not saved"})</p>
                            </>
                    }
                </Button>
            </section>

            {/* // Toolbar */}
            <section className='flex gap-2 items-center bg-secondary px-2 md:px-4 py-4 rounded'>
                {
                    editMode ? renderEditModeToolbar() : renderDefaultToolbar()
                }
            </section>

            {/* // Cards grid */}
            <main className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4'>
                {cards.length > 0 ?
                    cards.map((card, i) => (
                        <CardComp
                            key={card.id}
                            card={card}
                            stats={DeckService.getCardStatsFromProgress(card.id, deckProgress.data)}
                            editMode={editMode}
                            onClick={() => onClickOnCard(card)}
                            onRequestEdit={onCardEditBtn}
                            onRequestDelete={onCardDeleteBtn}
                            isSelected={selectedCardIds.includes(card.id)}
                        />
                    )) :
                    (
                        <p className=''>No cards</p>
                    )
                }
            </main>

            {/* // Deck editor */}
            {renderDeckInfoEditorModal()}

            {/* // Card editor */}
            {renderCardEditorModal()}

        </MainLayout>
    )

}

export default DeckClientPage