import { NestedStack } from 'aws-cdk-lib';
import { TestApiResourcesStackProps } from '../../../lib/common/interfaces/testAPIResource';
import { BuildConfig } from '../../../lib/common/config.interface';
import { name } from '../../../lib/common/utils';
import { createApi } from './create';
import { Method, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class TestApiStack extends NestedStack {
  public readonly methods: Method[] = [];

  constructor(scope: Construct, id: string, props: TestApiResourcesStackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    const baseEnv = {
      POSTS_TABLE_NAME: props.tableName,
      REGION: this.region,
      ENV: buildConfig.environment,
    }

    const testApi = RestApi.fromRestApiAttributes(this, id, {
      restApiId: props.apiId,
      rootResourceId: props.apiRootResourceId,
    });

    const resourceApi = testApi.root.addResource('posts');

    const baseParams = {
      ...props,
      environment: baseEnv,
    }

    this.methods.push(createApi(this, name(id, 'create'), { ...baseParams, resourceApi }, buildConfig));
  }
}
