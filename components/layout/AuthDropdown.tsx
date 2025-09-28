"use client"

import { AuthUser } from '@/types/models'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import Link from 'next/link';
import { Button } from '../ui/button';
import UserAvatar from './UserAvatar';
import ThemeToggle from '../common/ThemeToggle';

function AuthDropdown({ user }: {
    user: AuthUser,
}) {
    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Welcome {user.name ?? "No Name"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href={`/decks`}>My Decks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href={`/profile`}>My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Button variant={"destructive"} className='w-full'>
                        <i className='bi bi-door-closed'></i> Logout
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

}

export default AuthDropdown