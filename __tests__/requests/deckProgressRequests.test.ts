import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDB } from "@/lib/db";
import { requestCreateDeck, requestDeleteDeck, requestGetDeckById, requestSearchDecks, requestUpdateDeck } from "@/services/requests/deckRequests";
import DeckService from "@/services/systems/deckService";
import { DeckModel, DeckModelServer, DeckProgressModelServer, UserModel, UserModelServer } from "@/types/models";
import { convertUserServerToUserClient } from "@/helpers/conversionHelper";
import { requestCreateDeckProgress, requestDeleteDeckProgressByUserId, requestDeleteDeckProgressByUserIdAndDeckId, requestGetDeckProgressByDeckIdAndUserId, requestUpdateDeckProgress } from "@/services/requests/deckProgressRequests";
import { ObjectId } from "mongodb";

describe("deck progress requests", () => {
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

    it("can retrieve deck progress by deckid and user id", async () => {
        // get deck
        const {deck, deckProgressId} = await createDeckAndProgressForTest(db, authUser);

        const getDoe = await requestGetDeckProgressByDeckIdAndUserId(deck._id.toString(), authUser.id, authUser.id);

        expect(getDoe.data).not.toBeNull();
    });

    it("cannot retrieve deck progress by deckid and user id if not authorized", async () => {
        // get deck
        const {deck, deckProgressId} = await createDeckAndProgressForTest(db, authUser);

        const getDoe = await requestGetDeckProgressByDeckIdAndUserId(deck._id.toString(), authUser.id, "");

        expect(getDoe.data).toBeNull();
    });

    it("can create deck progress", async () => {
        // get deck
        const deck: DeckModelServer | null = await db.collection<DeckModelServer>("decks").findOne();
        if (!deck) throw new Error(`Couldn't find test deck for deck progress insert test`);

        const createDoe = await requestCreateDeckProgress(
            DeckService.makeNewDeckProgressModelInstance(deck._id.toString(), authUser.id, deck.data.cards),
            authUser.id
        );

        expect(createDoe.data).not.toBeNull();
    });

    it("cannot create deck progress if not authorized", async () => {
        // get deck
        const deck: DeckModelServer | null = await db.collection<DeckModelServer>("decks").findOne();
        if (!deck) throw new Error(`Couldn't find test deck for deck progress insert test`);

        const createDoe = await requestCreateDeckProgress(
            DeckService.makeNewDeckProgressModelInstance(deck._id.toString(), authUser.id, deck.data.cards),
            ""
        );

        expect(createDoe.data).toBeNull();
    });

    it("can update deck progress", async () => {
        // get deck
        const {deck, deckProgressId} = await createDeckAndProgressForTest(db, authUser);

        const updateDoe = await requestUpdateDeckProgress(deckProgressId.toString(), { data: { cardsStats: [] } }, authUser.id);

        expect(updateDoe.data).not.toBeNull();
        expect(updateDoe.data?.data.cardsStats.length).toBe(0);
    });

    it("cannot update deck progress if not authorized", async () => {
        // get deck
        const {deck, deckProgressId} = await createDeckAndProgressForTest(db, authUser);

        const updateDoe = await requestUpdateDeckProgress(deckProgressId.toString(), { data: { cardsStats: [] } }, "");

        expect(updateDoe.data).toBeNull();
    });

    it("can delete deck progress", async () => {
        const {deck, deckProgressId} = await createDeckAndProgressForTest(db, authUser);

        const deleteDoe = await requestDeleteDeckProgressByUserIdAndDeckId(authUser.id, deck._id.toString(), authUser.id);

        expect(deleteDoe.data).toBe(true);
    });

    it("cannot delete deck progress if not authorized", async () => {
        const {deck, deckProgressId} = await createDeckAndProgressForTest(db, authUser);

        const deleteDoe = await requestDeleteDeckProgressByUserIdAndDeckId(authUser.id, deck._id.toString(), "");

        expect(deleteDoe.data).toBe(false);
    });
});

async function createDeckAndProgressForTest(db: Awaited<ReturnType<typeof getDB>>, authUser: UserModel):
    Promise<{ deck: DeckModelServer, deckProgressId: ObjectId }> {
    // get deck
    const deck: DeckModelServer | null = await db.collection<DeckModelServer>("decks").findOne();
    if (!deck) throw new Error(`Couldn't find test deck for deck progress insert test`);

    // create deck progress
    const {user_id, deck_id, ...data} = DeckService.makeNewDeckProgressModelInstance(deck._id.toString(), authUser.id, deck.data.cards);
    const deckProgress = await db.collection("decksProgress").insertOne(
        {...data, user_id: new ObjectId(user_id), deck_id: new ObjectId(deck_id)}
    );
    if (!deckProgress) throw new Error(`Couldn't insert test deck_progress for deck progress update test`);

    return { deck, deckProgressId: deckProgress.insertedId };
}
