import { rest } from "cypress/types/lodash";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    console.log("YO");
    return res.status(200).json({ success: true });
  }
}
