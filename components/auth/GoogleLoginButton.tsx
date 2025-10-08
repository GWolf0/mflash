"use client"

/**
 * Placeholder for google auth provider (not used in this project)
 */

import { requestLogin } from '@/services/requests/authRequests';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { LoaderCircleIcon } from 'lucide-react';

function GoogleLoginButton() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onLoginBtn() {
        if(isLoading) return;
        
        setIsLoading(true);
        await requestLogin("github");
        setIsLoading(false);
    }

    return (
        <Button className='' disabled={isLoading} onClick={onLoginBtn}>
            <i className='bi bi-google'></i>
            {
                isLoading ? 
                <LoaderCircleIcon className='animate-spin' /> :
                'Login with google'
            }
        </Button>
    )

}

export default GoogleLoginButton