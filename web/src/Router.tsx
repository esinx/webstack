import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import RouteErrorBoundary from '@/components/RouteErrorBoundary'
import RootLayout from '@/layouts/Root.layout'
import ConfirmPage from '@/pages/Confirm.page'
import HelloPage from '@/pages/Hello.page'
import IndexPage from '@/pages/Index.page'
import SignInPage from '@/pages/SignIn.page'
import SignUpPage from '@/pages/SignUp.page'

const router = createBrowserRouter([
	{
		path: '/',
		errorElement: <RouteErrorBoundary />,
		element: <RootLayout />,
		children: [
			{
				path: '/',
				element: <IndexPage />,
			},
			{
				path: '/hello',
				element: <HelloPage />,
			},
			{
				path: '/sign-in',
				element: <SignInPage />,
			},
			{
				path: '/sign-up',
				element: <SignUpPage />,
			},
			{
				path: '/confirm',
				element: <ConfirmPage />,
			},
		],
	},
])

const Router: React.FC = () => <RouterProvider router={router} />

export default Router
