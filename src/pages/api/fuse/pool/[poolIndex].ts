import { EmptyAddress } from "context/RariContext";
import { fetchPools } from "hooks/fuse/useFusePools";
import Rari from "lib/rari-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchFusePoolData } from "utils/fetchFusePoolData";

// Web3
import { initFuseWithProviders, providerURL } from "utils/web3Providers";
import Web3 from "web3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    try {
      let userAddress: string = "";

      // Validate queryParams
      const poolIndex = req.query.poolIndex as string; // required
      const address = (req.query.address as string) ?? EmptyAddress; // optional
      try {
        userAddress = Web3.utils.toChecksumAddress(address);
      } catch (err) {
        return res.status(400).json({ error: "Invalid address provided." });
      }
      if (!poolIndex)
        return res.status(400).json({ error: "Invalid address provided." });

      // Set up SDKs
      const web3 = new Web3(providerURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(providerURL);

      // Get data for this fuse pool
      const fusePoolData = await fetchFusePoolData(
        poolIndex,
        userAddress,
        fuse,
        rari
      );

      return res.status(200).json({ success: true, fusePoolData, userAddress });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
}
