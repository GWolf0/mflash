"use server";

import { Db, ObjectId } from "mongodb";
import { DOE } from "@/types/common";
import { UserModel, DeckModel, UserModelServer, DeckModelServer } from "@/types/models";
import { getDB } from "@/lib/db";
import { convertDeckServerToDeckClient, convertUserServerToUserClient } from "@/helpers/conversionHelper";

// Get user by ID
export async function requestGetUserById(id: string): Promise<DOE<UserModel>> {
    const doe: DOE<UserModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const user = await db.collection<UserModelServer>("users").findOne({ _id: new ObjectId(id) });
        if (!user) throw new Error("User not found");

        doe.data = convertUserServerToUserClient(user);
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Search users by term(user.name) + filters
export async function requestSearchUsers(term: string, filters: Partial<UserModel> = {}): Promise<DOE<UserModel[]>> {
    const doe: DOE<UserModel[]> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const query: any = { ...filters };
        if (term) {
            query.name = { $regex: term, $options: "i" }; // case-insensitive search
        }

        const users = await db.collection<UserModelServer>("users").find(query).toArray();
        doe.data = users.map(u => convertUserServerToUserClient(u));
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Get user's decks
export async function requestUserDecks(id: string): Promise<DOE<DeckModel[]>> {
    const doe: DOE<DeckModel[]> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const query: any = { user_id: new ObjectId(id) };

        const decks = await db.collection<DeckModelServer>("decks").find(query).toArray();
        doe.data = decks.map(d => convertDeckServerToDeckClient(d));
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Create user
export async function requestCreateUser(data: Omit<UserModel, "id">): Promise<DOE<UserModel>> {
    const doe: DOE<UserModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("users").insertOne({
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const user = await db.collection<UserModelServer>("users").findOne({ _id: result.insertedId });
        doe.data = user ? convertUserServerToUserClient(user) : null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Update user
export async function requestUpdateUser(id: string, data: Partial<Omit<UserModel, "id">>): Promise<DOE<UserModel>> {
    const doe: DOE<UserModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...data, updated_at: new Date() } }
        );

        const user = await db.collection<UserModel>("users").findOne({ _id: new ObjectId(id) });
        doe.data = user;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Delete user
export async function requestDeleteUser(id: string, deleteDecks: boolean = true): Promise<DOE<boolean>> {
    const doe: DOE<boolean> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

        // delete all user's related data
        if (deleteDecks) {
            // find all deck IDs created by the user
            const decks = await db.collection("decks")
                .find({ user_id: new ObjectId(id) })
                .project({ _id: 1 })
                .toArray();

            const deckIds = decks.map(d => d._id);

            // delete decks and their progress
            await Promise.all([
                db.collection("decks").deleteMany({ user_id: new ObjectId(id) }),
                db.collection("decksProgress").deleteMany({ $or: [{ deck_id: { $in: deckIds } }, { user_id: new ObjectId(id) }] })
            ]);
        }

        doe.data = result.deletedCount === 1;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

