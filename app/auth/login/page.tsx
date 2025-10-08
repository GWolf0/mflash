import GithubLoginButton from '@/components/auth/GithubLoginButton';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import Logo from '@/components/layout/Logo';
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button';
import { requestAuthUser } from '@/services/requests/authRequests'
import { DOE } from '@/types/common';
import { AuthUser } from '@/types/models';
import React from 'react'

async function LoginPage() {
    const authUser: DOE<AuthUser> = await requestAuthUser();

    return (
        <MainLayout innerClasses='' authUser={authUser.data}>

            {/* // login box */}
            <main className={`flex flex-col gap-8 mx-auto rounded-lg p-4 md:border mt-10`} style={{width: 'min(100%, 480px)'}}>
                {/* // logo */}
                <div className='py-20 mx-auto'>
                    <Logo size={128} noLink withText='bottom' />
                </div>

                <hr />

                <div className='flex items-center justify-center'>
                    <h1 className='text-3xl'>Login</h1>
                </div>

                {/* // login buttons */}
                <div className='flex flex-col gap-4'>
                    <GithubLoginButton />
                    <GoogleLoginButton />
                </div>
            </main>

        </MainLayout>
    )

}

export default LoginPage