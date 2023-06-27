import {
	awsLambdaRequestHandler,
	isPayloadV1 as _isPayloadV1,
	getHTTPMethod,
} from '@trpc/server/adapters/aws-lambda'
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyEventV2,
	Context as APIGWContext,
} from 'aws-lambda'

import createLambdaContext from '@/core/trpc/context/lambda'
import appRouter from '@/router'

const generateCORSHeaders = (origin: string) => ({
	'Access-Control-Allow-Origin': origin,
	'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization',
	'Access-Control-Allow-Methods':
		'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT',
})

const trpcHandler = awsLambdaRequestHandler({
	router: appRouter,
	createContext: createLambdaContext,
	onError: ({ error, path }) => {
		console.error(error)
	},
	responseMeta: ({ ctx }) => {
		if (!ctx?.headers?.origin) return {}
		return {
			headers: generateCORSHeaders(ctx.headers.origin),
		}
	},
})

type HealthCheckEvent = {
	health: 'check'
}

const isHealthCheckEvent = (event: any): event is HealthCheckEvent =>
	event?.health === 'check'

export const handler = async (
	event: APIGatewayProxyEvent | APIGatewayProxyEventV2 | HealthCheckEvent,
	context: APIGWContext,
) => {
	if (isHealthCheckEvent(event)) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'ok',
			}),
		}
	}
	
	const origin = event.headers?.origin
	const method = getHTTPMethod(event)

	if (method === 'OPTIONS' && origin) {
		return {
			statusCode: 200,
			headers: generateCORSHeaders(origin),
			body: JSON.stringify({
				status: 'ok',
			}),
		}
	}

	return trpcHandler(event, context)
}
