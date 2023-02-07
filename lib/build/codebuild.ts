import { BuildSpec, Source } from 'aws-cdk-lib/aws-codebuild'
import { Repository as CodeRepository } from 'aws-cdk-lib/aws-codecommit'
import { Repository as ImageRepository } from 'aws-cdk-lib/aws-ecr'

/**
 * Create a codebuild.Source object from a CodeCommit repo
 *
 * @param sourceRepository The name of the CodeCommit repository
 * @param sourceFilePath The S3 key or folder with the source artifacts.
 * @returns codebuild.Source object
 */
export function createCodeCommitSourceProvider (sourceRepository: CodeRepository): Source {
  const codeCommitSource = Source.codeCommit({
    repository: sourceRepository
  })

  return codeCommitSource
}

/**
 * Create a buildspec object that builds a docker images and pushes it
 * to an ECR repository
 *
 * @param repository ECR repository to push the dockerfile.
 * @param dockerfileName (optional) The name of the Dockerfile. Defaults to "Dockerfile" if not set.
 * @returns codebuild.BuildSpec object
 */
export function createBuildSpecForPushToECR (
  repository: ImageRepository,
  containerName: string,
  dockerfileName?: string
): BuildSpec {
  const uri = repository.repositoryUri
  const dockerfile = dockerfileName ?? 'Dockerfile'

  return BuildSpec.fromObject({
    version: 0.2,
    phases: {
      pre_build: {
        commands: [
          'echo Logging in to Amazon ECR... ',
          'aws --version',
          '$(aws ecr get-login --region $AWS_DEFAULT_REGION --no-include-email)',
                    `REPOSITORY_URI=${uri}`,
                    'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)', // eslint-disable-line no-template-curly-in-string
                    'IMAGE_TAG=${COMMIT_HASH:=latest}' // eslint-disable-line no-template-curly-in-string
        ]
      },
      build: {
        commands: [
                    `docker build -t $REPOSITORY_URI:latest . -f ${dockerfile}`,
                    'docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG'
        ]
      },
      post_build: {
        commands: [
          'docker push $REPOSITORY_URI:latest',
          'docker push $REPOSITORY_URI:$IMAGE_TAG',
          'echo "Writing image definitions file..."',
                    `printf '[{"name":"%s","imageUri":"%s"}]' '${containerName}' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json`
        ]
      }
    },
    artifacts: {
      files: ['./**/*', 'imagedefinitions.json']
    }
  })
}
