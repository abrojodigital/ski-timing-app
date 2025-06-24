import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('skiTiming.db');
export default db;
