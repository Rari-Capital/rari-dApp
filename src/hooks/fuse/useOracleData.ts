// Rari
import Fuse from '../../fuse-sdk/src/index'

// Hooks
import { createOracle } from '../../utils/createComptroller'

// Web3
import { Contract } from "web3-eth-contract"

// Libraries
import axios from 'axios'
import { useQuery } from 'react-query'
import { useRari } from 'context/RariContext'
import { ETH_TOKEN_DATA } from 'hooks/useTokenData'

export type OracleDataType = {
  admin: string // Address of Oracle's admin
  adminOverwrite: boolean // Will tell us if admin can overwrite existing oracle-token pairs
  oracleContract: Contract
}

export const useIdentifyOracle = (oracleAddr: string, tokenAddr?: string) => {
  const { fuse }  = useRari()


  const { data } = useQuery("Identifying Oracle " + oracleAddr, async () => {
  if (tokenAddr && tokenAddr === ETH_TOKEN_DATA.address) return "MasterPriceOracle"
    return await fuse.identifyPriceOracle(oracleAddr)
  }) 

  return data ?? ""

} 

export const useOracleData = (oracleAddress: string, fuse: Fuse): OracleDataType | undefined => {
    const { data } = useQuery("Oracle info" + oracleAddress, async () => {
      const oracleContract = createOracle(oracleAddress, fuse, "MasterPriceOracle")
  
      const admin = await oracleContract.methods.admin().call()
      const adminOverwrite = await oracleContract.methods.canAdminOverwrite().call()
  
      return {admin, adminOverwrite, oracleContract}
    }) 
  
    return data
}

export const useGetOracleOptions = (oracleData: any, tokenAddress: string, fuse: Fuse, isValidAddress: boolean): {[key: string]: any} | null => {
  const { data: Active_Price_Oracle } = useQuery("MasterOracle " + oracleData.oracleContract.options.address + " check price feed for " + tokenAddress, async () => {
      if (!isValidAddress) return null

      // Get Oracle address for asset from the pools MasterPriceOracle
      const oracleAddress = await oracleData.oracleContract.methods
        .oracles(tokenAddress)
        .call();

      // If oracleAddress is empty return null
      if (oracleAddress === "0x0000000000000000000000000000000000000000")
        return null;
      return oracleAddress;
    }
  );

  const { data: Rari_MasterPriceOracle } = useQuery(
    "RariMasterPriceOracle price feed check for " + tokenAddress,
    async () => {
      if (
        !isValidAddress ||
        (!oracleData.adminOverwrite && !Active_Price_Oracle === null)
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
        (!oracleData.adminOverwrite && !Active_Price_Oracle === null)
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
  const {data: liquidity, error} = useQuery("UniswapV3 pool liquidity for  " + tokenAddress, async () => 
    (await axios.post(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
        {
          query:
          `{
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
      )).data.data.pairs
  ,{refetchOnMount: false})

  // If theres no whitelisted pool for the asset, or if there was an error return null
  // Otherwise its return ''
  // In the UniswapV3PriceOracleConfigurator, we will mount the hook above to get info 
  const Uniswap_V3_Oracle = 
              (liquidity?.data.token === null || error) 
              ? null
              : ''

  const {SushiPairs, SushiError, UniV2Pairs, univ2Error} = useSushiOrUniswapV2Pairs(tokenAddress)

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
  const Data = !isValidAddress ? null 
                  : oracleData.adminOverwrite ||  Active_Price_Oracle === null  
                  ? { 
                    Active_Price_Oracle, 
                    Rari_MasterPriceOracle, Chainlink_Oracle, 
                    Uniswap_V3_Oracle, 
                    // Uniswap_V2_Oracle, 
                    // SushiSwap_Oracle, 
                    Custom_Oracle: " "} 
                  : { Active_Price_Oracle }

  return Data
}

export const useSushiOrUniswapV2Pairs = (tokenAddress: string) => {

  const {data: UniV2Pairs, error: univ2Error} = useQuery("UniswapV2 pairs for  " + tokenAddress, async () => {
   const pairs = await axios.post(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        query:
        `{
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
    )
    return pairs !== undefined && pairs.data !== undefined && pairs.data.data.pairs !== undefined ? pairs.data.data.pairs.filter((pair: any) => pair.totalSupply > 10000) : null
  }
  ,{refetchOnMount: false})

  const {data: SushiPairs, error: SushiError} = useQuery("SushiSwap pairs for  " + tokenAddress, async () => {
    const pairs = await axios.post(
      "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
      {
        query:
        `{
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
    )


    return pairs !== undefined && pairs.data !== undefined && pairs.data.data.pairs !== undefined ? pairs.data.data.pairs.filter((pair: any) => pair.totalSupply > 10000) : null
  },{refetchOnMount: false})


  return {SushiPairs, SushiError, UniV2Pairs, univ2Error}
}
