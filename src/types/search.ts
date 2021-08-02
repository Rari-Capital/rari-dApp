import { FusePoolData } from "utils/fetchFusePoolData";
import { RariApiTokenData } from "./tokens";

export type CTokenSearchReturn = {
  id: string;
  underlyingAddress: string;
  underlyingDecimals: number;
  underlyingName: string;
  underlyingSymbol: string;
};

export type GQLSearchReturn = {
  markets: CTokenSearchReturn[];
};

export interface CTokenSearchReturnWithTokenData extends CTokenSearchReturn {
  tokenData: RariApiTokenData;
}
export interface FinalSearchReturn {
  tokens: CTokenSearchReturn[];
  fuse: FusePoolData[];
  tokensData: { [address: string]: RariApiTokenData };
}
