import path from 'path'

import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'

interface CognitoStackProps extends cdk.StackProps {
	baseId: string
	email: cognito.UserPoolSESOptions
	service?: {
		environment?: Record<string, string>
		withWarmer?: boolean
	}
}

export class CognitoStack extends cdk.Stack {
	public readonly userPool: cognito.UserPool
	constructor(scope: Construct, id: string, props: CognitoStackProps) {
		super(scope, id, props)
		const {
			baseId,
			email,
			service = {
				withWarmer: true,
			},
		} = props

		const { environment, withWarmer = true } = service

		const postConfirmationHandler = new lambda.Function(
			this,
			`post-confirmation-handler:${baseId}`,
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				code: lambda.Code.fromAsset(
					path.resolve(
						__dirname,
						'..',
						'..',
						'services',
						'cognito',
						'build.lambda',
					),
				),
				handler: 'index.handler',
				memorySize: 128,
				timeout: cdk.Duration.seconds(90),
				environment,
				functionName: `post-confirmation-handler_${baseId.replace(/\./g, '-')}`,
			},
		)

		if (withWarmer) {
			const warmer = new events.Rule(this, `warmer:${baseId}`, {
				schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
				targets: [
					new targets.LambdaFunction(postConfirmationHandler, {
						event: events.RuleTargetInput.fromObject({
							health: 'check',
						}),
					}),
				],
			})
		}

		this.userPool = new cognito.UserPool(this, `user-pool:${baseId}`, {
			userPoolName: baseId.replace(/\./g, '-'),
			selfSignUpEnabled: true,
			accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
			autoVerify: {
				email: true,
			},
			email: cognito.UserPoolEmail.withSES(email),
			standardAttributes: {
				email: {
					mutable: true,
					required: true,
				},
			},
			mfa: cognito.Mfa.OPTIONAL,
			lambdaTriggers: {
				postConfirmation: postConfirmationHandler,
			},
		})
		const userPoolClient = this.userPool.addClient(
			`user-pool-client:${baseId}`,
			{
				accessTokenValidity: cdk.Duration.minutes(10),
				refreshTokenValidity: cdk.Duration.days(180),
				userPoolClientName: baseId.replace(/\./g, '-'),
			},
		)
		new cdk.CfnOutput(this, `user-pool-id:${baseId}`, {
			value: this.userPool.userPoolId,
			description: 'Cognito User Pool ID',
			exportName: `user-pool-id:${baseId.replace(/\./g, '-')}`,
		})
		new cdk.CfnOutput(this, `user-pool-client-id:${baseId}`, {
			value: userPoolClient.userPoolClientId,
			description: 'Cognito User Pool Client ID',
			exportName: `user-pool-client-id:${baseId.replace(/\./g, '-')}`,
		})
	}
}
