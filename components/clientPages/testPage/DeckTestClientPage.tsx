"use client"

import CardComp from '@/components/cardsAndDecks/CardComp';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MSelect from '@/components/ui/MSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CARD_MAX_SCORE, MIN_CARDS_FOR_REVIEW } from '@/constants/deckConstants';
import { shuffleArray } from '@/helpers/dataHelper';
import { strTruncate } from '@/helpers/formatingHelper';
import DeckService from '@/services/systems/deckService';
import SaveService from '@/services/systems/saveService';
import { DeckData, DeckProgressData, FlashCard, FlashCardStats } from '@/types/deck';
import { AuthUser, DeckModel, DeckProgressModel, DeckWithRelations, UserModel } from '@/types/models';
import { LoaderCircleIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

function DeckTestClientPage({ deckWithRelations, authUser }: {
    deckWithRelations: DeckWithRelations, authUser: AuthUser,
}) {
    const deck: DeckModel = deckWithRelations.deck;
    const deckOwner: UserModel = deckWithRelations.user!;
    const [progress, setProgress] = useState<DeckProgressModel>({...deckWithRelations.progress!, data: DeckService.getSyncedDeckProgressDataWithDeckData(deckWithRelations.progress!.data, deck.data)});

    const [screen, setScreen] = useState<"start" | "main" | "end">("start");
    const [options, setOptions] = useState<DeckTestOptions>(DEFAULT_DECK_TEST_OPTIONS);
    const [reviewed, setReviewed] = useState<FlashCard[]>([]);
    const [mistakes, setMistakes] = useState<number[]>([]); // mistakes: ids of cards answered incorrectly
    const [score, setScore] = useState<number>(0);
    const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);
    const [progressSavedSuccess, setProgressSavedSuccess] = useState<boolean>(true);

    // render fns
    function renderSavingIndicator(): React.ReactNode {
        return (
            <div className='fixed bottom-0 right-0 py-4 px-8 bg-background text-foreground flex items-center gap-4'>
                <p className='text-xs md:text-sm'>
                    <LoaderCircleIcon className='animate-spin' />
                    Saving
                </p>
            </div>
        )
    }

    // options received from start screen
    function onReceiveOptions(options: DeckTestOptions) {
        if (isSavingProgress) return;

        setOptions(options);
        setScreen("main");
    }

    // on review ended
    async function onTestEnded(_reviewed: FlashCard[], _mistakes: number[], _score: number) {
        setReviewed(_reviewed);
        setMistakes(_mistakes);
        setScore(_score);
        setScreen("end");

        if (isSavingProgress) return;
        setIsSavingProgress(true);

        // update deck with new data
        const updatedProgressData: DeckProgressData = updateCardsStatsAndGetUpdatedDeckData(_reviewed, _mistakes);
        const updatedProgress: DeckProgressModel = { ...progress, data: updatedProgressData };
        setProgress(updatedProgress);

        // request update
        const doe = await SaveService.saveDeckProgress(updatedProgress, authUser?.id ?? "");
        if (!doe.data) {
            toast(`Error saving progress data`);
            setProgressSavedSuccess(false);
        } else {
            setProgressSavedSuccess(true);
        }

        setIsSavingProgress(false);
    }

    // on request restart
    function onRequestRestart() {
        if (isSavingProgress) return;

        setScreen("start");
        setReviewed([]);
        setMistakes([]);
        setScore(0);
    }

    // update reviewed cards stats
    function updateCardsStatsAndGetUpdatedDeckData(reviewedCards: FlashCard[], mistakeIds: number[]): DeckProgressData {
        // setup reviewed cards updated stats
        const newCardsStats: FlashCardStats[] = reviewedCards.map((c) => {
            const wasWrong: boolean = mistakeIds.includes(c.id);
            const incrementStep = CARD_MAX_SCORE / 4;
            const stats: FlashCardStats | undefined = progress.data.cardsStats.find(s => s.cardId === c.id);
            if (stats) {
                return {
                    ...stats,
                    lastViewed: Date.now(),
                    score: Math.min(CARD_MAX_SCORE, Math.max(-CARD_MAX_SCORE, stats.score + (wasWrong ? -incrementStep : incrementStep)))
                }
            } else {
                return DeckService.getDefaultCardStats(c.id)
            }
        });

        const reviewedMap = new Map(newCardsStats.map(s => [s.cardId, s]));
        return {
            cardsStats: progress.data.cardsStats.map(s => reviewedMap.get(s.cardId) ?? s)
        };
    }

    // render screen
    function renderScreen(): React.ReactNode {
        switch (screen) {
            case "start": return <DeckTestStartScreen deck={deck} onConfirmOptions={onReceiveOptions} deckOwner={deckOwner} />;
            case "main": return <DeckTestMainScreen deck={deck} options={options} progress={progress} onTestEnded={onTestEnded} onRestart={onRequestRestart} />;
            case "end": return <DeckTestEndScreen reviewed={reviewed} mistakes={mistakes} score={score} onRestart={onRequestRestart} progressSavedSuccess={progressSavedSuccess} />;
        }
    }

    return (
        <MainLayout authUser={authUser}>

            {renderScreen()}

            {isSavingProgress && renderSavingIndicator()}

        </MainLayout>
    )

}

