import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/hooks/auth'

const IndexPage: React.FC = () => {
	const { user } = useAuthStore()
	if (user) {
		return <Navigate to="/hello" replace />
	}
	return <Navigate to="/sign-in" replace />
}

export default IndexPage
