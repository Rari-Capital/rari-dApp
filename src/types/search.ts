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

export interface FinalSearchReturn extends CTokenSearchReturn {
  tokenData: RariApiTokenData;
}
