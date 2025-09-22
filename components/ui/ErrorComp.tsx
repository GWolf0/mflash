import { ErrorType } from '@/types/common';
import React from 'react'

function ErrorComp({error, errorKey}: {
    error: ErrorType, errorKey?: string,
}) {

    function renderError(text: string): React.ReactNode {
        return (
            <p className='text-destructive text-sm py-1'>{text}</p>
        )
    }

    if(!error) return null;

    if(errorKey && error.errors && Object.keys(error.errors).includes(errorKey)) {
        return (
            renderError(error.errors[errorKey])
        );
    }

    if(error.message) {
        return (
            renderError(error.message)
        );
    }

    return (
        renderError("Unknown error!")
    );

}

export default ErrorComp