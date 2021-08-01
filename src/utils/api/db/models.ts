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

const UserBalanceSchema = new Schema({
  userAddress: String,
  pools: Array,
  totals: {
    totalBorrowedUSD: Number,
    totalSuppliedUSD: Number
  }
});

export const TVLModel = mongoose.models.TVL || mongoose.model("TVL", TVLSchema);
export const UserBalanceModel = mongoose.models.UserBalanace || mongoose.model("UserBalance", UserBalanceSchema);
