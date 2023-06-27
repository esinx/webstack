import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import fetch from 'cross-fetch'
import { PropsWithChildren } from 'react'
import superjson from 'superjson'

import auth from '@/core/auth'
import trpc from '@/core/trpc'
import useSingleton from '@/hooks/singleton'

type Props = {}

const TRPCProvider: React.FC<PropsWithChildren<Props>> = ({ children }) => {
	const queryClient = useSingleton(
		() =>
			new QueryClient({
				defaultOptions: {
					mutations: {
						useErrorBoundary: false,
					},
					queries: {
						suspense: true,
						useErrorBoundary: true,
					},
				},
			}),
	)
	const trpcClient = useSingleton(() =>
		trpc.createClient({
			transformer: superjson,
			links: [
				loggerLink(),
				httpBatchLink({
					url: import.meta.env.VITE_BACKEND_URL,
					fetch,
					headers: async () => {
						try {
							const session = await auth.getSession()
							const accessToken = session.getAccessToken()
							const jwt = accessToken.getJwtToken()
							return {
								Authorization: `Bearer ${jwt}`,
							}
						} catch (error) {
							return {}
						}
					},
				}),
			],
		}),
	)
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	)
}

export default TRPCProvider
