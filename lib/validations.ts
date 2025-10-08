/**
 * ZOD definitions for validations (forms, etc)
 */

import { CARD_MAX_SCORE, DECK_CATEGORIES } from "@/constants/deckConstants";
import limitsConstants from "@/constants/limitsConstants";
import z from "zod";

// USER
export const VALIDATION_USER = z.object({
    name: z.string().min(3).max(64).nullable().optional(),
    email: z.email(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export const VALIDATION_USER_PARTIAL = VALIDATION_USER.partial();

// FLASH CARD
export const VALIDATION_FLASH_CARD = z.object({
    id: z.number(),
    frontMainText: z.string().min(1).max(64),
    frontSecondaryText: z.string().max(64).optional(),
    backMainText: z.string().min(1).max(64),
    backSecondaryText: z.string().max(64).optional(),
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