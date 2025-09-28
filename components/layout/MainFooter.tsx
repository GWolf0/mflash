import { APP_NAME } from '@/constants/appConstants'
import Link from 'next/link'
import React from 'react'
import ThemeToggle from '../common/ThemeToggle';

function MainFooter() {
    const items: FooterItemDef[] = [
        { label: "About", link: "/about" },
        { label: "Contact", link: "/contact" },
        { label: "Privacy Policy", link: "/privacy" },
        { label: "Terms of Service", link: "/terms" },
        { label: "GitHub", link: "https://github.com/yourusername" },
        // { label: "Twitter", link: "https://twitter.com/yourhandle" },
    ];

    return (
        <footer className='w-full flex flex-col md:flex-row items-center justify-between px-2 md:px-4 border-t' style={{ minHeight: "80px" }}>
            {/* links */}
            <ul className='flex gap-4 py-4 flex-wrap'>
                <li>
                    <ThemeToggle />
                </li>

                {items.map((it, i) => (
                    <li key={i} className='text-xs md:text-sm underline hover:opacity-70'>
                        <Link href={it.link} target={it.link.startsWith("http") ? "_blank" : "_self"}>
                            {it.label}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* copyright */}
            <div className='py-4 text-xs md:text-sm'>
                &copy; {APP_NAME} 2025
            </div>
        </footer>
    );
}

export default MainFooter;

interface FooterItemDef {
    label: string;
    link: string;
}
