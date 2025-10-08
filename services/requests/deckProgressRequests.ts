"use server";

/**
 * Handles decksProgress related requests
 */

import { ObjectId } from "mongodb";
import { DOE } from "@/types/common";
import { DeckProgressModel, DeckProgressModelServer } from "@/types/models";
import { getDB } from "@/lib/db";
import { convertDeckProgressServerToDeckProgressClient } from "@/helpers/conversionHelper";

// Get deck progress by deck & user
export async function requestGetDeckProgressByDeckIdAndUserId(deckId: string, userId: string, authUserId: string): Promise<DOE<DeckProgressModel | null>> {
    const doe: DOE<DeckProgressModel | null> = { data: null, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);
        if (userId != authUserId) throw new Error(`Action unauthorized`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const deckProgress = await db.collection<DeckProgressModelServer>("decksProgress").findOne({
            deck_id: new ObjectId(deckId),
            user_id: new ObjectId(userId),
        });

        doe.data = deckProgress ? convertDeckProgressServerToDeckProgressClient(deckProgress) : null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Create deck progress
export async function requestCreateDeckProgress(data: Omit<DeckProgressModel, "id">, authUserId: string, createOrRetrieve: boolean = true): Promise<DOE<DeckProgressModel>> {
    const doe: DOE<DeckProgressModel> = { data: null, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        // try getting document if exists
        const existingDocDoe = await requestGetDeckProgressByDeckIdAndUserId(data.deck_id, authUserId, authUserId);
        if (existingDocDoe.data) {
            if (createOrRetrieve) {
                doe.data = existingDocDoe.data;
                return doe;
            } else {
                throw new Error(`Deck progress already exists`);
            }
        }

        const result = await db.collection("decksProgress").insertOne({
            ...data,
            user_id: new ObjectId(authUserId),
            deck_id: new ObjectId(data.deck_id),
            created_at: new Date(),
            updated_at: new Date(),
        });

        const deckProgress = await db.collection<DeckProgressModelServer>("decksProgress").findOne({ _id: result.insertedId });
        doe.data = deckProgress ? convertDeckProgressServerToDeckProgressClient(deckProgress) : null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Update deck progress
export async function requestUpdateDeckProgress(id: string, data: Partial<Omit<DeckProgressModel, "id">>, authUserId: string): Promise<DOE<DeckProgressModel>> {
    const doe: DOE<DeckProgressModel> = { data: null, error: null };

    try {
        if (!ObjectId.isValid(id)) throw new Error(`Invalid deck progress`);
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        // Ensure IDs stay ObjectId
        const updateData: any = { ...data, updated_at: new Date() };
        if (data.user_id) updateData.user_id = new ObjectId(data.user_id);
        if (data.deck_id) updateData.deck_id = new ObjectId(data.deck_id);

        const res = await db.collection("decksProgress").updateOne(
            { _id: new ObjectId(id), user_id: new ObjectId(authUserId) },
            { $set: updateData }
        );

        if (res.modifiedCount === 1) {
            const deckProgress = await db.collection<DeckProgressModelServer>("decksProgress").findOne({ _id: new ObjectId(id) });
            doe.data = deckProgress ? convertDeckProgressServerToDeckProgressClient(deckProgress) : null;
        }
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Delete deck progress by ID
export async function requestDeleteDeckProgress(id: string, authUserId: string): Promise<DOE<boolean>> {
    const doe: DOE<boolean> = { data: null, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decksProgress").deleteOne({ _id: new ObjectId(id), user_id: new ObjectId(authUserId) });
        doe.data = result.deletedCount === 1;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Delete deck progress by user id and deck id
export async function requestDeleteDeckProgressByUserIdAndDeckId(userId: string, deckId: string, authUserId: string): Promise<DOE<boolean>> {
    const doe: DOE<boolean> = { data: false, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);
        if (userId != authUserId) throw new Error(`Action unauthorized`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decksProgress").deleteOne({ user_id: new ObjectId(userId), deck_id: new ObjectId(deckId) });
        
        doe.data = result.deletedCount === 1;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Delete deck progress by user id
export async function requestDeleteDeckProgressByUserId(userId: string, authUserId: string): Promise<DOE<number>> {
    const doe: DOE<number> = { data: 0, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);
        if (userId != authUserId) throw new Error(`Action unauthorized`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decksProgress").deleteMany({ user_id: new ObjectId(userId) });
        doe.data = result.deletedCount ?? 0;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}
