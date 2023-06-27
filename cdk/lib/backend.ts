import path from 'path'

import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53targets from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'

interface BackendServiceStackProps extends cdk.StackProps {
	baseId: string
	domainName: string
	hostedZoneId?: string
	service?: {
		basePath?: string
		environment?: Record<string, string>
		withWarmer?: boolean
	}
}

export class BackendServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: BackendServiceStackProps) {
		super(scope, id, props)
		const { baseId, domainName, hostedZoneId, service } = props
		const { environment, basePath, withWarmer = true } = service ?? {}

		const handler = new lambda.Function(this, `lambda:${baseId}`, {
			runtime: lambda.Runtime.NODEJS_18_X,
			code: lambda.Code.fromAsset(
				path.resolve(
					__dirname,
					'..',
					'..',
					'services',
					'backend',
					'build.lambda',
				),
			),
			handler: 'index.handler',
			memorySize: 512,
			timeout: cdk.Duration.seconds(90),
			environment,
			functionName: baseId.replace(/\./g, '-'),
		})

		const hostedZone = hostedZoneId
			? route53.HostedZone.fromHostedZoneAttributes(
					this,
					`hosted-zone:${baseId}`,
					{ hostedZoneId, zoneName: domainName },
			  )
			: route53.HostedZone.fromLookup(this, `hosted-zone:${baseId}`, {
					domainName,
					privateZone: false,
			  })

		const certificate = new acm.Certificate(this, `certificate:${baseId}`, {
			certificateName: domainName,
			domainName,
			validation: acm.CertificateValidation.fromDns(hostedZone),
		})

		const api = new apigateway.LambdaRestApi(this, `api:${baseId}`, {
			handler,
			proxy: true,
			deploy: true,
			disableExecuteApiEndpoint: true,
			integrationOptions: {
				allowTestInvoke: false,
			},
			domainName: {
				domainName,
				certificate,
				basePath,
			},
		})

		const record = new route53.ARecord(this, `record:${baseId}`, {
			zone: hostedZone,
			recordName: domainName,
			target: route53.RecordTarget.fromAlias(
				new route53targets.ApiGateway(api),
			),
		})

		if (withWarmer) {
			const warmer = new events.Rule(this, `warmer:${baseId}`, {
				schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
				targets: [
					new targets.LambdaFunction(handler, {
						event: events.RuleTargetInput.fromObject({
							health: 'check',
						}),
					}),
				],
			})
		}
	}
}
