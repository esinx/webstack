import 'dotenv/config'

import server from './server.fastify'

import loadPlaygroundPlugin from '@/core/trpc/playground'

const PORT = Number(process.env.PORT ?? 8000)

const listen = async () => {
	try {
		const address = await server.listen({
			port: PORT,
			host: '0.0.0.0',
		})
		await server.ready()
		console.log(`🚀 Server Listening on: ${address}`)
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

const registerPlayground = async () => {
	try {
		console.log(`🛝 Loading playground plugin...`)
		const plugin = await loadPlaygroundPlugin()
		server.register(plugin, {
			prefix: '/playground',
		})
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

const main = async () => {
	try {
		if (process.env.NODE_ENV !== 'production') {
			await registerPlayground()
		}
		await listen()
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

main()
