// From Rari API `tokenData` route
export type RariApiTokenData = {
  symbol: string;
  name: string;
  decimals: number;
  color: string;
  overlayTextColor: string;
  address: string;
  logoURL: string;
};

// Coming from Fuse Subgraph `underlyingAsset` Enitty
export type UnderlyingAsset = {
  id: string;
  name: string;
  price: number;
  symbol: string;
};

// UnderlyingAsset with stitched on tokenData
export interface UnderlyingAssetWithTokenData extends UnderlyingAsset {
  tokenData: RariApiTokenData;
}

export type TokensDataMap = { [address: string]: RariApiTokenData };
