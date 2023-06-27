import { TRPCError } from '@trpc/server'

import { middleware, procedure } from '@/core/trpc'
import cognito from '@/utils/cognito'

/**
 * @description cognito-authorized procedure
 */
const cognitoProcedure = procedure.use(
	middleware(async ({ ctx, next }) => {
		const { authorization } = ctx.headers
		const token = authorization?.match(/Bearer (.+)/)?.[1]
		if (!token) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Unauthorized',
			})
		}
		const cognitoPayload = await cognito.verify(token)
		return next({
			ctx: {
				...ctx,
				cognitoPayload,
			},
		})
	}),
)

export default cognitoProcedure
