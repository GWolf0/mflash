"use client"
import { LoaderCircleIcon } from 'lucide-react'
import React from 'react'

function defaultLoadingPage() {
    
    return (
        <div className='w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-8'>

            <div className='flex items-center gap-4'>
                <LoaderCircleIcon className='animate-spin' />
                <p>Loading</p>
            </div>

        </div>
    )

}

export default defaultLoadingPage