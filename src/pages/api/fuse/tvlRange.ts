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
import {
  getAllTVLs,
  getTVLsByBlockRange,
  getTVLsByDateRange,
  setupDB,
} from "utils/api/db";

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

// If we specify a startBlock and endBlock
// query db against this range of blocks
// return a range

// If we specify a startDate and endDate
// query db against this range of dates

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  //   Gets ALL fuse pool Data
  if (req.method === "GET") {
    try {
      await setupDB();

      // Set up SDKs
      const web3 = new Web3(providerURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(providerURL);

      // Query params
      // startDate and endDate is in DD-MM-YYY format
      const { startDate, endDate, startBlock, endBlock, useContract } =
        parseQueryParams(req);
      const latestBlockNumber = await web3.eth.getBlockNumber();
      const currentDate = formatDateToDDMMYY(new Date());

      let fetchETHUSDPrice: Promise<any>;

      let data;
      if (startBlock && endBlock) {
        data = await getTVLsByBlockRange(startBlock, endBlock);
      } else if (startBlock) {
        data = await getTVLsByBlockRange(startBlock, latestBlockNumber);
      } else if (startDate && endDate) {
        data = await getTVLsByDateRange(startDate, endDate);
      } else if (startDate) {
        data = await getTVLsByDateRange(startDate, currentDate);
      } else {
        data = await getAllTVLs();
      }

      return res.status(200).json({ data });
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

  const useContract =
    req.query.useContract && req.query.useContract === "true" ? true : false;

  return { startBlock, endBlock, startDate, endDate, useContract };
};
