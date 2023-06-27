import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

import env from '@/core/env'

const pool = new Pool({
	connectionString: env.DATABASE_URL,
})

const db = drizzle(pool, {
	schema,
	logger: true,
})

export default db
