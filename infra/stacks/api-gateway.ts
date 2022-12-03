import { App, Stack } from 'aws-cdk-lib';
import { Model, RequestValidator, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { BuildConfig } from '../lib/common/config.interface';
import { TestApiStackProps } from '../lib/common/interfaces/testAPI';
import { name } from '../lib/common/utils';
import * as fs from 'fs';
import { TestApiStack } from './api/test';
import { DeployStack } from './api/deployment';

export class TestApiGatewayStack extends Stack {
  public readonly apiGateway: RestApi;
  public readonly testResource: Resource;
  public readonly requestValidator: RequestValidator;
  public readonly apiModels: { [model: string]: Model } = {};

  constructor(scope: App, id: string, props: TestApiStackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.apiGateway = this.createApiGateway(id, buildConfig);

    this.requestValidator = this.createApiValidator(name(id, 'body-validator'), this.apiGateway);

    this.createApiModel(name(id, 'model'), this.apiGateway);

    const postsApiStack = new TestApiStack(
      this,
      name(id, 'posts'),
      {
        ...props,
        apiBodyValidator: this.requestValidator,
        apiModels: this.apiModels,
        apiId: this.apiGateway.restApiId,
        apiRootResourceId: this.apiGateway.restApiRootResourceId,
      },
      buildConfig
    );

    new DeployStack(
      this,
      name(id, 'deploy'),
      {
        restApiId: this.apiGateway.restApiId,
        methods: postsApiStack.methods,
        // methods: postsApiStack.methods.concat(otherStack.methods),
      },
      buildConfig
    );
  };

  private createApiGateway = (name: string, buildConfig: BuildConfig): RestApi => {
    return new RestApi(this, name, {
      description: 'Api gateway for test',
      deploy: true,
      deployOptions: {
        stageName: 'stage',
        description: 'This stage is not mantained',
        throttlingRateLimit: 0,
        throttlingBurstLimit: 0,
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['*'],
      },
    });
  };

  private createApiValidator = (name: string, restApi: RestApi): RequestValidator => {
    return new RequestValidator(this, name, {
      restApi,
      requestValidatorName: name,
      validateRequestBody: true,
    });
  };

  private createApiModel = (name: string, restApi: RestApi): void => {
    const filesname = fs.readdirSync(`${__dirname}/models`);
    for (const file of filesname) {
      const fileName = file.replace('.json', '');
      this.apiModels[`${fileName}`] = new Model(this, `${name}-${fileName}`, {
        restApi: restApi,
        modelName: `${name}-${fileName}`.replace(/-/g, ''),
        contentType: 'application/json',
        schema: JSON.parse(fs.readFileSync(`${__dirname}/models/${file}`).toString('utf-8')),
      });
    };
  };
}
