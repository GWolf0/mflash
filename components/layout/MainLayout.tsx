import React from 'react'
import MainHeader from './MainHeader'
import MainFooter from './MainFooter'
import { AuthUser } from '@/types/models'

function MainLayout({children, innerClasses, authUser}: {
    children: React.ReactNode, innerClasses?: string, authUser: AuthUser,
}) {


    return (
        <div className='w-full bg-background'>
            {/* // header */}
            <MainHeader user={authUser} />

            {/* //  content */}
            <div className={`min-h-screen mx-auto px-2 md:px-4 ${innerClasses}`} style={{width: "min(100%, 1280px)"}}>
                {children}
            </div>

            {/* // footer */}
            <MainFooter />
        </div>
    )

}

export default MainLayout