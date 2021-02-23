import { useQuery } from "react-query";

import { USDPricedFuseAsset } from "../components/pages/Fuse/FusePoolPage";
import { filterOnlyObjectProperties } from "../components/pages/Fuse/FusePoolsPage";
import { useRari } from "../context/RariContext";

export const useFusePoolData = (poolId: string) => {
  const { fuse, rari, address } = useRari();

  const { data } = useQuery(poolId + " poolData " + address, async () => {
    const comptroller = (
      await fuse.contracts.FusePoolDirectory.methods.pools(poolId).call()
    ).comptroller;

    let assets: USDPricedFuseAsset[] = (
      await fuse.contracts.FusePoolDirectory.methods
        .getPoolAssetsWithData(comptroller)
        .call()
    ).map(filterOnlyObjectProperties);

    let totalSupplyBalanceUSD = 0;
    let totalBorrowBalanceUSD = 0;

    let totalSuppliedUSD = 0;
    let totalBorrowedUSD = 0;

    const ethPrice: number = rari.web3.utils.fromWei(
      await rari.getEthUsdPriceBN()
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
    }

    return {
      assets,
      comptroller,

      totalSuppliedUSD,
      totalBorrowedUSD,

      totalSupplyBalanceUSD,
      totalBorrowBalanceUSD,
    };
  });

  return data;
};
