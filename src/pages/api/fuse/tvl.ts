import { NextApiRequest, NextApiResponse } from "next";
import { fetchFuseTVLBorrowsAndSupply } from "utils/fetchTVL";
import { initFuseWithProviders, turboGethURL } from "utils/web3Providers";
import Web3 from "web3";
import Rari from "lib/rari-sdk";

import { APIError } from "../accounts/fuse/balances";

// Cors
import Cors from "cors";
import { fetchCurrentETHPrice, fetchETHPriceAtDate } from "utils/coingecko";
import { blockNumberToTimeStamp } from "utils/web3Utils";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "POST", "HEAD", "OPTIONS"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export interface APIFuseTVL {
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  blockNumber: number;
  blockTimestamp: string | number;
  ethUSDPrice: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIFuseTVL | APIError>
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  //   Gets ALL fuse pool Data
  if (req.method === "GET") {
    try {
      // Set up SDKs
      const web3 = new Web3(turboGethURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(turboGethURL);

      //   Parse query param
      const blockNumber = req.query.blockNumber
        ? parseFloat(req.query.blockNumber as string)
        : undefined;

      const latestBlockNumber = await web3.eth.getBlockNumber();

      const blockTimestamp = blockNumber
        ? await blockNumberToTimeStamp(web3, blockNumber)
        : await blockNumberToTimeStamp(web3, latestBlockNumber)

      let fetchETHUSDPrice: Promise<any>;
      //   Blocknum 2 timestamp
      if (blockNumber) {
        const ddMMYYY = new Date(blockTimestamp * 1000)
          .toISOString()
          .split("T")[0]
          .split("-")
          .reverse()
          .join("-");

        //   If we did specified a blockNumber, we want the historical ETH Price apprxomiated to a DD-MM-YYYY Date
        fetchETHUSDPrice = fetchETHPriceAtDate(ddMMYYY);
      } else {
        //   If we did not specify a blockNumber, we want the CURRENT REAL TIME ETH PRICE
        fetchETHUSDPrice = fetchCurrentETHPrice();
      }

      //   Get TVL supplied and borrowed in ETH denomination
      const [{ totalSuppliedETH, totalBorrowedETH }, ethUSDPrice] =
        await Promise.all([
          fetchFuseTVLBorrowsAndSupply(fuse, blockNumber),
          fetchETHUSDPrice,
        ]);

      const tvlReturn = {
        totalSuppliedUSD:
          (parseInt(totalSuppliedETH.toString()) / 1e18) * ethUSDPrice,
        totalBorrowedUSD:
          (parseInt(totalBorrowedETH.toString()) / 1e18) * ethUSDPrice,
        blockNumber: blockNumber ?? latestBlockNumber,
        blockTimestamp,
        ethUSDPrice,
      };

      return res.status(200).json(tvlReturn);
    } catch (error) {
      console.log({ error }, error.message);
      return res.status(400).json({ error });
    }
  }
}
