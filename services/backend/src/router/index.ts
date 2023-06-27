import { z } from 'zod'

import { procedure, router } from '@/core/trpc'
import cognitoProcedure from '@/core/trpc/procedure/cognito.procedure'

const appRouter = router({
	hello: procedure
		.input(
			z.object({
				name: z.string().optional(),
			}),
		)
		.query(async ({ input: { name = 'World' } }) => {
			return { message: `Hello ${name}!` }
		}),
	authHello: cognitoProcedure
		.input(
			z.object({
				name: z.string().optional(),
			}),
		)
		.query(async ({ input: { name = 'World' }, ctx: { cognitoPayload } }) => {
			return { message: `Hello ${name}!`, cognitoPayload }
		}),
})

export default appRouter
export type AppRouter = typeof appRouter
