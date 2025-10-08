/**
 * Common types
 */

export type JSONType = { [key: string]: any }

interface MError {
    message?: string,
    errors?: JSONType,
}
export type ErrorType = MError | null | undefined;

// Data or error
export interface DOE<T = any> {
    data?: T | null,
    error?: ErrorType,
}

export class
    MRenderError extends Error {
        options; code?: number;
    constructor(message: string, options: {
        allowRetry?: boolean,
    }, code?: number) {
        super(message);
        this.name = "RenderError";
        this.options = options;
        this.code = code;
    }

}