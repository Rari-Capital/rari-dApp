import Fuse from '../../fuse-sdk/src/index'
import { useQuery } from 'react-query'
import { createOracle } from '../../utils/createComptroller'

export const useOracleData = (oracleAddress: string, fuse: Fuse) => {
    const { data } = useQuery("Oracle info" + oracleAddress, async () => {
      const oracleContract = createOracle(oracleAddress, fuse)
  
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
      
      if (oracleAddress === "0x0000000000000000000000000000000000000000" ) return null
      return oracleAddress
  })

  const { data: Rari_Default_Oracle } = useQuery("RariMasterPriceOracle price feed check for " + tokenAddress, async () => {
      if (!isValidAddress ||  ( !oracleData.adminOverwrite && !Master_Price_Oracle_Default === null )) return null

      // If address is valid and admin can overwrite then get Oracle address for asset from the RariMasterPriceOracle
      const oracleContract = createOracle(Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.MasterPriceOracle, fuse)
      const oracleAddress =  await oracleContract.methods.oracles(tokenAddress).call()

      if (oracleAddress === "0x0000000000000000000000000000000000000000" ) return null
      return oracleAddress
  })

  // If tokenAddress is not a valid address return null. 
  // If tokenAddress is valid and oracle admin can overwrite or if admin can't overwrite but there's no preset, return all options
  // If tokenAddress is valid but oracle admin can't overwrite, return the preset oracle address,

  const Data = !isValidAddress ? null 
                  : oracleData.adminOverwrite ||  Master_Price_Oracle_Default === null  
                  ? { Master_Price_Oracle_Default, Rari_Default_Oracle, Custom_Oracle: " "} 
                  : { Master_Price_Oracle_Default }

  return Data
}