// ZOD definitions for creating and updating data (for forms)

import { DECK_CATEGORIES } from "@/constants/deckAndCardsConstants";
import { CARD_MAX_SCORE } from "@/constants/deckConstants";
import limitsConstants from "@/constants/limitsConstants";
import z from "zod";

// USER
export const VALIDATION_USER = z.object({
    name: z.string().min(3).max(64).nullable().optional(),
    email: z.email(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

// FLASH CARD
export const VALIDATION_FLASH_CARD = z.object({
    id: z.number(),
    frontMainText: z.string().min(1).max(32),
    frontSecondaryText: z.string().max(32).optional(),
    backMainText: z.string().min(1).max(32),
    backSecondaryText: z.string().max(32).optional(),
    backExtraText: z.string().max(128).optional(),
    stats: z.object({
        score: z.number().min(-CARD_MAX_SCORE).max(CARD_MAX_SCORE),
        lastViewed: z.coerce.date().nullable(),
        enabled: z.boolean(),
    }),
});
export const VALIDATION_FLASH_CARD_PARTIAL = VALIDATION_FLASH_CARD.partial();

// DECK DATA
export const VALIDATION_DECK_DATA = z.object({
    cards: z.array(VALIDATION_FLASH_CARD).max(limitsConstants.maxCards),
});

// DECK (for create)
export const VALIDATION_DECK_CREATE = z.object({
    title: z.string().min(3).max(256),
    description: z.string().max(256).optional(),
    category: z.enum(DECK_CATEGORIES),
    is_private: z.boolean(),
    data: VALIDATION_DECK_DATA,
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    user_id: z.string(),
});

// DECK (for update, makes all fields optional)
export const VALIDATION_DECK_PARTIAL = VALIDATION_DECK_CREATE.partial();