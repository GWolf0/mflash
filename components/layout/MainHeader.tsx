import React from 'react'
import Logo from './Logo'
import { AuthUser } from '@/types/models'
import AuthDropdown from './AuthDropdown'
import { Button } from '../ui/button'
import Link from 'next/link'

function MainHeader({user}: {
    user: AuthUser,
}) {


    return (
        <header className='w-full px-2 md:px-4 flex items-center justify-between' style={{height: "80px"}}>
            <Logo />

            <div className='mr-auto'></div>

            {
                user ?
                (
                    <AuthDropdown user={user} />
                ) :
                (
                    <Button asChild>
                        <Link href={`/auth/login`}>Login</Link>
                    </Button>
                )
            }
        </header>
    )

}

export default MainHeader