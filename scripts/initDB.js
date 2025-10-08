// scripts/initDB.js

/**
 * Trigger with initDB.bat
 * Create required collections with validators
 * 3 Collections (users, decks, decksProgress)
 */

// switch to your database
use("flashy");

// Users collection
db.createCollection("users", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "created_at", "updated_at"],
            properties: {
                name: { bsonType: ["string", "null"] },
                email: { bsonType: "string" },
                image: { bsonType: ["string", "null"] },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
});

// Decks collection
db.createCollection("decks", {
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
                user_id: { bsonType: "objectId" }
            }
        }
    }
});

// DecksProgress collection
db.createCollection("decksProgress", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["user_id", "deck_id", "data"],
            properties: {
                data: { bsonType: "object" },
                user_id: { bsonType: "objectId" },
                deck_id: { bsonType: "objectId" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
});

print("✅ Database initialized");
