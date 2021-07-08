// GQL-request
import { GraphQLClient } from "graphql-request";

const FUSE_SUBGRAPH_GQL_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/platocrat/fuse-subgraph";

export const makeGqlRequest = async (query: any, vars: any) => {
  try {
    const client = gqlClient();
    return await client.request(query, { ...vars });
  } catch (err) {
    console.error(err);
  }
};

export const gqlClient = () => new GraphQLClient(FUSE_SUBGRAPH_GQL_ENDPOINT);
