"use server";

import { Db, ObjectId } from "mongodb";
import { DOE } from "@/types/common";
import { UserModel, DeckWithUser, DeckModel } from "@/types/models";
import { getDB } from "@/lib/db";

// Get user by ID
export async function requestGetUserById(id: ObjectId): Promise<DOE<UserModel>> {
    const doe: DOE<UserModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const user = await db.collection<UserModel>("users").findOne({ _id: id });
        if (!user) throw new Error("Deck not found");

        doe.data = user;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Search users by term(user.name) + filters
export async function requestSearchDecks(term: string, filters: Partial<UserModel> = {}): Promise<DOE<UserModel[]>> {
    const doe: DOE<UserModel[]> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const query: any = { ...filters };
        if (term) {
            query.name = { $regex: term, $options: "i" }; // case-insensitive search
        }

        const users = await db.collection<UserModel>("users").find(query).toArray();
        doe.data = users;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Get user's decks
export async function requestUserDecks(id: ObjectId): Promise<DOE<DeckModel[]>> {
    const doe: DOE<DeckModel[]> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const query: any = { user_id: id };

        const decks = await db.collection<DeckModel>("decks").find(query).toArray();
        doe.data = decks;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Create user
export async function requestCreateUser(data: Omit<UserModel, "_id">): Promise<DOE<UserModel>> {
    const doe: DOE<UserModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("users").insertOne({
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const user = await db.collection<UserModel>("users").findOne({ _id: result.insertedId });
        doe.data = user ?? null;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Update user
export async function requestUpdateUser(id: ObjectId, data: Partial<Omit<UserModel, "_id">>): Promise<DOE<UserModel>> {
    const doe: DOE<UserModel> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        await db.collection("users").updateOne(
            { _id: id },
            { $set: { ...data, updated_at: new Date() } }
        );

        const user = await db.collection<UserModel>("users").findOne({ _id: id });
        doe.data = user;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}

// Delete user
export async function requestDeleteUser(id: ObjectId): Promise<DOE<boolean>> {
    const doe: DOE<boolean> = { data: null, error: null };

    try {
        const db = await getDB();
        if (!db) throw new Error("Database connection failed");

        const result = await db.collection("users").deleteOne({ _id: id });
        doe.data = result.deletedCount === 1;
    } catch (e: any) {
        doe.error = { message: e.message };
    }

    return doe;
}
