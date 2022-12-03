import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { ApiKey, Deployment, Method, MethodLoggingLevel, RestApi, Stage, UsagePlan } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { BuildConfig } from "../../lib/common/config.interface";

interface DeployStackProps extends NestedStackProps {
  readonly restApiId: string;
  readonly methods?: Method[];
}

export class DeployStack extends NestedStack {
  public readonly deployStage: Stage;

  constructor(scope: Construct, id: string, props: DeployStackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    const restApi = RestApi.fromRestApiId(this, `${id}-api`, props.restApiId);
    //! it will create a new deployment every time
    const deployment = new Deployment(this, `${id}-${(new Date).getTime()}`, {
      api: restApi,
      description: `deploy: ${(new Date).toISOString()}`
    });

    if (props.methods) {
      for (const method of props.methods) {
        deployment.node.addDependency(method);
      };
    };

    this.deployStage = new Stage(this, `${id}-stage`, {
      deployment,
      stageName: buildConfig.environment,
      description: `deploy: ${(new Date).toISOString()}`,
      loggingLevel: MethodLoggingLevel.INFO,
      metricsEnabled: true,
    });

    const usagePlan = new UsagePlan(this, `${id}-plan`, {
      apiStages: [{
        api: restApi,
        stage: this.deployStage,
      }],
    });
  };
}