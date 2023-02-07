import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { Repository as CodeRepository, Code } from 'aws-cdk-lib/aws-codecommit'
import { Repository as ImageRepository } from 'aws-cdk-lib/aws-ecr'
import { Project } from 'aws-cdk-lib/aws-codebuild'

import { createCodeBuildServiceRole } from './infra/iam'
import { createCodeCommitSourceProvider, createBuildSpecForPushToECR } from './build/codebuild'
import { Bucket } from 'aws-cdk-lib/aws-s3'

export interface TlsOffloadContainerBuildStackProps extends cdk.StackProps {
  readonly stackPrefix: string
}

export class TlsOffloadContainerBuildStack extends cdk.Stack {
  readonly sourceRepo: CodeRepository
  readonly sourceRepoBranch: string
  readonly imageRepository: ImageRepository
  readonly buildProject: Project
  readonly artifactsBucket: Bucket

  constructor (scope: Construct, id: string, props: TlsOffloadContainerBuildStackProps) {
    super(scope, id, props)

    const sourceBranchName = 'mainline'
    const sourcePath = 'resources'

    const codeBuildServiceRole = createCodeBuildServiceRole(this)

    // Create a CodeCommit repo to hold the source code
    this.sourceRepo = new CodeRepository(this, 'EcsFargateSourceRepository', {
      repositoryName: `${props.stackPrefix}-source`,
      code: Code.fromDirectory(sourcePath, sourceBranchName)
    })
    this.sourceRepoBranch = sourceBranchName

    // Create an ECR Repository to host the built docker images
    this.imageRepository = new ImageRepository(this, 'EcsFargateImageRepository')

    // Create a CodeBuild project to build the source and push to ECR
    const codebuildSourceProvider = createCodeCommitSourceProvider(this.sourceRepo)
    const codebuildBuildSpec = createBuildSpecForPushToECR(this.imageRepository, props.stackPrefix)
    this.buildProject = new Project(this, 'EcsFargateImageBuildProject', {
      source: codebuildSourceProvider,
      buildSpec: codebuildBuildSpec,
      role: codeBuildServiceRole,
      environment: {
        privileged: true
      }
    })

    // This bucket will be used to store built artifacts in our CodePipeline. However, since our build constructs
    // need to access this bucket, we will declare it here, otherwise CDK will declare it a circular dependency
    // Ref: https://github.com/aws/aws-cdk/issues/5657
    this.artifactsBucket = new Bucket(this, 'EcsFargateArtifactsBucket')
  }
}
