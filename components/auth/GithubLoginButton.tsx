"use client"

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { requestLogin } from '@/services/requests/authRequests'
import { LoaderCircleIcon } from 'lucide-react';

function GithubLoginButton() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onLoginBtn() {
        if(isLoading) return;

        setIsLoading(true);
        await requestLogin("github");
        setIsLoading(false);
    }

    return (
        <Button className='' disabled={isLoading} onClick={onLoginBtn}>
            <i className='bi bi-github'></i> 
            {
                isLoading ? 
                <LoaderCircleIcon className='animate-spin' /> :
                'Login with github'
            }
        </Button>
    )

}

export default GithubLoginButton