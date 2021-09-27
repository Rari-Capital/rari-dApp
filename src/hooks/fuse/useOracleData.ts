import Fuse from '../../fuse-sdk/src/index'
import { useQuery } from 'react-query'
import { createOracle } from '../../utils/createComptroller'
import Rari from 'rari-sdk'
import axios from 'axios'

export const useOracleData = (oracleAddress: string, fuse: Fuse) => {
    const { data } = useQuery("Oracle info" + oracleAddress, async () => {
      const oracleContract = createOracle(oracleAddress, fuse, "MasterPriceOracle")
  
      const admin = await oracleContract.methods.admin().call()
      const adminOverwrite = await oracleContract.methods.canAdminOverwrite().call()
  
      return {admin, adminOverwrite, oracleContract}
    }) 
  
    return data
}

export const useGetOracleOptions = (oracleData: any, tokenAddress: string, fuse: Fuse, isValidAddress: boolean): {[key: string]: any} | null => {
  const { data: Master_Price_Oracle_Default } = useQuery("MasterOracle " + oracleData.oracleContract.options.address + " check price feed for " + tokenAddress, async () => {
      if (!isValidAddress) return null

      // Get Oracle address for asset from the pools MasterPriceOracle
      const oracleAddress = await oracleData.oracleContract.methods.oracles(tokenAddress).call()
      
      // If oracleAddress is empty return null
      if (oracleAddress === "0x0000000000000000000000000000000000000000" ) return null
      return oracleAddress
  })

  const { data: Rari_Default_Oracle } = useQuery("RariMasterPriceOracle price feed check for " + tokenAddress, async () => {
      if (!isValidAddress ||  ( !oracleData.adminOverwrite && !Master_Price_Oracle_Default === null )) return null

      // If address is valid and admin can overwrite, get Oracle address for the asset from RariMasterPriceOracle
      const oracleContract = createOracle(Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.MasterPriceOracle, fuse, "MasterPriceOracle")
      const oracleAddress =  await oracleContract.methods.oracles(tokenAddress).call()

      // If oracleAddress is empty return null
      if (oracleAddress === "0x0000000000000000000000000000000000000000" ) return null
      return oracleAddress
  })

  const {data: Chainlink_Oracle } = useQuery("Chainlink price feed check for: " + tokenAddress, async () => {
    if(!isValidAddress || ( !oracleData.adminOverwrite && !Master_Price_Oracle_Default === null )) return null

    // If address is valid and admin can overwrite, get price for the asset from ChainlinkPriceOracle
    const oracleContract = createOracle(Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.ChainlinkPriceOracleV3, fuse, "ChainlinkPriceOracle")
    const oraclePrice = await oracleContract.methods.price(tokenAddress).call()

    // If price is zero, this means theres no pricefeed for the asset so return null
    // If we receive a price, return ChainlinkPriceOracle address
    if (oraclePrice <= 0) return null
    return Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.ChainlinkPriceOracleV3
  })

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
      )).data
  ,{refetchOnMount: false})

  // If theres no whitelisted pool for the asset, or if there was an error return null
  // Otherwise its return ''
  // In the UniswapV3PriceOracleConfigurator, we will mount the hook above to get info 
  const Uniswap_V3_Oracle = 
              (liquidity?.data.token === null || error) 
              ? null
              : ''
  

  // If tokenAddress is not a valid address return null. 
  // If tokenAddress is valid and oracle admin can overwrite or if admin can't overwrite but there's no preset, return all options
  // If tokenAddress is valid but oracle admin can't overwrite, return the preset oracle address,
  const Data = !isValidAddress ? null 
                  : oracleData.adminOverwrite ||  Master_Price_Oracle_Default === null  
                  ? { Master_Price_Oracle_Default, Rari_Default_Oracle, Chainlink_Oracle, Uniswap_V3_Oracle, Custom_Oracle: " "} 
                  : { Master_Price_Oracle_Default }

  return Data
}