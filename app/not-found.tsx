"use client"

import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

function PageNotFoundPage() {
    
    return (
        <MainLayout innerClasses='flex flex-col gap-8 items-center justify-center' authUser={undefined}>

            <h1 className='text-2xl text-center'>Page Not Found</h1>

            <Button asChild>
                <Link href={`/`}>Home</Link>
            </Button>

        </MainLayout>
    )

}

export default PageNotFoundPage