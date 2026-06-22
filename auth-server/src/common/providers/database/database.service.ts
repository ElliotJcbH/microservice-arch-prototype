import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      // connectionString: process.env.PG_URL,
      connectionString: "postgresql://postgres:rising-sun@192.168.254.103:5432/postgres"
    });

    // Test connection on startup
    try {
      const client = await this.pool.connect();
      console.log('Database connected successfully');
      client.release();
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async getClient() {
    return this.pool.connect();
  }
}