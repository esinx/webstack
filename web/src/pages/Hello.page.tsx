import { Button, Code, Text, Title } from '@mantine/core'

import Header from '@/components/Header'
import auth from '@/core/auth'
import trpc from '@/core/trpc'
import { useGuardedUser } from '@/hooks/auth'
import { suspended } from '@/utils/suspended'

const HelloPage: React.FC = () => {
	const user = useGuardedUser()
	const helloQuery = trpc.authHello.useQuery({
		name: user.getUsername(),
	})

	const hello = suspended(helloQuery.data)

	return (
		<div>
			<Header>Welcome</Header>
			<Title order={2}>{hello.message}</Title>
			<Text color="dimmed" weight="bold">
				You're logged in!
			</Text>
			<Code block mt={12}>
				{JSON.stringify(hello.cognitoPayload, null, 2)}
			</Code>
			<Button onClick={async () => await auth.signOut()} fullWidth mt={24}>
				Sign Out
			</Button>
		</div>
	)
}

export default HelloPage
