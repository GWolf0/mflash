import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDB } from "@/lib/db";
import { requestCreateDeck, requestDeleteDeck, requestGetDeckById, requestSearchDecks, requestUpdateDeck } from "@/services/requests/deckRequests";
import DeckService from "@/services/systems/deckService";
import { DeckModel, DeckModelServer, DeckProgressModelServer, UserModel, UserModelServer } from "@/types/models";
import { convertUserServerToUserClient } from "@/helpers/conversionHelper";
import { requestCreateUser, requestDeleteUser, requestGetUserById, requestUpdateUser, requestUserDecks } from "@/services/requests/userRequests";
import AuthService from "@/services/systems/authService";
import { ObjectId } from "mongodb";

describe("user requests", () => {
    let db: Awaited<ReturnType<typeof getDB>>;
    let authUser: UserModel;
    let authUserCpy: UserModel;
    let start: Date;

    beforeAll(async () => {
        db = await getDB();
        if (!db) throw new Error(`Couldn't get the database handler`);

        start = new Date();

        const authUserServer = await db.collection<UserModelServer>("users").findOne();
        if (!authUserServer) {
            throw new Error(`Couldn't fetch test auth user, consider seeding database`);
        }
        authUser = convertUserServerToUserClient(authUserServer);
        authUserCpy = { ...authUser };
    });

    afterAll(async () => {
        await db.collection<DeckModelServer>("decks").deleteMany({ created_at: { $gte: start } });
        await db.collection<UserModelServer>("user").deleteMany({ created_at: { $gte: start } });
        await db.collection<DeckProgressModelServer>("decksProgress").deleteMany({ created_at: { $gte: start } });
        
        await db.collection<UserModelServer>("users").updateOne({ _id: new ObjectId(authUser.id) }, { $set: authUserCpy });
    });

    it("can retrieve user by id", async () => {
        const getDoe = await requestGetUserById(authUser.id);

        expect(getDoe.data).not.toBeNull();
    });

    it("can retrieve the user's decks", async () => {
        const decksDoe = await requestUserDecks(authUser.id, authUser.id);

        expect(decksDoe.data).not.toBeNull();
    });

    it("can create a user", async () => {
        const createDoe = await requestCreateUser(AuthService.makeNewUserInstance({ name: "New Test User" }));

        expect(createDoe.data).not.toBeNull();
        expect(createDoe.data?.name).toBe("New Test User");
    });

    it("can update a user", async () => {
        const userToUpdate: UserModel = authUser;

        const updateDoe = await requestUpdateUser(userToUpdate.id, authUser.id,
            { name: "Updated User Name" }
        );

        expect(updateDoe.data).not.toBeNull();
        expect(updateDoe.data?.name).toBe("Updated User Name");
    });

    it("cannot update a user if not authorized", async () => {
        const userToUpdate: UserModel = authUser;

        const updateDoe = await requestUpdateUser(userToUpdate.id, "123",
            { name: "Updated User Name 2" }
        );

        expect(updateDoe.data).toBeNull();
    });

    it("can delete user", async () => {
        const createDoe = await requestCreateUser(AuthService.makeNewUserInstance({ name: "Test User" }));
        expect(createDoe.data).not.toBeNull();

        const deleteDoe = await requestDeleteUser(createDoe.data!.id, createDoe.data!.id, true);

        expect(deleteDoe.data).not.toBeNull();
        expect(deleteDoe.data).toBe(true);
    });

    it("cannot delete user if not authorized", async () => {
        const createDoe = await requestCreateUser(AuthService.makeNewUserInstance({ name: "Test User 2" }));
        expect(createDoe.data).not.toBeNull();

        const deleteDoe = await requestDeleteUser(createDoe.data!.id, authUser.id, true);

        expect(deleteDoe.data).toBe(false);
    });
});
