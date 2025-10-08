import MainLayout from '@/components/layout/MainLayout'
import { requestAuthUser } from '@/services/requests/authRequests';
import { DOE, MRenderError } from '@/types/common';
import { AuthUser } from '@/types/models';
import React from 'react'

async function HomePage() {
    const authUserDoe: DOE<AuthUser> = await requestAuthUser();

    const authUser: AuthUser = authUserDoe.data;

    return (
        <MainLayout innerClasses='' authUser={authUser}>

            <h1>Home Page placeholder</h1>

        </MainLayout>
    )

}

export default HomePage