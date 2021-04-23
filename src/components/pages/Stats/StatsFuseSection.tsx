import React, { useMemo } from 'react';

import {
    Avatar,
    Box,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner
} from '@chakra-ui/react';
import { Row, Column } from 'buttered-chakra';

// Hooks
import { useFusePools } from 'hooks/fuse/useFusePools';
import { useFusePoolsData } from 'hooks/useFusePoolData';
import { useBorrowLimits } from 'hooks/useBorrowLimit';
import { useAssetsMapWithTokenData } from 'hooks/useAssetsMap';

import {
    formatAbbreviatedCurrency,
} from "utils/format"
import { USDPricedFuseAsset, USDPricedFuseAssetWithTokenData } from "utils/fetchFusePoolData";
import { TokenData, useTokensData } from 'hooks/useTokenData';
import { AssetHashWithTokenData, TokensDataHash } from 'utils/tokenUtils';
import { convertMantissaToAPR, convertMantissaToAPY } from 'utils/apyUtils';
import { shortUsdFormatter, smallUsdFormatter } from 'utils/bigUtils';

export enum AssetContainerType {
    SUPPLY,
    BORROW,
    RATES
}

const Fuse = () => {

    // Todo - write useFusePoolsData
    const { filteredPools } = useFusePools('my-pools')

    const poolIds: number[] = filteredPools?.map(({ id }) => id) ?? []

    const fusePoolsData: any[] | null = useFusePoolsData(poolIds)

    const assetsArray: USDPricedFuseAsset[][] | null = fusePoolsData?.map((pool) => pool?.assets) ?? null
    const maxBorrows = useBorrowLimits(assetsArray)
    const { tokensDataMap }: { tokensDataMap: TokensDataHash } = useAssetsMapWithTokenData(assetsArray)


    const { totalBorrowBalanceUSD } = useMemo(() => {
        return fusePoolsData?.reduce((a, b) => {
            return { totalBorrowBalanceUSD: a.totalBorrowBalanceUSD + b.totalBorrowBalanceUSD }
        }) ?? { totalBorrowBalanceUSD: null}
    }, [fusePoolsData])

    const { totalSupplyBalanceUSD } = useMemo(() => {
        return fusePoolsData?.reduce((a, b) => {
            return { totalSupplyBalanceUSD: a.totalSupplyBalanceUSD + b.totalSupplyBalanceUSD }
        }) ?? { totalSupplyBalanceUSD: null}
    }, [fusePoolsData])

    console.log({ filteredPools, fusePoolsData, totalBorrowBalanceUSD })

    return (
        <>
            <Table variant="simple">
                <Thead color="white">
                    <Tr>
                        <Th color="white">Pool</Th>
                        <Th color="white">Borrow Limit</Th>
                        <Th color="white">Deposits</Th>
                        <Th color="white">Borrows</Th>
                        <Th color="white">Lend APY / Borrow APR</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredPools?.map((filteredPool, index) => {
                        const fusePoolData = fusePoolsData?.[index]
                        const maxBorrow = maxBorrows?.[index]

                        const ratio = fusePoolData?.totalBorrowBalanceUSD && maxBorrow
                            ? (fusePoolData.totalBorrowBalanceUSD / maxBorrow) * 100
                            : null

                        const isAtRiskOfLiquidation = ratio && ratio > 95

                        return (
                            <Tr key={filteredPool.id}>
                                <Td>{filteredPool.id}</Td>
                                <Td color={isAtRiskOfLiquidation && 'red'}>{ratio?.toFixed(1) ?? <Spinner />}%</Td>
                                {/* Deposits By Asset */}
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.supplyBalanceUSD > 0) &&
                                            <AssetContainer
                                                asset={asset}
                                                tokenData={tokensDataMap[asset.underlyingToken]}
                                            />)
                                    }
                                </Td>
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.borrowBalanceUSD > 0) &&
                                            <AssetContainer
                                                asset={asset}
                                                type={AssetContainerType.BORROW}
                                                tokenData={tokensDataMap[asset.underlyingToken]}
                                            />)
                                    }
                                </Td>
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.supplyBalanceUSD > 0 || asset.borrowBalanceUSD > 0) &&
                                            <AssetContainer
                                                asset={asset}
                                                type={AssetContainerType.RATES}
                                                tokenData={tokensDataMap[asset.underlyingToken]}
                                            />
                                        )}
                                </Td>
                            </Tr>
                        )
                    }
                    )}
                    <Tr>
                        <Td>Total</Td>
                        <Td></Td>
                        <Td justifyContent="flex-end">{smallUsdFormatter(totalSupplyBalanceUSD)}</Td>
                        <Td justifyContent="flex-end">{smallUsdFormatter(totalBorrowBalanceUSD)}</Td>
                        <Td></Td>
                    </Tr>
                </Tbody>
            </Table>
        </>
    );
};



const AssetContainer = ({ asset, type = AssetContainerType.SUPPLY, tokenData }: { asset: USDPricedFuseAsset, type: string, tokenData: TokenData }) => {

    const supplyAmount = ((asset.supplyBalance / (10 ** asset.underlyingDecimals))).toFixed(2) + ` ${asset.underlyingSymbol}`
    const borrowAmount = (asset.borrowBalance / (10 ** asset.underlyingDecimals)).toFixed(2) + ` ${asset.underlyingSymbol}`
    const supplyBalanceUSD = shortUsdFormatter(asset.supplyBalanceUSD)
    const borrowBalanceUSD = shortUsdFormatter(asset.borrowBalanceUSD)

    const borrowRate = convertMantissaToAPR(asset.borrowRatePerBlock).toFixed(2)
    const supplyRate = convertMantissaToAPY(asset.supplyRatePerBlock, 365).toFixed(2)

    return (

        <Row
            mainAxisAlignment={type === AssetContainerType.RATES ? "flex-start" : "space-between"}
            crossAxisAlignment="center"
            background=""
            mb={3}
            p={2}
        // background="pink"

        >
            <Column
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                // background="lime"
                mr={2}
            >
                <Avatar
                    bg="#FFF"
                    boxSize="30px"
                    name={tokenData?.symbol ?? "Loading..."}
                    src={
                        tokenData?.logoURL ??
                        "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
                    }
                />
            </Column>
            <Column
                mainAxisAlignment="center"
                crossAxisAlignment="flex-end"
            >
                {type !== AssetContainerType.RATES && (
                    <>
                        <Text p={1} fontSize="lg" >
                            {type === AssetContainerType.BORROW ? borrowAmount : supplyAmount}
                        </Text>
                        <Text p={1} fontSize="sm">
                            {type === AssetContainerType.BORROW ? borrowBalanceUSD : supplyBalanceUSD}
                        </Text>
                    </>
                )}
                {
                    type === AssetContainerType.RATES && (
                        <Row>
                            <Text p={1} fontSize="lg" >
                                {supplyRate}%
                            </Text>
                            <Text p={1} fontSize="2xl" >
                                /
                            </Text>
                            <Text p={1} fontSize="lg" >
                                {borrowRate}%
                            </Text>
                        </Row>
                    )
                }
            </Column>
        </Row>

    )
}

export default Fuse
