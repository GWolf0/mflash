import React from 'react'
import MainHeader from './MainHeader'
import MainFooter from './MainFooter'

function MainLayout({children}: {
    children: React.ReactNode,
}) {


    return (
        <div className='w-full min-h-screen bg-background'>
            {/* // header */}
            <MainHeader />

            {/* //  content */}
            <div className='mx-auto px-2 md:px-4' style={{width: "min(100%, 1280px)"}}>
                {children}
            </div>

            {/* // footer */}
            <MainFooter />
        </div>
    )

}

export default MainLayout