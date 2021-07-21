import { NextApiRequest, NextApiResponse } from "next";
import { fetchFuseTVLBorrowsAndSupply } from "utils/fetchTVL";
import { initFuseWithProviders, turboGethURL } from "utils/web3Providers";
import Web3 from "web3";
import Rari from "lib/rari-sdk";

import { APIError } from "../accounts/fuse/balances";

export interface APIFuseTVL {
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIFuseTVL | APIError>
) {
  //   Gets ALL fuse pool Data
  if (req.method === "GET") {
    try {
      // Set up SDKs
      const web3 = new Web3(turboGethURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(turboGethURL);

      //   Get TVL supplied and borrowed in ETH denomination

      const [{ totalSuppliedETH, totalBorrowedETH }, ethUSDPriceBN] =
        await Promise.all([
          fetchFuseTVLBorrowsAndSupply(fuse),
          rari.getEthUsdPriceBN(),
        ]);

      const ethPrice = parseFloat(rari.web3.utils.fromWei(ethUSDPriceBN));

      const tvlReturn = {
        totalSuppliedUSD:
          (parseInt(totalSuppliedETH.toString()) / 1e18) * ethPrice,
        totalBorrowedUSD:
          (parseInt(totalBorrowedETH.toString()) / 1e18) * ethPrice,
      };

      return res.status(200).json(tvlReturn);
    } catch (error) {
      console.log({ error }, error.message);
      return res.status(400).json({ error });
    }
  }
}
