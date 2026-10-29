import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Configure reliable DNS servers for MongoDB Atlas SRV queries on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

export type DatabaseState = 'connected' | 'connecting' | 'disconnected' | 'in_memory';

class DatabaseConnection {
  private state: DatabaseState = 'disconnected';

  async connect(): Promise<DatabaseState> {
    if (!env.MONGODB_URI) {
      if (env.NODE_ENV === 'production') {
        console.error('[celebration-api] FATAL: MONGODB_URI is required in production mode. Refusing silent fallback to in-memory store.');
        this.state = 'disconnected';
        throw new Error('MONGODB_URI is required in production mode. Refusing silent fallback to in-memory store.');
      }
      console.warn('[celebration-api] No MONGODB_URI configured. Running with in-memory persistence fallback for local development.');
      this.state = 'in_memory';
      return this.state;
    }

    try {
      this.state = 'connecting';
      mongoose.set('strictQuery', true);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: env.NODE_ENV !== 'production'
      });
      this.state = 'connected';
      console.log('[celebration-api] Successfully connected to MongoDB Atlas / Instance.');
      return this.state;
    } catch (error: any) {
      console.error('[celebration-api] MongoDB connection error:', error.message);
      if (env.NODE_ENV === 'production') {
        this.state = 'disconnected';
        throw new Error(`FATAL: MongoDB connection failed in production mode: ${error.message}`);
      } else {
        console.warn('[celebration-api] Falling back to in-memory persistence for local development and testing.');
        this.state = 'in_memory';
      }
      return this.state;
    }
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    this.state = 'disconnected';
  }

  getState(): DatabaseState {
    if (mongoose.connection.readyState === 1) {
      return 'connected';
    }
    return this.state;
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const database = new DatabaseConnection();
export const isConnectedToDatabase = (): boolean => database.isConnected();
export const connectToDatabase = (): Promise<DatabaseState> => database.connect();
export const disconnectFromDatabase = (): Promise<void> => database.disconnect();
