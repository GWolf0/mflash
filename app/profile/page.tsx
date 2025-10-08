import ProfileEditButton from '@/components/auth/ProfileEditButton';
import ProfileTerminateButton from '@/components/auth/ProfileTerminateButton';
import MainLayout from '@/components/layout/MainLayout';
import { requestAuthUser } from '@/services/requests/authRequests'
import { DOE, MRenderError } from '@/types/common'
import { AuthUser } from '@/types/models'
import React from 'react'

async function ProfilePage() {
    const authUserDoe: DOE<AuthUser> = await requestAuthUser();
    if(!authUserDoe.data) throw new MRenderError(`User not authenticated`, {});

    const authUser: AuthUser = authUserDoe.data;

    return(
        <MainLayout innerClasses='flex flex-col gap-8' authUser={authUser}>

            {/* // user details section */}
            <section className='w-full flex flex-col gap-4'>
                <h1 className='text-xl underline'>Profile Details</h1>

                <table className='text-foreground'>
                    <tbody>
                        <tr>
                            <td className='py-2 mr-4 italic'>Username</td>
                            <td className='py-2'>{authUser.name ?? "No Name"}</td>
                        </tr>
                        <tr>
                            <td className='py-2 mr-4 italic'>Email</td>
                            <td className='py-2'>{authUser.email}</td>
                        </tr>
                        <tr>
                            <td className='py-2 mr-4 italic'>Joined At</td>
                            <td className='py-2'>{authUser.created_at.toISOString().substring(0, 10)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className='flex items-center justify-end gap-2 md:gap-4'>
                    <ProfileTerminateButton authUser={authUser} />
                    <ProfileEditButton authUser={authUser} />
                </div>

            </section>

        </MainLayout>
    )

}

export default ProfilePage