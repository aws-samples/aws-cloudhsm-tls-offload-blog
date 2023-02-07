# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

-   `npm run build` compile typescript to js
-   `npm run watch` watch for changes and compile
-   `npm run test` perform the jest unit tests
-   `cdk deploy` deploy this stack to your default AWS account/region
-   `cdk diff` compare deployed stack with current state
-   `cdk synth` emits the synthesized CloudFormation template

# TLS Offload with CloudHSM

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

-   [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
-   [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.aws.dev/alket/tls-offload-cloudhsm.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

-   [ ] [Set up project integrations](https://gitlab.aws.dev/alket/tls-offload-cloudhsm/-/settings/integrations)

## Collaborate with your team

-   [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
-   [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
-   [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
-   [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
-   [ ] [Automatically merge when pipeline succeeds](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

## Test and Deploy

Use the built-in continuous integration in GitLab.

-   [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
-   [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing(SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
-   [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
-   [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
-   [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

---

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thank you to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name

Choose a self-explaining name for your project.

## Description

Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges

On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals

Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation

Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage

Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support

Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap

If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing

State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment

Show your appreciation to those who have contributed to the project.

## License

For open source projects, say how it is licensed.

## Project status

If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.

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

### Deploy a stack

Choose the stack that you want to deploy from the output of the previous command

```
cdk deploy AppStack
```

If successful, you should now see the resources deployed in your AWS account.
