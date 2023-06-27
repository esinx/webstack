import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Header from '@/components/Header'
import auth from '@/core/auth'

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
})
type FormSchema = z.infer<typeof formSchema>

const SignInPage: React.FC = () => {
	const navigate = useNavigate()

	const {
		register,
		handleSubmit,
		formState: { isValid, isSubmitting },
	} = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
	})

	const onSubmit = handleSubmit(async data => {
		try {
			const res = await auth.signIn(data)
			const session = await auth.getSession()
			const user = await auth.getUser()
			navigate('/')
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'UserNotFoundException') {
					notifications.show({
						title: 'User not found',
						message: `We couldn't find a user with that email address.`,
					})
				}
				if (error.name === 'NotAuthorizedException') {
					notifications.show({
						title: 'Incorrect password',
						message: `The password you entered is incorrect.`,
					})
				}
				if (error.name === 'UserNotConfirmedException') {
					navigate('/confirm', { state: { email: data.email } })
				}
			}
			console.error(error)
		}
	})

	return (
		<>
			<Header>Sign In</Header>
			<main>
				<form onSubmit={onSubmit}>
					<TextInput {...register('email')} label="Email" type="email" />
					<TextInput
						{...register('password')}
						label="Password"
						type="password"
						mt={12}
					/>
					<Button
						type="submit"
						fullWidth
						disabled={!isValid}
						loading={isSubmitting}
						mt={24}
					>
						Sign In
					</Button>
				</form>
				<Link to="/sign-up">
					<Button variant="subtle" fullWidth mt={12}>
						Don't have an account? Sign up
					</Button>
				</Link>
			</main>
		</>
	)
}

export default SignInPage
