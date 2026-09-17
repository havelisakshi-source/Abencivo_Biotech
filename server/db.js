import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
fs.mkdirSync("data",{recursive:true});
const db=new Database("data/abencivo.sqlite");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,composition TEXT,dosage_form TEXT,category TEXT,image_url TEXT,description TEXT,active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS enquiries(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,phone TEXT,email TEXT,city TEXT,type TEXT,message TEXT,status TEXT DEFAULT 'New',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,admin_id INTEGER,action TEXT,entity TEXT,entity_id INTEGER,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
// Migration: add columns that track who an enquiry was routed to and
// whether the notification email actually went out. Safe to run repeatedly —
// better-sqlite3/SQLite has no "ADD COLUMN IF NOT EXISTS", so we check first.
const enquiryColumns = db.prepare("PRAGMA table_info(enquiries)").all().map(c => c.name);
if (!enquiryColumns.includes("assigned_to")) {
  db.exec("ALTER TABLE enquiries ADD COLUMN assigned_to TEXT");
}
if (!enquiryColumns.includes("emailed")) {
  db.exec("ALTER TABLE enquiries ADD COLUMN emailed INTEGER DEFAULT 0");
}
if(!db.prepare("SELECT id FROM admins WHERE email=?").get(process.env.ADMIN_EMAIL)){
 const hash=bcrypt.hashSync(process.env.ADMIN_PASSWORD||"change-this-password",12);
 db.prepare("INSERT INTO admins(email,password_hash) VALUES(?,?)").run(process.env.ADMIN_EMAIL||"admin@abencivo.com",hash);
}
export default db;
