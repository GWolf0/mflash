/**
 * Models (db)
 * With server version and client version
 */

import { DeckData, DeckProgressData } from "./deck";
import { ObjectId } from "mongodb";

export interface UserModelServer {
    _id: ObjectId;
    name?: string | null;
    email: string;
    image?: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface UserModel extends Omit<UserModelServer, "_id"> {
    id: string;
}

// AuthUser (the authenticated user), can be a UserModel or no value
export type AuthUser = UserModel | null | undefined;

export interface DeckModelServer {
    _id: ObjectId;
    title: string;
    description?: string;
    category?: string;
    data: DeckData,
    is_private: boolean;
    created_at: Date;
    updated_at: Date;
    user_id: ObjectId;
}

export interface DeckModel extends Omit<DeckModelServer, "_id" | "user_id"> {
    id: string,
    user_id: string,
}

export type DeckWithRelations = { deck: DeckModel, user?: UserModel, progress?: DeckProgressModel };

export interface DeckProgressModelServer {
    _id: ObjectId,
    user_id: ObjectId,
    deck_id: ObjectId,
    data: DeckProgressData,
    created_at: Date;
    updated_at: Date;
}

export interface DeckProgressModel extends Omit<DeckProgressModelServer, "_id" | "user_id" | "deck_id"> {
    id: string,
    user_id: string,
    deck_id: string,
}