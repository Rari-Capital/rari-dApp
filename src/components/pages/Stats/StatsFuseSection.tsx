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


import { USDPricedFuseAsset} from "utils/fetchFusePoolData";
import { TokenData, useTokensData } from 'hooks/useTokenData';
import { TokensDataHash } from 'utils/tokenUtils';
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
        }) ?? { totalBorrowBalanceUSD: null }
    }, [fusePoolsData])

    const { totalSupplyBalanceUSD } = useMemo(() => {
        return fusePoolsData?.reduce((a, b) => {
            return { totalSupplyBalanceUSD: a.totalSupplyBalanceUSD + b.totalSupplyBalanceUSD }
        }) ?? { totalSupplyBalanceUSD: null }
    }, [fusePoolsData])

    const hasDeposits = useMemo(() => totalSupplyBalanceUSD > 0, [totalSupplyBalanceUSD])

    return (
        <>
            <Table variant="simple">
                <Thead color="white">
                    <Tr>
                        <Th textAlign="right" color="white" fontSize="sm">Pool</Th>
                        <Th textAlign="right" color="white" fontSize="sm">Borrow Limit</Th>
                        <Th textAlign="right" color="white" fontSize="sm">Deposits</Th>
                        <Th textAlign="right" color="white" fontSize="sm">Borrows</Th>
                        <Th textAlign="right" textAlign="right" color="white" fontSize="sm">Lend APY / Borrow APR</Th>
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
                                <Td textAlign="center" fontSize="large">{filteredPool.id}</Td>
                                <Td textAlign="right" textStyle="bold" color={isAtRiskOfLiquidation && 'red'} fontSize="large">
                                    {ratio?.toFixed(1) ?? <Spinner />}%
                                </Td>
                                {/* Deposits By Asset */}
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.supplyBalanceUSD > 0) &&
                                            <Box mb={2} >
                                                <AssetContainer
                                                    asset={asset}
                                                    tokenData={tokensDataMap[asset.underlyingToken]}
                                                />
                                            </Box>
                                        )}
                                </Td>
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.borrowBalanceUSD > 0) &&
                                            <Box mb={2} >
                                                <AssetContainer
                                                    asset={asset}
                                                    type={AssetContainerType.BORROW}
                                                    tokenData={tokensDataMap[asset.underlyingToken]}
                                                />
                                            </Box>

                                        )}
                                </Td>
                                
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.supplyBalanceUSD > 0 || asset.borrowBalanceUSD > 0) &&
                                            <Box mb={2}>
                                                <AssetContainer
                                                    asset={asset}
                                                    type={AssetContainerType.RATES}
                                                    tokenData={tokensDataMap[asset.underlyingToken]}
                                                />
                                            </Box>
                                        )}
                                </Td>
                            </Tr>
                        )
                    }
                    )}
                    <Tr>
                        <Td><Text fontWeight={hasDeposits && "bold"}>Total</Text></Td>
                        <Td></Td>
                        <Td textAlign="right"><Text fontWeight={hasDeposits && "bold"}>{smallUsdFormatter(totalSupplyBalanceUSD)}</Text></Td>
                        <Td textAlign="right"><Text fontWeight={hasDeposits && "bold"}>{smallUsdFormatter(totalBorrowBalanceUSD)}</Text></Td>
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

        <>
            <Column
                mainAxisAlignment={type === AssetContainerType.RATES ? "space-around" : "center"}
                crossAxisAlignment="flex-end"
            // background="lime"
            >
                {/* Icon and Units */}
                <Row
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment="center"
                    width="90%"
                    // pl={6}
                >
                    <Avatar
                        bg="#FFF"
                        boxSize="20px"
                        name={tokenData?.symbol ?? "Loading..."}
                        my="auto"
                        mr="auto"
                        src={
                            tokenData?.logoURL ??
                            "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
                        }
                    />
                    {/* Lend/borrow Supply */}
                    {type !== AssetContainerType.RATES && (
                        <>
                            <Text p={1} fontSize="lg" textAlign="right">
                                {type === AssetContainerType.BORROW ? borrowAmount : supplyAmount}
                            </Text>
                        </>
                    )}
                    {/* Lend/borrow rates */}
                    {
                        type === AssetContainerType.RATES && (
                            <Row>
                                <Text p={1} fontSize="lg" >
                                    {supplyRate}%
                            </Text>
                                <Text p={1} fontSize="2xl"  >
                                    /
                            </Text>
                                <Text p={1} fontSize="lg" >
                                    {borrowRate}%
                            </Text>
                            </Row>
                        )
                    }
                </Row>
                {/* USD Denomination */}
                <Row
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment="center"
                    width="90%"
                >
                    {type !== AssetContainerType.RATES && (
                        <Text p={1} fontSize="sm" color="grey">
                            {type === AssetContainerType.BORROW ? borrowBalanceUSD : supplyBalanceUSD}
                        </Text>
                    )}
                </Row>
            </Column>
        </>
    )
}

export default Fuse
