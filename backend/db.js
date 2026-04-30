const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '../data/letty.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('SQLite init error:', err);
});
const { promisify } = require('util');
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

async function init() {
  await db.runAsync(`CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    filename TEXT,
    originalname TEXT,
    path TEXT,
    course TEXT,
    semester TEXT,
    year TEXT,
    type TEXT,
    content TEXT,
    uploadedAt TEXT
  )`);
  await db.runAsync(`CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    material_id TEXT,
    question TEXT,
    answer TEXT,
    createdAt TEXT
  )`);
}

module.exports = { db, init };
