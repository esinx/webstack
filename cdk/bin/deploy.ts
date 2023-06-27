#!/usr/bin/env node
import dotenv from 'dotenv'

import fs from 'fs/promises'
import path from 'path'

import * as cdk from 'aws-cdk-lib'

import 'source-map-support/register'

import { BackendServiceStack } from '../lib/backend'
import { CertStack } from '../lib/cert'
import { CognitoStack } from '../lib/cognito'
import { WebAppStack } from '../lib/webapp'

dotenv.config()

const {
	PROJECT_IDENTIFIER,
	SES_EMAIL,
	HOSTED_ZONE_ID,
	AWS_REGION,
	CDK_DEFAULT_REGION,
} = process.env

const main = async () => {
	const app = new cdk.App()
	if (SES_EMAIL) {
		const envfile = await fs.readFile(path.resolve('./.cognito.env'), 'utf-8')
		const environment = dotenv.parse(envfile)
		new CognitoStack(app, 'cognito', {
			stackName: 'Cognito',
			baseId: `${PROJECT_IDENTIFIER}.cognito`,
			email: {
				fromEmail: SES_EMAIL,
			},
			service: {
				environment,
			},
		})
	}
	{
		const envfile = await fs.readFile(path.resolve('./.backend.env'), 'utf-8')
		const environment = dotenv.parse(envfile)
		new BackendServiceStack(app, 'backend', {
			stackName: 'BackendService',
			baseId: `${PROJECT_IDENTIFIER}.backend`,
			domainName: 'api.example.com',
			hostedZoneId: HOSTED_ZONE_ID,
			service: {
				environment,
				basePath: 'trpc',
			},
		})
	}
	const {
		certificate: { certificateArn },
	} = new CertStack(app, 'cert', {
		stackName: 'Cert',
		baseId: `${PROJECT_IDENTIFIER}.cert`,
		hostedZoneId: HOSTED_ZONE_ID,
		domainName: 'example.com',
		crossRegionReferences: true,
		env: {
			region: 'us-east-1',
		},
	})
	new WebAppStack(app, 'webapp', {
		stackName: 'WebApp',
		baseId: `${PROJECT_IDENTIFIER}.webapp`,
		domainName: 'example.com',
		hostedZoneId: HOSTED_ZONE_ID,
		certificateArn,
		crossRegionReferences: true,
		env: {
			region: AWS_REGION || CDK_DEFAULT_REGION,
		},
	})
}

main()
