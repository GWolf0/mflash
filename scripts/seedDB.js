// scripts/seedDB.js

/**
 * Trigger with seedDB.bat
 * DB seeder
 */

use("flashy");

// clean collections first
db.users.deleteMany({});
db.decks.deleteMany({});
db.decksProgress.deleteMany({});

function now() { return new Date(); }

// --- create 3 users ---
const users = [
  {
    name: "Alice",
    email: "alice@example.com",
    image: null,
    created_at: now(),
    updated_at: now(),
  },
  {
    name: "Bob",
    email: "bob@example.com",
    image: null,
    created_at: now(),
    updated_at: now(),
  },
  {
    name: "Charlie",
    email: "charlie@example.com",
    image: null,
    created_at: now(),
    updated_at: now(),
  },
];

const userResult = db.users.insertMany(users);
const userIds = Object.values(userResult.insertedIds);

// --- create 9 decks (random users) ---
const decks = [];

for (let i = 1; i <= 9; i++) {
  const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
  decks.push({
    title: `Deck ${i}`,
    description: `This is deck ${i}`,
    category: "general",
    data: { cards: [] }, // placeholder
    is_private: i % 2 === 0, // alternate private/public
    created_at: now(),
    updated_at: now(),
    user_id: randomUser,
  });
}

db.decks.insertMany(decks);

print("✅ Seed complete: 3 users + 9 decks created");
