import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

interface CertStackProps extends cdk.StackProps {
	baseId: string
	domainName: string
	hostedZoneId?: string
}

/**
 * This stack exists to create a certificate in us-east-1, which is required for
 * CloudFront distributions.
 */
export class CertStack extends cdk.Stack {
	public readonly certificate: acm.Certificate

	constructor(scope: Construct, id: string, props: CertStackProps) {
		super(scope, id, props)

		const { baseId, domainName, hostedZoneId } = props

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

		this.certificate = new acm.Certificate(this, `certificate:${baseId}`, {
			certificateName: domainName,
			domainName,
			validation: acm.CertificateValidation.fromDns(hostedZone),
		})

		new cdk.CfnOutput(this, `certificate-arn:${baseId}`, {
			value: this.certificate.certificateArn,
		})
	}
}
