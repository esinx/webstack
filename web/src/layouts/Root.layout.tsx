import { css } from '@emotion/react'
import { PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'

const RootLayout: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<main
			css={css`
				width: 100vw;
				max-width: 400px;
				min-height: 100vh;

				margin: 0 auto;
				padding: 1rem;
			`}
		>
			{children}
			<Outlet />
		</main>
	)
}

export default RootLayout
