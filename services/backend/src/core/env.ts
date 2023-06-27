import 'dotenv/config'

import { z, ZodError } from 'zod'

const envSchema = z.object({
	DATABASE_URL: z.string(),
	AWS_COGNITO_POOL_ID: z.string(),
	AWS_COGNITO_CLIENT_ID: z.string(),

	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_ACCESS_KEY_SECRET: z.string().optional(),
})

const parseEnv = () => {
	try {
		return envSchema.parse(process.env)
	} catch (error) {
		if (error instanceof ZodError) {
			console.log(
				`[ENV]: Invalid Environment! See keys listed below.\n`,
				error.issues
					.map(issue => `\t${issue.path}: ${issue.message}`)
					.join('\n'),
			)
			process.exit(1)
		}
	}
}

// ENFORCED TYPE: process will exit
const env = parseEnv() as z.infer<typeof envSchema>

export default env
