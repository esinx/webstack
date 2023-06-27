import 'dotenv/config'

import path from 'path'

import chalk from 'chalk'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const pool = new Pool({
	connectionString: process.argv[2] ?? process.env.DATABASE_URL,
})

const print = (msg: string) =>
	console.log(
		chalk.blueBright(`${chalk.bold('[migrator]')} ${chalk.white(msg)}`),
	)

const main = async () => {
	print('Indexing Migrations...')
	const migrationsFolder = path.resolve(__dirname, '../migrations')
	print('Establishing Connection...')
	const db = drizzle(pool, {
		logger: true,
	})
	print('Running Migrations...')
	await migrate(db, {
		migrationsFolder,
	})
	print('Done! Closing Connection...')
	await pool.end()
	process.exit(0)
}

main()
