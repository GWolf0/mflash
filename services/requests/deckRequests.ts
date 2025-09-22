"use server";

import { Db, ObjectId } from "mongodb";
import { DOE } from "@/types/common";
import { DeckModel, DeckWithUser, UserModel } from "@/types/models";
import { getDB } from "@/lib/db";

// Get deck by ID
export async function requestGetDeckById(id: ObjectId): Promise<DOE<DeckWithUser>> {
    const doe: DOE<DeckWithUser> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const deck = await db.collection<DeckModel>("decks").findOne({ _id: id });
        if (!deck) throw new Error("Deck not found");
        
        const user = await db.collection<UserModel>("users").findOne({ _id: deck.user_id });
        if (!user) throw new Error("Deck's user not found");

        doe.data = {deck, user};
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Search decks by term(deck.title) + filters
export async function requestSearchDecks(term: string, filters: Partial<DeckModel> = {}): Promise<DOE<DeckWithUser[]>> {
    const doe: DOE<DeckWithUser[]> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const query: any = { ...filters };
        if (term) {
            query.title = { $regex: term, $options: "i" }; // case-insensitive search
        }

        const decks = await db.collection("decks").aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" }
        ]).toArray();

        // Map the result to match DeckWithUser structure
        doe.data = decks.map((doc: any) => ({
            deck: {
                _id: doc._id,
                title: doc.title,
                description: doc.description,
                category: doc.category,
                data: doc.data,
                is_private: doc.is_private,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
                user_id: doc.user_id
            },
            user: doc.user
        }));
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}


// Create deck
export async function requestCreateDeck(data: Omit<DeckModel, "_id">): Promise<DOE<DeckModel>> {
    const doe: DOE<DeckModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decks").insertOne({
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const deck = await db.collection<DeckModel>("decks").findOne({ _id: result.insertedId });
        doe.data = deck ?? null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Update deck
export async function requestUpdateDeck(id: ObjectId, data: Partial<Omit<DeckModel, "_id">>): Promise<DOE<DeckModel>> {
    const doe: DOE<DeckModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        await db.collection("decks").updateOne(
            { _id: id },
            { $set: { ...data, updated_at: new Date() } }
        );

        const deck = await db.collection<DeckModel>("decks").findOne({ _id: id });
        doe.data = deck ?? null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Delete deck
export async function requestDeleteDeck(id: ObjectId): Promise<DOE<boolean>> {
    const doe: DOE<boolean> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decks").deleteOne({ _id: id });
        doe.data = result.deletedCount === 1;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}
