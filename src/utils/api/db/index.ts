import { APIFuseTVL } from "pages/api/fuse/tvl";
import mongoose from "mongoose";
import { TVLModel } from "./models";
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
    console.log(`Document exists for blockDate ${blockDate}... skip save`);
  } else {
    const saveResult = await instance.save();
    console.log({ saveResult });
    console.log(`Saved instance for blockNumber ${blockNumber}`);
  }
};

// Getters
export const getTVLByBlockNumber = async (blockNumber: number) =>
  await TVLModel.findOne({ blockNumber }).exec();

export const getTVLByBlockDate = async (blockDate: string) =>
  await TVLModel.findOne({ blockDate }).exec();

export const getAllTVLs = async () => {
  const tvls = await TVLModel.find({}).sort({ blockTimestamp: 1 }).exec();
  return tvls;
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
