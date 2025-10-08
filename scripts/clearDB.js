// scripts/clearDB.js

use("flashy");

// clear collections
db.users.deleteMany({});
db.decks.deleteMany({});
db.decksProgress.deleteMany({});

print("✅ DB cleared");
