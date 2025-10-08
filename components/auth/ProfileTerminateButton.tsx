"use client"

/**
 * Handling terminating an account
 */

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { DOE } from '@/types/common';
import { requestDeleteUser } from '@/services/requests/userRequests';
import { AuthUser } from '@/types/models';
import { LoaderCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function ProfileTerminateButton({ authUser }: {
    authUser: AuthUser,
}) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onDeleteAccount() {
        if (!authUser || isLoading) return;

        if (!confirm(`Confirm delete account?`)) return;
        const deletePublicPosts: boolean = confirm(`Private decks will be deleted, would you like to delete public decks as well?`);

        setIsLoading(true);
        const res: DOE = await requestDeleteUser(authUser.id, authUser.id, deletePublicPosts);

        if (!res.data) {
            toast(`Error deleting account`);
        } else {
            router.replace("/");
        }
        setIsLoading(false);
    }

    return (
        <Button variant={"destructive"} onClick={onDeleteAccount} disabled={isLoading}>
            <i className='bi bi-x-lg'></i>
            {
                isLoading ?
                    <LoaderCircleIcon className='animate-spin' /> :
                    "Terminate Account"
            }
        </Button>
    )

}

export default ProfileTerminateButton