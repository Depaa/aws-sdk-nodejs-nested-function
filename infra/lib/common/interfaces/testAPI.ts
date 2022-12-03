import { StackProps } from "aws-cdk-lib/core/lib/stack";

export interface TestApiStackProps extends StackProps {
  readonly tableArn: string;
  readonly tableName: string;
}