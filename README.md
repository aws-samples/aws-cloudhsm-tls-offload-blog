# aws-cloudhsm-tls-offload-blog 

## Description

Sample code written using the [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) demonstrating how to deploy a managed AWS ECS web service backed by AWS CloudHSM with build and deployment automation.

This repository is referenced by the AWS Security Blog: ["Automate the deployment of an NGINX web service using Amazon ECS with TLS offload in CloudHSM"](https://aws.amazon.com/blogs/security/automate-the-deployment-of-an-nginx-web-service-using-amazon-ecs-with-tls-offload-in-cloudhsm/).

## Support

If you have questions about this post, start a new thread on the [Security, Identity and Compliance re:Post](https://repost.aws/tags/TAEEfW2o7QS4SOLeZqACq9jA/security-identity-compliance) or [contact AWS Support](https://console.aws.amazon.com/support/home).

## Authors and acknowledgment

* Alket Memushaj - Solutions Architect at Capital Markets
* Nikolas Nikravesh - Software Development Engineer at AWS CloudHSM
* Brad Woodward - Senior Customer Delivery Architect, ProServe

## License

Copyright 2023 Amazon Web Services, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 or in the "LICENSE" file accompanying this project. 

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

# Project Info

## Prerequisites

This project includes a Dockerfile which installs all necessary dependencies to deploy the CDK stacks to your account. Read more about Docker on the [Docker website](https://www.docker.com/).

Read about [Getting started with AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) for more information on setting up an environment for developing and deploying CDK.

To install docker on an Amazon Linux 2 host, run the following command:

```
sudo yum install docker
```

Then, start the docker daemon

```
sudo service docker start
```

Build the docker image from the root directory of the project

```
sudo docker build . -f Dockerfile -t aws-cloudhsm-tls-offload-cdk
```

Login to the container

```
sudo docker run -v `pwd`:/home -it aws-cloudhsm-tls-offload-cdk bash
```

The following instructions assume that you are inside the Docker container or have AWS CDK installed and configured

## First Time Setup

### Configure credentials

First, you need to configure your environment with AWS credentials. Follow the instructions to [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) to configure your environment with credentials.

### Bootstrap your account

You must first bootstrap your AWS account, which will install all the necessary infrastructure to allow you to deploy CDK stacks to your account.

```
cdk bootstrap "aws://<AWS_ACCOUNT_ID>/<REGION>"
```

## Build and Deploy

### Application configuration

Edit the `app_config.json` file and update the following fields with your target configuration:

```
{
    "applicationAccount": "<AWS_ACCOUNT_ID>",
    "applicationRegion": "<REGION>",
    "networkConfig": {
        "vpcId": "<VPC_ID>",
        "publicSubnets": ["<PUBLIC_SUBNET_1>", "<PUBLIC_SUBNET_2>", ...],
        "privateSubnets": ["<PRIVATE_SUBNET_1>", "<PRIVATE_SUBNET_2>", ...]
    },
    "secrets": {
        "cloudHsmPin": "arn:aws:secretsmanager:<REGION>:<AWS_ACCOUNT_ID>:secret:<SECRET_ID>",
        "fakePem": "arn:aws:secretsmanager:<REGION>:<AWS_ACCOUNT_ID>:secret:<SECRET_ID>",
        "serverCert": "arn:aws:secretsmanager:<REGION>:<AWS_ACCOUNT_ID>:secret:<SECRET_ID>",
        "clusterCert": "arn:aws:secretsmanager:<REGION>:<AWS_ACCOUNT_ID>:secret:<SECRET_ID>"
    },
    "cloudhsm": {
        "clusterId": "<CLUSTER_ID>",
        "clusterSecurityGroup": "<CLUSTER_SECURITY_GROUP>"
    }
}

```

### Build the project

To build the project run the following from the root of the project directory

```
npm run build
```

### View build stacks

To view all the stacks available to deploy, run the following from the root of the project directory

```
cdk ls
```

Available stacks to deploy:
* `TlsOffloadContainerBuildStack` – Deploys the CodeCommit, CodeBuild, and ECR Repository which builds the ECS container image.
* `TlsOffloadEcsServiceStack` – Deploys the load-balanced ECS Fargate web service.
* `TlsOffloadPipelineStack` – Deploys the CodePipeline which automates the deployment of updates to the service.

### Deploy a stack

Choose the stack that you want to deploy from the output of the previous command

```
cdk deploy <STACK NAME>
```

If successful, you should now see the resources deployed in your AWS account.
