import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { BuildConfig } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';

export class TestTableStac extends Stack {
  public readonly testTable: Table;

  constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.testTable = this.createTable(name(id), buildConfig);
  }

  private createTable = (name: string, buildConfig: BuildConfig): Table => {
    const table = new Table(this, name, {
      tableName: `${name}`,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: buildConfig.environment != 'prod' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      stream: StreamViewType.NEW_IMAGE,
    });
    table.addGlobalSecondaryIndex({
      indexName: `${name}-list-index`,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.NUMBER,
      }
    });

    return table;
  }
}