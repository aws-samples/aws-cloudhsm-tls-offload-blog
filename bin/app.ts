#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'

import { TlsOffloadContainerBuildStack } from '../lib/build_stack'
import { TlsOffloadEcsServiceStack } from '../lib/service_stack'
import { TlsOffloadPipelineStack } from '../lib/pipeline_stack'

import config from '../app_config.json'

const applicationAccount = config.applicationAccount
const applicationRegion = config.applicationRegion

const networkConfig = config.networkConfig
const secrets = config.secrets
const cloudhsm = config.cloudhsm

const app = new cdk.App()

const stackPrefix = 'cloudhsm-tls-offload'

const containerBuild = new TlsOffloadContainerBuildStack(app, 'TlsOffloadContainerBuildStack', {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: { account: applicationAccount, region: applicationRegion },
  stackPrefix
})

const ecsService = new TlsOffloadEcsServiceStack(app, 'TlsOffloadEcsServiceStack', {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: { account: applicationAccount, region: applicationRegion },
  networkConfig,
  secrets,
  cloudhsm,
  ecrRepo: containerBuild.imageRepository,
  stackPrefix
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deploymentPipeline = new TlsOffloadPipelineStack(app, 'TlsOffloadPipelineStack', {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: { account: applicationAccount, region: applicationRegion },
  sourceRepository: {
    repo: containerBuild.sourceRepo,
    branch: containerBuild.sourceRepoBranch
  },
  buildProject: containerBuild.buildProject,
  ecsFargateService: ecsService.ecsFargateService.serviceInternal,
  artifactsBucket: containerBuild.artifactsBucket
})
