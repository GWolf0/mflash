"use client"

import CardComp from '@/components/cardsAndDecks/CardComp';
import CardEditor from '@/components/cardsAndDecks/CardEditor';
import DeckInfoEditor from '@/components/cardsAndDecks/DeckInfoEditor';
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { strMaxLen } from '@/helpers/formatingHelper';
import DeckService from '@/services/systems/deckService'
import { FlashCard } from '@/types/deck';
import { DeckModel } from '@/types/models';
import React, { useEffect, useMemo, useRef, useState } from 'react'

function DeckClientPage() {
    // refs
    const isFirstRender = useRef<boolean>(true);

    // deck
    const [deck, setDeck] = useState<DeckModel>(DeckService.makeNewDeckInstance({}, 64));

    // memos
    const cards = useMemo(() => deck.data.cards, [deck]);

    // states
    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedCardIds, setSelectedCardsIds] = useState<number[]>([]);
    const [cardEditorState, setCardEditorState] = useState<{isOpen: boolean, cardId?: number}>({isOpen: false});
    const [deckInfoEditorOn, setDeckInfoEditorOn] = useState<boolean>(false);

    // effects
    // saving effect (track deck change)
    useEffect(() => {
        if(isFirstRender.current) isFirstRender.current = false;
        else setIsSaved(false);
    }, [deck]);

    // render fns
    function renderDefaultToolbar(): React.ReactNode {
        return (
            <>
                <p className='text-sm mr-auto font-semibold'>
                    Cards ({cards.length})
                </p>

                <Button onClick={()=>setEditMode(true)} title='edit mode'>
                    <i className='bi bi-check2'></i> <p className='hidden md:block'>Edit Mode</p>
                </Button>

                <Button title='new card' onClick={()=>setCardEditorState({isOpen: true})}>
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

                <Button onClick={()=>{ setEditMode(false); setSelectedCardsIds([]);}} title='cancel edit mode'>
                    <i className='bi bi-x-lg'></i> <p className='hidden md:block'>Cancel Edit Mode</p>
                </Button>

                { renderEditModeDropdownOptions() }
            </>
        )
    }

    function renderEditModeDropdownOptions(): React.ReactNode {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger><i className='bi bi-three-dots-vertical'></i></DropdownMenuTrigger>
                <DropdownMenuContent align='end' sideOffset={14}>
                    {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                    <DropdownMenuItem onClick={()=>onSelectedCardsAction("select-all")}>Select All</DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>onSelectedCardsAction("deselect-all")}>Deselect All</DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>onSelectedCardsAction("enable-selected")}>Enable Selected</DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>onSelectedCardsAction("disable-selected")}>Disable Selected</DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>onSelectedCardsAction("reset-stats")}>Reset Stats</DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>onSelectedCardsAction("delete")}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    function renderCardEditorModal() {
        return (
            <Dialog open={cardEditorState.isOpen} onOpenChange={(open: boolean) => setCardEditorState(prev => ({...prev, isOpen: open}))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Card Editor</DialogTitle>
                    </DialogHeader>
                    <CardEditor card={cards.find(c => c.id === cardEditorState.cardId)} cards={cards} onCardData={onCardData} />
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
        if(editMode) {
            if(selectedCardIds.includes(card.id)) setSelectedCardsIds(prev => prev.filter(id => card.id !== id));
            else setSelectedCardsIds(prev => [...prev, card.id]);
        }
    }

    function onSelectedCardsAction(action: "select-all" | "deselect-all" | "enable-selected" | "disable-selected" | "reset-stats" | "delete") {
        switch(action) {
            case "select-all":
                setSelectedCardsIds(cards.map(c => c.id));
                break;
            case "deselect-all":
                setSelectedCardsIds([]);
                break;
            case "enable-selected":
                setDeck(prev => ({...prev, data: {...prev.data, cards: prev.data.cards.map((c, i) => {
                    if(selectedCardIds.includes(c.id)) {
                        c.stats.enabled = true;
                    }
                    return c;
                })}}));
                break;
            case "disable-selected":
                setDeck(prev => ({...prev, data: {...prev.data, cards: prev.data.cards.map((c, i) => {
                    if(selectedCardIds.includes(c.id)) {
                        c.stats.enabled = false;
                    }
                    return c;
                })}}));
                break;
            case "reset-stats":
                if(confirm(`Confirm reset selected card(s) stats? Irreversible!`)) {
                    setDeck(prev => ({...prev, data: {...prev.data, cards: prev.data.cards.map((c, i) => {
                        if(selectedCardIds.includes(c.id)) {
                            c.stats = DeckService.getDefaultCardStats();
                        }
                        return c;
                    })}}));
                }
                break;
            case "delete":
                if(confirm(`Confirm delete selected card(s)? Irreversible!`)) {
                    setDeck(prev => ({...prev, data: {...prev.data, cards: prev.data.cards.filter((c, i) => {
                        return !selectedCardIds.includes(c.id);
                    })}}));
                }
                break;
        }
    }

    function onCardEditBtn(cardId: number) {
        setCardEditorState({isOpen: true, cardId});
    }

    function onCardDeleteBtn(cardId: number) {
        if(!confirm(`Confirm delete card?`)) return;
    }

    // received deck info
    function onDeckData(deckData: DeckModel) {
        console.log("received deck info data", deckData)
    }

    // received new or updated card data
    function onCardData(cardData: FlashCard) {
        console.log("received card data", cardData)
    }

    async function onSave() {
        setIsSaved(true);
    }

    return (
        <MainLayout innerClasses='flex flex-col gap-4 md:gap-8'>
            {/* // Top bar */}
            <section className='flex gap-2 items-center bg-secondary px-2 md:px-4 py-4 rounded'>
                <div className='flex flex-col gap-1 justify-start items-start'>
                    {/* // click on the deck title enable editing of project fields */}
                    <p className='text-sm mr-auto font-semibold hover:underline hover:cursor-default hover:opacity-70'
                        title="edit"
                        onClick={()=>setDeckInfoEditorOn(true)}
                    >
                        <i className='bi bi-pencil-fill mr-2 text-xs'></i>
                        { strMaxLen(deck.title, 32) }
                    </p>

                    <p className='text-xs'>
                        by author, at {deck.created_at.toISOString().substring(0, 10)} <br />
                        last update {deck.updated_at.toISOString().substring(0, 10)}
                    </p>

                    {/* <Button size={"sm"} variant={"outline"} className='mx-0 scale-75'>Edit</Button> */}
                </div>

                <div className='mr-auto'></div>

                <Button disabled={!isSaved} title='review'>
                    <i className='bi bi-eyeglasses'></i> <p className='hidden md:block'>Review</p>
                </Button>
                <Button disabled={!isSaved} title='test'>
                    <i className='bi bi-play-fill'></i> <p className='hidden md:block'>Test</p>
                </Button>

                <Button variant={isSaved?"default":"outline"} disabled={isSaved} title='save' onClick={onSave}>
                    <i className='bi bi-save'></i> <p className='hidden md:block'>Save ({isSaved ? "saved" : "not saved"})</p>
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
                {
                    cards.map((card, i) => (
                        <CardComp 
                            key={card.id}
                            card={card} 
                            editMode={editMode}
                            onClick={()=>onClickOnCard(card)}
                            onRequestEdit={onCardEditBtn}
                            onRequestDelete={onCardDeleteBtn}
                            isSelected={selectedCardIds.includes(card.id)} 
                        />
                    ))
                }
            </main>

            {/* // Deck editor */}
            { renderDeckInfoEditorModal() }

            {/* // Card editor */}
            { renderCardEditorModal() }

        </MainLayout>
    )

}

export default DeckClientPage