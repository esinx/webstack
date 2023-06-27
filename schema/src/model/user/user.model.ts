import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { timestampColumn } from '@/column/timestamp.column'

export const $userProfile = pgTable('user_profile', {
	id: uuid('id'),
	email: text('email'),
	...timestampColumn,
})
