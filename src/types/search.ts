import { FusePoolData } from "utils/fetchFusePoolData";
import { RariApiTokenData } from "./tokens";

export type CTokenSearchReturn = {
  id: string;
  underlyingAddress: string;
  underlyingDecimals: number;
  underlyingName: string;
  underlyingSymbol: string;
};

export type UnderlyingAssetSearchReturn = {
  id: string;
  price: number;
  name: string;
  symbol: string;
};

export type GQLSearchReturn = {
  underlyingAssets: UnderlyingAssetSearchReturn[];
};

export interface CTokenSearchReturnWithTokenData extends CTokenSearchReturn {
  tokenData: RariApiTokenData;
}
export interface FinalSearchReturn {
  tokens: UnderlyingAssetSearchReturn[];
  fuse: FusePoolData[];
  tokensData: { [address: string]: RariApiTokenData };
}
