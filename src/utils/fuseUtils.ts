import Fuse from "lib/fuse-sdk";
import { USDPricedFuseAsset } from "./fetchFusePoolData";
import { isAssetETH } from "./tokenUtils";

// Types
import { Contract } from "web3-eth-contract";

// Creates a CToken Contract
// Todo - refactor this into a `contractUtils.ts` file.
export const createCTokenContract = ({
  fuse,
  asset,
}: {
  fuse: Fuse;
  asset: USDPricedFuseAsset;
}) => {
  const isETH = isAssetETH(asset.underlyingToken);

  // Create the cTokenContract
  const cToken = new fuse.web3.eth.Contract(
    isETH
      ? JSON.parse(
          fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"]
            .abi
        )
      : JSON.parse(
          fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"]
            .abi
        ),
    asset.cToken
  );

  return cToken;
};
