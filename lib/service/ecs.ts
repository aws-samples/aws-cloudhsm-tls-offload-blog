import { Construct } from 'constructs'

import { ISubnet, IVpc, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import {
  ContainerImage,
  DeploymentControllerType,
  FargateService,
  LogDriver,
  Secret as EcsSecret
} from 'aws-cdk-lib/aws-ecs'
import { Repository as ImageRepository } from 'aws-cdk-lib/aws-ecr'
import { NetworkLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { NetworkLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns'
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam'

import { FargateTaskPolicy } from '../infra/iam'
import { CloudHsmProps } from '../service_stack'

export interface EcsFargateServiceProps {
  readonly vpc: IVpc
  readonly publicSubnets: ISubnet[]
  readonly privateSubnets: ISubnet[]
  readonly secrets: Record<string, EcsSecret>
  readonly cloudhsm: CloudHsmProps
  readonly ecrRepo: ImageRepository
  readonly containerName: string
}

export class EcsFargateService extends Construct {
  readonly serviceInternal: FargateService

  constructor (scope: Construct, id: string, props: EcsFargateServiceProps) {
    super(scope, id)

    // define customer managed policy
    const FargateTaskPolicyProps = {
      policyName: 'EcsFargateTaskPolicy'
    }
    const ecsFargateTaskPolicy = new FargateTaskPolicy(this, 'EcsFargateTaskPolicy', FargateTaskPolicyProps)

    const ecsFargateNlb = new NetworkLoadBalancer(this, 'EcsFargateNLB', {
      vpc: props.vpc,
      internetFacing: true,
      vpcSubnets: {
        subnets: props.publicSubnets
      }
    })

    const loadBalancedFargateService = new NetworkLoadBalancedFargateService(this, 'EcsFargateService', {
      vpc: props.vpc,
      loadBalancer: ecsFargateNlb,
      listenerPort: 443,
      memoryLimitMiB: 2048,
      cpu: 1024,
      desiredCount: 2,
      taskImageOptions: {
        image: ContainerImage.fromEcrRepository(props.ecrRepo),
        containerPort: 443,
        enableLogging: true,
        secrets: props.secrets,
        logDriver: LogDriver.awsLogs({
          streamPrefix: 'nginx-node',
          logGroup: new LogGroup(this, 'cloudhsm-tls-offload')
        }),
        environment: {
          CLUSTER_ID: props.cloudhsm.clusterId
        },
        containerName: props.containerName
      },
      taskSubnets: {
        subnets: props.privateSubnets
      },
      deploymentController: {
        type: DeploymentControllerType.ECS
      }
    })

    loadBalancedFargateService.service.taskDefinition.taskRole.addManagedPolicy(
      ManagedPolicy.fromManagedPolicyName(
        this,
        'EcsFargateManagedPolicy',
        ecsFargateTaskPolicy.taskPolicy.managedPolicyName
      )
    )
    loadBalancedFargateService.service.connections.allowFromAnyIpv4(Port.tcp(443))

    const cloudHsmSecurityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      'CloudHsmClusterSecurityGroup',
      props.cloudhsm.clusterSecurityGroup
    )
    cloudHsmSecurityGroup.addIngressRule(
      loadBalancedFargateService.service.connections.securityGroups[0],
      Port.tcpRange(2223, 2225)
    )

    this.serviceInternal = loadBalancedFargateService.service
  }
}
