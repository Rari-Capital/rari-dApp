// Rari
import Fuse from "../../fuse-sdk/src/index";

// Hooks
import { createOracle } from "../../utils/createComptroller";

// Web3
import { Contract } from "web3-eth-contract";

// Libraries
import axios from "axios";
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { ETH_TOKEN_DATA } from "hooks/useTokenData";

export type OracleDataType = {
  admin: string; // Address of Oracle's admin
  adminOverwrite: boolean; // Will tell us if admin can overwrite existing oracle-token pairs
  oracleContract: Contract;
  defaultOracle: undefined | string;
};

// Return a string of what we want to call this oracle
export const useIdentifyOracle = (
  oracleAddr: string,
  tokenAddr?: string
): string => {
  const { fuse } = useRari();

  const { data } = useQuery("Identifying Oracle " + oracleAddr, async () => {
    if (tokenAddr && tokenAddr === ETH_TOKEN_DATA.address)
      return "MasterPriceOracle";

    // If no oracle address provided, return empty string
    if (!oracleAddr) return "";

    const identity = await fuse.identifyPriceOracle(oracleAddr);
    if (identity === "MasterPriceOracleV1") return "RariMasterPriceOracle";
    return identity;
  });

  return data ?? "";
};

export const useOracleData = (
  oracleAddress: string,
  fuse: Fuse,
  oracleModel: string | undefined
): OracleDataType | undefined => {
  const { data } = useQuery(
    "Oracle info" + oracleAddress + " Oracle Model: " + oracleModel,
    async () => {
      // If its not v2 or v3 (it is  a legacy oracle), then just return the string of the oracleModel
      // If its MPOv1 or MPOv2 or v3
      if (
        oracleModel !== "MasterPriceOracleV2" &&
        oracleModel !== "MasterPriceOracleV3"
      )
        return undefined;

      const oracleContract = createOracle(
        oracleAddress,
        fuse,
        "MasterPriceOracle"
      );

      const admin = await oracleContract.methods.admin().call();
      const adminOverwrite = await oracleContract.methods
        .canAdminOverwrite()
        .call();

      let defaultOracle = undefined;
      try {
        defaultOracle = await oracleContract.methods.defaultOracle().call();
      } catch (err) {
        console.log("Error fetching default oracle for Pool Oracle");
        console.error(err);
      }

      return { admin, adminOverwrite, oracleContract, defaultOracle };
    }
  );

  return data;
};

