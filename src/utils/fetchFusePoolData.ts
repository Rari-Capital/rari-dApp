import Fuse from "../fuse-sdk";
import Rari from "../rari-sdk/index";

// @ts-ignore
import Filter from "bad-words";
import { TokenData } from "hooks/useTokenData";
import { createComptroller } from "./createComptroller";
export const filter = new Filter({ placeHolder: " " });
filter.addWords(...["R1", "R2", "R3", "R4", "R5", "R6", "R7"]);

export function filterOnlyObjectProperties(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => isNaN(k as any))
  ) as any;
}

export interface FuseAsset {
  cToken: string;

  borrowBalance: number;
  supplyBalance: number;
  liquidity: number;

  membership: boolean;

  underlyingName: string;
  underlyingSymbol: string;
  underlyingToken: string;
  underlyingDecimals: number;
  underlyingPrice: number;
  underlyingBalance: number;

  collateralFactor: number;
  reserveFactor: number;

  adminFee: number;
  fuseFee: number;

  borrowRatePerBlock: number;
  supplyRatePerBlock: number;

  totalBorrow: number;
  totalSupply: number;
}

export interface USDPricedFuseAsset extends FuseAsset {
  supplyBalanceUSD: number;
  borrowBalanceUSD: number;

  totalSupplyUSD: number;
  totalBorrowUSD: number;

  liquidityUSD: number;

  isPaused: boolean;
}

export interface USDPricedFuseAssetWithTokenData extends USDPricedFuseAsset {
  tokenData: TokenData;
}

export interface FusePoolData {
  assets: USDPricedFuseAssetWithTokenData[] | USDPricedFuseAsset[];
  comptroller: any;
  name: any;
  isPrivate: boolean;
  totalLiquidityUSD: any;
  totalSuppliedUSD: any;
  totalBorrowedUSD: any;
  totalSupplyBalanceUSD: any;
  totalBorrowBalanceUSD: any;
  id?: number;
}

export enum FusePoolMetric {
  TotalLiquidityUSD,
  TotalSuppliedUSD,
  TotalBorrowedUSD,
}

export const filterPoolName = (name: string) => {
  if (name === "Tetranode's Pool") {
    return "Tetranode's Locker";
  }

  if (name === "Stake DAO Pool") {
    return "The Animal Kingdom";
  }

  if (name === "Tetranode's ETH Pool") {
    return "ChainLinkGod's / Tetranode's Up Only Pool";
  }

  if (name === "Tetranode's Flavor of the Month") {
    return "FeiRari (Fei DAO Pool)";
  }

  if (name === "WOO pool") {
    return "Warlord's WOO Pool";
  }

  if (name === "Yearn's Yield") {
    return "Yearn Soup Pot of Yield";
  }

  return filter.clean(name);
};

export const fetchFusePoolData = async (
  poolId: string | undefined,
  address: string,
  fuse: Fuse,
  rari?: Rari
): Promise<FusePoolData | undefined> => {
  if (!poolId) return undefined;

  const {
    comptroller,
    name: _unfiliteredName,
    isPrivate,
  } = await fuse.contracts.FusePoolDirectory.methods
    .pools(poolId)
    .call({ from: address });

  // Remove any profanity from the pool name
  let name = filterPoolName(_unfiliteredName);

  let assets: USDPricedFuseAsset[] = (
    await fuse.contracts.FusePoolLens.methods
      .getPoolAssetsWithData(comptroller)
      .call({ from: address, gas: 1e18 })
  ).map(filterOnlyObjectProperties);

  let totalLiquidityUSD = 0;

  let totalSupplyBalanceUSD = 0;
  let totalBorrowBalanceUSD = 0;

  let totalSuppliedUSD = 0;
  let totalBorrowedUSD = 0;

  const ethPrice: number = fuse.web3.utils.fromWei(
    // prefer rari because it has caching
    await (rari ?? fuse).getEthUsdPriceBN()
  ) as any;

  let promises = [];

  for (let i = 0; i < assets.length; i++) {
    const comptrollerContract = createComptroller(comptroller, fuse);

    let asset = assets[i];

    promises.push(
      comptrollerContract.methods
        .borrowGuardianPaused(asset.cToken)
        .call()
        // TODO: THIS WILL BE BUILT INTO THE LENS
        .then((isPaused: boolean) => (asset.isPaused = isPaused))
    );

    asset.supplyBalanceUSD =
      ((asset.supplyBalance * asset.underlyingPrice) / 1e36) * ethPrice;

    asset.borrowBalanceUSD =
      ((asset.borrowBalance * asset.underlyingPrice) / 1e36) * ethPrice;

    totalSupplyBalanceUSD += asset.supplyBalanceUSD;
    totalBorrowBalanceUSD += asset.borrowBalanceUSD;

    asset.totalSupplyUSD =
      ((asset.totalSupply * asset.underlyingPrice) / 1e36) * ethPrice;
    asset.totalBorrowUSD =
      ((asset.totalBorrow * asset.underlyingPrice) / 1e36) * ethPrice;

    totalSuppliedUSD += asset.totalSupplyUSD;
    totalBorrowedUSD += asset.totalBorrowUSD;

    asset.liquidityUSD =
      ((asset.liquidity * asset.underlyingPrice) / 1e36) * ethPrice;

    totalLiquidityUSD += asset.liquidityUSD;
  }

  await Promise.all(promises);

  return {
    assets: assets.sort((a, b) => (b.liquidityUSD > a.liquidityUSD ? 1 : -1)),
    comptroller,
    name,
    isPrivate,

    totalLiquidityUSD,

    totalSuppliedUSD,
    totalBorrowedUSD,

    totalSupplyBalanceUSD,
    totalBorrowBalanceUSD,
  };
};
