export const ROUTES = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    DECKS: "/decks",
    DECK: (id: string) => `/dashboard/decks/${id}`,
    REVIEW: (id: string) => `/dashboard/review/${id}`,
    TEST: (id: string) => `/dashboard/test/${id}`,
};