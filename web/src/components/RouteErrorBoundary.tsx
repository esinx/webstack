import { Code, Stack, Text, Title } from '@mantine/core'
import { Navigate, useRouteError } from 'react-router-dom'

import { UserNotAuthenticatedError } from '@/hooks/auth'
import RootLayout from '@/layouts/Root.layout'

const RouteErrorBoundary: React.FC = () => {
	const error = useRouteError()
	if (error instanceof UserNotAuthenticatedError) {
		return <Navigate to="/sign-in" replace />
	}
	return (
		<RootLayout>
			<Stack>
				<Title size={32} weight="bold">
					Error
				</Title>
				<Code block>
					{(() => {
						if (error instanceof Error) {
							return (
								<>
									<Text weight="bold">
										{error.name}: {error.message}
									</Text>
									<Text size={12}>{error.stack}</Text>
								</>
							)
						}
						return JSON.stringify(error, null, 2)
					})()}
				</Code>
			</Stack>
		</RootLayout>
	)
}

export default RouteErrorBoundary
