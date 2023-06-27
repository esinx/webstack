import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Center, PinInput, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Header from '@/components/Header'
import auth from '@/core/auth'

const formSchema = z.object({
	code: z.string().min(6, 'Code must be at least 6 characters long.'),
})

type FormSchema = z.infer<typeof formSchema>

const ConfirmPage: React.FC = () => {
	const { search, state } = useLocation()
	const navigate = useNavigate()

	const email = useMemo(() => {
		const params = new URLSearchParams(search)
		return params.get('email') ?? state?.email
	}, [search, state])

	const {
		control,
		handleSubmit,
		formState: { isValid, isSubmitting },
	} = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
	})

	const onResend = async () => {
		try {
			const res = await auth.sendSignUpConfirmationCode({ email })
			notifications.show({
				title: 'Code resent',
				message: `We sent a new confirmation code to ${email}`,
			})
		} catch (error) {
			console.error(error)
		}
	}
	const onSubmit = handleSubmit(async data => {
		try {
			const res = await auth.confirmSignUp({
				email,
				code: data.code,
			})
			const session = await auth.getSession()
			const user = await auth.getUser()
			navigate('/')
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'CodeMismatchException') {
					notifications.show({
						title: 'Incorrect code',
						message: `The code you entered is incorrect.`,
					})
				}
				if (error.name === 'NotAuthorizedException') {
					notifications.show({
						title: 'Cannot confirm user',
						message: `This user cannot be confirmed. Please contact support.`,
					})
				}
			}
		}
	})

	return (
		<>
			<Header>Confirm Your Email</Header>
			<main>
				<Text>
					We sent a confirmation 6-digit code to <b>{email}</b>. Please enter it
					below.
				</Text>
				<form onSubmit={onSubmit}>
					<Controller
						control={control}
						name="code"
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<Center>
								<PinInput
									value={value}
									onChange={onChange}
									error={typeof error !== 'undefined'}
									length={6}
									mt={24}
								/>
							</Center>
						)}
					/>
					<Button
						type="submit"
						fullWidth
						disabled={!isValid}
						loading={isSubmitting}
						mt={24}
					>
						Confirm
					</Button>
				</form>
				<Button fullWidth onClick={onResend} mt={12}>
					Resend Code
				</Button>
			</main>
		</>
	)
}

export default ConfirmPage
