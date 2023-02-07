import { Construct } from 'constructs'

import { Vpc, IVpc, InterfaceVpcEndpointAwsService } from 'aws-cdk-lib/aws-ec2'

export function importExistingVpc (scope: Construct, vpcId: string): IVpc {
  return Vpc.fromLookup(scope, 'ImportedVpc', {
    vpcId
  })
}

export function addVpcEcrDockerEndpoint (vpc: IVpc): void {
  vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
    service: InterfaceVpcEndpointAwsService.ECR_DOCKER
  })
}

export function addVpcEcrApiEndpoint (vpc: IVpc): void {
  vpc.addInterfaceEndpoint('EcrApiEndpoint', {
    service: InterfaceVpcEndpointAwsService.ECR
  })
}

export function addVpcCloudWatchLogsEndpoint (vpc: IVpc): void {
  vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
    service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS
  })
}

export function addVpcSecretsManagerEndpoint (vpc: IVpc): void {
  vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
    service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER
  })
}

export function addVpcCloudHsmEndpoint (vpc: IVpc): void {
  vpc.addInterfaceEndpoint('CloudHsmEndpoint', {
    service: InterfaceVpcEndpointAwsService.CLOUDHSM
  })
}
