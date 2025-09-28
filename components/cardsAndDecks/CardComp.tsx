"use client"

import { FlashCard } from '@/types/deck'
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import CardEditor from './CardEditor';

function CardComp({card, editMode, isSelected, onClick, onRequestDelete, onRequestEdit}: {
    card: FlashCard, editMode?: boolean, isSelected?: boolean, onClick?: (e: React.MouseEvent) => any,
    onRequestEdit?: (cardId: number) => any, onRequestDelete?: (cardId: number) => any,
}) {
    // states
    const [isFliped, setIsFliped] = useState<boolean>(false);

    // render fns
    function renderContent(): React.ReactNode {
        return (
            <div 
                className='grow flex flex-col items-center justify-center gap-4 p-2'
            >
                <p className='text-foreground text-2xl font-bold'>
                    {isFliped ? card.backMainText : card.frontMainText}
                </p>

                <p className='text-foreground text-sm font-semibold'>
                    {isFliped ? card.backSecondaryText : card.frontSecondaryText}
                </p>

                {
                    isFliped && card.backExtraText &&
                    <Button>More</Button>
                }
            </div>
        )
    }

    function renderEditTools(): React.ReactNode {
        return (
            <div className='absolute w-full bottom-1 right-1 flex items-center justify-end'>
                <Button className='scale-75' variant={"outline"} size={"sm"} title="remove" onClick={(e) => {e.stopPropagation(); onRequestDelete?.(card.id)}}>
                    <i className='bi bi-trash'></i>
                </Button>

                <Button className='scale-75' variant={"outline"} size={"sm"} title="edit" onClick={(e) => {e.stopPropagation(); onRequestEdit?.(card.id)}}>
                    <i className='bi bi-pen-fill'></i>
                </Button>
            </div>
        )
    }

    function renderInfoIcon(): React.ReactNode {
        return (
            <Popover>
                <PopoverTrigger
                    className={`absolute left-2 top-2 scale-75 bg-background text-foreground border rounded-full px-1 ${!card.stats.enabled&&'opacity-50'}`}
                    onClick={(e)=>e.stopPropagation()}
                >
                    <i className='bi bi-info'></i>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" style={{width: "fit-content"}}>
                    <p className='text-xs'>Score: {card.stats.score}</p>
                    <p className='text-xs'>Enabled: {card.stats.enabled ? "Yes" : "No"}</p>
                </PopoverContent>
            </Popover>
        )
    }

    // actions fns
    function _onClick(e: React.MouseEvent) {
        if(onClick && editMode) onClick(e);
        else toggleFlip();
    }

    function toggleFlip() {
        setIsFliped(prev => !prev);
    }

    return (
        <div className={`relative bg-secondary text-foreground rounded-lg border ${isFliped&&'border-dashed'} cursor-default ${isSelected&&'opacity-60'} ${editMode&&'select-none'}`} 
            style={{aspectRatio: "0.7", transform: `rotateY(${isFliped?'180deg':'0deg'})`, transition: 'transform 0.3s'}}
            onClick={_onClick}    
        >
            <div 
                className='absolute left-0 top-0 right-0 bottom-0 flex flex-col'
                style={{transform: `rotateY(${isFliped?'180deg':'0deg'})`}}
            >
                {/* // content */}
                { renderContent() }

                {/* // info icon */}
                { renderInfoIcon() }

                {/* // edit tools */}
                { editMode && renderEditTools() }
            </div>
        </div>
    )

}

export default CardComp