"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { DOE } from "@/types/common";
import { AuthUser, UserModel } from "@/types/models";
import { Session } from "next-auth";
import { getDB } from "@/lib/db";
import { ObjectId } from "mongodb";

// Get authenticated user (and ensure exists in DB)
export async function requestAuthUser(): Promise<DOE<AuthUser>> {
    const doe: DOE<AuthUser> = { data: null, error: null };

    try {
        const session: Session | null = await auth();

        if (!session?.user?.email) {
            doe.error = { message: "Not authenticated" };
            return doe;
        }

        const db = await getDB();
        if (!db) {
            doe.error = { message: "Database connection failed" };
            return doe;
        }

        const usersColl = db.collection<UserModel>("users");

        // Try to find user by email
        let user = await usersColl.findOne({ email: session.user.email });

        // If user not found, create it
        if (!user) {
            const newUser: UserModel = {
                _id: new ObjectId(),
                name: session.user.name ?? "",
                email: session.user.email,
                image: session.user.image ?? "",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const result = await usersColl.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
        }

        doe.data = user;
    } catch (err) {
        console.error("requestAuthUser error", err);
        doe.error = { message: "Failed to fetch authenticated user!" };
    }

    return doe;
}

// Login user
export async function requestLogin(provider: "github") {
    await signIn(provider, { redirectTo: "/" });
}

// Logout user
export async function requestLogout() {
    await signOut({ redirectTo: "/" });
}
