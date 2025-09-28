// scripts/initDB.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI!;
const dbName = process.env.MONGO_DB!;

async function initDB() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Users collection
    await db.createCollection("users", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["email", "created_at", "updated_at"],
                properties: {
                    name: { bsonType: ["string", "null"] },
                    email: { bsonType: "string", },
                    image: { bsonType: ["string", "null"] },
                    created_at: { bsonType: "date" },
                    updated_at: { bsonType: "date" },

                }
            }
        }
    }).catch(() => {});

    // Decks collection
    await db.createCollection("decks", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "data", "user_id"],
            properties: {
                title: { bsonType: "string" },
                data: { bsonType: "object" },
                description: { bsonType: "string" },
                category: { bsonType: "string" },
                is_private: { bsonType: "bool" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                user_id: { bsonType: "objectId" },
            }
        }
    }
    }).catch(() => {});

    // Decks Progress collection
    await db.createCollection("decksProgress", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["user_id", "deck_id","data"],
            properties: {
                data: { bsonType: "object" },
                user_id: { bsonType: "objectId" },
                deck_id: { bsonType: "objectId" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
            }
        }
    }
    }).catch(() => {});

    console.log("✅ Database initialized");
    await client.close();
}

initDB();
