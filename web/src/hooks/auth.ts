import type { CognitoUser } from 'amazon-cognito-identity-js'
import { create } from 'zustand'

export interface AuthStoreState {
	user?: CognitoUser | null
}

export interface AuthStoreAction {
	setUser: (user: CognitoUser | null) => void
}

export interface AuthStore extends AuthStoreState, AuthStoreAction {}

export const useAuthStore = create<AuthStore>()((set, get) => ({
	setUser: user => set({ user }),
}))

export const useAuthenticated = () =>
	useAuthStore(
		store => typeof store.user !== 'undefined' && store.user !== null,
	)

export class UserNotAuthenticatedError extends Error {}

export const useGuardedUser = () => {
	const user = useAuthStore(state => state.user)
	if (!user) {
		throw new UserNotAuthenticatedError(
			'[useGuardedUser] Attempted to access user when user is not authenticated',
		)
	}
	return user
}
