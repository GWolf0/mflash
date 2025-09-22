import { FlashCard } from "@/types/deck";
import { DeckModel, UserModel } from "@/types/models";
import { ObjectId } from "mongodb";

export default class AuthService {

    // make new user instance
    static makeNewUserInstance(params: Partial<Omit<UserModel, "_id">>): UserModel | null {
        if(!params.email) return null;

        return {
            _id: null,
            name: params.name ?? "New User",
            email: params.email,
            created_at: params.created_at ?? new Date(),
            updated_at: params.updated_at ?? new Date(),
        };
    }

    // get guest user instance
    static getGuestInstance(): UserModel {
        return {
            _id: null,
            name: "Guest",
            email: "guest@email.com",
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

}