import * as cdk from 'aws-cdk-lib'

import { Construct } from 'constructs'

import { Repository as ImageRepository } from 'aws-cdk-lib/aws-ecr'

import {
  importExistingVpc,
  addVpcCloudHsmEndpoint,
  addVpcCloudWatchLogsEndpoint,
  addVpcEcrApiEndpoint,
  addVpcEcrDockerEndpoint,
  addVpcSecretsManagerEndpoint
} from './infra/vpc'
import { importSecret } from './infra/secrets'
import { EcsFargateService } from './service/ecs'

export interface NetworkConfig {
  readonly vpcId: string
  readonly publicSubnets: string[]
  readonly privateSubnets: string[]
}

export interface SecretsArns {
  readonly cloudHsmPin: string
  readonly fakePem: string
  readonly serverCert: string
  readonly clusterCert: string
}

export interface CloudHsmProps {
  readonly clusterId: string
  readonly clusterSecurityGroup: string
}

export interface TlsOffloadEcsServiceProps extends cdk.StackProps {
  readonly stackPrefix: string
  readonly networkConfig: NetworkConfig
  readonly secrets: SecretsArns
  readonly cloudhsm: CloudHsmProps
  readonly ecrRepo: ImageRepository
}

export class TlsOffloadEcsServiceStack extends cdk.Stack {
  readonly ecsFargateService: EcsFargateService

  constructor (scope: Construct, id: string, props: TlsOffloadEcsServiceProps) {
    super(scope, id, props)

    // Import the VPC and add VPC endpoints
    const vpc = importExistingVpc(this, props.networkConfig.vpcId)
    addVpcCloudHsmEndpoint(vpc)
    addVpcCloudWatchLogsEndpoint(vpc)
    addVpcEcrApiEndpoint(vpc)
    addVpcEcrDockerEndpoint(vpc)
    addVpcSecretsManagerEndpoint(vpc)

    // Import the public and private subnets for this VPC
    function fromSubnetString (scope: Construct) {
      return function (subnetString: string) {
        return cdk.aws_ec2.Subnet.fromSubnetId(scope, subnetString, subnetString)
      }
    }
    const publicSubnets = props.networkConfig.publicSubnets.map(fromSubnetString(this))
    const privateSubnets = props.networkConfig.privateSubnets.map(fromSubnetString(this))

    // Import secrets
    const secrets = {
      CLOUDHSM_PIN: importSecret(this, 'CLOUDHSM_PIN', props.secrets.cloudHsmPin),
      FAKE_PEM: importSecret(this, 'FAKE_PEM', props.secrets.fakePem),
      SERVER_CERT: importSecret(this, 'SERVER_CERT', props.secrets.serverCert),
      CLUSTER_CERT: importSecret(this, 'CLUSTER_CERT', props.secrets.clusterCert)
    }

    this.ecsFargateService = new EcsFargateService(this, 'EcsFargateService', {
      vpc,
      publicSubnets,
      privateSubnets,
      secrets,
      cloudhsm: props.cloudhsm,
      ecrRepo: props.ecrRepo,
      containerName: props.stackPrefix
    })
  }
}
