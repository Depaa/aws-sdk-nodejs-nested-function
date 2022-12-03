import { NestedStackProps } from "aws-cdk-lib";
import { IModel, IRequestValidator, IResource } from "aws-cdk-lib/aws-apigateway";

export interface TestApiResourcesStackProps extends NestedStackProps {
  readonly tableArn: string;
  readonly tableName: string;
  readonly apiId: string;
  readonly apiRootResourceId: string;
  readonly apiBodyValidator: IRequestValidator;
  readonly apiModels: { [model: string]: IModel };
}

export interface PostLambdasStackProps extends TestApiResourcesStackProps {
  readonly environment: { [key: string]: string; } | undefined;
  readonly resourceApi: IResource;
}