export default DeckTestClientPage;

// start screen
function DeckTestStartScreen({ deck, onConfirmOptions, deckOwner }: {
    deck: DeckModel, onConfirmOptions: (options: DeckTestOptions) => any, deckOwner: UserModel,
}): React.ReactNode {

    function canStart(): boolean {
        return deck.data.cards.length >= MIN_CARDS_FOR_REVIEW;
    }

    function onSubmitOptionsForm(e: React.FormEvent) {
        e.preventDefault();
        if (!canStart()) return;

        const fd: FormData = new FormData(e.currentTarget as HTMLFormElement);

        const cardsCount = Number(fd.get("cardsCount")!.toString());
        const direction = fd.get("direction")!.toString();

        const options: DeckTestOptions = { cardsCount, direction: (direction as "ftb" | "btf") };
        onConfirmOptions(options);
    }

    return (
        <main className='w-full min-h-screen flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
                <h1 className='underline'>Test: {strTruncate(deck.title, 48)}</h1>
                <p className='text-sm'>by {deckOwner.name ?? "No Name"}</p>
            </div>

            {!canStart() &&
                <p className='text-destructive'>Cannot start test, minimum cards required ({MIN_CARDS_FOR_REVIEW})</p>
            }

            {/* // options form */}
            <form className='w-full flex flex-col gap-4' onSubmit={onSubmitOptionsForm}>
                <div className='flex flex-col gap-2'>
                    <Label className='text-sm'>Cards Count</Label>
                    <MSelect
                        items={[10, 20, 30, 40, 50].map(num => ({ label: String(num), value: num }))}
                        name="cardsCount"
                        defaultValue={DEFAULT_DECK_TEST_OPTIONS.cardsCount}
                        placeholder='cards count'
                        props={{ required: true }}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label className='text-sm'>Direction</Label>
                    <MSelect
                        items={[
                            { label: "front to back", value: "ftb" },
                            { label: "back to front", value: "btf" },
                        ].map(it => ({ label: it.label, value: it.value }))}
                        name="direction"
                        defaultValue={DEFAULT_DECK_TEST_OPTIONS.direction}
                        placeholder='direction'
                        props={{ required: true }}
                    />
                </div>

                <div className='flex items-center justify-end'>
                    <Button type='submit' disabled={!canStart()}>Confirm</Button>
                </div>
            </form>
        </main>
    )

}

