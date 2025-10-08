import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDB } from "@/lib/db";
import { requestCreateDeck, requestDeleteDeck, requestGetDeckById, requestSearchDecks, requestUpdateDeck } from "@/services/requests/deckRequests";
import DeckService from "@/services/systems/deckService";
import { DeckModel, DeckModelServer, DeckProgressModelServer, UserModel, UserModelServer } from "@/types/models";
import { convertUserServerToUserClient } from "@/helpers/conversionHelper";

describe("deck requests", () => {
    let db: Awaited<ReturnType<typeof getDB>>;
    let authUser: UserModel;
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
    });

    afterAll(async () => {
        await db.collection<DeckModelServer>("decks").deleteMany({ created_at: { $gte: start } });
        await db.collection<UserModelServer>("user").deleteMany({ created_at: { $gte: start } });
        await db.collection<DeckProgressModelServer>("decksProgress").deleteMany({ created_at: { $gte: start } });
    });

    it("can create deck and return it", async () => {
        const createDoe = await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Test Deck" }),
            authUser.id
        );

        expect(createDoe.data).not.toBeNull();
        expect(createDoe.data?.title).toBe("Test Deck");
    });

    it("cannot create deck if not authorized", async () => {
        const createDoe = await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Test Deck" }),
            ""
        );

        expect(createDoe.data).toBeNull();
    });

    it("can update deck and return it", async () => {
        const deckToUpdate: DeckModelServer | null = await db.collection<DeckModelServer>("decks").findOne();
        if (!deckToUpdate) throw new Error(`Couldn't get deck to update, condsider seeding the database`);

        const updateDoe = await requestUpdateDeck(deckToUpdate._id.toString(), deckToUpdate.user_id.toString(),
            { title: "Updated Title" }
        );

        expect(updateDoe.data).not.toBeNull();
        expect(updateDoe.data?.title).toBe("Updated Title");
    });

    it("cannot update deck if not authorized", async () => {
        const deckToUpdate: DeckModelServer | null = await db.collection<DeckModelServer>("decks").findOne();
        if (!deckToUpdate) throw new Error(`Couldn't get deck to update, condsider seeding the database`);

        const updateDoe = await requestUpdateDeck(deckToUpdate._id.toString(), deckToUpdate._id.toString(),
            { title: "Updated Title" }
        );

        expect(updateDoe.data).toBeNull();
    });

    it("can retrieve deck with its relations", async () => {
        const createDoe = await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Test Deck For Retrieval" }),
            authUser.id
        );
        expect(createDoe.data).not.toBeNull();

        const getDoe = await requestGetDeckById(
            createDoe.data!.id,
            authUser.id,
            ["user", "progress"]
        );

        expect(getDoe.data).not.toBeNull();
        expect(getDoe.data?.deck).not.toBeNull();
        expect(getDoe.data?.user).not.toBeNull();
        expect(getDoe.data?.progress).not.toBeNull();
    });

    it("cannot retrieve deck if not authorized", async () => {
        const createDoe = await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Test Deck For Retrieval", is_private: true }),
            authUser.id
        );
        expect(createDoe.data).not.toBeNull();

        const getDoe = await requestGetDeckById(
            createDoe.data!.id,
            "",
            ["user", "progress"]
        );

        expect(getDoe.data).toBeNull();
    });

    it("can retrieve filtered decks", async () => {
        // create a deck with is_private: true
        await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Test Deck For Search", is_private: true }),
            authUser.id
        );

        const searchDoe = await requestSearchDecks("Test Deck For Search", { is_private: true }, authUser.id);

        expect(searchDoe.data).not.toBeNull();
        expect(Array.isArray(searchDoe.data)).toBe(true);
        expect(searchDoe.data?.length).toBeGreaterThanOrEqual(1);
    });

    it("can delete deck", async () => {
        const created = await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Temp Deck" }),
            authUser.id
        );
        const deck: DeckModel = created.data!;

        const deleteDoe = await requestDeleteDeck(deck.id, authUser.id);
        expect(deleteDoe.data).toBe(true);
    });

    it("cannot delete deck if not authorized", async () => {
        const created = await requestCreateDeck(
            DeckService.makeNewDeckInstance({ title: "Temp Deck" }),
            authUser.id
        );
        const deck: DeckModel = created.data!;

        const deleteDoe = await requestDeleteDeck(deck.id, "");
        expect(deleteDoe.data).toBe(false);
    });
});
