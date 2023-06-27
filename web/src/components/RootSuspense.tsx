import { LoadingOverlay } from '@mantine/core'
import { PropsWithChildren, Suspense } from 'react'

const RootSuspense: React.FC<PropsWithChildren> = ({ children }) => (
	<Suspense fallback={<LoadingOverlay visible overlayBlur={2} />}>
		{children}
	</Suspense>
)

export default RootSuspense
