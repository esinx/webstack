import type { PostConfirmationTriggerHandler } from 'aws-lambda'

import db from '@/core/db'
import { $userProfile } from '@/core/db/schema'

type HealthCheckEvent = {
	health: 'check'
}

const isHealthCheckEvent = (event: any): event is HealthCheckEvent =>
	event?.health === 'check'

export const handler: PostConfirmationTriggerHandler = async (
	event,
	context,
) => {
	if (isHealthCheckEvent(event)) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'ok',
			}),
		}
	}
	const [res] = await db
		.insert($userProfile)
		.values({
			id: event.userName,
			email: event.request.userAttributes.email,
		})
		.returning()

	console.log(`Registered user ${res.id}`)
	return event
}
