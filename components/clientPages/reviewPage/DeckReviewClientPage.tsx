"use client"

import CardComp from '@/components/cardsAndDecks/CardComp';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MSelect from '@/components/ui/MSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DeckService from '@/services/systems/deckService';
import { FlashCard } from '@/types/deck';
import { DeckModel } from '@/types/models';
import React, { useEffect, useState } from 'react'

function DeckReviewClientPage({ deck }: {
    deck: DeckModel
}) {
    const [screen, setScreen] = useState<"start" | "main" | "end">("start");
    const [options, setOptions] = useState<DeckReviewOptions>(DEFAULT_DECK_REVIEW_OPTIONS);
    const [reviewed, setReviewed] = useState<FlashCard[]>([]);

    // options received from start screen
    function onReceiveOptions(options: DeckReviewOptions) {
        setOptions(options);
        setScreen("main");
    }

    // on review ended
    function onReviewEnded(reviewed: FlashCard[]) {
        setReviewed(reviewed);
        setScreen("end");
    }

    // on request restart
    function onRequestRestart() {
        setScreen("start");
    }

    // render screen
    function renderScreen(): React.ReactNode {
        switch (screen) {
            case "start": return <DeckReviewStartScreen deck={deck} onConfirmOptions={onReceiveOptions} />;
            case "main": return <DeckReviewMainScreen deck={deck} options={options} onReviewEnded={onReviewEnded} onRestart={onRequestRestart} />;
            case "end": return <DeckReviewEndScreen reviewed={reviewed} onRestart={onRequestRestart} />;
        }
    }

    return (
        <MainLayout>

            {renderScreen()}

        </MainLayout>
    )

}

export default DeckReviewClientPage;

// start screen
function DeckReviewStartScreen({ deck, onConfirmOptions }: {
    deck: DeckModel, onConfirmOptions: (options: DeckReviewOptions) => any,
}): React.ReactNode {

    function onSubmitOptionsForm(e: React.FormEvent) {
        e.preventDefault();
        const fd: FormData = new FormData(e.currentTarget as HTMLFormElement);

        const cardsCount = Number(fd.get("cardsCount")!.toString());
        const cardsPerView = Number(fd.get("cardsPerView")!.toString());

        const options: DeckReviewOptions = { cardsCount, cardsPerView };
        onConfirmOptions(options);
    }

    return (
        <main className='w-full min-h-screen flex flex-col gap-8'>
            <h1 className='underline'>Review: {deck.title}</h1>

            {/* // options form */}
            <form className='w-full flex flex-col gap-4' onSubmit={onSubmitOptionsForm}>
                <div className='flex flex-col gap-2'>
                    <Label className='text-sm'>Cards Count</Label>
                    <MSelect
                        items={[10, 20, 30, 40, 50].map(num => ({ label: String(num), value: num }))}
                        name="cardsCount"
                        defaultValue={DEFAULT_DECK_REVIEW_OPTIONS.cardsCount}
                        placeholder='cards count'
                        props={{ required: true }}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label className='text-sm'>Cards Per View</Label>
                    <MSelect
                        items={[1, 2, 3, 4].map(num => ({ label: String(num), value: num }))}
                        name="cardsPerView"
                        defaultValue={DEFAULT_DECK_REVIEW_OPTIONS.cardsPerView}
                        placeholder='cards per view'
                        props={{ required: true }}
                    />
                </div>

                <div className='flex items-center justify-end'>
                    <Button type='submit'>Confirm</Button>
                </div>
            </form>
        </main>
    )

}

// Deck main screen
function DeckReviewMainScreen({
    deck, options, onReviewEnded, onRestart,
}: {
    deck: DeckModel, options: DeckReviewOptions, onReviewEnded: (reviewed: FlashCard[]) => any, onRestart: () => any,
}): React.ReactNode {
    const [reviewed, setReviewed] = useState<FlashCard[]>([]);
    const [curCards, setCurCards] = useState<FlashCard[]>([]);

    useEffect(() => {
        setCurCards(getNextCards(reviewed));
    }, []);

    function getNextCards(reviewedList: FlashCard[]): FlashCard[] {
        const remaining = options.cardsCount - reviewedList.length;
        const requestCount = Math.min(options.cardsPerView, remaining);
        
        return DeckService.suggestCardsForReview(deck.data.cards, reviewedList, requestCount);
    }

    function onNextBtn() {
        const newReviewed = [...reviewed, ...curCards];

        if (hasEnded(newReviewed)) {
            onEnd(newReviewed);
        } else {
            setReviewed(newReviewed);
            setCurCards(getNextCards(newReviewed));
        }
    }

    function onEnd(finalReviewed: FlashCard[]) {
        onReviewEnded(finalReviewed);
    }

    function hasEnded(reviewedList: FlashCard[] = reviewed): boolean {
        return reviewedList.length >= options.cardsCount;
    }

    return (
        <main className="w-full min-h-screen flex flex-col gap-4" style={{}}>
            {/* top bar */}
            <div className="w-full px-2 py-2 flex items-center gap-2 border rounded">
                <p className='mr-auto'>Reviewed ({reviewed.length}/{options.cardsCount})</p>
                <Button onClick={onRestart}>
                    <i className="bi bi-arrow-counterclockwise"></i> Restart
                </Button>
            </div>

            {/* cards grid */}
            <div
                className={`mx-auto grw grid gap-2 justify-items-center ${options.cardsPerView === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                style={{ width: "min(100%, 420px)" }}
            >
                {curCards.map((c) => (
                    <div key={c.id} style={{ width: "100%" }}>
                        <CardComp card={c} />
                    </div>
                ))}
            </div>

            {/* bottom bar */}
            <div className="w-full px-2 py-2 flex items-center gap-2 justify-end border rounded">
                <Button onClick={onNextBtn}>
                    <i className="bi bi-arrow-right-circle"></i> Next
                </Button>
            </div>
        </main>
    );
}

// end screen
function DeckReviewEndScreen({ reviewed, onRestart }: {
    reviewed: FlashCard[], onRestart: () => any,
}): React.ReactNode {

    return (
        <main className='w-full min-h-screen flex flex-col gap-8 items-center'>
            <p className='text-4xl'>Review Ended ({reviewed.length})</p>

            <Button onClick={onRestart}>
                <i className='bi bi-arrow-counterclockwise'></i> Restart
            </Button>

            <ul className='w-full flex flex-col'>
                {
                    reviewed.map((c, i) => (
                        <li key={i} className={`${i < reviewed.length - 1 && 'border-b'} w-full text-center py-2 md:text-lg`}>
                            {c.frontMainText} - {c.backMainText}
                        </li>
                    ))
                }
            </ul>
        </main>
    )

}

// types
interface DeckReviewOptions {
    cardsCount: number, // total cards to review
    cardsPerView: number, // cards to show at once
}
const DEFAULT_DECK_REVIEW_OPTIONS: DeckReviewOptions = {
    cardsCount: 30, cardsPerView: 4,
}