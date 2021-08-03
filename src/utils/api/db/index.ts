import { APIFuseTVL } from "pages/api/fuse/tvl";
import { APIAccountsFuseBalancesResponseType } from "pages/api/accounts/fuse/balances";
import mongoose from "mongoose";
import { TVLModel, UserBalanceModel } from "./models";
import { formatDDMMYYToDate } from "../dateUtils";

const MONGODB_URL: string = process.env.MONGODB_URL as string;

// Init
export const setupDB = async () => {
  await mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  console.log("Connected to db...");
};

export const dropCollection = async () => await TVLModel.collection.drop();
export const dropBalanceCollection = async () => await UserBalanceModel.collection.drop();

// Saves TVL obj to db
export const saveTVLObject = async ({
  totalSuppliedUSD,
  totalBorrowedUSD,
  ethUSDPrice,
  blockNumber,
  blockDate,
  blockTimestamp,
}: APIFuseTVL) => {
  const instance = new TVLModel();
  instance.totalSuppliedUSD = totalSuppliedUSD;
  instance.totalBorrowedUSD = totalBorrowedUSD;
  instance.ethUSDPrice = ethUSDPrice;
  instance.blockNumber = blockNumber;
  instance.blockDate = blockDate;
  instance.blockTimestamp = blockTimestamp;

  const existingDocument = await getTVLByBlockDate(blockDate);

  if (existingDocument) {
    console.log(`Document exists for blockDate ${ blockDate }... skip save`);
  } else {
    const saveResult = await instance.save();
    console.log({ saveResult });
    console.log(`Saved instance for blockNumber ${ blockNumber }`);
  }
};


// Saves UserBalance obj to db
export const saveUserBalanceObject = async ({
  userAddress,
  pools,
  totals,
  blockNumber,
  blockTimestamp,
  blockDate
}: APIAccountsFuseBalancesResponseType) => {
  const instance = new UserBalanceModel();
  instance.userAddress = userAddress;
  instance.pools = pools;
  instance.totals = totals;
  instance.blockNumber = blockNumber;
  instance.blockTimestamp = blockTimestamp;
  instance.blockDate = blockDate;

  const existingDocument = await getUserBalanceByBlockDate(blockDate);

  if (existingDocument) {
    console.log(`Document exists for blockDate ${ blockDate }... skip save`);
  } else {
    const saveResult = await instance.save();
    console.log({ saveResult });
    console.log(`Saved instance for blockNumber ${ blockNumber }`);
  }
};

// Getters
export const getTVLByBlockNumber = async (blockNumber: number) =>
  await TVLModel.findOne({ blockNumber }).exec();

export const getUserBalanceByBlockNumber = async (blockNumber: number) =>
  await UserBalanceModel.findOne({ blockNumber }).exec();

export const getTVLByBlockDate = async (blockDate: string) =>
  await TVLModel.findOne({ blockDate }).exec();

export const getUserBalanceByBlockDate = async (blockDate: string) =>
  await UserBalanceModel.findOne({ blockDate }).exec();

export const getAllTVLs = async () => {
  const tvls = await TVLModel.find({}).sort({ blockTimestamp: 1 }).exec();
  return tvls;
};

export const getAllUserBalances = async () => {
  const userBalances = await UserBalanceModel.find({}).sort({ blockTimestamp: 1 }).exec();
  return userBalances;
};

// Dates are in DD-MM-YYY
export const getTVLsByDateRange = async (
  startDate: string,
  endDate: string
) => {
  const start = (formatDDMMYYToDate(startDate)).getTime() / 1000;
  const end = (formatDDMMYYToDate(endDate)).getTime() / 1000;

  console.log({ start, end });

  return await TVLModel.find({
    blockTimestamp: { $gte: start, $lte: end },
  })
    .sort({ blockTimestamp: 1 })
    .exec();
};

export const getUserBalancesByDateRange = async (
  startDate: string,
  endDate: string
) => {
  const start = (formatDDMMYYToDate(startDate)).getTime() / 1000;
  const end = (formatDDMMYYToDate(endDate)).getTime() / 1000;

  console.log({ start, end });

  return await UserBalanceModel.find({
    blockTimestamp: { $gte: start, $lte: end },
  })
    .sort({ blockTimestamp: 1 })
    .exec();
};

// Fetch by blockrange
export const getTVLsByBlockRange = async (
  startBlock: number,
  endBlock: number
) =>
  await TVLModel.find({
    blockNumber: { $gte: startBlock, $lte: endBlock },
  })
    .sort({ blockNumber: 1 })
    .exec();

export const getUserBalancesByBlockRange = async (
  startBlock: number,
  endBlock: number
) =>
  await UserBalanceModel.find({
    blockNumber: { $gte: startBlock, $lte: endBlock },
  })
    .sort({ blockNumber: 1 })
    .exec();
