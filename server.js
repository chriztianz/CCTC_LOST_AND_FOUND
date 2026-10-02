const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = new Database("cctc.db"); // the database file is created automatically
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  school_id TEXT PRIMARY KEY COLLATE NOCASE,
  name TEXT NOT NULL, section TEXT NOT NULL, school_year TEXT NOT NULL,
  password_hash TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, school_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, category TEXT NOT NULL, location TEXT NOT NULL,
  description TEXT NOT NULL, image TEXT NOT NULL, contact_email TEXT,
  reported_date TEXT NOT NULL, claimed_date TEXT,
  reported_by TEXT NOT NULL, claimed_by TEXT
);`);

try { db.exec("ALTER TABLE users ADD COLUMN avatar TEXT"); } catch (e) {} // already exists? fine

const IMG = "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80";
const fmt = d => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
// Escape HTML so nobody can inject scripts through names/descriptions
const esc = s => String(s ?? "").trim().replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const toItem = r => ({
  id: "CCTC-" + String(r.id).padStart(3, "0"), name: r.name, category: r.category,
  location: r.location, description: r.description, image: r.image,
  reportedDate: r.reported_date, claimedDate: r.claimed_date,
  status: r.claimed_date ? "Claimed" : "Unclaimed",
  reportedBy: r.reported_by, claimedBy: r.claimed_by
});
const toUser = r => ({ schoolId: r.school_id, name: r.name, section: r.section,
  schoolYear: r.school_year, createdAt: r.created_at, avatar: r.avatar });

// Starter items (only added when the table is empty)
if (!db.prepare("SELECT COUNT(*) c FROM items").get().c) {
  const add = db.prepare(`INSERT INTO items (name,category,location,description,image,reported_date,reported_by)
    VALUES (?,?,?,?,?,?,'CCTC-SEED')`);
  add.run("Black Wallet", "Personal", "Cafeteria", "A small black wallet found under a cafeteria table.", IMG, fmt(new Date()));
  add.run("Blue Student ID", "School", "Main Building", "A blue student ID found near the main entrance.", IMG, fmt(new Date()));
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = db.prepare(
    "SELECT u.* FROM sessions s JOIN users u ON u.school_id = s.school_id WHERE s.token = ?").get(token);
  if (!user) return res.status(401).json({ error: "Please sign in." });
  req.user = user; req.token = token; next();
}

function startSession(user, res) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES (?, ?)").run(token, user.school_id);
  res.json({ token, user: toUser(user) });
}

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public")); // your website files live in /public

app.post("/api/signup", (req, res) => {
  const { schoolId, name, section, schoolYear, password } = req.body;
  if (!schoolId || !name || !section || !schoolYear || !password)
    return res.status(400).json({ error: "Please complete all required fields." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must contain at least 6 characters." });
  const id = esc(schoolId);
  if (db.prepare("SELECT 1 FROM users WHERE school_id = ?").get(id))
    return res.status(400).json({ error: "That School ID already has an account." });
  db.prepare("INSERT INTO users (school_id,name,section,school_year,password_hash,created_at) VALUES (?,?,?,?,?,?)").run(
    id, esc(name), esc(section), esc(schoolYear), bcrypt.hashSync(password, 10), fmt(new Date()));
  startSession(db.prepare("SELECT * FROM users WHERE school_id = ?").get(id), res);
});

app.post("/api/login", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE school_id = ?").get(esc(req.body.schoolId));
  if (!user || !bcrypt.compareSync(req.body.password || "", user.password_hash))
    return res.status(401).json({ error: "Incorrect School ID or password." });
  startSession(user, res);
});

app.post("/api/logout", auth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.token);
  res.json({ ok: true });
});

app.post("/api/profile/photo", auth, (req, res) => {
  const { avatar } = req.body; // null removes the photo
  if (avatar !== null && !(typeof avatar === "string" && avatar.length < 200000 &&
      /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(avatar)))
    return res.status(400).json({ error: "Invalid image." });
  db.prepare("UPDATE users SET avatar = ? WHERE school_id = ?").run(avatar, req.user.school_id);
  res.json({ user: toUser(db.prepare("SELECT * FROM users WHERE school_id = ?").get(req.user.school_id)) });
});

app.get("/api/me", auth, (req, res) => res.json({ user: toUser(req.user) }));

app.get("/api/items", (req, res) =>
  res.json(db.prepare("SELECT * FROM items ORDER BY id").all().map(toItem)));

app.post("/api/items", auth, (req, res) => {
  const { name, category, location, description, date, email, image } = req.body;
  if (!name || !category || !location || !description || !date || !email)
    return res.status(400).json({ error: "Please fill in all fields." });
  if (image != null && !(typeof image === "string" && image.length <= 1300000 &&
      /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image)))
    return res.status(400).json({ error: "Invalid item photo. Please choose an image and try again." });
  const info = db.prepare(`INSERT INTO items
    (name,category,location,description,image,contact_email,reported_date,reported_by)
    VALUES (?,?,?,?,?,?,?,?)`).run(esc(name), esc(category), esc(location), esc(description),
      image || IMG, esc(email), fmt(new Date(date + "T12:00:00")), req.user.school_id);
  res.json(toItem(db.prepare("SELECT * FROM items WHERE id = ?").get(info.lastInsertRowid)));
});

app.post("/api/items/:id/claim", auth, (req, res) => {
  const n = parseInt(req.params.id.replace("CCTC-", ""), 10);
  const r = db.prepare("UPDATE items SET claimed_date = ?, claimed_by = ? WHERE id = ? AND claimed_date IS NULL")
    .run(fmt(new Date()), req.user.school_id, n);
  if (!r.changes) return res.status(400).json({ error: "This item is already claimed or doesn't exist." });
  res.json({ ok: true });
});

app.listen(3000, () => console.log("Open http://localhost:3000"));
