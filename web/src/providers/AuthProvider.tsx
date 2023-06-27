import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useEffect } from 'react'

import auth from '@/core/auth'
import { useAuthStore } from '@/hooks/auth'

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const setUser = useAuthStore(state => state.setUser)
	const prefetchCognitoQuery = useQuery(
		['_prefetch', 'cognito'],
		async () => {
			try {
				console.log('[AuthProvider] refetching user...')
				const user = await auth.getUser()
				setUser(user)
				console.log('[AuthProvider] User:', user)
				return true
			} catch (error) {
				console.log('[AuthProvider] Error:', error)
				setUser(null)
			} finally {
				try {
					const session = await auth.getSession()
					console.log(
						'[AuthProvider] session life:',
						Math.floor(
							(session.getAccessToken().getExpiration() * 1000 -
								new Date().getTime()) /
								1000,
						),
					)
				} catch (error) {}
			}
			return true
		},
		{
			useErrorBoundary: false,
		},
	)
	useEffect(() => {
		const subscriptions = [
			auth.subscribe('signIn', async () => {
				prefetchCognitoQuery.refetch()
			}),
			auth.subscribe('autoSignIn', async () => {
				prefetchCognitoQuery.refetch()
			}),
			auth.subscribe('signOut', async () => {
				prefetchCognitoQuery.refetch()
			}),
			auth.subscribe('tokenRefresh', async () => {
				console.log('[AuthProvider] token refreshed')
				prefetchCognitoQuery.refetch()
			}),
		]
		return () => subscriptions.forEach(({ unsubscribe }) => unsubscribe())
	}, [])

	return <>{children}</>
}

export default AuthProvider
