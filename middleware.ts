import { requestAuthUser } from '@/services/requests/authRequests'
import { DOE } from '@/types/common'
import { AuthUser } from '@/types/models'
import { NextResponse, NextRequest } from 'next/server'
import { AUTH_REDIRECT, GUEST_REDIRECT } from './constants/appConstants';

/**
 * Check for pages that requires auth or guest
 * Redirect to next if all ok
 */
export async function middleware(request: NextRequest) {
    const authUserDoe: DOE<AuthUser> = await requestAuthUser();
    
    const pathname = request.nextUrl.pathname;

    const isLoggedIn = !!authUserDoe.data;

    // Pages that require auth
    if (requireAuthPages.some((p) => pathname.startsWith(p))) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL(GUEST_REDIRECT, request.url));
        }
    }

    // Pages that require guest
    if (requireGuestPages.some((p) => pathname.startsWith(p))) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(AUTH_REDIRECT, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
}

// pages that require auth, and others that require guest
const requireAuthPages: string[] = [
    "/decks", "/profile"
];
const requireGuestPages: string[] = [
    "/auth/login"
];