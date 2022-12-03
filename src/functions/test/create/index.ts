import { APIGatewayProxyEventV2, Handler } from 'aws-lambda';

export const handler : Handler = (event: APIGatewayProxyEventV2) => {
  console.log(event);
}
