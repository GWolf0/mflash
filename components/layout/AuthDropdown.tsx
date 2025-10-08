"use client"

/**
 * Auth dropdown component
 * for authenticated user
 */

import { AuthUser } from '@/types/models'
import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import Link from 'next/link';
import { Button } from '../ui/button';
import UserAvatar from './UserAvatar';
import ThemeToggle from '../common/ThemeToggle';
import { requestLogout } from '@/services/requests/authRequests';
import { LoaderCircle } from 'lucide-react';

function AuthDropdown({ user }: {
    user: AuthUser,
}) {
    if (!user) return null;

    const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);

    async function onLogoutBtn() {
        if (isLogoutLoading) return;

        setIsLogoutLoading(true);
        await requestLogout();
        setIsLogoutLoading(false);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' sideOffset={10}>
                <DropdownMenuLabel>Welcome {user.name ?? "No Name"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href={`/decks`} className='block w-full'>My Decks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href={`/profile`} className='block w-full'>My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Button variant={"destructive"} className='w-full' onClick={onLogoutBtn} disabled={isLogoutLoading}>
                        {
                            isLogoutLoading ?
                                <LoaderCircle className='animate-spin' /> :
                                <>
                                    <i className='bi bi-door-closed'></i> Logout
                                </>
                        }
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

}

export default AuthDropdown