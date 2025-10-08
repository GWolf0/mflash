/**
 * Handling db connection (mongodb)
 * dev mode uses local mongodb config
 */

import { MongoClient, Db } from "mongodb";

// init env mode
const env = process.env.NODE_ENV;
const isProduction = env === "production";

const uri = !isProduction ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;
const dbName = !isProduction ? process.env.MONGO_DB_LOCAL : process.env.MONGO_DB;


if (!uri) throw new Error("Please add MONGO_URI to your .env ");
if (!dbName) throw new Error("Please add MONGO_DB to your .env");

// init client, client promise handler, and db
let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let db: Db;

// In dev, use global to avoid re-creating on hot reload
if (!isProduction) {
    if (!(global as any)._mongoClientPromise) {
        client = new MongoClient(uri);
        (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

// get db helper
export async function getDB(): Promise<Db> {
    if (!db) {
        const c = await clientPromise;
        db = c.db(dbName);
    }
    return db;
}
