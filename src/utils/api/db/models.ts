import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TVLSchema = new Schema({
  totalSuppliedUSD: Number,
  totalBorrowedUSD: Number,
  ethUSDPrice: Number,
  blockNumber: Number,
  blockDate: String,
  blockTimestamp: String,
});

export const TVLModel = mongoose.models.TVL || mongoose.model("TVL", TVLSchema);
