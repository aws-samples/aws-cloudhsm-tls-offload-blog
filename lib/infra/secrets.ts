import { Construct } from 'constructs'

import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Secret as EcsSecret } from 'aws-cdk-lib/aws-ecs'

export function importSecret (scope: Construct, secretName: string, secretArn: string): EcsSecret {
  return EcsSecret.fromSecretsManager(Secret.fromSecretCompleteArn(scope, secretName, secretArn))
}
