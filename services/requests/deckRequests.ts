"use server";

/**
 * Handles decks related requests
 */

import { Db, ObjectId } from "mongodb";
import { DOE } from "@/types/common";
import { DeckModel, DeckModelServer, DeckProgressModel, DeckProgressModelServer, DeckWithRelations, UserModel, UserModelServer } from "@/types/models";
import { getDB } from "@/lib/db";
import { convertDeckProgressServerToDeckProgressClient, convertDeckServerToDeckClient, convertUserServerToUserClient } from "@/helpers/conversionHelper";
import { requestCreateDeckProgress } from "./deckProgressRequests";
import DeckService from "../systems/deckService";


// Get deck by ID
export async function requestGetDeckById(
    id: string,
    authUserId: string,
    withRelations: ("user" | "progress")[] = []
): Promise<DOE<DeckWithRelations>> {
    const doe: DOE<DeckWithRelations> = { data: null, error: null };

    try {
        if(!ObjectId.isValid(authUserId)) authUserId = new ObjectId().toString()

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const deck = await db.collection<DeckModelServer>("decks").findOne({ _id: new ObjectId(id), $or: [ {is_private: false}, {is_private: true, user_id: new ObjectId(authUserId)} ] });
        if (!deck) throw new Error("Deck not found or private");

        // Run relational queries in parallel
        const [user, deckProgress] = await Promise.all([
            withRelations.includes("user")
                ? db.collection<UserModelServer>("users").findOne({ _id: deck.user_id })
                : null,
            withRelations.includes("progress")
                ? db.collection<DeckProgressModelServer>("deckProgress")
                    .findOne({ deck_id: deck._id, user_id: new ObjectId(authUserId) })
                : null
        ]);

        if (withRelations.includes("user") && !user) {
            throw new Error("Deck's user not found");
        }

        // Default progress
        let progress: DeckProgressModel = DeckService.makeNewDeckProgressModelInstance(
            deck._id.toString(),
            authUserId,
            deck.data.cards
        );

        if (withRelations.includes("progress")) {
            if (!deckProgress && authUserId) {
                // create progress for first-time user
                const deckProgressDoe = await requestCreateDeckProgress(progress, authUserId);
                if (!deckProgressDoe.data) throw new Error("Couldn't create deck progress instance");
                progress = deckProgressDoe.data;
            } else if (deckProgress) {
                progress = convertDeckProgressServerToDeckProgressClient(deckProgress);
            }
        }

        doe.data = {
            deck: convertDeckServerToDeckClient(deck),
            user: user ? convertUserServerToUserClient(user) : undefined,
            progress
        };
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Search decks by term(deck.title) + filters
export async function requestSearchDecks(
    term: string,
    filters: Partial<DeckModel> = {},
    authUserId: string,
    withRelations: ("user")[] = []
): Promise<DOE<DeckWithRelations[]>> {
    const doe: DOE<DeckWithRelations[]> = { data: null, error: null };

    try {
        if(!authUserId) throw new Error(`User not authenticated`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const query: any = { ...filters, $or: [ {is_private: false}, {is_private: true, user_id: new ObjectId(authUserId)} ] };
        if (term) {
            query.title = { $regex: term, $options: "i" }; // case-insensitive search
        }

        const pipeline: any[] = [{ $match: query }];

        if (withRelations.includes("user")) {
            pipeline.push({
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            });
            pipeline.push({ $unwind: "$user" });
        }

        const decks = await db.collection("decks").aggregate(pipeline).toArray();

        doe.data = decks.map((doc: any) => ({
            deck: convertDeckServerToDeckClient({
                _id: doc._id,
                title: doc.title,
                description: doc.description,
                category: doc.category,
                data: doc.data,
                is_private: doc.is_private,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
                user_id: doc.user_id
            } as DeckModelServer),
            user: withRelations.includes("user") && doc.user
                ? convertUserServerToUserClient(doc.user as UserModelServer)
                : undefined
        }));
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Create deck
export async function requestCreateDeck(
    data: Omit<DeckModel, "id">,
    authUserId: string
): Promise<DOE<DeckModel>> {
    const doe: DOE<DeckModel> = { data: null, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decks").insertOne({
            ...data,
            user_id: new ObjectId(authUserId),
            created_at: new Date(),
            updated_at: new Date(),
        });

        const deck = await db.collection<DeckModelServer>("decks").findOne({ _id: result.insertedId });
        if(!deck) throw new Error(`Error couldn't create deck model`);

        // create deck progress for auth user with this deck
        if (deck) {
            const progressModel: DOE<DeckProgressModel> = await requestCreateDeckProgress(
                DeckService.makeNewDeckProgressModelInstance(deck._id.toString(), authUserId, deck.data.cards),
                authUserId
            );

            if(!progressModel.data) throw new Error(`Error couldn't create progress model`);
        }

        doe.data = deck ? convertDeckServerToDeckClient(deck) : null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Update deck
export async function requestUpdateDeck(
    id: string,
    authUserId: string,
    data: Partial<Omit<DeckModel, "id">>
): Promise<DOE<DeckModel>> {
    let doe: DOE<DeckModel> = { data: null, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);

        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        let updateData: any = { ...data, updated_at: new Date() };
        if (data.user_id) updateData.user_id = new ObjectId(data.user_id);

        const res = await db.collection("decks").updateOne(
            { _id: new ObjectId(id), user_id: new ObjectId(authUserId) },
            { $set: updateData }
        );

        if(res.modifiedCount === 1) {
            const deck = await db.collection<DeckModelServer>("decks").findOne({ _id: new ObjectId(id) });
            doe.data = deck ? convertDeckServerToDeckClient(deck) : null;
        }
    } catch (e: any) {
        doe.error = { message: e.message};
    }
    return doe;
}

// Delete deck
export async function requestDeleteDeck(
    id: string,
    authUserId: string
): Promise<DOE<boolean>> {
    const doe: DOE<boolean> = { data: false, error: null };

    try {
        if (!ObjectId.isValid(authUserId)) throw new Error(`Unauthenticated`);
        
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("decks").deleteOne({ _id: new ObjectId(id), user_id: new ObjectId(authUserId) });

        // delete auth user progress also
        await db.collection("deckProgress").deleteOne({
            user_id: new ObjectId(authUserId),
            deck_id: new ObjectId(id)
        });

        doe.data = result.deletedCount === 1;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}
