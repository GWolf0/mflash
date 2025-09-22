export type JSONType = {[key: string]: any}

interface MError {
    message?: string,
    errors?: JSONType,
}
export type ErrorType = MError | null | undefined;

export interface DOE<T=any> {
    data?: T | null,
    error?: ErrorType,
}