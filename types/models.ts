import { DeckData } from "./deck";
import { ObjectId } from "mongodb";

export interface UserModel {
    _id: ObjectId | null;
    name?: string | null;
    email: string;
    image?: string | null;
    created_at: Date;
    updated_at: Date;
}

export type AuthUser = UserModel | null;

export interface DeckModel {
    _id: ObjectId | null;
    title: string;
    description?: string;
    category?: string;
    data: DeckData,
    is_private: boolean;
    created_at: Date;
    updated_at: Date;
    user_id: ObjectId | null;
}

export type DeckWithUser = {deck: DeckModel, user: UserModel};