export const useGetOracleOptions = (
  oracleData: OracleDataType | undefined,
  tokenAddress: string
): { [key: string]: any } | null => {
  const { fuse } = useRari();
  const isValidAddress = fuse.web3.utils.isAddress(tokenAddress);

  const { defaultOracle, oracleContract, adminOverwrite } = oracleData ?? {};
  const oracleAddress = oracleContract?.options?.address ?? undefined;

  // If the pool has a default price oracle (RariMasterPriceOracle), query that oracle's price for this token.
  // If it has an available price, we can let the user choose "Default Price Oracle"
  // We should also set this value initially if it is available and if "Current_Price_Oracle" is null.
  const { data: Default_Price_Oracle } = useQuery(
    "Pool Default Price Oracle " +
      (defaultOracle ?? "") +
      " check price feed for " +
      tokenAddress,
    async () => {
      if (!defaultOracle) return null;

      // If defaultOracle address is empty return null
      if (defaultOracle === ETH_TOKEN_DATA.address) return null;

      const oracleContract = createOracle(
        defaultOracle,
        fuse,
        "MasterPriceOracle"
      );

      // Call the defaultOracle's price to make sure we have a price for this token
      try {
        const price = await oracleContract.methods.price(tokenAddress).call();
        console.log("Default_Price_Oracle", { price });
        if (parseFloat(price) > 0) return defaultOracle;
      } catch (err) {
        console.log("Default_Price_Oracle: could not fetch price");
        console.error(err);
        return null;
      }
    }
  );

  // If it has a custom oracle set, show this option and show it by default
  // If it doesn't have a custom oracle, then query for the default oracle and show that as the "Current oracle"
  const { data: Current_Price_Oracle } = useQuery(
    "MasterOracle " + oracleAddress ??
      "" +
        " check price feed for " +
        tokenAddress +
        " and default oracle " +
        defaultOracle,
    async () => {
      if (!isValidAddress) return null;
      if (!oracleContract) return null;
      if (!oracleData) return null;

      // Get custom Oracle address for asset from the pools MasterPriceOracle
      const customOracleAddress = await oracleData.oracleContract.methods
        .oracles(tokenAddress)
        .call();

      // If we have a custom oracle address set, retur that
      if (customOracleAddress !== ETH_TOKEN_DATA.address)
        return customOracleAddress;
      // If custom oracleAddress is empty
      //  -- If there isnt a defaultOracle, return null
      //  -- If there is a defaultOracle price for this asset, return the defaultOracle
      //  -- If there isnt a default oracle price, then return null
      // -
      else {
        if (!oracleData.defaultOracle) return null;
        // This is copied from the DefaultOracle query
        else {
          const oracleContract = createOracle(
            oracleData.defaultOracle,
            fuse,
            "MasterPriceOracle"
          );

          // Call the defaultOracle's price to make sure we have a price for this token
          try {
            const price = await oracleContract.methods
              .price(tokenAddress)
              .call();
            if (parseFloat(price) > 0) return oracleData.defaultOracle;
          } catch (err) {
            console.log(
              "Current_Price_Oracle: Default_Price_Oracle: could not fetch price"
            );
            console.error(err);
            return null;
          }
        }
      }
    }
  );

  // If the pool does not have a default oracle (RariMasterPriceOracle) then show this option.
  // If the pool already has a default oracle (RariMasterPriceOracle) then we don't have to show this.
  // In case the Pool's default RariMasterPriceOracle cannot fetch the price for this asset, there would be no point in choosing this option.
  const { data: Rari_MasterPriceOracle } = useQuery(
    "RariMasterPriceOracle price feed check for " + tokenAddress,
    async () => {
      if (
        !isValidAddress ||
        (!adminOverwrite && !Current_Price_Oracle === null) ||
        !!defaultOracle || // our defaultOracle IS RariMasterPriceOracle. ||
        !oracleData
      )
        return null;

      // If address is valid and admin can overwrite, get Oracle address for the asset from RariMasterPriceOracle
      const oracleContract = createOracle(
        Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.MasterPriceOracle,
        fuse,
        "MasterPriceOracle"
      );

      const oracleAddress = await oracleContract.methods
        .oracles(tokenAddress)
        .call();

      // If oracleAddress is empty return null, else return the RARI MASTER PRICE ORACLE
      if (oracleAddress === "0x0000000000000000000000000000000000000000")
        return null;
      return Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.MasterPriceOracle;
    }
  );

  const { data: Chainlink_Oracle } = useQuery(
    "Chainlink price feed check for: " + tokenAddress,
    async () => {
      if (
        !isValidAddress ||
        (!adminOverwrite && !Current_Price_Oracle === null) ||
        !oracleData
      )
        return null;

      // If address is valid and admin can overwrite, get price for the asset from ChainlinkPriceOracle
      const oracleContract = createOracle(
        Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.ChainlinkPriceOracleV3,
        fuse,
        "ChainlinkPriceOracle"
      );
      const oraclePrice = await oracleContract.methods
        .price(tokenAddress)
        .call();

      // If price is zero, this means theres no pricefeed for the asset so return null
      // If we receive a price, return ChainlinkPriceOracle address
      if (oraclePrice <= 0) return null;
      return Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.ChainlinkPriceOracleV3;
    }
  );

  // We mount this hook to get data from cache.
  // We need this because if there's no whitelisted uniswap pool,
  // we shouldn't return Uniswap_V3_Oracle as an option
  const { data: liquidity, error } = useQuery(
    "UniswapV3 pool liquidity for  " + tokenAddress,
    async () =>
      (
        await axios.post(
          "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
          {
            query: `{
            token(id:"${tokenAddress.toLocaleLowerCase()}") {
              whitelistPools {
                id,
                feeTier,
                totalValueLockedUSD,
                token0 {
                  name
                },
                token1 {
                  name
                }
              }
            }
          }`,
          }
        )
      ).data.data.pairs,
    { refetchOnMount: false }
  );

  // If theres no whitelisted pool for the asset, or if there was an error return null
  // Otherwise its return ''
  // In the UniswapV3PriceOracleConfigurator, we will mount the hook above to get info
  const Uniswap_V3_Oracle = liquidity?.data.token === null || error ? null : "";

  const { SushiPairs, SushiError, UniV2Pairs, univ2Error } =
    useSushiOrUniswapV2Pairs(tokenAddress);

  // If theres no whitelisted pool for the asset, or if there was an error return null
  // Otherwise its return ''
  // In the UniswapV3PriceOracleConfigurator, we will mount the hook above to get info
  // const Uniswap_V2_Oracle =
  //       (UniV2Pairs === null || UniV2Pairs === undefined || UniV2Pairs.length === 0 || univ2Error )
  //       ? null
  //       : ''

  // const SushiSwap_Oracle =
  //       (SushiPairs === null || SushiPairs === undefined || SushiPairs.length === 0 || SushiError )
  //       ? null
  //       : ''

  // If tokenAddress is not a valid address return null.
  // If tokenAddress is valid and oracle admin can overwrite or if admin can't overwrite but there's no preset, return all options
  // If tokenAddress is valid but oracle admin can't overwrite, return the preset oracle address,
  const Data = !isValidAddress
    ? null
    : adminOverwrite || Current_Price_Oracle === null
    ? {
        Default_Price_Oracle,
        Current_Price_Oracle,
        Rari_MasterPriceOracle,
        Chainlink_Oracle,
        Uniswap_V3_Oracle,
        // Uniswap_V2_Oracle,
        // SushiSwap_Oracle,
        Custom_Oracle: " ",
      }
    : { Current_Price_Oracle };

  return Data;
};

