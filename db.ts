import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  bookedTrips: any[];
}

interface Database {
  users: User[];
}

const initialDb: Database = {
  users: [],
};

export const getDb = (): Database => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveDb = (db: Database) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};
