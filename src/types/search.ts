import { GQLFusePool, GQLUnderlyingAsset } from "./gql";
import { RariApiTokenData, TokensDataMap } from "./tokens";

export type GQLSearchReturn = {
  underlyingAssets: GQLUnderlyingAsset[];
};

export interface APISearchReturn {
  tokens: GQLUnderlyingAsset[];
  fuse: GQLFusePool[];
  fuseTokensMap: { [comptroller: string]: string[] }
  tokensData: TokensDataMap;
}
