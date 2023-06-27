import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Header from '@/components/Header'
import auth from '@/core/auth'

const formSchema = z
	.object({
		email: z.string().email('Please enter a valid email address.'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters long.')
			.regex(/[A-Z]/g, 'Password must contain at least 1 uppercase alphabet')
			.regex(/[a-z]/g, 'Password must contain at least 1 lowercase alphabet')
			.regex(/[0-9]/g, 'Password must contain at least 1 number'),
		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters long.'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

type FormSchema = z.infer<typeof formSchema>

const SignUpPage: React.FC = () => {
	const navigate = useNavigate()

	const {
		register,
		handleSubmit,
		formState: { isValid, isSubmitting, errors },
	} = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
	})

	const onSubmit = handleSubmit(async data => {
		try {
			const res = await auth.signUp(data)
			console.log(res)
			navigate('/confirm', { state: { email: data.email } })
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'UsernameExistsException') {
					notifications.show({
						title: 'User already exists',
						message: `A user with that email address already exists.`,
					})
				}
			}
		}
	})

	return (
		<>
			<Header>Sign Up</Header>
			<main>
				<form onSubmit={onSubmit}>
					<TextInput
						{...register('email')}
						label="Email"
						type="email"
						error={errors.email?.message}
					/>
					<TextInput
						{...register('password')}
						label="Password"
						type="password"
						mt={12}
						error={errors.password?.message}
					/>
					<TextInput
						{...register('confirmPassword')}
						label="Confirm Password"
						type="password"
						mt={12}
						error={errors.confirmPassword?.message}
					/>
					<Button
						type="submit"
						fullWidth
						disabled={!isValid}
						loading={isSubmitting}
						mt={24}
					>
						Sign Up
					</Button>
				</form>
				<Link to="/sign-in">
					<Button variant="subtle" fullWidth mt={12}>
						Already have an account? Sign In
					</Button>
				</Link>
			</main>
		</>
	)
}

export default SignUpPage
