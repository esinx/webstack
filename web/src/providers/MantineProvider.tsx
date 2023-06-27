import {
	ColorScheme,
	ColorSchemeProvider,
	MantineProvider as OGMantineProvider,
} from '@mantine/core'
import { PropsWithChildren, useState } from 'react'

const MantineProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}
		>
			<OGMantineProvider
				withGlobalStyles
				theme={{
					colorScheme,
				}}
			>
				{children}
			</OGMantineProvider>
		</ColorSchemeProvider>
	)
}

export default MantineProvider
