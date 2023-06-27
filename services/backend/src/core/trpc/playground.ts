import { getFastifyPlugin } from 'trpc-playground/handlers/fastify'

import router from '@/router'

const loadPlaygroundPlugin = () =>
	getFastifyPlugin({
		playgroundEndpoint: '/playground',
		trpcApiEndpoint: '/trpc',
		router,
		request: {
			superjson: true,
		},
	})

export default loadPlaygroundPlugin
