import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URI!;
const dbName = process.env.MONGO_DB!;

if (!uri) throw new Error("Please add MONGO_URI to your .env");
if (!dbName) throw new Error("Please add MONGO_DB to your .env");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let db: Db;

// In dev, use global to avoid re-creating on hot reload
if (process.env.NODE_ENV === "development") {
    if (!(global as any)._mongoClientPromise) {
        client = new MongoClient(uri);
        (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getDB(): Promise<Db> {
    if (!db) {
        const c = await clientPromise;
        db = c.db(dbName);
    }
    return db;
}
