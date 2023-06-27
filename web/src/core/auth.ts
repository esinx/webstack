import { Auth } from '@aws-amplify/auth'
import { Hub } from '@aws-amplify/core'
import type { CognitoUser } from 'amazon-cognito-identity-js'

Auth.configure({
	region: import.meta.env.VITE_COGNITO_REGION,
	userPoolId: import.meta.env.VITE_COGNITO_POOL_ID,
	userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
	storage: localStorage,
})

export type AuthEventName =
	| 'configured'
	| 'signIn'
	| 'signIn_failure'
	| 'signUp'
	| 'signUp_failure'
	| 'confirmSignUp'
	| 'completeNewPassword_failure'
	| 'autoSignIn'
	| 'autoSignIn_failure'
	| 'forgotPassword'
	| 'forgotPassword_failure'
	| 'forgotPasswordSubmit'
	| 'forgotPasswordSubmit_failure'
	| 'verify'
	| 'tokenRefresh'
	| 'tokenRefresh_failure'
	| 'cognitoHostedUI'
	| 'cognitoHostedUI_failure'
	| 'customOAuthState'
	| 'customState_failure'
	| 'parsingCallbackUrl'
	| 'userDeleted'
	| 'updateUserAttributes'
	| 'updateUserAttributes_failure'
	| 'signOut'

type Subscription = {
	id: string
	event: AuthEventName
	callback: (data: any) => void
}

const subscriptions = new Map<AuthEventName, Subscription[]>()

Hub.listen('auth', ({ payload }) => {
	console.log('[core.auth]', payload)
	const eventName = payload.event as AuthEventName
	const subs = subscriptions.get(eventName)
	subs?.forEach(sub => sub.callback(payload.data))
})

const auth = {
	signUp: async ({ email, password }: { email: string; password: string }) =>
		Auth.signUp({
			username: email,
			password,
			attributes: {
				email,
			},
			autoSignIn: {
				enabled: true,
			},
		}),
	sendSignUpConfirmationCode: async ({ email }: { email: string }) =>
		Auth.resendSignUp(email),
	confirmSignUp: async ({
		email,
		code,
	}: {
		email: string
		code: string
	}): Promise<'SUCCESS'> => Auth.confirmSignUp(email, code),
	signIn: async ({
		email,
		password,
	}: {
		email: string
		password: string
	}): Promise<CognitoUser> => Auth.signIn(email, password),

	signOut: async (): Promise<void> => Auth.signOut(),

	getSession: async () => Auth.currentSession(),
	getUser: async (): Promise<CognitoUser> => Auth.currentUserPoolUser(),

	subscribe: (event: AuthEventName, callback: Subscription['callback']) => {
		const subs = subscriptions.get(event) ?? []
		const id = `${event}-${subs.length}`
		subscriptions.set(event, [...subs, { id, event, callback }])
		return {
			unsubscribe: () => {
				const subs = subscriptions.get(event) ?? []
				subscriptions.set(
					event,
					subs.filter(sub => sub.id !== id),
				)
			},
		}
	},
	startAuthRefresh: async () => {
		const session = await Auth.currentSession()
		const expiresAt = session.getAccessToken().getExpiration()
		const refreshAt = expiresAt - 60 * 1000
		const refresh = async () => {
			try {
				await Auth.currentSession()
			} catch (error) {
				console.log(error)
			}
		}
		const refreshTimer = setInterval(refresh, refreshAt - Date.now())
		return {
			stop: () => clearInterval(refreshTimer),
		}
	},
}

export default auth
