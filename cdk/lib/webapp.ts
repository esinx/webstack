import path from 'path'

import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'

interface WebAppStackProps extends cdk.StackProps {
	baseId: string
	domainName: string
	hostedZoneId?: string
	certificateArn: string
}

export class WebAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: WebAppStackProps) {
		super(scope, id, props)

		const { baseId, domainName, hostedZoneId, certificateArn } = props

		const bucket = new s3.Bucket(this, `bucket:${baseId}`, {
			bucketName: domainName,
			accessControl: s3.BucketAccessControl.PRIVATE,
		})

		const deployment = new s3deploy.BucketDeployment(
			this,
			`bucket-deployment:${baseId}`,
			{
				destinationBucket: bucket,
				sources: [
					s3deploy.Source.asset(path.resolve(__dirname, '../../web/build')),
				],
			},
		)

		const hostedZone = hostedZoneId
			? route53.HostedZone.fromHostedZoneAttributes(
					this,
					`hosted-zone:${baseId}`,
					{
						hostedZoneId,
						zoneName: domainName,
					},
			  )
			: route53.HostedZone.fromLookup(this, `hosted-zone:${baseId}`, {
					domainName,
					privateZone: false,
			  })

		const certificate = acm.Certificate.fromCertificateArn(
			this,
			`certificate:${baseId}`,
			certificateArn,
		)

		const identity = new cloudfront.OriginAccessIdentity(
			this,
			`identity:${baseId}`,
		)
		bucket.grantRead(identity)

		const distribution = new cloudfront.Distribution(
			this,
			`distribution:${baseId}`,
			{
				defaultRootObject: 'index.html',
				errorResponses: [
					{
						httpStatus: 404,
						responseHttpStatus: 200,
						responsePagePath: '/index.html',
					},
				],
				defaultBehavior: {
					origin: new cloudfrontOrigins.S3Origin(bucket, {
						originAccessIdentity: identity,
					}),
					viewerProtocolPolicy:
						cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				},
				certificate,
				domainNames: [domainName],
				sslSupportMethod: cloudfront.SSLMethod.SNI,
			},
		)
		new route53.ARecord(this, `record:${baseId}`, {
			target: route53.RecordTarget.fromAlias(
				new route53targets.CloudFrontTarget(distribution),
			),
			zone: hostedZone,
			recordName: domainName,
		})
	}
}
