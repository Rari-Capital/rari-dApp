import React from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner
} from '@chakra-ui/react';

import { useFusePools } from 'hooks/fuse/useFusePools';
import { useFusePoolsData } from 'hooks/useFusePoolData';
import { useBorrowLimits } from 'hooks/useBorrowLimit';

import {
    smallStringUsdFormatter,
  } from "utils/bigUtils";

import { USDPricedFuseAsset } from "utils/fetchFusePoolData";

const Earn = () => {

    // Todo - write useFusePoolsData
    const { filteredPools } = useFusePools('my-pools')
    const poolIds : number[] = filteredPools?.map(({ id }) => id) ?? []
    const fusePoolsData : any[] | null = useFusePoolsData(poolIds)

    const assetsArray : USDPricedFuseAsset[][] | null = fusePoolsData?.map((pool) => pool?.assets) ?? null
    const maxBorrows = useBorrowLimits(assetsArray)

    console.log({ fusePoolsData, assetsArray, maxBorrows })

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

                        console.log({ fusePoolData, maxBorrow, ratio })

                        return (
                            <Tr key={filteredPool.id}>
                                <Td>{filteredPool.id}</Td>
                                <Td color={isAtRiskOfLiquidation && 'red'}>{ ratio?.toFixed(1) ?? <Spinner />}%</Td>
                                <Td>{smallStringUsdFormatter(fusePoolData?.totalSupplyBalanceUSD) ?? <Spinner />}</Td>
                                <Td>{smallStringUsdFormatter(fusePoolData?.totalBorrowBalanceUSD) ?? <Spinner />}</Td>
                                <Td>{0 ?? <Spinner />}%</Td>
                            </Tr>
                        )
                    }
                    )}
                    {/* <Tr>
            <Td>Total</Td>
            <Td>0%</Td>
            <Td>{totals?.balance }</Td>
            <Td>{totals?.interestEarned }</Td>
            <Td>0%</Td>
          </Tr> */}
                </Tbody>
            </Table>
        </>
    );
};

export default Earn
