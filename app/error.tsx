'use client';

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { MRenderError } from "@/types/common";
import Link from "next/link";

// default error handling boundary
export default function DefaultErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    const renderError: MRenderError = error as MRenderError;

    return (
        <MainLayout innerClasses="flex flex-col items-center justify-center gap-8" authUser={undefined}>
            <h1 className="text-2xl text-destructive">Error {renderError.code}</h1>

            <h2 className="text-3xl">{error.message}</h2>

            {
                renderError.options?.allowRetry ?
                    <Button onClick={reset}> Try again </Button> :
                    (
                        <div className="flex items-center gap-8">
                            <Button asChild>
                                <Link href={`/`}>Home</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/auth/login`}>Login</Link>
                            </Button>
                        </div>
                    )
            }
        </MainLayout>
    );

}