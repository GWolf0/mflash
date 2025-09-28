"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'

function DecksPageDeleteDeckButton() {


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={"sm"} variant={"destructive"} title='delete'>
                    <i className='bi bi-trash'></i>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
    
}

export default DecksPageDeleteDeckButton