import { LambdaIntegration, Method } from 'aws-cdk-lib/aws-apigateway';
import { Effect, ManagedPolicy, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { PostLambdasStackProps } from '../../../lib/common/interfaces/testApiResource';
import { BuildConfig } from '../../../lib/common/config.interface';
import { lambdaFactory } from '../../../lib/common/lambda-factory';
import { Construct } from 'constructs';

export const createApi = (scope: Construct, id: string, params: PostLambdasStackProps, buildConfig: BuildConfig): Method => {
  const createPolicy = new Policy(scope, `${id}-policy`, {
    statements: [
      new PolicyStatement({
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
        resources: [params.tableArn],
      }),
    ],
  });
  const createRole = new Role(scope, `${id}-role`, {
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
  });
  createRole.attachInlinePolicy(createPolicy);

  const lambdaCreatePost = lambdaFactory(scope, {
    name: `${id}`,
    filenamePath: 'test/create',
    role: createRole,
    memorySize: 128,
    environment: params.environment,
  }, buildConfig.environment);

  return params.resourceApi.addMethod(
    'POST',
    new LambdaIntegration(lambdaCreatePost, { proxy: true }),
    {
      requestValidator: params.apiBodyValidator,
      requestModels: {
        'application/json': params.apiModels['create-test'],
      },
      apiKeyRequired: false,
    },
  );
};