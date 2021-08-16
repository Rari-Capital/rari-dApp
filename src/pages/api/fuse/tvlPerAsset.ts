import { EmptyAddress } from "context/RariContext";
import { fetchPools } from "hooks/fuse/useFusePools";
import Rari from "lib/rari-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchFusePoolData, FusePoolData } from "utils/fetchFusePoolData";
import { initFuseWithProviders, turboGethURL } from "utils/web3Providers";
import Web3 from "web3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let _poolIndices: string[] = [];

  if (req.method === "POST") {
    try {
      let userAddress: string = "";

      // Validate queryParams
      const poolIndices = req.body.poolIndices as string[]; // optional
      const address = (req.body.address as string) ?? EmptyAddress; // optional

      try {
        userAddress = Web3.utils.toChecksumAddress(address);
      } catch (err) {
        return res.status(400).json({ error: "Invalid address provided." });
      }

      // Set up SDKs
      const web3 = new Web3(turboGethURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(turboGethURL);

      // If we specified poolIndices, use those, else fetch all pools
      if (poolIndices?.length) {
        _poolIndices = poolIndices;
      } else {
        const fusePools = await fetchPools({
          rari,
          fuse,
          address: userAddress,
          filter: "",
        });
        _poolIndices = fusePools.map((pool) => pool.id.toString());
      }

      const fusePoolsData: FusePoolData[] = await Promise.all(
        _poolIndices.map((poolIndex) =>
          fetchFusePoolData(poolIndex, userAddress, fuse, rari)
        )
      ) as FusePoolData[];

      let newFusePoolsFormat: FusePoolData[] = [];

      if (fusePoolsData != undefined) {
        for (let i = 0; i < fusePoolsData.length; i++) {
          for (let j = 0; j < fusePoolsData[i].assets.length; j++) {
            newFusePoolsFormat[i].assets[j].totalBorrowUSD =
              fusePoolsData[i].assets[j].totalBorrowUSD
            newFusePoolsFormat[i].assets[j].totalSupplyUSD =
              fusePoolsData[i].assets[j].totalSupplyUSD
          }
        }
      }


      /**
       * @todo Get TVL per asset from the full response object that this 
       *       endpoint returns
       */

      return res.status(200).json({ pools: fusePoolsData, userAddress });
    } catch (error) {
      console.log({ error });
      return res.status(400).json({ error });
    }
  }
  //   Gets ALL fuse pool Data
  else if (req.method === "GET") {
    try {
      let userAddress: string = "";

      // Validate queryParams
      // const poolIndices = req.body.poolIndices as string[]; // optional
      const address = (req.body.address as string) ?? EmptyAddress; // optional

      try {
        userAddress = Web3.utils.toChecksumAddress(address);
      } catch (err) {
        return res.status(400).json({ error: "Invalid address provided." });
      }

      // Set up SDKs
      const web3 = new Web3(turboGethURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(turboGethURL);

      const fusePools = await fetchPools({
        rari,
        fuse,
        address: userAddress,
        filter: "",
      });

      const poolIndices = fusePools
        .filter((pool) => !!pool.underlyingTokens.length) // filter out empty pools
        .map((pool) => pool.id.toString());

      const fusePoolsData = await Promise.all(
        poolIndices.map((poolIndex) =>
          fetchFusePoolData(poolIndex, userAddress, fuse, rari)
        )
      );

      return res.status(200).json({ pools: fusePoolsData, userAddress });
    } catch (error) {
      console.log({ error }, error.message);
      return res.status(400).json({ error });
    }
  }
}
