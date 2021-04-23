import { useMemo } from 'react';

// Utils
import { createAssetsMap, AssetHash, createTokensDataMap } from 'utils/tokenUtils'
import { USDPricedFuseAsset, USDPricedFuseAssetWithTokenData } from "utils/fetchFusePoolData";

// Hooks
import { useTokensData } from 'hooks/useTokenData';


export const useAssetsMap = (assetsArray: USDPricedFuseAsset[][] | null): AssetHash | null => {
    return useMemo(() => assetsArray ? createAssetsMap(assetsArray) : null, [assetsArray])
}

export const useAssetsMapWithTokenData = (assetsArray: USDPricedFuseAsset[][] | null): USDPricedFuseAssetWithTokenData[] => {
    const assetsMap: AssetHash | null = useAssetsMap(assetsArray)
    const tokensAddresses: string[] = assetsMap ? Object.keys(assetsMap) : []
    const tokensData = useTokensData(tokensAddresses)

    const tokensDataMap = useMemo(() => tokensData ? createTokensDataMap(tokensData) : null, [tokensData])

    const assetsMapWithTokenData: USDPricedFuseAssetWithTokenData[] = useMemo(() => {
        return tokensData?.reduce((arr, tokenData, index) => {
            const asset: USDPricedFuseAsset | null = assetsMap?.[tokenData.address] ?? null

            // If no asset return an empty array
            if (!asset) { return arr }

            const newAsset = { ...asset, tokenData }
            arr.push(newAsset)
            return arr
        }, [])
    }, [assetsMap, tokensData])

    console.log(({ assetsMapWithTokenData , tokensDataMap }))

    return { assetsMapWithTokenData , tokensDataMap }
}