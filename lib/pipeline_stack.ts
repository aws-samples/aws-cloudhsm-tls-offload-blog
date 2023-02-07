import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline'
import {
  CodeBuildAction,
  CodeCommitSourceAction,
  CodeCommitTrigger,
  EcsDeployAction
} from 'aws-cdk-lib/aws-codepipeline-actions'
import { Repository as CodeRepository } from 'aws-cdk-lib/aws-codecommit'
import { Project } from 'aws-cdk-lib/aws-codebuild'
import { FargateService } from 'aws-cdk-lib/aws-ecs'
import { Bucket } from 'aws-cdk-lib/aws-s3'

export interface TlsOffloadPipelineStackProps extends cdk.StackProps {
  readonly sourceRepository: {
    repo: CodeRepository
    branch: string
  }
  readonly buildProject: Project
  readonly ecsFargateService: FargateService
  readonly artifactsBucket: Bucket
}

export class TlsOffloadPipelineStack extends cdk.Stack {
  readonly pipelineInternal: Pipeline

  constructor (scope: Construct, id: string, props: TlsOffloadPipelineStackProps) {
    super(scope, id, props)

    const sourceOutput = new Artifact()
    const buildOutput = new Artifact()

    const sourceAction = new CodeCommitSourceAction({
      actionName: 'Source',
      repository: props.sourceRepository.repo,
      output: sourceOutput,
      trigger: CodeCommitTrigger.POLL,
      branch: props.sourceRepository.branch
    })

    const buildAction = new CodeBuildAction({
      actionName: 'ImageBuild',
      project: props.buildProject,
      input: sourceOutput,
      outputs: [buildOutput]
    })

    const deployAction = new EcsDeployAction({
      actionName: 'DeployService',
      service: props.ecsFargateService,
      input: buildOutput
    })

    this.pipelineInternal = new Pipeline(this, 'EcsFargateDeploymentPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction]
        },
        {
          stageName: 'ImageBuild',
          actions: [buildAction]
        },
        {
          stageName: 'DeployService',
          actions: [deployAction]
        }
      ],
      artifactBucket: props.artifactsBucket
    })
  }
}
