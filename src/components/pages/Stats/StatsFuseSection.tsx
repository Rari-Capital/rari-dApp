import React from 'react';

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
    formatAbbreviatedCurrency
} from "utils/format"
import { USDPricedFuseAsset, USDPricedFuseAssetWithTokenData } from "utils/fetchFusePoolData";
import { TokenData, useTokensData } from 'hooks/useTokenData';
import { AssetHashWithTokenData, TokensDataHash } from 'utils/tokenUtils';

const Earn = () => {

    // Todo - write useFusePoolsData
    const { filteredPools } = useFusePools('my-pools')
    const poolIds: number[] = filteredPools?.map(({ id }) => id) ?? []
    const fusePoolsData: any[] | null = useFusePoolsData(poolIds)

    const assetsArray: USDPricedFuseAsset[][] | null = fusePoolsData?.map((pool) => pool?.assets) ?? null
    const maxBorrows = useBorrowLimits(assetsArray)
    const { tokensDataMap }: { tokensDataMap: TokensDataHash } = useAssetsMapWithTokenData(assetsArray)

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
                                            (asset.supplyBalanceUSD > 0) && <AssetContainer asset={asset} tokenData={tokensDataMap[asset.underlyingToken]} />)
                                    }
                                </Td>
                                <Td>
                                    {
                                        fusePoolData?.assets.map((asset: USDPricedFuseAsset) =>
                                            (asset.borrowBalanceUSD > 0) && <AssetContainer asset={asset} type="borrow" tokenData={tokensDataMap[asset.underlyingToken]} />)
                                    }
                                </Td>
                                <Td>{0 ?? <Spinner />}%</Td>
                            </Tr>
                        )
                    }
                    )}
                    {/* <Tr>
                        <Td>Total</Td>
                        <Td>0%</Td>
                        <Td>{totals?.balance}</Td>
                        <Td>{totals?.interestEarned}</Td>
                        <Td>0%</Td>
                    </Tr> */}
                </Tbody>
            </Table>
        </>
    );
};

const AssetContainer = ({ asset, type = "supply", tokenData }: { asset: USDPricedFuseAsset, type: string, tokenData: TokenData }) => {

    console.log({ tokenData })

    const supplyAmount = ((asset.supplyBalance / (10 ** asset.underlyingDecimals))).toFixed(2) + ` ${asset.underlyingSymbol}`
    const borrowAmount = (asset.borrowBalance / (10 ** asset.underlyingDecimals)).toFixed(2) + ` ${asset.underlyingSymbol}`
    const supplyBalanceUSD = formatAbbreviatedCurrency(asset.supplyBalanceUSD)
    const borrowBalanceUSD = formatAbbreviatedCurrency(asset.borrowBalanceUSD)

    return (

        <Row
            mainAxisAlignment="space-between"
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
                    // boxSize="37px"
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
                <Text p={1} fontSize="lg" >
                    {type === "borrow" ? borrowAmount : supplyAmount}
                </Text>
                <Text p={1} fontSize="sm">
                    ${type === "borrow" ? borrowBalanceUSD : supplyBalanceUSD}
                </Text>
            </Column>
        </Row>

    )
}

export default Earn
