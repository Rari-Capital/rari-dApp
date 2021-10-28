// GQL-request
import { request } from "graphql-request";

// const FUSE_SUBGRAPH_GQL_ENDPOINT =
//   "https://api.thegraph.com/subgraphs/name/zacel/fusedemo";

const FUSE_SUBGRAPH_GQL_ENDPOINT = "https://api.studio.thegraph.com/query/853/fuse-zacel/0.2.1"


// const FUSE_SUBGRAPH_GQL_ENDPOINT =
//   "https://api.thegraph.com/subgraphs/id/QmZUk988UJSQQtYwTmZobV26FqHZQJscGZMjRR35RnNzMw";

export const makeGqlRequest = async (query: any, vars: any = {}) => {
  try {
    return await request(FUSE_SUBGRAPH_GQL_ENDPOINT, query, { ...vars });
  } catch (err) {
    console.error(err);
  }
};