// Deck main screen
function DeckTestMainScreen({
    deck, options, progress, onTestEnded, onRestart,
}: {
    deck: DeckModel, options: DeckTestOptions, progress: DeckProgressModel,
    onTestEnded: (reviewed: FlashCard[], mistakes: number[], score: number) => any, onRestart: () => any,
}): React.ReactNode {
    const [reviewed, setReviewed] = useState<FlashCard[]>([]);
    const [curCard, setCurCard] = useState<FlashCard>(DeckService.makeNewCardInstance({}));
    const [curCardsOptions, setCurCardsOptions] = useState<FlashCard[]>([]);
    const [mistakes, setMistakes] = useState<number[]>([]); // mistakes as cards ids
    const [score, setScore] = useState<number>(0);
    const [answerFeedbackPause, setAnswerFeedbackPause] = useState<boolean>(false);// phase to pause to show user's answer feedback

    const lastUserAnswer = useRef<number>(-1); // track id of the last answer(card id)

    useEffect(() => {
        newTestData();
    }, []);

    function newTestData() {
        const nextCard = getNextCard(reviewed);
        const cardOptions = getOptionsCards(nextCard);

        setCurCard(nextCard);
        setCurCardsOptions(cardOptions);
    }

    function getNextCard(reviewedList: FlashCard[]): FlashCard {
        return DeckService.suggestCardsForReview(deck.data.cards, progress.data.cardsStats, reviewedList, 1)[0];
    }

    function getOptionsCards(curCard: FlashCard): FlashCard[] {
        const options = shuffleArray<FlashCard>([...DeckService.suggestRandomCards(deck.data.cards, [curCard.id], 3), { ...curCard }]);
        return options;
    }

    function onCardChoiceBtn(selectedCard: FlashCard) {
        if (answerFeedbackPause) return;

        const newReviewed = [...reviewed, curCard];
        const correct = curCard.id === selectedCard.id;
        const newMistakes = correct ? mistakes : [...mistakes, curCard.id];
        const newScore = score + (correct ? 1 : 0);

        lastUserAnswer.current = selectedCard.id;

        setReviewed(newReviewed);
        if (!correct) setMistakes(newMistakes);

        if (hasEnded(newReviewed)) {
            onEnd(newReviewed, newMistakes, newScore);
        } else {
            setAnswerFeedbackPause(true);
            setScore(newScore);

            setTimeout(() => {
                newTestData();
                setAnswerFeedbackPause(false);
            }, 2000);
        }
    }

    function onEnd(finalTested: FlashCard[], mistakes: number[], score: number) {
        setAnswerFeedbackPause(true);

        setTimeout(() => {
            onTestEnded(finalTested, mistakes, score);
            setAnswerFeedbackPause(false);
        }, 2000);
    }

    function hasEnded(reviewedList: FlashCard[] = reviewed): boolean {
        return reviewedList.length >= options.cardsCount;
    }

    function getChoiceBtnClasses(choiceCard: FlashCard): string {
        if (!answerFeedbackPause) return `bg-foreground text-background`;

        if (choiceCard.id === curCard.id) return `bg-green-500 text-background`; // correct
        if (choiceCard.id === lastUserAnswer.current)
            return `bg-destructive text-background`; // wrong

        return `bg-foreground text-background`;
    }

    return (
        <main className="w-full min-h-screen flex flex-col gap-4">
            {/* top bar */}
            <div className="w-full px-2 py-2 flex items-center gap-2 border rounded">
                <p className='mr-auto'>Tested ({reviewed.length}/{options.cardsCount}) | Score {score}</p>
                <Button onClick={onRestart}>
                    <i className="bi bi-arrow-counterclockwise"></i> Restart
                </Button>
            </div>

            {/* test content */}
            <div className='w-full flex flex-col gap-8 justify-center'>
                {/* // question */}
                <p className='text-center text-3xl font-semibold py-20'>
                    {options.direction === "ftb" ? curCard.frontMainText : curCard.backMainText}
                </p>

                {/* // options */}
                <ul className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4'>
                    {
                        curCardsOptions.map((c, i) => (
                            <li key={i}
                                className={`py-4 rounded-lg ${getChoiceBtnClasses(c)} text-center hover:opacity-70 cursor-pointer`}
                                onClick={() => onCardChoiceBtn(c)}
                            >
                                {options.direction === "ftb" ? c.backMainText : c.frontMainText}
                            </li>
                        ))
                    }
                </ul>
            </div>

        </main>
    );
}

// end screen
function DeckTestEndScreen({ reviewed, onRestart, mistakes, score, progressSavedSuccess }: {
    reviewed: FlashCard[], onRestart: () => any, mistakes: number[], score: number, progressSavedSuccess: boolean,
}): React.ReactNode {

    return (
        <main className='w-full min-h-screen flex flex-col gap-8 items-center'>
            <p className='text-4xl'>Test Ended ({reviewed.length})</p>

            <p className='text-3xl'>Score: {score}/{reviewed.length}</p>

            <p className={`${!progressSavedSuccess?'text-destructive':'text-foreground'}`}>
                {progressSavedSuccess ?
                    "Progress saved successfully" :
                    "Error saving progress (maybe not logged in)"
                }
            </p>

            <Button onClick={onRestart}>
                <i className='bi bi-arrow-counterclockwise'></i> Restart
            </Button>

            <ul className='w-full flex flex-col'>
                {
                    reviewed.map((c, i) => (
                        <li key={i} className={`${i < reviewed.length - 1 && 'border-b'} ${mistakes.includes(c.id) && 'text-destructive'} w-full text-center py-2 md:text-lg`}>
                            {c.frontMainText} - {c.backMainText}
                        </li>
                    ))
                }
            </ul>
        </main>
    )

}

// types
interface DeckTestOptions {
    cardsCount: number, // total cards to review
    direction: "ftb" | "btf", // front to back or back to front (question -> answer)
}
const DEFAULT_DECK_TEST_OPTIONS: DeckTestOptions = {
    cardsCount: 30, direction: "ftb",
}