import { TokenData } from "hooks/useTokenData";
import { FuseAsset } from "./fetchFusePoolData";

export function getSymbol(tokenData: TokenData | undefined, asset: FuseAsset) {
  if (!tokenData) {
    return asset.underlyingSymbol;
  }

  if (tokenData.symbol === "UNI-V2") {
    // Fuse lens converts LP token symbols into their underlying (like UNI-V2 -> DAI/USDC),
    // so we want to use it here.
    return asset.underlyingSymbol;
  }

  if (tokenData.symbol === "G-UNI") {
    // Parse the LP token symbols from the G-UNI name (like Gelato DAI/USDC LP -> USDC/DAI).
    const splitName = asset.underlyingName.split(" ");
    return "G-" + splitName[splitName.length - 2];
  }

  return tokenData.symbol!;
}
