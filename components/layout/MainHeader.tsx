import React from 'react'
import Logo from './Logo'

function MainHeader() {


    return (
        <header className='w-full px-2 md:px-4 flex items-center justify-between' style={{height: "80px"}}>
            <Logo />
        </header>
    )

}

export default MainHeader