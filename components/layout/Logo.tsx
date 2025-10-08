import { APP_NAME } from '@/constants/appConstants';
import Link from 'next/link';
import React from 'react'

function Logo({size, noLink, withText}: {
    size?: number, noLink?: boolean, withText?: "right" | "bottom",
}) {
    size = size ?? 32;

    function renderLogo(): React.ReactNode {
        return (
            <div className={`flex items-center justify-center ${withText==='bottom'&&"flex-col"} gap-4`}>
                <img src="/logo.png" alt="logo" width={size} height={size} />
                { renderText() }
            </div>
        )
    }

    function renderText(): React.ReactNode{
        if(!withText) return null;
        return (
            <p className='text-2xl md:text-4xl'>{APP_NAME.toUpperCase()}</p>
        )
    }

    if(noLink) {
        return renderLogo();
    } else {
        return (
            <Link href={"/"}>
                {renderLogo()}
            </Link>
        )
    }

}

export default Logo