import { NextApiRequest, NextApiResponse } from "next";
import { fetchFuseTVLBorrowsAndSupply } from "utils/fetchTVL";
import { initFuseWithProviders, providerURL } from "utils/web3Providers";
import Web3 from "web3";
import Rari from "lib/rari-sdk";

import { APIError } from "../accounts/fuse/balances";

// Cors
import Cors from "cors";
import { fetchCurrentETHPrice, fetchETHPriceAtDate } from "utils/coingecko";
import { blockNumberToTimeStamp } from "utils/web3Utils";
import { formatDateToDDMMYY } from "utils/api/dateUtils";

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
  blockDate: string;
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
      const web3 = new Web3(providerURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(providerURL);

      // Query params
      // startDate and endDate is in DD-MM-YYY format
      const { startDate, endDate, startBlock, endBlock } =
        parseQueryParams(req);
      const latestBlockNumber = await web3.eth.getBlockNumber();

      // We will always have a startBlockTimestamp
      const startBlockTimestamp = startBlock
        ? await blockNumberToTimeStamp(web3, startBlock)
        : await blockNumberToTimeStamp(web3, latestBlockNumber);

      let fetchETHUSDPrice: Promise<any>;
      // If a startBlock is specified
      if (startBlock) {
        const ddMMYYY = formatDateToDDMMYY(new Date(startBlockTimestamp * 1000));

        //   We want the historical ETH Price apprxomiated to a DD-MM-YYYY Date
        fetchETHUSDPrice = fetchETHPriceAtDate(ddMMYYY);
      } 
      // Else 
      else {
        //   If we did not specify a blockNumber, we want the CURRENT REAL TIME ETH PRICE
        fetchETHUSDPrice = fetchCurrentETHPrice();
      }

      //   Get TVL supplied and borrowed in ETH denomination
      const [{ totalSuppliedETH, totalBorrowedETH }, ethUSDPrice] =
        await Promise.all([
          fetchFuseTVLBorrowsAndSupply(fuse, startBlock),
          fetchETHUSDPrice,
        ]);

      const tvlReturn = {
        totalSuppliedUSD:
          (parseInt(totalSuppliedETH.toString()) / 1e18) * ethUSDPrice,
        totalBorrowedUSD:
          (parseInt(totalBorrowedETH.toString()) / 1e18) * ethUSDPrice,
        blockNumber: startBlock ?? latestBlockNumber,
        blockTimestamp: startBlockTimestamp,
        blockDate: formatDateToDDMMYY(new Date(startBlockTimestamp * 1000)),
        ethUSDPrice,
      };

      return res.status(200).json(tvlReturn);
    } catch (error) {
      console.log({ error });
      return res.status(400).json({ error });
    }
  }
}

//   Parse query params
const parseQueryParams = (req: NextApiRequest) => {
  const startBlock = req.query.startBlock
    ? parseFloat(req.query.startBlock as string)
    : undefined;

  const endBlock = req.query.endBlock
    ? parseFloat(req.query.endBlock as string)
    : undefined;

  const startDate = req.query.startDate
    ? (req.query.startDate as string)
    : undefined;

  const endDate = req.query.endDate ? (req.query.endDate as string) : undefined;

  const useContract = req.query.useContract

  return { startBlock, endBlock, startDate, endDate, useContract };
};
