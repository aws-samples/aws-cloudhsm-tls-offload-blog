import { Construct } from 'constructs'

import { Effect, PolicyStatement, Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam'

export function createCodeBuildServiceRole (scope: Construct): Role {
  // We need a service role in order to push the built image to ECR
  // Ref: https://docs.aws.amazon.com/codebuild/latest/userguide/setting-up.html#setting-up-service-role
  const codebuildRole = new Role(scope, 'CodeBuildRole', {
    assumedBy: new ServicePrincipal('codebuild.amazonaws.com')
  })

  const cloudWatchLogsFullAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
  const ecrReadWriteAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPowerUser')
  const codeBuildRoleCustomPolicy = new PolicyStatement({
    actions: [
      'codecommit:GitPull',
      's3:GetObject',
      's3:GetObjectVersion',
      's3:PutObject',
      's3:GetBucketAcl',
      's3:GetBucketLocation'
    ],
    resources: ['*']
  })

  codebuildRole.addManagedPolicy(cloudWatchLogsFullAccessPolicy)
  codebuildRole.addManagedPolicy(ecrReadWriteAccessPolicy)
  codebuildRole.addToPolicy(codeBuildRoleCustomPolicy)

  return codebuildRole
}

export interface FargateTaskPolicyProps {
  readonly policyName: string
}

export class FargateTaskPolicy extends Construct {
  readonly taskPolicy: ManagedPolicy

  constructor (scope: Construct, id: string, props: FargateTaskPolicyProps) {
    super(scope, id)

    // Create a Managed Policy and associate it with the role
    const managedPolicy = new ManagedPolicy(this, 'managed-policy-id', {
      description: 'Fargate Task Role for CloudHSM',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'ecr:GetAuthorizationToken',
            'ecr:BatchCheckLayerAvailability',
            'ecr:GetDownloadUrlForLayer',
            'ecr:GetRepositoryPolicy',
            'ecr:DescribeRepositories',
            'ecr:ListImages',
            'ecr:DescribeImages',
            'ecr:BatchGetImage',
            'ecr:GetLifecyclePolicy',
            'ecr:GetLifecyclePolicyPreview',
            'ecr:ListTagsForResource',
            'ecr:DescribeImageScanFindings',
            'cloudhsm:Get*',
            'cloudhsm:List*',
            'cloudhsm:Describe*'
          ],
          resources: ['*']
        })
      ]
    })
    this.taskPolicy = managedPolicy
  }

  public getFargateTaskPolicy (): ManagedPolicy {
    return this.taskPolicy
  }
}

export interface FargateTaskRoleProps {
  readonly roleName: string
}

export class FargateTaskRole extends Construct {
  readonly taskRole = Role

  constructor (scope: Construct, id: string, props: FargateTaskRoleProps) {
    super(scope, id)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const codebuildRole = new Role(this, 'FargateTaskRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com')
    })
  }
}
