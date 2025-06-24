import db from './db';

export type ImpulseEntry = {
  id: number;
  timestamp: string;
  comment: string | null;
  tempComment?: string;
};

export const initDatabase = () => {
  db.withTransactionSync(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS impulses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        comment TEXT
      );
    `);
  });
};

export const insertImpulse = (timestamp: string) => {
  db.withTransactionSync(() => {
    db.runSync('INSERT INTO impulses (timestamp, comment) VALUES (?, ?)', [timestamp, null]);
  });
};

export const getAllImpulses = (): ImpulseEntry[] => {
  return db.getAllSync('SELECT * FROM impulses ORDER BY id DESC', []) as ImpulseEntry[];
};

export const updateImpulseComment = (id: number, comment: string) => {
  db.withTransactionSync(() => {
    db.runSync('UPDATE impulses SET comment = ? WHERE id = ?', [comment, id]);
  });
};

export const clearAllImpulses = () => {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM impulses', []);
    db.runSync("DELETE FROM sqlite_sequence WHERE name='impulses'", []);
  });
};


