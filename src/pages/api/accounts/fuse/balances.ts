import { fetchPools } from "hooks/fuse/useFusePools";
import Rari from "lib/rari-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchFusePoolData, FusePoolData } from "utils/fetchFusePoolData";
import { initFuseWithProviders, turboGethURL } from "utils/web3Providers";
import Web3 from "web3";

interface APIAccountsFuseBalancesResponse {
  userAddress: string;
  pools: FusePoolData[];
  totals: {
    totalBorrowsUSD: number;
    totalSuppliedUSD: number;
  };
}

export interface APIError {
  error: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIAccountsFuseBalancesResponse | APIError>
) {
  if (req.method === "GET") {
    try {
      let userAddress: string = "";

      // Validate address input
      const address = req.query.address as string;
      const blockNum = req.query.blockNum as string;

      if (!address)
        return res.status(400).json({ error: "No Address provided." });

      try {
        userAddress = Web3.utils.toChecksumAddress(address);
      } catch (err) {
        return res.status(400).json({ error: "Invalid address provided." });
      }

      // Set up SDKs
      const web3 = new Web3(turboGethURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(turboGethURL);

      // Get all fuse pools this user is active in
      const pools = await fetchPools({
        rari,
        fuse,
        address,
        filter: "my-pools",
        blockNum
      });

      // Then get the data for each of these fuse pools
      const poolIndices = pools.map((pool) => pool.id);
      const fusePoolsData = await Promise.all(
        poolIndices.map((poolIndex) =>
          fetchFusePoolData(poolIndex.toString(), userAddress, fuse, rari)
        )
      );

      // Then filter out the data to show only assets where supply or borrow balance > 0
      const fusePoolsDataWithFilteredAssets = fusePoolsData.map((pool) => {
        return {
          ...pool,
          assets:
            pool?.assets.filter(
              (asset) => asset.borrowBalance > 0 || asset.supplyBalance > 0
            ) ?? [],
        } as FusePoolData;
      });

      const totalBorrowsUSD =
        fusePoolsData?.reduce((a, b) => {
          return a + (b?.totalBorrowBalanceUSD ?? 0);
        }, 0) ?? 0;

      const totalSuppliedUSD =
        fusePoolsDataWithFilteredAssets?.reduce((a, b) => {
          return a + (b?.totalSupplyBalanceUSD ?? 0);
        }, 0) ?? 0;

      // Calc totals
      const totals = {
        totalBorrowsUSD,
        totalSuppliedUSD,
      };

      return res.status(200).json({
        userAddress,
        pools: fusePoolsDataWithFilteredAssets,
        totals,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }
}

const validateAddressQuery = (address: string) => {
  let userAddress: string = "";

  return userAddress;
};
