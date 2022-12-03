import { App, Environment, StackProps } from 'aws-cdk-lib';
import { getConfig } from './lib/common/build-config';
import { BuildConfig } from './lib/common/config.interface';
import { Tags } from 'aws-cdk-lib';
import { TestTableStac } from './stacks/table';
import { TestApiGatewayStack } from './stacks/api-gateway';

const app = new App();

const buildConfig: BuildConfig = getConfig(app);
Tags.of(app).add('Environment', buildConfig.environment);
Tags.of(app).add('Project', buildConfig.project);
Tags.of(app).add('Cdk', 'true');

const env: Environment = { account: buildConfig.account, region: buildConfig.region }
const stackId = `${buildConfig.environment}-${buildConfig.project}`;
const baseProps: StackProps = { env }

const apiGatewayStackId = `${stackId}-api`;
const testTableStackId = `${stackId}-test-table`;

const testTableStack = new TestTableStac(
  app,
  testTableStackId,
  {
    ...baseProps,
    stackName: testTableStackId,
  },
  buildConfig,
);

new TestApiGatewayStack(
  app,
  apiGatewayStackId,
  {
    ...baseProps,
    stackName: apiGatewayStackId,
    tableArn: testTableStack.testTable.tableArn,
    tableName: testTableStack.testTable.tableName,
  },
  buildConfig,
);
