import { css } from '@emotion/react'
import { Title } from '@mantine/core'
import { PropsWithChildren } from 'react'

const Header: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<header
			css={css`
				padding: 1rem 0;
			`}
		>
			<Title order={1} color="blue">
				{children}
			</Title>
		</header>
	)
}

export default Header
