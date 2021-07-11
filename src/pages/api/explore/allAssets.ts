import { GET_ALL_UNDERLYING_ASSETS } from "gql/getAllUnderlyingAssets";
import { makeGqlRequest } from "utils/gql";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const results = await makeGqlRequest(GET_ALL_UNDERLYING_ASSETS);
    res.json({ success: true, results })
  }
}
