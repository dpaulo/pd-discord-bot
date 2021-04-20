const config = require("../config.json");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(config.dbName);

db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS csgoPriceHistory (hash_name TEXT, user_id TEXT, lowest_price TEXT, median_price TEXT, last_checked TEXT NOT NULL)");
});

db.close();
