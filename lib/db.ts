import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('landhub');
    console.log('[v0] Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    return connectToDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
