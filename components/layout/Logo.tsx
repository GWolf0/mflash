import Link from 'next/link';
import React from 'react'

function Logo({size, noLink}: {
    size?: number, noLink?: boolean,
}) {
    size = size ?? 64;

    function renderLogo(): React.ReactNode {
        return (
            <div>
                <img src="/next.svg" alt="logo" width={size} height={size} />
            </div>
        )
    }

    if(noLink) {
        return renderLogo();
    } else {
        <Link href={"/"}>
            {renderLogo()}
        </Link>
    }

}

export default Logo