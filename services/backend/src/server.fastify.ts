import { fastifyCors, FastifyCorsOptions } from '@fastify/cors'
import {
	fastifyTRPCPlugin,
	FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

import createFastifyContext from '@/core/trpc/context/fastify'
import router, { AppRouter } from '@/router'

const server = fastify()

/**
 * fastify register type is broken. Need to define Options explicitly.
 */
server.register<FastifyCorsOptions>(fastifyCors, {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true)
		return callback(null, true)
	},
})

/**
 * fastify register type is broken. Need to define Options explicitly.
 */
server.register<FastifyTRPCPluginOptions<AppRouter>>(fastifyTRPCPlugin, {
	prefix: '/trpc',
	trpcOptions: {
		batching: {
			enabled: true,
		},
		router,
		createContext: createFastifyContext,
		onError: ({ error, path }) => {
			console.error(error)
		},
	},
})

export default server
