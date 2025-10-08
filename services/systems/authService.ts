/**
 * Auth service (Main usage)
 * - Create new instances related to user/auth models
 */

import { UserModel } from "@/types/models";

export default class AuthService {

    // make new user instance
    static makeNewUserInstance(params: Partial<Omit<UserModel, "id">>): UserModel {

        return {
            id: "",
            name: params.name ?? "New User",
            email: params.email ?? "email@nomail.com",
            created_at: params.created_at ?? new Date(),
            updated_at: params.updated_at ?? new Date(),
        };
    }

    // get guest user instance
    static getGuestInstance(): UserModel {
        return {
            id: "",
            name: "Guest",
            email: "guest@email.com",
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

}