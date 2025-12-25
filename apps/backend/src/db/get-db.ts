import { drizzle } from 'drizzle-orm/d1'
import { relations } from './relations'

export const getDb = (db: D1Database) => drizzle(db, { relations })
