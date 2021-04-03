import Fuse from "../fuse-sdk";
import Rari from "../rari-sdk/index";

// @ts-ignore
import Filter from "bad-words";
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
}

export const filterPoolName = (name: string) => {
  // Manual rename pool 6 until we add func to change pool names.
  if (name === "Tetranode's Pool") {
    return "Tetranode's RGT Pool";
  }

  return filter.clean(name);
};

export const fetchFusePoolData = async (
  poolId: string,
  address: string,
  fuse: Fuse,
  rari?: Rari
) => {
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

  for (let i = 0; i < assets.length; i++) {
    let asset = assets[i];

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
