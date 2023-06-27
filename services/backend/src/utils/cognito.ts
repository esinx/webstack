import { CognitoJwtVerifier } from 'aws-jwt-verify'

import env from '@/core/env'

const verifier = CognitoJwtVerifier.create({
	userPoolId: env.AWS_COGNITO_POOL_ID,
	clientId: env.AWS_COGNITO_CLIENT_ID,
	tokenUse: 'access',
})

const cognito = {
	verify: async (token: string) => verifier.verify(token),
}

export default cognito