export const useSushiOrUniswapV2Pairs = (tokenAddress: string) => {
  const { data: UniV2Pairs, error: univ2Error } = useQuery(
    "UniswapV2 pairs for  " + tokenAddress,
    async () => {
      const pairs = await axios.post(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
        {
          query: `{
          pairs(first: 10, orderBy: totalSupply, orderDirection: desc, where: { token0: "${tokenAddress.toLocaleLowerCase()}" } ) {
            id,
           token0 {
             id,
             symbol
           },
           token1 {
             id,
             symbol
           }
           totalSupply
          }
         }`,
        }
      );
      return pairs !== undefined &&
        pairs.data !== undefined &&
        pairs.data.data.pairs !== undefined
        ? pairs.data.data.pairs.filter((pair: any) => pair.totalSupply > 10000)
        : null;
    },
    { refetchOnMount: false }
  );

  const { data: SushiPairs, error: SushiError } = useQuery(
    "SushiSwap pairs for  " + tokenAddress,
    async () => {
      const pairs = await axios.post(
        "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
        {
          query: `{
          pairs(first: 10, orderBy: totalSupply, orderDirection: desc, where: { token0: "${tokenAddress.toLocaleLowerCase()}" } ) {
            id,
           token0 {
             id,
             symbol
           },
           token1 {
             id,
             symbol
           }
           totalSupply
          }
         }`,
        }
      );

      return pairs !== undefined &&
        pairs.data !== undefined &&
        pairs.data.data.pairs !== undefined
        ? pairs.data.data.pairs.filter((pair: any) => pair.totalSupply > 10000)
        : null;
    },
    { refetchOnMount: false }
  );

  return { SushiPairs, SushiError, UniV2Pairs, univ2Error };
};
