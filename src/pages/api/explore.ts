import Fuse from "fuse-sdk";
import Rari from "rari-sdk/index";


export default function handler(req: any, res: any) {
if (req.method === "GET") {

    new Fuse()


    // Process a GET request
    res.json({ success: true }).send(200);
  }
}
